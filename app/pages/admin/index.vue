<script setup lang="ts">
useHead({ title: 'Admin | Carport Picker' })
const router = useRouter()
const { setToken, loadToken, getStoredToken } = useAdminAuth()
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  loadToken()
  if (getStoredToken()) {
    router.replace('/admin/leads')
  }
})

async function onSubmit() {
  if (!password.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<{ success?: boolean }>('/api/admin/leads', {
      headers: { Authorization: `Bearer ${password.value.trim()}` },
    })
    if (res) {
      setToken(password.value.trim())
      await router.push('/admin/leads')
    }
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { statusMessage?: string } }
    if (err?.statusCode === 401) {
      error.value = 'Invalid password.'
    } else if (err?.statusCode === 503) {
      error.value = 'Admin not configured. Set NUXT_ADMIN_SECRET in .env and restart the dev server.'
    } else {
      error.value = 'Something went wrong.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[40vh] max-w-sm flex-col justify-center px-4 py-16">
    <h1 class="text-2xl font-bold text-stone-900">Sales admin</h1>
    <p class="mt-1 text-sm text-stone-600">Enter the admin password to continue.</p>
    <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
      <div v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
        {{ error }}
      </div>
      <div>
        <label for="password" class="sr-only">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Admin password"
          class="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-amber-600 py-2.5 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Checking…' : 'Continue' }}
      </button>
    </form>
  </div>
</template>
