<script setup lang="ts">
useHead({ title: 'Products | Carport Picker' })
const { data: products } = await useFetch<Array<{ id: string; name: string; description: string }>>('/api/products')
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <h1 class="text-3xl font-bold text-stone-900">Products</h1>
    <p class="mt-2 text-stone-600">
      Premium Japanese aluminum carports, patio covers, gates, fences, and entry doors.
    </p>
    <ul class="mt-10 space-y-4">
      <li v-for="p in (products ?? [])" :key="p.id">
        <NuxtLink
          :to="`/products/${p.id}`"
          class="block rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
        >
          <h2 class="text-xl font-semibold text-stone-900">{{ p.name }}</h2>
          <p class="mt-2 text-sm text-stone-600">{{ p.description }}</p>
          <span class="mt-3 inline-block text-sm font-medium text-amber-700">View details →</span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
