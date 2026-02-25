import { Resend } from 'resend'
import { quoteSubmissions } from '../db/schema'

interface QuoteBody {
  name: string
  email?: string
  phone?: string
  message?: string
  product_interest?: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<QuoteBody>(event)

  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : undefined
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : undefined
  const message = typeof body?.message === 'string' ? body.message.trim() : undefined
  const productInterest = typeof body?.product_interest === 'string' ? body.product_interest.trim() : undefined

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
  const businessEmail = config.resendRecipientEmail || config.resendFromEmail || null

  if (config.tursoDatabaseUrl) {
    try {
      const db = useDb()
      await db.insert(quoteSubmissions).values({
        name,
        email: email || null,
        phone: phone || null,
        message: message || null,
        productInterest: productInterest || null,
        createdAt: new Date(),
      })
    } catch {
      // Continue even if DB insert fails
    }
  }

  if (!businessEmail && !email) {
    return { success: true, message: 'Quote request submitted successfully' }
  }

  if (!resendApiKey) {
    return { success: true, message: 'Quote request submitted successfully' }
  }

  const resend = new Resend(resendApiKey)
  const businessHtml = `
    <p><strong>Name:</strong> ${name}</p>
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
    ${productInterest ? `<p><strong>Product interest:</strong> ${productInterest}</p>` : ''}
    ${message ? `<p><strong>Message:</strong></p><p>${message.replace(/</g, '&lt;')}</p>` : ''}
    <p><em>Submitted ${new Date().toLocaleString()}</em></p>
  `

  if (businessEmail) {
    await resend.emails.send({
      from: fromEmail,
      to: businessEmail,
      reply_to: email || undefined,
      subject: `Quote request from ${name}`,
      html: businessHtml,
    })
  }

  if (email) {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `We received your quote request, ${name}`,
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for your interest. We've received your quote request and will get back to you shortly.</p>
        <p>— Carport Picker</p>
      `,
    })
  }

  return { success: true, message: 'Quote request submitted successfully' }
})
