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

const leads = ref<Lead[]>([])
const loading = ref(true)
const error = ref('')

async function loadLeads() {
  const t = getStoredToken()
  if (!t) {
    router.replace('/admin')
    return
  }
  loading.value = true
  error.value = ''
  try {
    leads.value = await fetchWithAuth<Lead[]>('/api/admin/leads')
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
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-900">Leads</h1>
      <NuxtLink to="/admin" class="text-sm text-stone-600 hover:text-stone-900">Back</NuxtLink>
    </div>
    <p v-if="error" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{{ error }}</p>
    <div v-else-if="loading" class="mt-8 text-center text-stone-500">Loading…</div>
    <div v-else-if="leads.length === 0" class="mt-8 text-stone-500">No leads yet.</div>
    <ul v-else class="mt-6 space-y-3">
      <li
        v-for="lead in leads"
        :key="lead.id"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
      >
        <div class="min-w-0 flex-1">
          <NuxtLink
            :to="`/admin/leads/${lead.id}`"
            class="font-medium text-stone-900 hover:text-amber-700 hover:underline"
          >
            {{ lead.name }}
          </NuxtLink>
          <p class="mt-0.5 text-sm text-stone-600">
            {{ lead.email || lead.phone || '—' }}
          </p>
          <div class="mt-1 flex flex-wrap gap-2">
            <span v-if="lead.product_interest" class="rounded bg-stone-100 px-1.5 py-0.5 text-xs text-stone-700">
              {{ lead.product_interest }}
            </span>
            <span
              v-if="lead.chat_session_id"
              class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800"
            >
              From chat
            </span>
          </div>
        </div>
        <span class="text-sm text-stone-500">{{ formatDate(lead.created_at) }}</span>
      </li>
    </ul>
  </div>
</template>
