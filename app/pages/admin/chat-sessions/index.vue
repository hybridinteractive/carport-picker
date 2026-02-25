<script setup lang="ts">
useHead({ title: 'Chats without quote | Admin | Carport Picker' })
const router = useRouter()
const { loadToken, getStoredToken, fetchWithAuth } = useAdminAuth()

interface ChatSessionRow {
  session_id: string
  email: string | null
  created_at: string
  updated_at: string
  message_count: number
}

const sessions = ref<ChatSessionRow[]>([])
const loading = ref(true)
const error = ref('')

async function load() {
  const t = getStoredToken()
  if (!t) {
    router.replace('/admin')
    return
  }
  loading.value = true
  error.value = ''
  try {
    sessions.value = await fetchWithAuth<ChatSessionRow[]>('/api/admin/chat-sessions')
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err?.statusCode === 401) {
      router.replace('/admin')
    } else {
      error.value = 'Failed to load chat sessions.'
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function viewUrl(sessionId: string) {
  return `/admin/chat-sessions/${encodeURIComponent(sessionId)}`
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-900">Chats without quote</h1>
      <NuxtLink to="/admin/leads" class="text-sm text-stone-600 hover:text-stone-900">← Leads</NuxtLink>
    </div>
    <p class="mt-2 text-sm text-stone-500">Conversations that have not been linked to a quote.</p>
    <p v-if="error" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</p>
    <div v-else-if="loading" class="mt-8 text-center text-stone-500">Loading…</div>
    <div v-else-if="sessions.length === 0" class="mt-8 text-stone-500">No chat-only sessions.</div>
    <ul v-else class="mt-6 space-y-3">
      <li
        v-for="s in sessions"
        :key="s.session_id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
      >
        <div class="min-w-0 flex-1">
          <NuxtLink
            :to="viewUrl(s.session_id)"
            class="font-medium text-stone-900 hover:text-amber-700 hover:underline"
          >
            {{ s.email || s.session_id }}
          </NuxtLink>
          <p v-if="s.email" class="mt-0.5 text-xs text-stone-500 truncate">{{ s.session_id }}</p>
          <span class="mt-1 inline-block rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-700">
            {{ s.message_count }} message{{ s.message_count === 1 ? '' : 's' }}
          </span>
        </div>
        <span class="text-sm text-stone-500">{{ formatDate(s.updated_at) }}</span>
      </li>
    </ul>
  </div>
</template>
