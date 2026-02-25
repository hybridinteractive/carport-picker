const ADMIN_TOKEN_KEY = 'carport-admin-token'

export function useAdminAuth() {
  const token = useState<string | null>('admin-token', () => null)

  function getStoredToken(): string | null {
    if (import.meta.client && typeof localStorage !== 'undefined') {
      return localStorage.getItem(ADMIN_TOKEN_KEY)
    }
    return null
  }

  function setToken(value: string | null) {
    if (import.meta.client && typeof localStorage !== 'undefined') {
      if (value) localStorage.setItem(ADMIN_TOKEN_KEY, value)
      else localStorage.removeItem(ADMIN_TOKEN_KEY)
    }
    token.value = value
  }

  function loadToken() {
    const t = getStoredToken()
    token.value = t
    return t
  }

  async function fetchWithAuth<T>(url: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    const t = token.value ?? getStoredToken()
    if (!t) {
      throw new Error('Not authenticated')
    }
    const res = await $fetch<T>(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${t}`,
        ...(options.headers as Record<string, string>),
      },
    })
    return res
  }

  return { token, setToken, getStoredToken, loadToken, fetchWithAuth }
}
