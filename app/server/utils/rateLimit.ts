import { getHeader } from 'h3'
import { eq } from 'drizzle-orm'
import { rateLimits } from '../db/schema'

export function getClientIp(event: Parameters<typeof getHeader>[0]): string {
  const cf = getHeader(event, 'cf-connecting-ip')
  if (cf) return cf
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return 'unknown'
}

export async function checkRateLimit(
  event: Parameters<typeof getHeader>[0],
  prefix: string,
  limit: number,
  windowMs: number
): Promise<void> {
  const ip = getClientIp(event)
  const key = `rl:${prefix}:${ip}`
  const db = useDb()
  const now = new Date()
  const windowEnd = new Date(now.getTime() + windowMs)

  const rows = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1)
  const existing = rows[0]
  const isExpired = !existing?.windowEnd || new Date(existing.windowEnd).getTime() < now.getTime()

  if (rows.length === 0 || isExpired) {
    if (rows.length === 0) {
      await db.insert(rateLimits).values({ key, count: 1, windowEnd })
    } else {
      await db.update(rateLimits).set({ count: 1, windowEnd }).where(eq(rateLimits.key, key))
    }
    return
  }

  const current = existing!
  const newCount = (current.count ?? 0) + 1
  await db.update(rateLimits).set({ count: newCount }).where(eq(rateLimits.key, key))

  if (newCount > limit) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Try again later.',
    })
  }
}
