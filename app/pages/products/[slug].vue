<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)
useHead({ title: () => `${product?.name ?? 'Product'} | Carport Picker` })

const { data: products } = await useFetch<Array<Record<string, unknown>>>('/api/products')
const product = computed(() => products.value?.find((p) => p.id === slug.value))

const series = computed(() => (product.value?.series as string[]) ?? [])
const styles = computed(() => (product.value?.styles as string[]) ?? [])
const options = computed(() => (product.value?.options as string[]) ?? [])
const benefits = computed(() => (product.value?.benefits as string[]) ?? [])
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <NuxtLink to="/products" class="text-sm font-medium text-amber-700 hover:underline">← Products</NuxtLink>
    <template v-if="product">
      <h1 class="mt-4 text-3xl font-bold text-stone-900">{{ product.name }}</h1>
      <p class="mt-2 text-stone-600">{{ product.description }}</p>
      <div class="mt-8 space-y-4">
        <section v-if="series.length">
          <h2 class="text-lg font-semibold text-stone-800">Series</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="s in series" :key="s">{{ s }}</li>
          </ul>
        </section>
        <section v-if="styles.length">
          <h2 class="text-lg font-semibold text-stone-800">Styles</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="s in styles" :key="s">{{ s }}</li>
          </ul>
        </section>
        <section v-if="options.length">
          <h2 class="text-lg font-semibold text-stone-800">Options</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="o in options" :key="o">{{ o }}</li>
          </ul>
        </section>
        <section v-if="benefits.length">
          <h2 class="text-lg font-semibold text-stone-800">Benefits</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="b in benefits" :key="b">{{ b }}</li>
          </ul>
        </section>
      </div>
      <div class="mt-10 flex gap-4">
        <NuxtLink
          to="/chat"
          class="inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Chat with an expert
        </NuxtLink>
        <NuxtLink
          to="/quote"
          class="inline-flex rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Get a quote
        </NuxtLink>
      </div>
    </template>
    <div v-else class="mt-8 text-stone-500">Product not found.</div>
  </div>
</template>
