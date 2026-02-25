<script setup lang="ts">
const links = [
  { label: 'Home', to: '/' },
  {
    label: 'Products',
    to: '/products',
    children: [
      { label: 'All products', to: '/products' },
      { label: 'Carports', to: '/products/carports' },
      { label: 'Patio Covers', to: '/products/patio-covers' },
      { label: 'Gates', to: '/products/gates' },
      { label: 'Fences', to: '/products/fences' },
      { label: 'Entry Doors', to: '/products/entry-doors' },
    ],
  },
  { label: 'Carport Builder', to: '/visualize' },
  { label: 'Chat', to: '/chat' },
  { label: 'Get a Quote', to: '/quote' },
]
const productsOpen = ref(false)
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
            <template v-if="link.children">
              <div class="relative" @mouseenter="productsOpen = true" @mouseleave="productsOpen = false">
                <NuxtLink
                  :to="link.to"
                  class="text-sm font-medium text-stone-600 hover:text-stone-900"
                  active-class="text-amber-700"
                >
                  {{ link.label }}
                  <span class="inline-block translate-y-0.5" aria-hidden="true">▾</span>
                </NuxtLink>
                <ul
                  v-show="productsOpen"
                  class="absolute left-0 top-full z-10 mt-1 min-w-44 rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
                >
                  <li v-for="child in link.children" :key="child.to">
                    <NuxtLink
                      :to="child.to"
                      class="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                      active-class="!bg-amber-50 !text-amber-800"
                    >
                      {{ child.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </template>
            <NuxtLink
              v-else
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
