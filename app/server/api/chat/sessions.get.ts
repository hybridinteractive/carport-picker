import { eq, desc } from 'drizzle-orm'
import { chatSessions } from '../../db/schema'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const email = getQuery(event).email
  if (typeof email !== 'string' || !email.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' })
  }
  const trimmed = email.trim()
  if (!EMAIL_REGEX.test(trimmed)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address format' })
  }

  const db = useDb()
  const rows = await db
    .select({
      sessionId: chatSessions.sessionId,
      createdAt: chatSessions.createdAt,
      updatedAt: chatSessions.updatedAt,
    })
    .from(chatSessions)
    .where(eq(chatSessions.email, trimmed))
    .orderBy(desc(chatSessions.updatedAt))

  return rows.map((r) => ({
    session_id: r.sessionId,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  }))
})
