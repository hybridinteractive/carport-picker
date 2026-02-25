const CHAT_SESSION_STORAGE_KEY = 'carport-chat-session'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatSessionSummary {
  session_id: string
  created_at: Date | string
  updated_at: Date | string
}

export interface UseChatOptions {
  /** Restore and load history for this session (e.g. from route query or localStorage) */
  initialSessionId?: string | null
  /** Persist session_id to localStorage when set (default true) so history can be restored on next visit */
  persistSession?: boolean
}

export type MagicLinkIntent = 'link_session' | 'list_sessions'

export function useChat(options: UseChatOptions = {}) {
  const { initialSessionId, persistSession = true } = options
  const messages = ref<ChatMessage[]>([])
  const sessionId = ref<string | null>(initialSessionId ?? null)
  const loading = ref(false)
  const loadingHistory = ref(false)
  const error = ref<string | null>(null)
  const verifiedEmail = ref<string | null>(null)

  async function loadHistory(sid: string) {
    if (loadingHistory.value) return
    loadingHistory.value = true
    error.value = null
    try {
      const res = await $fetch<{
        session_id: string
        messages: { role: 'user' | 'assistant'; content: string }[]
      }>('/api/chat', { query: { session_id: sid } })
      sessionId.value = res.session_id
      messages.value = res.messages.map((m) => ({ role: m.role, content: m.content }))
      if (persistSession && typeof localStorage !== 'undefined') {
        localStorage.setItem(CHAT_SESSION_STORAGE_KEY, res.session_id)
      }
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; message?: string }
      error.value = err?.data?.statusMessage ?? err?.message ?? 'Failed to load chat history'
    } finally {
      loadingHistory.value = false
    }
  }

  async function linkSessionToEmail(email: string) {
    const sid = sessionId.value
    if (!sid?.trim()) {
      error.value = 'No active chat session to link'
      return
    }
    const trimmed = email.trim()
    if (!trimmed) {
      error.value = 'Email is required'
      return
    }
    error.value = null
    try {
      await $fetch('/api/chat/link', {
        method: 'POST',
        body: { session_id: sid, email: trimmed },
      })
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; message?: string }
      error.value = err?.data?.statusMessage ?? err?.message ?? 'Failed to link chat to email'
      throw e
    }
  }

  async function fetchSessionsByEmail(email: string): Promise<ChatSessionSummary[]> {
    const trimmed = email.trim()
    if (!trimmed) return []
    const res = await $fetch<ChatSessionSummary[]>('/api/chat/sessions', { query: { email: trimmed } })
    return res ?? []
  }

  async function requestMagicLink(payload: {
    email: string
    intent: MagicLinkIntent
    session_id?: string
  }): Promise<void> {
    const email = payload.email.trim()
    if (!email) {
      error.value = 'Email is required'
      return
    }
    error.value = null
    try {
      await $fetch('/api/chat/request-magic-link', {
        method: 'POST',
        body: {
          email,
          intent: payload.intent,
          session_id: payload.session_id ?? undefined,
        },
      })
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; message?: string }
      error.value = err?.data?.statusMessage ?? err?.message ?? 'Failed to send verification email'
      throw e
    }
  }

  async function refreshVerifiedEmail(): Promise<void> {
    try {
      const res = await $fetch<{ email: string } | null>('/api/chat/verified-email')
      verifiedEmail.value = res?.email ?? null
    } catch {
      verifiedEmail.value = null
    }
  }

  async function send(userContent: string) {
    if (!userContent.trim() || loading.value) return
    const content = userContent.trim()
    messages.value.push({ role: 'user', content })
    loading.value = true
    error.value = null
    try {
      const res = await $fetch<{ session_id: string; message: string }>('/api/chat', {
        method: 'POST',
        body: { message: content, session_id: sessionId.value ?? undefined },
      })
      sessionId.value = res.session_id
      messages.value.push({ role: 'assistant', content: res.message })
      if (persistSession && typeof localStorage !== 'undefined') {
        localStorage.setItem(CHAT_SESSION_STORAGE_KEY, res.session_id)
      }
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; message?: string }
      error.value = err?.data?.statusMessage ?? err?.message ?? 'Something went wrong'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (initialSessionId?.trim()) {
      loadHistory(initialSessionId.trim())
    }
    refreshVerifiedEmail()
  })

  return {
    messages,
    sessionId,
    loading,
    loadingHistory,
    error,
    verifiedEmail,
    send,
    loadHistory,
    linkSessionToEmail,
    fetchSessionsByEmail,
    requestMagicLink,
    refreshVerifiedEmail,
  }
}
