import { Resend } from 'resend'
import { quoteSubmissions } from '../db/schema'

const MAX_VISUALIZER_IMAGE_LENGTH = 2 * 1024 * 1024 // 2MB for base64 data URL
const CARPORT_VISUAL_CID = 'carport-visual'

/** Extract base64 content and filename from a data URL for Resend inline attachment */
function dataUrlToAttachment(dataUrl: string): { content: string; filename: string } | null {
  const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  const ext = match[1] === 'jpeg' || match[1] === 'jpg' ? 'jpg' : 'png'
  return { content: match[2], filename: `carport-visual.${ext}` }
}

interface VisualizerConfig {
  style?: string
  placement?: string
  metalColor?: string
  roofPanelType?: string
  aluminumPanelColor?: string | null
  polycarbonatePanelType?: string | null
  carportName?: string
}

interface QuoteBody {
  name: string
  email?: string
  phone?: string
  message?: string
  product_interest?: string
  product_slug?: string
  series_slug?: string
  session_id?: string
  source?: 'form' | 'chat'
  rendered_image?: string
  visualizer_config?: VisualizerConfig
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<QuoteBody>(event)

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : undefined
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : undefined
  const message = typeof body?.message === 'string' ? body.message.trim() : undefined
  const productInterest = typeof body?.product_interest === 'string' ? body.product_interest.trim() : undefined
  const productSlug = typeof body?.product_slug === 'string' ? body.product_slug.trim() : undefined
  const seriesSlug = typeof body?.series_slug === 'string' ? body.series_slug.trim() : undefined
  const chatSessionId = typeof body?.session_id === 'string' ? body.session_id.trim() : undefined
  const source = body?.source === 'chat' ? 'chat' : 'form'
  let visualizerImage: string | null = null
  if (typeof body?.rendered_image === 'string' && body.rendered_image.startsWith('data:image/')) {
    if (body.rendered_image.length <= MAX_VISUALIZER_IMAGE_LENGTH) {
      visualizerImage = body.rendered_image
    }
  }
  let visualizerConfigJson: string | null = null
  if (body?.visualizer_config && typeof body.visualizer_config === 'object') {
    const c = body.visualizer_config as Record<string, unknown>
    const safe: VisualizerConfig = {
      style: typeof c.style === 'string' ? c.style : undefined,
      placement: typeof c.placement === 'string' ? c.placement : undefined,
      metalColor: typeof c.metalColor === 'string' ? c.metalColor : undefined,
      roofPanelType: typeof c.roofPanelType === 'string' ? c.roofPanelType : undefined,
      aluminumPanelColor: c.aluminumPanelColor == null ? null : typeof c.aluminumPanelColor === 'string' ? c.aluminumPanelColor : undefined,
      polycarbonatePanelType: c.polycarbonatePanelType == null ? null : typeof c.polycarbonatePanelType === 'string' ? c.polycarbonatePanelType : undefined,
      carportName: typeof c.carportName === 'string' ? c.carportName : undefined,
    }
    if (Object.values(safe).some((v) => v !== undefined && v !== null)) {
      visualizerConfigJson = JSON.stringify(safe)
    }
  }

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  }
  if (!email && !phone) {
    throw createError({ statusCode: 400, statusMessage: 'Either email or phone is required' })
  }
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid email address format' })
    }
  }

  const resendApiKey = config.resendApiKey
  const fromEmail = config.resendFromEmail || 'onboarding@resend.dev'
  const ctx = event.context as { cloudflare?: { env?: Record<string, string> }; env?: Record<string, string> }
  const runtimeEnv = ctx.cloudflare?.env ?? ctx.env ?? {}
  const additionalRecipientsRaw =
    (typeof config.resendAdditionalRecipients === 'string' ? config.resendAdditionalRecipients : '') ||
    (typeof runtimeEnv.RESEND_ADDITIONAL_RECIPIENTS === 'string' ? runtimeEnv.RESEND_ADDITIONAL_RECIPIENTS : '') ||
    (typeof process.env.RESEND_ADDITIONAL_RECIPIENTS === 'string' ? process.env.RESEND_ADDITIONAL_RECIPIENTS : '')
  const additional = additionalRecipientsRaw
    .split(/[\s,]+/)
    .map((e) => e.trim().replace(/^["']|["']$/g, ''))
    .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
  const businessRecipients = [
    config.resendRecipientEmail,
    config.resendFromEmail,
    'hi@hybridinteractive.io',
    ...additional,
  ].filter((e): e is string => typeof e === 'string' && e.length > 0)
  const uniqueBusinessEmails = [...new Set(businessRecipients)]

  let insertedId: number | null = null
  if (config.tursoDatabaseUrl) {
    try {
      const db = useDb()
      const result = await db
        .insert(quoteSubmissions)
        .values({
          name,
          email: email || null,
          phone: phone || null,
          message: message || null,
          productInterest: productInterest || null,
          productSlug: productSlug || null,
          seriesSlug: seriesSlug || null,
          chatSessionId: chatSessionId || null,
          source,
          visualizerImage: visualizerImage || null,
          visualizerConfig: visualizerConfigJson || null,
          createdAt: new Date(),
        })
        .returning({ id: quoteSubmissions.id })
      insertedId = result[0]?.id ?? null
    } catch {
      // Continue even if DB insert fails
    }
  }

  if (uniqueBusinessEmails.length === 0 && !email) {
    return { success: true, message: 'Quote request submitted successfully' }
  }

  if (!resendApiKey) {
    return { success: true, message: 'Quote request submitted successfully' }
  }

  const resend = new Resend(resendApiKey)
  let visualizerConfigSummary = ''
  if (visualizerConfigJson) {
    try {
      const vc = JSON.parse(visualizerConfigJson) as VisualizerConfig
      const parts: string[] = []
      if (vc.carportName) parts.push(`Carport: ${vc.carportName}`)
      if (vc.style) parts.push(`House style: ${vc.style}`)
      if (vc.placement) parts.push(`Placement: ${vc.placement}`)
      if (vc.metalColor) parts.push(`Frame color: ${vc.metalColor}`)
      if (vc.roofPanelType) parts.push(`Roof: ${vc.roofPanelType}`)
      if (vc.aluminumPanelColor) parts.push(`Aluminum panel: ${vc.aluminumPanelColor}`)
      if (vc.polycarbonatePanelType) parts.push(`Polycarbonate panel: ${vc.polycarbonatePanelType}`)
      if (parts.length) {
        visualizerConfigSummary = `<p><strong>Carport Builder options:</strong></p><ul>${parts.map((p) => `<li>${p}</li>`).join('')}</ul>`
      }
    } catch {
      // ignore
    }
  }
  const visualizerParsed = visualizerImage ? dataUrlToAttachment(visualizerImage) : null
  const visualizerAttachment = visualizerParsed
    ? {
        content: visualizerParsed.content,
        filename: visualizerParsed.filename,
        contentId: CARPORT_VISUAL_CID,
      }
    : null
  const visualizerImgHtml = visualizerImage
    ? `<p><strong>Carport Builder visual:</strong></p><p><img src="cid:${CARPORT_VISUAL_CID}" alt="Carport visual" style="max-width:100%; height:auto; border-radius:8px;" /></p>`
    : ''
  const businessHtml = `
    <p><strong>Name:</strong> ${name}</p>
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
    ${productInterest ? `<p><strong>Product interest:</strong> ${productInterest}</p>` : ''}
    ${productSlug ? `<p><strong>Product:</strong> ${productSlug}</p>` : ''}
    ${seriesSlug ? `<p><strong>Series:</strong> ${seriesSlug}</p>` : ''}
    ${chatSessionId ? `<p><strong>Chat session:</strong> ${chatSessionId} (view in sales dashboard)</p>` : ''}
    ${visualizerConfigSummary}
    ${visualizerImgHtml}
    ${message ? `<p><strong>Message:</strong></p><p>${message.replace(/</g, '&lt;')}</p>` : ''}
    <p><em>Submitted ${new Date().toLocaleString()}</em></p>
  `

  const businessAttachments = visualizerAttachment ? [visualizerAttachment] : undefined
  if (uniqueBusinessEmails.length > 0) {
    await resend.emails.send({
      from: fromEmail,
      to: uniqueBusinessEmails,
      reply_to: email || undefined,
      subject: `Quote request from ${name}`,
      html: businessHtml,
      attachments: businessAttachments,
    })
  }

  const customerVisualHtml = visualizerImage
    ? `<p>Here’s the Carport Builder visual you created:</p><p><img src="cid:${CARPORT_VISUAL_CID}" alt="Your carport visual" style="max-width:100%; height:auto; border-radius:8px;" /></p>`
    : ''
  if (email) {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `We received your quote request, ${name}`,
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for your interest. We've received your quote request and will get back to you shortly.</p>
        ${customerVisualHtml}
        <p>— Carport Picker</p>
      `,
      attachments: visualizerAttachment ? [visualizerAttachment] : undefined,
    })
  }

  const webhookUrl =
    typeof config.quoteWebhookUrl === 'string' && config.quoteWebhookUrl.trim()
      ? config.quoteWebhookUrl.trim()
      : null
  if (webhookUrl) {
    try {
      await $fetch(webhookUrl, {
        method: 'POST',
        body: {
          id: insertedId,
          name,
          email: email ?? null,
          phone: phone ?? null,
          message: message ?? null,
          product_interest: productInterest ?? null,
          product_slug: productSlug ?? null,
          series_slug: seriesSlug ?? null,
          chat_session_id: chatSessionId ?? null,
          source,
          has_visualizer_image: !!visualizerImage,
          visualizer_config: visualizerConfigJson ? JSON.parse(visualizerConfigJson) : null,
          created_at: new Date().toISOString(),
        },
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // Don't fail the request if webhook fails
    }
  }

  return { success: true, message: 'Quote request submitted successfully' }
})
