<script setup lang="ts">
useHead({ title: 'Leads | Admin | Carport Picker' })
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

interface LeadGroup {
  key: string
  email: string | null
  name: string
  contact: string
  count: number
  productTags: string[]
  hasChat: boolean
  latestAt: string
  leads: Lead[]
}

const groups = ref<LeadGroup[]>([])
const loading = ref(true)
const error = ref('')

function groupKey(lead: Lead): string {
  const e = lead.email?.trim().toLowerCase()
  if (e) return e
  const p = lead.phone?.trim()
  if (p) return `phone:${p}`
  return `id:${lead.id}`
}

function encodeGroupKey(key: string): string {
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(key, 'utf-8').toString('base64')
      : btoa(unescape(encodeURIComponent(key)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function loadLeads() {
  const t = getStoredToken()
  if (!t) {
    router.replace('/admin')
    return
  }
  loading.value = true
  error.value = ''
  try {
    const leads = await fetchWithAuth<Lead[]>('/api/admin/leads')
    const byKey = new Map<string, Lead[]>()
    for (const lead of leads) {
      const key = groupKey(lead)
      if (!byKey.has(key)) byKey.set(key, [])
      byKey.get(key)!.push(lead)
    }
    const list: LeadGroup[] = []
    for (const [key, groupLeads] of byKey) {
      const sorted = [...groupLeads].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const latest = sorted[0]!
      const productTags = [...new Set(sorted.flatMap((l) => [l.product_interest, l.product_slug, l.series_slug].filter(Boolean) as string[]))]
      list.push({
        key,
        email: latest.email ?? null,
        name: latest.name,
        contact: latest.email ?? latest.phone ?? '—',
        count: sorted.length,
        productTags,
        hasChat: sorted.some((l) => l.chat_session_id),
        latestAt: latest.created_at,
        leads: sorted,
      })
    }
    list.sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime())
    groups.value = list
  } catch (e: unknown) {
    const err = e as { statusCode?: number }
    if (err?.statusCode === 401) {
      router.replace('/admin')
    } else {
      error.value = 'Failed to load leads.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadToken()
  loadLeads()
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

function groupLink(group: LeadGroup) {
  if (group.email) return `/admin/leads/group/${encodeGroupKey(group.key)}`
  if (group.leads.length === 1) return `/admin/leads/${group.leads[0].id}`
  return `/admin/leads/group/${encodeGroupKey(group.key)}`
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-900">Leads</h1>
      <NuxtLink to="/admin" class="text-sm text-stone-600 hover:text-stone-900">Back</NuxtLink>
    </div>
    <p v-if="error" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</p>
    <div v-else-if="loading" class="mt-8 text-center text-stone-500">Loading…</div>
    <div v-else-if="groups.length === 0" class="mt-8 text-stone-500">No leads yet.</div>
    <ul v-else class="mt-6 space-y-3">
      <li
        v-for="group in groups"
        :key="group.key"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
      >
        <div class="min-w-0 flex-1">
          <NuxtLink
            :to="groupLink(group)"
            class="font-medium text-stone-900 hover:text-amber-700 hover:underline"
          >
            {{ group.name }}
          </NuxtLink>
          <p class="mt-0.5 text-sm text-stone-600">
            {{ group.contact }}
          </p>
          <div class="mt-1 flex flex-wrap items-center gap-2">
            <span
              v-if="group.count > 1"
              class="rounded bg-stone-200 px-1.5 py-0.5 text-xs font-medium text-stone-700"
            >
              {{ group.count }} quote{{ group.count === 1 ? '' : 's' }}
            </span>
            <span
              v-for="tag in group.productTags.slice(0, 3)"
              :key="tag"
              class="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-700"
            >
              {{ tag }}
            </span>
            <span
              v-if="group.hasChat"
              class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800"
            >
              From chat
            </span>
          </div>
        </div>
        <span class="text-sm text-stone-500">{{ formatDate(group.latestAt) }}</span>
      </li>
    </ul>
  </div>
</template>
