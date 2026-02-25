import { eq, asc } from 'drizzle-orm'
import { requireAdminAuth } from '../../../utils/adminAuth'
import { chatMessages } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const sessionId = getRouterParam(event, 'sessionId')
  if (!sessionId?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'sessionId is required' })
  }

  const db = useDb()
  const rows = await db
    .select({
      role: chatMessages.role,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId.trim()))
    .orderBy(asc(chatMessages.createdAt))

  return {
    session_id: sessionId.trim(),
    messages: rows.map((m) => ({
      role: m.role,
      content: m.content,
      created_at: m.createdAt,
    })),
  }
})
