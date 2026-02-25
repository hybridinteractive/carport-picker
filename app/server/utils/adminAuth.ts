import { getHeader } from 'h3'

/**
 * Require admin auth for API routes. Throws 401 if Authorization header is missing or invalid.
 * Expects: Authorization: Bearer <NUXT_ADMIN_SECRET>
 */
export function requireAdminAuth(event: Parameters<typeof getHeader>[0]) {
  const config = useRuntimeConfig()
  const raw = config.adminSecret
  const secret = typeof raw === 'string' ? raw.trim() : ''
  if (!secret) {
    throw createError({ statusCode: 503, statusMessage: 'Admin not configured' })
  }
  const auth = getHeader(event, 'authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (token !== secret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
}
