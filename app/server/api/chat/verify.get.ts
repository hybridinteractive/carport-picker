import { sendRedirect } from 'h3'
import { eq, and, gt } from 'drizzle-orm'
import { magicLinks, chatSessions } from '../../db/schema'
import { setVerifiedEmailCookie } from '../../utils/verifiedEmail'

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token
  if (typeof token !== 'string' || !token.trim()) {
    sendRedirect(event, '/chat?error=expired', 302)
    return
  }

  const db = useDb()
  const now = new Date()
  const rows = await db
    .select()
    .from(magicLinks)
    .where(and(eq(magicLinks.token, token.trim()), gt(magicLinks.expiresAt, now)))
    .limit(1)

  if (rows.length === 0) {
    sendRedirect(event, '/chat?error=expired', 302)
    return
  }

  const row = rows[0]
  await db.delete(magicLinks).where(eq(magicLinks.id, row.id))

  await setVerifiedEmailCookie(event, row.email)

  if (row.intent === 'link_session' && row.sessionId) {
    await db
      .update(chatSessions)
      .set({ email: row.email, updatedAt: new Date() })
      .where(eq(chatSessions.sessionId, row.sessionId))
  }

  const config = useRuntimeConfig()
  const baseUrl = ((config.appBaseUrl as string) || 'http://localhost:3000').replace(/\/$/, '')

  if (row.intent === 'link_session') {
    sendRedirect(event, `${baseUrl}/chat?linked=1`, 302)
  } else {
    sendRedirect(event, `${baseUrl}/chat?email=${encodeURIComponent(row.email)}`, 302)
  }
})
