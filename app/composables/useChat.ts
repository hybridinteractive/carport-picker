export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useChat() {
  const messages = ref<ChatMessage[]>([])
  const sessionId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

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
    } catch (e: unknown) {
      const err = e as { data?: { statusMessage?: string }; message?: string }
      error.value = err?.data?.statusMessage ?? err?.message ?? 'Something went wrong'
    } finally {
      loading.value = false
    }
  }

  return { messages, sessionId, loading, error, send }
}
