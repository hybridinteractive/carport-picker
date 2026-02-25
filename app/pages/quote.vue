<script setup lang="ts">
useHead({ title: 'Get a quote | Carport Picker' })
const route = useRoute()

const submitted = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

const productSlugFromQuery = computed(() => {
  const p = route.query.product
  return typeof p === 'string' ? p : ''
})
const seriesSlugFromQuery = computed(() => {
  const s = route.query.series
  return typeof s === 'string' ? s : ''
})
const sessionIdFromQuery = computed(() => {
  const sid = route.query.session_id
  return typeof sid === 'string' ? sid : ''
})
const productInterestFromQuery = computed(() => {
  const pi = route.query.product_interest
  return typeof pi === 'string' ? pi : ''
})

const config = useRuntimeConfig()
const calendlyUrl = computed(() => (config.public?.calendlyUrl as string)?.trim() || '')

const form = ref({
  name: '',
  email: '',
  phone: '',
  product_interest: '',
  message: '',
})

const VISUALIZER_IMAGE_KEY = 'carport-picker-visualizer-image'
const VISUALIZER_CONFIG_KEY = 'carport-picker-visualizer-config'
const visualizerImage = ref<string | null>(null)
const visualizerConfig = ref<Record<string, unknown> | null>(null)

const productOptions = [
  { value: '', label: 'Select…' },
  { value: 'carports', label: 'Carports' },
  { value: 'patio-covers', label: 'Patio Covers' },
  { value: 'gates', label: 'Gates' },
  { value: 'fences', label: 'Fences' },
  { value: 'entry-doors', label: 'Entry Doors' },
]

onMounted(() => {
  if (productInterestFromQuery.value && productOptions.some((o) => o.value === productInterestFromQuery.value)) {
    form.value.product_interest = productInterestFromQuery.value
  }
  if (productSlugFromQuery.value && !form.value.product_interest) {
    form.value.product_interest = productSlugFromQuery.value
  }
  const from = route.query.from
  if (from === 'visualizer') {
    form.value.message = form.value.message?.trim() ? form.value.message : 'I used the Carport Builder.'
  }
  if (typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(VISUALIZER_IMAGE_KEY)
      if (stored && stored.startsWith('data:image/')) {
        visualizerImage.value = stored
      }
      const configStr = sessionStorage.getItem(VISUALIZER_CONFIG_KEY)
      if (configStr) {
        try {
          visualizerConfig.value = JSON.parse(configStr) as Record<string, unknown>
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }
})

async function onSubmit() {
  if (!form.value.name.trim()) return
  if (!form.value.email?.trim() && !form.value.phone?.trim()) {
    error.value = 'Please provide either email or phone.'
    return
  }
  loading.value = true
  error.value = null
  try {
    await $fetch('/api/quote', {
      method: 'POST',
      body: {
        name: form.value.name.trim(),
        email: form.value.email?.trim() || undefined,
        phone: form.value.phone?.trim() || undefined,
        message: form.value.message?.trim() || undefined,
        product_interest: form.value.product_interest || undefined,
        product_slug: productSlugFromQuery.value || undefined,
        series_slug: seriesSlugFromQuery.value || undefined,
        session_id: sessionIdFromQuery.value || undefined,
        source: sessionIdFromQuery.value ? 'chat' : 'form',
        rendered_image: visualizerImage.value || undefined,
        visualizer_config: visualizerConfig.value || undefined,
      },
    })
    submitted.value = true
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem(VISUALIZER_IMAGE_KEY)
        sessionStorage.removeItem(VISUALIZER_CONFIG_KEY)
      } catch {
        // ignore
      }
    }
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; message?: string }
    error.value = err?.data?.statusMessage ?? err?.message ?? 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-12">
    <h1 class="text-3xl font-bold text-stone-900">Get a quote</h1>
    <p class="mt-2 text-stone-600">Tell us what you’re interested in and we’ll get back to you.</p>

    <div v-if="submitted" class="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
      <p class="font-medium">Thank you!</p>
      <p class="mt-2 text-sm">Your quote request has been submitted. We’ll be in touch shortly.</p>
      <p v-if="calendlyUrl" class="mt-4 text-sm">
        Want to schedule a call?
        <a :href="calendlyUrl" target="_blank" rel="noopener noreferrer" class="font-medium underline hover:no-underline">Schedule a call</a>
      </p>
    </div>

    <form v-else class="mt-10 space-y-4" @submit.prevent="onSubmit">
      <div v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
        {{ error }}
      </div>
      <div>
        <label for="name" class="block text-sm font-medium text-stone-700">Name *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-stone-700">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label for="phone" class="block text-sm font-medium text-stone-700">Phone</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label for="product_interest" class="block text-sm font-medium text-stone-700">Product interest</label>
        <select
          id="product_interest"
          v-model="form.product_interest"
          class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        >
          <option v-for="opt in productOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div v-if="visualizerImage" class="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p class="text-sm font-medium text-amber-900">Your Carport Builder visual will be included with this quote.</p>
        <img
          :src="visualizerImage"
          alt="Your visual"
          class="mt-2 max-h-32 w-auto rounded-lg border border-stone-200 object-contain"
        />
      </div>
      <div>
        <label for="message" class="block text-sm font-medium text-stone-700">Message</label>
        <textarea
          id="message"
          v-model="form.message"
          rows="4"
          class="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-amber-600 py-2.5 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? 'Sending…' : 'Submit' }}
      </button>
    </form>
  </div>
</template>
