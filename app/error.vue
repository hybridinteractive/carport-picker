<script setup lang="ts">
const props = defineProps<{
  error: { statusCode?: number; message?: string; statusMessage?: string }
}>()

const is404 = computed(() => props.error?.statusCode === 404)
const message = computed(() => {
  if (is404.value) return 'This page doesn’t exist.'
  return props.error?.message ?? props.error?.statusMessage ?? 'Something went wrong.'
})

function tryAgain() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 py-20">
    <div class="mx-auto max-w-md text-center">
      <p class="text-6xl font-bold text-stone-200" aria-hidden="true">
        {{ error?.statusCode ?? 'Error' }}
      </p>
      <h1 class="mt-4 text-2xl font-semibold text-stone-900">
        {{ is404 ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="mt-2 text-stone-600">
        {{ message }}
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <NuxtLink
          to="/"
          class="inline-flex items-center rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          Back to home
        </NuxtLink>
        <NuxtLink
          v-if="!is404"
          to="/"
          class="inline-flex items-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          @click="tryAgain"
        >
          Try again
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
