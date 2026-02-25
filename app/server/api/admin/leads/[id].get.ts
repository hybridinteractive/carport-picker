import { eq } from 'drizzle-orm'
import { requireAdminAuth } from '../../../utils/adminAuth'
import { quoteSubmissions } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = getRouterParam(event, 'id')
  const numId = id ? parseInt(id, 10) : NaN
  if (!id || Number.isNaN(numId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid lead id' })
  }

  const db = useDb()
  const rows = await db
    .select()
    .from(quoteSubmissions)
    .where(eq(quoteSubmissions.id, numId))
    .limit(1)

  if (rows.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Lead not found' })
  }

  const r = rows[0]
  return {
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
  }
})
