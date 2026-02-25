<script setup lang="ts">
const categories = [
  { title: 'Carports', description: 'Single, double & triple — protect your vehicles.', to: '/products/carports', icon: '🚗' },
  { title: 'Patio Covers', description: 'Shade and style for outdoor living.', to: '/products/patio-covers', icon: '🏡' },
  { title: 'Gates & Fences', description: 'Entry gates, driveway gates, railings.', to: '/products/gates', icon: '🚧' },
  { title: 'Entry Doors', description: 'Elegant, secure aluminum entry doors.', to: '/products/entry-doors', icon: '🚪' },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 px-4 py-20 sm:px-6 sm:py-28">
      <div class="mx-auto max-w-4xl text-center">
        <h1 class="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Find the right carport for your space
        </h1>
        <p class="mt-4 text-lg text-stone-600">
          Premium Japanese aluminum carports and shade structures, built for Colorado.
        </p>
        <p class="mt-2 text-sm text-stone-500">
          Anodized · Meticulously crafted · High grade
        </p>
        <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
          <NuxtLink
            to="/chat"
            class="inline-flex items-center rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
          >
            Talk to an expert
          </NuxtLink>
          <NuxtLink
            to="/quote"
            class="inline-flex items-center rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Get a quote
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <h2 class="text-center text-2xl font-semibold text-stone-800 sm:text-3xl">
        What are you looking for?
      </h2>
      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="cat in categories"
          :key="cat.to"
          :to="cat.to"
          class="group flex flex-col rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <span class="text-2xl" aria-hidden="true">{{ cat.icon }}</span>
          <h3 class="mt-3 text-lg font-semibold text-stone-900 group-hover:text-amber-800">
            {{ cat.title }}
          </h3>
          <p class="mt-1 flex-1 text-sm text-stone-600">
            {{ cat.description }}
          </p>
          <span class="mt-3 text-sm font-medium text-amber-700 group-hover:underline">
            Explore →
          </span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
