import { eq } from 'drizzle-orm'
import { chatSessions } from '../../db/schema'
import { getVerifiedEmail } from '../../utils/verifiedEmail'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<{ session_id?: string; email?: string }>(event)
  const sessionId = typeof body?.session_id === 'string' ? body.session_id.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'session_id is required' })
  }
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }
  if (!EMAIL_REGEX.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address format' })
  }

  const verifiedEmail = await getVerifiedEmail(event)
  if (verifiedEmail !== email) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Please verify your email first by clicking the link we sent you.',
    })
  }

  const db = useDb()
  const existing = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.sessionId, sessionId))
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' })
  }

  await db
    .update(chatSessions)
    .set({ email, updatedAt: new Date() })
    .where(eq(chatSessions.sessionId, sessionId))

  return { ok: true }
})
