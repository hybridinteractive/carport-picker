import { count, desc, inArray, not, sql } from 'drizzle-orm'
import { requireAdminAuth } from '../../utils/adminAuth'
import { chatSessions, chatMessages, quoteSubmissions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const db = useDb()

  const linkedRows = await db
    .select({ chatSessionId: quoteSubmissions.chatSessionId })
    .from(quoteSubmissions)
    .where(sql`${quoteSubmissions.chatSessionId} IS NOT NULL`)
  const linkedSessionIds = [...new Set(linkedRows.map((r) => r.chatSessionId).filter(Boolean) as string[])]

  const sessions = await db
    .select({
      sessionId: chatSessions.sessionId,
      email: chatSessions.email,
      createdAt: chatSessions.createdAt,
      updatedAt: chatSessions.updatedAt,
    })
    .from(chatSessions)
    .where(
      linkedSessionIds.length === 0
        ? sql`1 = 1`
        : not(inArray(chatSessions.sessionId, linkedSessionIds))
    )
    .orderBy(desc(chatSessions.updatedAt))

  if (sessions.length === 0) {
    return []
  }

  const messageCounts = await db
    .select({
      sessionId: chatMessages.sessionId,
      count: count(),
    })
    .from(chatMessages)
    .where(inArray(chatMessages.sessionId, sessions.map((s) => s.sessionId)))
    .groupBy(chatMessages.sessionId)

  const countBySession = new Map(messageCounts.map((r) => [r.sessionId, r.count]))

  return sessions.map((s) => ({
    session_id: s.sessionId,
    email: s.email ?? null,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
    message_count: countBySession.get(s.sessionId) ?? 0,
  }))
})
