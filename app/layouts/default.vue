<script setup lang="ts">
const links = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Chat', to: '/chat' },
  { label: 'Get a Quote', to: '/quote' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-stone-50 text-stone-900">
    <header class="border-b border-stone-200 bg-white/80 backdrop-blur">
      <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <NuxtLink to="/" class="text-xl font-semibold tracking-tight text-stone-800">
          Carport Picker
        </NuxtLink>
        <ul class="flex items-center gap-6">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="text-sm font-medium text-stone-600 hover:text-stone-900"
              active-class="text-amber-700"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="border-t border-stone-200 bg-stone-100 py-8 text-center text-sm text-stone-500">
      <p>Premium Japanese aluminum carports &amp; shade structures for Colorado.</p>
      <p class="mt-1">Products by KunkelWorks / Sankyo-Tateyama.</p>
    </footer>
  </div>
</template>
