<template>
  <div class="min-h-screen flex flex-col items-center p-4 md:p-8 lg:p-12 bg-stone-50">
    <header class="w-full max-w-7xl mb-8 text-center md:text-left">
      <h1 class="text-4xl md:text-5xl font-extrabold text-stone-900 mb-2">
        Carport Builder
      </h1>
      <p class="text-stone-600 text-lg">
        See how a carport could look on your property. Pick a style, then get a quote.
      </p>
    </header>

    <main class="w-full max-w-7xl lg:w-[95%] xl:max-w-[1600px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
      <!-- Left: Controls -->
      <section class="lg:col-span-4 flex flex-col gap-6">
        <div class="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 shadow-lg">
          <h2 class="text-xl font-semibold text-stone-700 mb-6 flex items-center gap-3">
            <span class="w-1.5 h-6 bg-amber-500 rounded-full" />
            Design parameters
          </h2>

          <!-- Carport selection -->
          <div class="mb-6">
            <label class="block text-xs font-bold text-stone-500 uppercase mb-3">Carport reference</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div
                v-for="option in carportOptions"
                :key="option.id"
                class="flex flex-col"
              >
                <div
                  @click="selectCarportOption(option)"
                  :class="[
                    'relative aspect-square rounded-xl border-2 cursor-pointer transition-all overflow-hidden group mb-2',
                    selectedCarportOption?.id === option.id
                      ? 'border-amber-600 ring-2 ring-amber-500/40'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-100'
                  ]"
                >
                  <img
                    :src="option.imageUrl"
                    :alt="option.name"
                    class="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                    @error="onCarportImageError($event, option)"
                  />
                  <div class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p class="text-white text-xs font-semibold text-center truncate">{{ option.name }}</p>
                  </div>
                  <div v-if="selectedCarportOption?.id === option.id" class="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="showCustomUpload = !showCustomUpload"
              class="w-full text-xs text-stone-500 hover:text-stone-700 flex items-center justify-center gap-1"
            >
              Or upload your own
              <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showCustomUpload }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="showCustomUpload" class="mt-3">
              <div
                @click="carportInputRef?.click()"
                :class="[
                  'relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden',
                  config.carportReferenceImage && !selectedCarportOption
                    ? 'border-amber-500/50 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                ]"
              >
                <img
                  v-if="config.carportReferenceImage && !selectedCarportOption"
                  :src="config.carportReferenceImage"
                  alt="Carport"
                  class="w-full h-full object-cover"
                />
                <div v-else class="text-center p-4">
                  <span class="text-stone-400 text-4xl">+</span>
                  <p class="text-[10px] text-stone-500 uppercase tracking-wide mt-1">Upload carport</p>
                </div>
                <input
                  ref="carportInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleCarportUpload"
                />
              </div>
            </div>
          </div>

          <!-- House reference -->
          <div class="mb-6">
            <label class="block text-xs font-bold text-stone-500 uppercase mb-2">House style reference (optional)</label>
            <div
              @click="houseInputRef?.click()"
              :class="[
                'relative h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden',
                config.houseReferenceImage ? 'border-amber-500/50 bg-amber-50' : 'border-stone-200 hover:border-stone-300 bg-stone-50'
              ]"
            >
              <img
                v-if="config.houseReferenceImage"
                :src="config.houseReferenceImage"
                alt="House"
                class="w-full h-full object-cover"
              />
              <div v-else class="text-center p-4">
                <span class="text-stone-400 text-4xl">+</span>
                <p class="text-[10px] text-stone-500 uppercase tracking-wide mt-1">Upload house (optional)</p>
              </div>
              <input
                ref="houseInputRef"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleHouseUpload"
              />
            </div>
            <p class="text-xs text-stone-500 mt-1">Required only if "Custom (Upload Image)" is selected below.</p>
          </div>

          <!-- House style (architect types; not in carports.json) -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-stone-700 mb-2">House style</label>
            <select
              v-model="config.style"
              class="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option v-for="style in HouseStyleList" :key="style" :value="style">{{ style }}</option>
            </select>
          </div>

          <!-- Placement -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-stone-700 mb-2">Carport placement</label>
            <input
              v-model="config.placement"
              type="text"
              placeholder="e.g. rear side offset"
              class="w-full bg-white border border-stone-300 rounded-xl px-4 py-3 text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <!-- Frame & roof -->
          <div class="mb-6 p-4 bg-stone-100 rounded-xl border border-stone-200">
            <h3 class="text-sm font-semibold text-stone-800 mb-4">Carport customization</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-stone-600 mb-1">Frame color</label>
                <select
                  v-model="config.metalColor"
                  class="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option v-for="c in customization.frameColors" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-stone-600 mb-1">Roof panel type</label>
                <select
                  v-model="config.roofPanelType"
                  class="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  @change="onRoofPanelTypeChange"
                >
                  <option v-for="t in customization.roofPanelTypes" :key="t.id" :value="t.name">{{ t.name }}</option>
                </select>
              </div>
              <div v-if="isAluminumRoof">
                <label class="block text-xs font-medium text-stone-600 mb-1">Aluminum panel color</label>
                <select
                  v-model="config.aluminumPanelColor"
                  class="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option v-for="c in customization.aluminumPanelColors" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </div>
              <div v-if="isPolycarbonateRoof">
                <label class="block text-xs font-medium text-stone-600 mb-1">Polycarbonate panel</label>
                <select
                  v-model="config.polycarbonatePanelType"
                  class="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-900 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option v-for="t in customization.polycarbonatePanelTypes" :key="t.id" :value="t.name">{{ t.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="hasUnsavedChanges" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
            Options changed — click "Generate visual" to apply.
          </div>

          <button
            type="button"
            :disabled="state.isGenerating || !config.carportReferenceImage"
            :class="[
              'w-full py-4 rounded-xl font-bold text-lg transition-all',
              state.isGenerating || !config.carportReferenceImage
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : hasUnsavedChanges
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-stone-800 hover:bg-stone-700 text-white'
            ]"
            @click="handleGenerate"
          >
            <span v-if="state.isGenerating" class="flex items-center justify-center gap-3">
              <span class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Rendering…
            </span>
            <span v-else>Generate visual</span>
          </button>

          <p v-if="state.error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {{ state.error }}
          </p>
        </div>
      </section>

      <!-- Right: Result -->
      <section class="lg:col-span-8">
        <div class="bg-white border border-stone-200 rounded-2xl p-6 lg:p-8 min-h-[400px] lg:min-h-[600px] flex flex-col shadow-lg">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-bold text-stone-900">Architectural visual</h2>
              <p class="text-stone-500 text-sm mt-0.5">Concept rendering</p>
            </div>
            <div v-if="state.resultUrl" class="flex items-center gap-3">
              <button
                type="button"
                class="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-full text-sm font-medium flex items-center gap-2"
                @click="downloadImage"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save image
              </button>
              <button
                type="button"
                class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-sm font-semibold flex items-center gap-2"
                @click="goToQuoteWithVisual"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request quote
              </button>
            </div>
          </div>

          <div class="flex-1 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 min-h-[300px] lg:min-h-[450px] relative">
            <div v-if="state.isGenerating" class="absolute inset-0 flex flex-col items-center justify-center gap-6">
              <span class="w-16 h-16 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              <p class="text-stone-600 font-medium">Compositing your vision…</p>
            </div>
            <img
              v-else-if="state.resultUrl"
              :src="state.resultUrl"
              alt="Generated visual"
              class="w-full h-full object-cover block"
            />
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-stone-400 p-8">
              <svg class="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
              </svg>
              <p class="text-center">Select a carport and click "Generate visual" to start.</p>
            </div>
          </div>

          <!-- About selected carport -->
          <div v-if="selectedCarportOption && (selectedCarportOption.aboutSystem || selectedCarportOption.specifications)" class="mt-6 bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">
            <button
              type="button"
              class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
              @click="expandedAccordion = expandedAccordion === selectedCarportOption.id ? null : selectedCarportOption.id"
            >
              <span>About {{ selectedCarportOption.name }}</span>
              <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': expandedAccordion === selectedCarportOption.id }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div v-show="expandedAccordion === selectedCarportOption.id" class="px-4 pb-4 text-sm text-stone-600 border-t border-stone-200 space-y-3 pt-3">
              <p v-if="selectedCarportOption.aboutSystem" class="leading-relaxed">{{ selectedCarportOption.aboutSystem }}</p>
              <p v-if="selectedCarportOption.specifications" class="whitespace-pre-line pt-2 border-t border-stone-200">{{ selectedCarportOption.specifications }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  HouseStyle,
  type GenerationConfig,
  type GenerationState,
  type CarportOption,
} from '~/types/architect'

useHead({ title: 'Carport Builder' })

const HouseStyleList = Object.values(HouseStyle)

interface CustomizationItem {
  id: string
  name: string
}
interface VisualizerOptionsResponse {
  carportOptions: CarportOption[]
  customization: {
    frameColors: CustomizationItem[]
    roofPanelTypes: CustomizationItem[]
    aluminumPanelColors: CustomizationItem[]
    polycarbonatePanelTypes: CustomizationItem[]
  }
}

const { data: optionsData } = await useFetch<VisualizerOptionsResponse>('/api/visualizer/options')
const carportOptions = computed(() => optionsData.value?.carportOptions ?? [])
const rawCustomization = computed(() => optionsData.value?.customization)
const customization = computed(() => {
  const r = rawCustomization.value
  return {
    frameColors: r?.frameColors?.length ? r.frameColors : [{ id: 'urban-gray', name: 'Urban Gray (UC)' }],
    roofPanelTypes: r?.roofPanelTypes?.length ? r.roofPanelTypes : [{ id: 'aluminum', name: 'Aluminum' }, { id: 'polycarbonate', name: 'Polycarbonate (Lexan)' }],
    aluminumPanelColors: r?.aluminumPanelColors?.length ? r.aluminumPanelColors : [{ id: 'urban-gray', name: 'Urban Gray Aluminum' }],
    polycarbonatePanelTypes: r?.polycarbonatePanelTypes?.length ? r.polycarbonatePanelTypes : [{ id: 'blue', name: 'Blue Panel' }],
  }
})
const isAluminumRoof = computed(() => config.value.roofPanelType === 'Aluminum')
const isPolycarbonateRoof = computed(() => config.value.roofPanelType === 'Polycarbonate (Lexan)')

const config = ref<GenerationConfig>({
  style: HouseStyle.MINIMALIST,
  placement: 'rear side offset',
  carportReferenceImage: null,
  houseReferenceImage: null,
  metalColor: 'Urban Gray (UC)',
  roofPanelType: 'Polycarbonate (Lexan)',
  aluminumPanelColor: null,
  polycarbonatePanelType: 'Blue Panel',
})

const state = ref<GenerationState>({
  isGenerating: false,
  resultUrl: null,
  error: null,
})

const hasUnsavedChanges = ref(false)
const selectedCarportOption = ref<CarportOption | null>(null)
const showCustomUpload = ref(false)
const expandedAccordion = ref<string | null>(null)
const carportInputRef = ref<HTMLInputElement | null>(null)
const houseInputRef = ref<HTMLInputElement | null>(null)

const quoteLink = computed(() => {
  const params = new URLSearchParams()
  params.set('product_interest', 'carports')
  params.set('from', 'visualizer')
  if (selectedCarportOption.value) {
    params.set('product', 'carports')
    params.set('series', selectedCarportOption.value.id)
  }
  return `/quote?${params.toString()}`
})

function onCarportImageError(e: Event, option: CarportOption) {
  const el = e.target as HTMLImageElement
  if (el) {
    el.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e7e5e4" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#78716c" font-size="12">${option.name}</text></svg>`)}`
  }
}

function markAsChanged() {
  if (state.value.resultUrl) hasUnsavedChanges.value = true
}

function onRoofPanelTypeChange() {
  const type = config.value.roofPanelType
  if (type === 'Aluminum') {
    config.value.aluminumPanelColor = customization.value.aluminumPanelColors[0]?.name ?? 'Urban Gray Aluminum'
    config.value.polycarbonatePanelType = null
  } else {
    config.value.polycarbonatePanelType = customization.value.polycarbonatePanelTypes[0]?.name ?? 'Blue Panel'
    config.value.aluminumPanelColor = null
  }
  markAsChanged()
}

async function selectCarportOption(option: CarportOption) {
  selectedCarportOption.value = option
  showCustomUpload.value = false
  try {
    const res = await fetch(option.imageUrl)
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    config.value.carportReferenceImage = dataUrl
  } catch {
    config.value.carportReferenceImage = option.imageUrl
  }
}

function handleCarportUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onloadend = () => {
    config.value.carportReferenceImage = reader.result as string
    selectedCarportOption.value = null
  }
  reader.readAsDataURL(file)
}

function handleHouseUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onloadend = () => {
    config.value.houseReferenceImage = reader.result as string
    config.value.style = HouseStyle.CUSTOM
  }
  reader.readAsDataURL(file)
}

async function handleGenerate() {
  if (!config.value.carportReferenceImage) {
    state.value.error = 'Please select a carport or upload your own image.'
    return
  }
  if (config.value.style === HouseStyle.CUSTOM && !config.value.houseReferenceImage) {
    state.value.error = 'Please upload a house reference image for Custom style.'
    return
  }
  state.value = { isGenerating: true, resultUrl: null, error: null }
  hasUnsavedChanges.value = false
  try {
    const result = await $fetch<string>('/api/generate-architectural-visual', {
      method: 'POST',
      body: config.value,
    })
    state.value = { isGenerating: false, resultUrl: result, error: null }
  } catch (err: unknown) {
    const msg = err && typeof (err as any).data?.statusMessage === 'string'
      ? (err as any).data.statusMessage
      : err instanceof Error ? err.message : 'Generation failed.'
    state.value = { isGenerating: false, resultUrl: null, error: msg }
  }
}

function downloadImage() {
  if (!state.value.resultUrl) return
  const a = document.createElement('a')
  a.href = state.value.resultUrl
  a.download = 'carport-visual.png'
  a.click()
}

const VISUALIZER_IMAGE_KEY = 'carport-picker-visualizer-image'
const VISUALIZER_CONFIG_KEY = 'carport-picker-visualizer-config'

function goToQuoteWithVisual() {
  if (typeof sessionStorage !== 'undefined') {
    try {
      if (state.value.resultUrl) {
        sessionStorage.setItem(VISUALIZER_IMAGE_KEY, state.value.resultUrl)
      }
      const cfg = config.value
      const savedConfig = {
        style: cfg.style,
        placement: cfg.placement,
        metalColor: cfg.metalColor,
        roofPanelType: cfg.roofPanelType,
        aluminumPanelColor: cfg.aluminumPanelColor ?? null,
        polycarbonatePanelType: cfg.polycarbonatePanelType ?? null,
        carportName: selectedCarportOption.value?.name ?? undefined,
      }
      sessionStorage.setItem(VISUALIZER_CONFIG_KEY, JSON.stringify(savedConfig))
    } catch {
      // ignore
    }
  }
  navigateTo(quoteLink.value)
}
</script>
