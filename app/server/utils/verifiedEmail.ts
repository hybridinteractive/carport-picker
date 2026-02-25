import { getCookie, setCookie } from 'h3'

const COOKIE_NAME = 'carport_verified_email'
const COOKIE_MAX_AGE = 86400 // 24 hours

function base64UrlEncode(bytes: ArrayBuffer): string {
  const u8 = new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i])
  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (3 - (str.length % 4)) % 4)
  if (typeof atob !== 'undefined') {
    const binary = atob(padded)
    const u8 = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i)
    return u8
  }
  return new Uint8Array(Buffer.from(padded, 'base64'))
}

async function hmacSign(secret: string, message: string): Promise<ArrayBuffer> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
}

async function hmacVerify(secret: string, message: string, signature: ArrayBuffer): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )
  return crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(message))
}

export async function getVerifiedEmail(event: { context?: { _verifiedEmail?: string | null } }): Promise<string | null> {
  const secret = getCookieSecret()
  if (!secret) return null

  const raw = getCookie(event, COOKIE_NAME)
  if (!raw) return null

  const dot = raw.indexOf('.')
  if (dot === -1) return null
  const payloadB64 = raw.slice(0, dot)
  const sigB64 = raw.slice(dot + 1)
  if (!payloadB64 || !sigB64) return null

  try {
    const payloadBytes = base64UrlDecode(payloadB64)
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { email?: string; exp?: number }
    if (typeof payload.email !== 'string' || typeof payload.exp !== 'number') return null
    if (payload.exp < Date.now() / 1000) return null

    const sigBytes = base64UrlDecode(sigB64)
    const message = new TextDecoder().decode(payloadBytes)
    const valid = await hmacVerify(secret, message, sigBytes.buffer)
    if (!valid) return null
    return payload.email
  } catch {
    return null
  }
}

function getCookieSecret(): string {
  const config = useRuntimeConfig()
  const secret = config.cookieSecret
  if (secret && typeof secret === 'string') return secret
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-cookie-secret-do-not-use-in-production'
  }
  throw new Error('NUXT_COOKIE_SECRET must be set in production')
}

export async function setVerifiedEmailCookie(event: Parameters<typeof setCookie>[0], email: string): Promise<void> {
  const secret = getCookieSecret()

  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE
  const payload = JSON.stringify({ email, exp })
  const payloadBytes = new TextEncoder().encode(payload)
  const signature = await hmacSign(secret, payload)
  const value = base64UrlEncode(payloadBytes) + '.' + base64UrlEncode(signature)

  const isProd = process.env.NODE_ENV === 'production'
  setCookie(event, COOKIE_NAME, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}
