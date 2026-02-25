import { Resend } from 'resend'
import { eq } from 'drizzle-orm'
import { magicLinks, chatSessions } from '../../db/schema'
import { checkRateLimit } from '../../utils/rateLimit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000 // 15 min

export default defineEventHandler(async (event) => {
  try {
    await checkRateLimit(event, 'magic_link', 5, 15 * 60 * 1000)
  } catch (e: unknown) {
    const err = e as { statusCode?: number; statusMessage?: string }
    if (err.statusCode === 429) throw e
    console.error('[request-magic-link] Rate limit check failed:', e)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service temporarily unavailable. Please try again.',
    })
  }

  const config = useRuntimeConfig()
  const body = await readBody<{
    email?: string
    intent?: 'link_session' | 'list_sessions'
    session_id?: string
  }>(event)

  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const intent = body?.intent
  const sessionId = typeof body?.session_id === 'string' ? body.session_id.trim() : undefined

  if (!email || !EMAIL_REGEX.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email is required' })
  }
  if (intent !== 'link_session' && intent !== 'list_sessions') {
    throw createError({ statusCode: 400, statusMessage: 'intent must be link_session or list_sessions' })
  }
  if (intent === 'link_session' && (!sessionId || !sessionId.length)) {
    throw createError({ statusCode: 400, statusMessage: 'session_id is required when intent is link_session' })
  }

  let db
  try {
    db = useDb()
  } catch (e) {
    console.error('[request-magic-link] Database error:', e)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service temporarily unavailable. Please try again.',
    })
  }

  if (intent === 'link_session' && sessionId) {
    const existing = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId))
      .limit(1)
    if (existing.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Session not found' })
    }
  }

  const token = crypto.randomUUID()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + MAGIC_LINK_EXPIRY_MS)

  try {
    await db.insert(magicLinks).values({
      token,
      email,
      intent,
      sessionId: intent === 'link_session' ? sessionId : null,
      createdAt: now,
      expiresAt,
    })
  } catch (e) {
    console.error('[request-magic-link] Insert magic_links failed:', e)
    throw createError({
      statusCode: 503,
      statusMessage: 'Service temporarily unavailable. Please try again.',
    })
  }

  const baseUrl = (config.appBaseUrl as string) || 'http://localhost:3000'
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/api/chat/verify?token=${encodeURIComponent(token)}`

  const resendApiKey = config.resendApiKey
  const fromEmail = (config.resendFromEmail as string) || 'onboarding@resend.dev'

  if (!resendApiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[dev] Magic link (Resend not configured):', verifyUrl)
    }
    return { ok: true }
  }

  const resend = new Resend(resendApiKey)
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: 'Verify your email for Carport Picker chat',
    html: `
      <p>Click the link below to verify your email. This link expires in 15 minutes.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  })

  if (error) {
    console.error('[request-magic-link] Resend error:', error)
    throw createError({
      statusCode: 503,
      statusMessage: 'Could not send verification email. Please try again.',
    })
  }

  return { ok: true }
})
