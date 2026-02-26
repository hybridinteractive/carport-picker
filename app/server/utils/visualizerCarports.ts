import carportsData from '../data/products/carports.json'
import type { CarportOption } from '~/types/architect'

interface SeriesDetail {
  name: string
  description?: string
  sizes?: string[]
  priceRange?: string
  image?: string
}

interface CustomizationItem {
  id: string
  name: string
}

interface CustomizationOptions {
  frameColors: CustomizationItem[]
  roofPanelTypes: CustomizationItem[]
  aluminumPanelColors: CustomizationItem[]
  polycarbonatePanelTypes: CustomizationItem[]
}

interface CarportsJson {
  seriesDetails?: Record<string, SeriesDetail>
  customizationOptions?: {
    frameColors?: CustomizationItem[]
    roofPanelTypes?: CustomizationItem[]
    aluminumPanelColors?: CustomizationItem[]
    polycarbonatePanelTypes?: CustomizationItem[]
  }
}

/** Build visualizer carport options from carports.json (single source of truth). */
export function getVisualizerCarportOptions(): CarportOption[] {
  const data = carportsData as CarportsJson
  const seriesDetails = data.seriesDetails ?? {}
  return Object.entries(seriesDetails).map(([slug, detail]) => {
    const specs: string[] = []
    if (detail.sizes?.length) {
      specs.push(detail.sizes.join('\n'))
    }
    if (detail.priceRange) {
      specs.push(detail.priceRange)
    }
    return {
      id: slug,
      name: detail.name,
      imageUrl: detail.image ?? '',
      aboutSystem: detail.description,
      specifications: specs.length ? specs.join('\n\n') : undefined,
    }
  })
}

/** Get frame/roof customization options from carports.json. */
export function getVisualizerCustomizationOptions(): CustomizationOptions {
  const data = carportsData as CarportsJson
  const c = data.customizationOptions ?? {}
  return {
    frameColors: c.frameColors ?? [],
    roofPanelTypes: c.roofPanelTypes ?? [],
    aluminumPanelColors: c.aluminumPanelColors ?? [],
    polycarbonatePanelTypes: c.polycarbonatePanelTypes ?? [],
  }
}
