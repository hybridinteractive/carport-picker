<script setup lang="ts">
useHead({ title: 'Chat | Admin | Carport Picker' })
const route = useRoute()
const router = useRouter()
const { loadToken, getStoredToken, fetchWithAuth } = useAdminAuth()

interface ChatMessage {
  role: string
  content: string
  created_at: string
}

const sessionId = computed(() => {
  const p = route.params.sessionId
  const raw = Array.isArray(p) ? p[0] : p
  return raw ? decodeURIComponent(raw) : ''
})

const messages = ref<ChatMessage[]>([])
const loading = ref(true)
const error = ref('')

async function load() {
  const t = getStoredToken()
  if (!t) {
    router.replace('/admin')
    return
  }
  if (!sessionId.value) {
    error.value = 'Missing session.'
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await fetchWithAuth<{ session_id: string; messages: ChatMessage[] }>(
      `/api/admin/chat/${encodeURIComponent(sessionId.value)}`
    )
    messages.value = data.messages ?? []
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err?.statusCode === 401) {
      router.replace('/admin')
    } else {
      error.value = 'Failed to load conversation.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadToken()
  load()
})

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6 flex items-center gap-4">
      <NuxtLink to="/admin/chat-sessions" class="text-sm font-medium text-amber-700 hover:underline">← Chats without quote</NuxtLink>
    </div>
    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</p>
    <template v-else>
      <h1 class="text-xl font-bold text-stone-900">Conversation</h1>
      <p class="mt-1 text-xs text-stone-500 font-mono truncate">{{ sessionId }}</p>
      <div v-if="loading" class="mt-6 text-center text-stone-500">Loading…</div>
      <div v-else-if="messages.length === 0" class="mt-6 text-stone-500">No messages.</div>
      <div v-else class="mt-6 space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div
          v-for="(msg, i) in messages"
          :key="i"
          :class="[
            'rounded-lg px-3 py-2 text-sm',
            msg.role === 'user'
              ? 'ml-8 bg-amber-100 text-stone-900'
              : 'mr-8 bg-stone-100 text-stone-800'
          ]"
        >
          <p class="text-xs text-stone-500">{{ formatDate(msg.created_at) }} · {{ msg.role }}</p>
          <p class="mt-1 whitespace-pre-wrap">{{ msg.content }}</p>
        </div>
      </div>
    </template>
  </div>
</template>
