import { desc, eq, sql } from 'drizzle-orm'
import { requireAdminAuth } from '../../utils/adminAuth'
import { quoteSubmissions } from '../../db/schema'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const email = getQuery(event).email
  const phone = getQuery(event).phone
  const db = useDb()
  if (typeof email === 'string' && email.trim()) {
    const trimmed = email.trim().toLowerCase()
    if (EMAIL_REGEX.test(trimmed)) {
      const rows = await db
        .select()
        .from(quoteSubmissions)
        .where(sql`LOWER(${quoteSubmissions.email}) = ${trimmed}`)
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
    }
  }
  if (typeof phone === 'string' && phone.trim()) {
    const trimmed = phone.trim()
    const rows = await db
      .select()
      .from(quoteSubmissions)
      .where(eq(quoteSubmissions.phone, trimmed))
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
  }
  const rows = await db.select().from(quoteSubmissions).orderBy(desc(quoteSubmissions.createdAt))
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
