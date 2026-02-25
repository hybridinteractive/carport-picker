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

type TimelineEvent =
  | { type: 'quote'; at: string; lead: Lead }
  | { type: 'chat'; at: string; session: ChatSessionWithMessages }

const leads = ref<Lead[]>([])
const conversations = ref<ChatSessionWithMessages[]>([])
const timeline = ref<TimelineEvent[]>([])
const loading = ref(true)
const error = ref('')
const groupKey = ref('')

const hash = computed(() => {
  const p = route.params.hash
  return Array.isArray(p) ? p[0] : p ?? ''
})

function decodeGroupKey(h: string): string {
  try {
    const base64 = h.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf-8')
    return typeof decodeURIComponent !== 'undefined' ? decodeURIComponent(escape(decoded)) : decoded
  } catch {
    return ''
  }
}

const displayName = computed(() => leads.value[0]?.name ?? '—')
const displayContact = computed(() => leads.value[0]?.email ?? leads.value[0]?.phone ?? '—')
const productSummary = computed(() => {
  const tags = [...new Set(leads.value.flatMap((l) => [l.product_interest, l.product_slug, l.series_slug].filter(Boolean) as string[]))]
  return tags.length ? tags.map((t) => t.replace(/-/g, ' ')).join(' · ') : ''
})

async function loadGroup() {
  const t = getStoredToken()
  if (!t) {
    router.replace('/admin')
    return
  }
  const key = decodeGroupKey(hash.value)
  if (!key) {
    error.value = 'Invalid link.'
    loading.value = false
    return
  }
  groupKey.value = key
  if (key.startsWith('id:')) {
    const id = key.slice(3)
    router.replace(`/admin/leads/${id}`)
    return
  }
  loading.value = true
  error.value = ''
  leads.value = []
  conversations.value = []
  try {
    if (key.includes('@')) {
      const list = await fetchWithAuth<Lead[]>(`/api/admin/leads?email=${encodeURIComponent(key)}`)
      leads.value = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (key.startsWith('phone:')) {
      const phone = key.slice(6)
      const list = await fetchWithAuth<Lead[]>(`/api/admin/leads?phone=${encodeURIComponent(phone)}`)
      leads.value = list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else {
      loading.value = false
      return
    }
    const email = leads.value[0]?.email?.trim()
    if (email) {
      const sessions = await fetchWithAuth<Array<{ session_id: string; updated_at: string }>>(
        `/api/admin/sessions-by-email?email=${encodeURIComponent(email)}`
      )
      const loaded: ChatSessionWithMessages[] = []
      for (const s of sessions) {
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
          // skip
        }
      }
      conversations.value = loaded
    }
    buildTimeline()
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
  loadGroup()
})

function formatDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function leadProductSummary(l: Lead) {
  const parts: string[] = []
  if (l.product_interest) parts.push(l.product_interest.replace(/-/g, ' '))
  if (l.series_slug) parts.push(l.series_slug)
  else if (l.product_slug) parts.push(l.product_slug.replace(/-/g, ' '))
  return parts.length ? parts.join(' · ') : ''
}

function buildTimeline() {
  const events: TimelineEvent[] = []
  for (const lead of leads.value) {
    events.push({ type: 'quote', at: lead.created_at, lead })
  }
  for (const session of conversations.value) {
    if (session.messages.length === 0) continue
    const firstAt = session.messages.reduce(
      (min, m) => (m.created_at < min ? m.created_at : min),
      session.messages[0].created_at
    )
    events.push({ type: 'chat', at: firstAt, session })
  }
  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
  timeline.value = events
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <div class="mb-6 flex items-center gap-4">
      <NuxtLink to="/admin/leads" class="text-sm font-medium text-amber-700 hover:underline">← Leads</NuxtLink>
    </div>
    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</p>
    <template v-else-if="leads.length > 0">
      <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 class="text-xl font-bold text-stone-900">{{ displayName }}</h1>
        <p class="mt-1 text-sm text-stone-600">{{ displayContact }}</p>
        <p
          v-if="productSummary"
          class="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-900"
        >
          Interested in: {{ productSummary }}
        </p>
        <p class="mt-2 text-sm text-stone-500">
          {{ leads.length }} quote request{{ leads.length === 1 ? '' : 's' }}
        </p>
      </div>

      <section class="mt-8">
        <h2 class="mb-4 text-lg font-semibold text-stone-800">Activity</h2>
        <div class="space-y-6">
          <div
            v-for="(evt, idx) in timeline"
            :key="evt.type === 'quote' ? `q-${evt.lead.id}` : `c-${evt.session.session_id}-${idx}`"
            class="flex gap-4"
          >
            <div class="shrink-0 pt-0.5 text-right text-xs text-stone-500 w-28">
              {{ formatDate(evt.at) }}
            </div>
            <div class="min-w-0 flex-1 border-l-2 border-stone-200 pl-4">
              <div v-if="evt.type === 'quote'" class="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-medium uppercase tracking-wide text-amber-700">Quote request</p>
                <p class="mt-1 font-medium text-stone-900">{{ evt.lead.name }}</p>
                <p v-if="leadProductSummary(evt.lead)" class="mt-0.5 text-sm text-amber-800">
                  {{ leadProductSummary(evt.lead) }}
                </p>
                <p v-if="evt.lead.message" class="mt-2 text-sm text-stone-600">{{ evt.lead.message }}</p>
                <NuxtLink
                  :to="`/admin/leads/${evt.lead.id}`"
                  class="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline"
                >
                  View quote →
                </NuxtLink>
              </div>
              <div v-else class="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                <p class="text-xs font-medium uppercase tracking-wide text-amber-700">Chat</p>
                <div class="mt-2 space-y-2">
                  <div
                    v-for="(msg, i) in evt.session.messages"
                    :key="i"
                    :class="[
                      'rounded-lg px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'ml-4 bg-amber-100 text-stone-900'
                        : 'mr-4 bg-stone-100 text-stone-800'
                    ]"
                  >
                    <p class="text-xs text-stone-500">{{ formatDate(msg.created_at) }} · {{ msg.role }}</p>
                    <p class="mt-1 whitespace-pre-wrap">{{ msg.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
    <div v-else-if="loading" class="text-center text-stone-500">Loading…</div>
  </div>
</template>
