<script setup lang="ts">
useHead({ title: 'Products | Carport Picker' })
const { data: products } = await useFetch<Array<{ id: string; name: string; description: string; image?: string }>>('/api/products')
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <h1 class="text-3xl font-bold text-stone-900">Products</h1>
    <p class="mt-2 text-stone-600">
      Premium Japanese aluminum carports, patio covers, gates, fences, and entry doors.
    </p>
    <ul class="mt-10 space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <li v-for="p in (products ?? [])" :key="p.id" class="grid grid-rows-subgrid">
        <NuxtLink
          :to="`/products/${p.id}`"
          class="block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <img
            v-if="p.image"
            :src="p.image"
            :alt="p.name"
            class="h-48 w-full object-cover"
            width="800"
            height="300"
          />
          <div class="p-6">
            <h2 class="text-xl font-semibold text-stone-900">{{ p.name }}</h2>
            <p class="mt-2 text-sm text-stone-600">{{ p.description }}</p>
            <span class="mt-3 inline-block text-sm font-medium text-amber-700">View details →</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
