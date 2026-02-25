import { desc } from 'drizzle-orm'
import { requireAdminAuth } from '../../utils/adminAuth'
import { quoteSubmissions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const db = useDb()
  const rows = await db
    .select()
    .from(quoteSubmissions)
    .orderBy(desc(quoteSubmissions.createdAt))

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    message: r.message,
    product_interest: r.productInterest,
    product_slug: r.productSlug,
    series_slug: r.seriesSlug,
    chat_session_id: r.chatSessionId,
    source: r.source,
    created_at: r.createdAt,
  }))
})
