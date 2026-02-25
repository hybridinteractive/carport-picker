<script setup lang="ts">
const route = useRoute()
const slug = computed(() => {
  const p = route.params.slug
  return Array.isArray(p) ? p[0] ?? '' : (p ?? '')
})
const seriesSlug = computed(() => {
  const p = route.params.series
  return Array.isArray(p) ? p[0] ?? '' : (p ?? '')
})

interface SeriesInfo {
  name: string
  description?: string
  image?: string
  sizes?: string[]
  priceRange?: string
  galleryUrl?: string
  detailUrl?: string
  pdfUrl?: string
}

const { data: products } = await useFetch<Array<Record<string, unknown>>>('/api/products')
const product = computed(() => products.value?.find((p) => p.id === slug.value) as Record<string, unknown> | undefined)
const seriesDetails = computed(() => (product.value?.seriesDetails as Record<string, SeriesInfo>) ?? {})
const series = computed(() => seriesDetails.value[seriesSlug.value])
const productName = computed(() => (product.value?.name as string) ?? '')
const productPriceNote = computed(() => (product.value?.priceNote as string) ?? '')
const seriesSizes = computed(() => (series.value?.sizes ?? []) as string[])

useHead({ title: () => `${series.value?.name ?? 'Series'} | ${productName.value} | Carport Picker` })
</script>

<template>
  <div class="mt-4">
    <NuxtLink :to="`/products/${slug}`" class="text-sm font-medium text-amber-700 hover:underline">← {{ productName || 'Product' }}</NuxtLink>
    <template v-if="series">
      <img
        v-if="series.image"
        :src="series.image"
        :alt="series.name"
        class="mt-4 w-full rounded-lg object-cover shadow-md"
        width="800"
        height="400"
      />
      <img
        v-else
        :src="`https://placehold.co/800x400/78716c/f5f5f4?text=${encodeURIComponent(series.name)}`"
        :alt="series.name"
        class="mt-4 w-full rounded-lg object-cover shadow-md"
        width="800"
        height="400"
      />
      <h1 class="mt-4 text-3xl font-bold text-stone-900">{{ series.name }}</h1>
      <p v-if="series.description" class="mt-2 text-stone-600">{{ series.description }}</p>

      <section v-if="(seriesSizes ?? []).length" class="mt-6">
        <h2 class="text-lg font-semibold text-stone-800">Sizes & dimensions</h2>
        <ul class="mt-2 list-inside list-disc text-stone-600">
          <li v-for="s in seriesSizes" :key="s">{{ s }}</li>
        </ul>
      </section>
      <p v-if="series.priceRange" class="mt-4 text-stone-600">
        <span class="font-medium text-stone-800">Typical price range:</span> {{ series.priceRange }}
      </p>
      <p v-if="productPriceNote && !series.priceRange" class="mt-4 text-sm text-stone-500">{{ productPriceNote }}</p>

      <div class="mt-6 flex flex-wrap gap-3">
        <a
          v-if="series.galleryUrl"
          :href="series.galleryUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline"
        >
          View photo gallery on KunkelWorks
          <span aria-hidden="true">↗</span>
        </a>
        <a
          v-if="series.pdfUrl"
          :href="series.pdfUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:underline"
        >
          Full product details (PDF)
          <span aria-hidden="true">↗</span>
        </a>
        <a
          v-else-if="series.detailUrl"
          :href="series.detailUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:underline"
        >
          More on KunkelWorks
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="mt-10 flex flex-wrap gap-4">
        <NuxtLink
          to="/quote"
          class="inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Get a quote
        </NuxtLink>
        <NuxtLink
          to="/chat"
          class="inline-flex rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          Chat with an expert
        </NuxtLink>
      </div>
    </template>
    <div v-else class="mt-8 text-stone-500">Series not found.</div>
  </div>
</template>
