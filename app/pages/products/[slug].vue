<script setup lang="ts">
const route = useRoute()
const slug = computed(() => {
  const p = route.params.slug
  return Array.isArray(p) ? p[0] ?? '' : (p ?? '')
})

const { data: products } = await useFetch<Array<Record<string, unknown>>>('/api/products')
const product = computed(() => products.value?.find((p) => p.id === slug.value))

useHead({ title: () => `${product.value?.name ?? 'Product'} | Carport Picker` })

const series = computed(() => (product.value?.series as string[]) ?? [])
const styles = computed(() => (product.value?.styles as string[]) ?? [])
const options = computed(() => (product.value?.options as string[]) ?? [])
const benefits = computed(() => (product.value?.benefits as string[]) ?? [])
const sizes = computed(() => (product.value?.sizes as string[]) ?? [])
const finishes = computed(() => (product.value?.finishes as string[]) ?? [])
const descriptionLong = computed(() => (product.value?.descriptionLong as string) ?? '')
const priceNote = computed(() => (product.value?.priceNote as string) ?? '')
const attribution = computed(() => (product.value?.attribution as string) ?? '')
const image = computed(() => (product.value?.image as string) ?? '')
const galleryUrl = computed(() => (product.value?.galleryUrl as string) ?? '')
const seriesDetails = computed(() => (product.value?.seriesDetails as Record<string, { name: string; description?: string; galleryUrl?: string; detailUrl?: string; image?: string; sizes?: string[]; colors?: string }>) ?? {})
const seriesEntries = computed(() => Object.entries(seriesDetails.value))
const isSeriesRoute = computed(() => !!route.params.series)
const showSeriesGrid = computed(() => (seriesEntries.value?.length ?? 0) > 0 && slug.value !== 'entry-doors')
const isExternalSeriesLink = (info: { detailUrl?: string; description?: string; sizes?: unknown; colors?: unknown }) =>
  !!info?.detailUrl?.startsWith('http') && !info?.description && !(Array.isArray(info?.sizes) && info.sizes.length) && !info?.colors
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-12">
    <NuxtLink to="/products" class="text-sm font-medium text-amber-700 hover:underline">← Products</NuxtLink>
    <!-- Child route: /products/carports/pjr renders [series].vue here -->
    <NuxtPage v-if="isSeriesRoute" />
    <template v-else-if="product">
      <img
        v-if="image"
        :src="image"
        :alt="product.name"
        class="mt-4 w-full rounded-lg object-cover shadow-md"
        width="800"
        height="400"
      />
      <h1 class="mt-4 text-3xl font-bold text-stone-900">{{ product.name }}</h1>
      <p class="mt-2 text-stone-600">{{ product.description }}</p>
      <p v-if="descriptionLong" class="mt-4 text-stone-600">{{ descriptionLong }}</p>
      <a
        v-if="galleryUrl"
        :href="galleryUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline"
      >
        View photo gallery on KunkelWorks
        <span aria-hidden="true">↗</span>
      </a>
      <div class="mt-8 space-y-4">
        <section v-if="showSeriesGrid" class="mt-8">
          <h2 class="text-lg font-semibold text-stone-800">Series &amp; styles</h2>
          <ul class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3" role="list">
            <li v-for="[seriesSlug, info] in seriesEntries" :key="seriesSlug">
              <a
                v-if="isExternalSeriesLink(info)"
                :href="info.detailUrl!"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:border-amber-300 hover:shadow-md"
              >
                <span class="block aspect-4/3 w-full shrink-0 overflow-hidden bg-stone-100">
                  <img
                    v-if="(info as { image?: string }).image"
                    :src="(info as { image?: string }).image"
                    :alt="info?.name ?? ''"
                    class="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <span v-else class="flex h-full w-full items-center justify-center text-2xl font-semibold text-stone-400">{{ info?.name?.charAt(0) ?? '?' }}</span>
                </span>
                <span class="flex flex-1 items-center justify-center p-3 text-center text-sm font-medium text-stone-800 group-hover:text-amber-700">{{ info?.name }} <span aria-hidden="true">↗</span></span>
              </a>
              <NuxtLink
                v-else
                :to="`/products/${slug}/${seriesSlug}`"
                class="group flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:border-amber-300 hover:shadow-md"
              >
                <span class="block aspect-4/3 w-full shrink-0 overflow-hidden bg-stone-100">
                  <img
                    v-if="(info as { image?: string }).image"
                    :src="(info as { image?: string }).image"
                    :alt="info?.name ?? ''"
                    class="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <span v-else class="flex h-full w-full items-center justify-center text-2xl font-semibold text-stone-400">{{ info?.name?.charAt(0) ?? '?' }}</span>
                </span>
                <span class="flex flex-1 items-center justify-center p-3 text-center text-sm font-medium text-stone-800 group-hover:text-amber-700">{{ info?.name }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>
        <section v-else-if="(seriesEntries ?? []).length" class="mt-8">
          <h2 class="text-lg font-semibold text-stone-800">Series &amp; styles</h2>
          <ul class="mt-2 space-y-1 text-stone-600">
            <li v-for="[seriesSlug, info] in (seriesEntries ?? [])" :key="seriesSlug">
              <a
                v-if="isExternalSeriesLink(info)"
                :href="info.detailUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-amber-700 hover:underline"
              >
                {{ info?.name }}
                <span aria-hidden="true">↗</span>
              </a>
              <NuxtLink v-else :to="`/products/${slug}/${seriesSlug}`" class="text-amber-700 hover:underline">{{ info?.name }}</NuxtLink>
            </li>
          </ul>
        </section>
        <section v-else-if="(series ?? []).length">
          <h2 class="text-lg font-semibold text-stone-800">Series</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="s in (series ?? [])" :key="s">{{ s }}</li>
          </ul>
        </section>
        <section v-if="(styles ?? []).length">
          <h2 class="text-lg font-semibold text-stone-800">Styles</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="s in (styles ?? [])" :key="s">{{ s }}</li>
          </ul>
        </section>
        <section v-if="(sizes ?? []).length">
          <h2 class="text-lg font-semibold text-stone-800">Sizes & dimensions</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="s in (sizes ?? [])" :key="s">{{ s }}</li>
          </ul>
        </section>
        <section v-if="(finishes ?? []).length">
          <h2 class="text-lg font-semibold text-stone-800">Finishes</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="f in (finishes ?? [])" :key="f">{{ f }}</li>
          </ul>
        </section>
        <section v-if="(options ?? []).length">
          <h2 class="text-lg font-semibold text-stone-800">Options</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="o in (options ?? [])" :key="o">{{ o }}</li>
          </ul>
        </section>
        <section v-if="(benefits ?? []).length">
          <h2 class="text-lg font-semibold text-stone-800">Benefits</h2>
          <ul class="mt-2 list-inside list-disc text-stone-600">
            <li v-for="b in (benefits ?? [])" :key="b">{{ b }}</li>
          </ul>
        </section>
        <p v-if="priceNote" class="mt-4 text-sm text-stone-500">{{ priceNote }}</p>
        <p v-if="attribution" class="mt-2 text-xs text-stone-400">{{ attribution }}</p>
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
