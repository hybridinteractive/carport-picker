<script setup lang="ts">
useHead({ title: 'Lead | Admin | Carport Picker' })
const route = useRoute()
const router = useRouter()
const { loadToken, getStoredToken, fetchWithAuth } = useAdminAuth()

interface Lead {
  id: number
  name: string
  email: string | null
  phone: string | null
  message: string | null
  product_interest: string | null
  product_slug: string | null
  series_slug: string | null
  chat_session_id: string | null
  source: string | null
  created_at: string
}

interface ChatMessage {
  role: string
  content: string
  created_at: string
}

interface ChatSessionWithMessages {
  session_id: string
  updated_at: string
  messages: ChatMessage[]
}

const lead = ref<Lead | null>(null)
const conversations = ref<ChatSessionWithMessages[]>([])
const loading = ref(true)
const error = ref('')

const id = computed(() => {
  const p = route.params.id
  return Array.isArray(p) ? p[0] : p
})

const productSummary = computed(() => {
  const l = lead.value
  if (!l) return ''
  const parts: string[] = []
  if (l.product_interest) parts.push(l.product_interest.replace(/-/g, ' '))
  if (l.series_slug) parts.push(l.series_slug)
  else if (l.product_slug) parts.push(l.product_slug.replace(/-/g, ' '))
  return parts.length ? parts.join(' · ') : ''
})

async function loadLead() {
  const t = getStoredToken()
  if (!t) {
    router.replace('/admin')
    return
  }
  loading.value = true
  error.value = ''
  conversations.value = []
  try {
    lead.value = await fetchWithAuth<Lead>(`/api/admin/leads/${id.value}`)
    const l = lead.value
    if (!l) return

    const sessionsByEmail: Array<{ session_id: string; updated_at: string }> = []
    if (l.email?.trim()) {
      const list = await fetchWithAuth<Array<{ session_id: string; updated_at: string }>>(
        `/api/admin/sessions-by-email?email=${encodeURIComponent(l.email.trim())}`
      )
      sessionsByEmail.push(...list)
    }
    const linkedId = l.chat_session_id ?? ''
    if (linkedId && !sessionsByEmail.some((s) => s.session_id === linkedId)) {
      sessionsByEmail.unshift({ session_id: linkedId, updated_at: l.created_at })
    }

    const loaded: ChatSessionWithMessages[] = []
    for (const s of sessionsByEmail) {
      try {
        const chat = await fetchWithAuth<{ session_id: string; messages: ChatMessage[] }>(
          `/api/admin/chat/${encodeURIComponent(s.session_id)}`
        )
        loaded.push({
          session_id: chat.session_id,
          updated_at: s.updated_at,
          messages: chat.messages ?? [],
        })
      } catch {
        // skip sessions that fail to load
      }
    }
    loaded.sort((a, b) => {
      if (a.session_id === linkedId) return -1
      if (b.session_id === linkedId) return 1
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
    conversations.value = loaded
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err?.statusCode === 401) {
      router.replace('/admin')
    } else {
      error.value = 'Failed to load lead.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadToken()
  loadLead()
})

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sessionLabel(session: ChatSessionWithMessages) {
  return lead.value?.chat_session_id === session.session_id
    ? 'Conversation (linked to this quote)'
    : 'Other conversation'
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6 flex items-center gap-4">
      <NuxtLink to="/admin/leads" class="text-sm font-medium text-amber-700 hover:underline">← Leads</NuxtLink>
    </div>
    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</p>
    <template v-else-if="lead">
      <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 class="text-xl font-bold text-stone-900">{{ lead.name }}</h1>
        <p
          v-if="productSummary"
          class="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900"
        >
          Interested in: {{ productSummary }}
        </p>
        <dl class="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div v-if="lead.email">
            <dt class="text-stone-500">Email</dt>
            <dd><a :href="`mailto:${lead.email}`" class="text-amber-700 hover:underline">{{ lead.email }}</a></dd>
          </div>
          <div v-if="lead.phone">
            <dt class="text-stone-500">Phone</dt>
            <dd><a :href="`tel:${lead.phone}`" class="text-amber-700 hover:underline">{{ lead.phone }}</a></dd>
          </div>
          <div v-if="lead.product_interest">
            <dt class="text-stone-500">Product interest</dt>
            <dd>{{ lead.product_interest }}</dd>
          </div>
          <div v-if="lead.product_slug">
            <dt class="text-stone-500">Product</dt>
            <dd>{{ lead.product_slug }}</dd>
          </div>
          <div v-if="lead.series_slug">
            <dt class="text-stone-500">Series</dt>
            <dd>{{ lead.series_slug }}</dd>
          </div>
          <div>
            <dt class="text-stone-500">Submitted</dt>
            <dd>{{ new Date(lead.created_at).toLocaleString() }}</dd>
          </div>
          <div v-if="lead.chat_session_id">
            <dt class="text-stone-500">Source</dt>
            <dd><span class="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">From chat</span></dd>
          </div>
        </dl>
        <div v-if="lead.message" class="mt-4 border-t border-stone-100 pt-4">
          <dt class="text-stone-500">Message</dt>
          <p class="mt-1 whitespace-pre-wrap text-stone-700">{{ lead.message }}</p>
        </div>
      </div>

      <template v-for="(conv, cIdx) in conversations" :key="conv.session_id">
        <section v-if="conv.messages.length > 0" class="mt-8">
          <h2 class="mb-4 text-lg font-semibold text-stone-800">
            {{ sessionLabel(conv) }}
          </h2>
          <div class="space-y-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <div
              v-for="(msg, i) in conv.messages"
              :key="`${cIdx}-${i}`"
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
        </section>
      </template>
    </template>
    <div v-else-if="loading" class="text-center text-stone-500">Loading…</div>
  </div>
</template>
