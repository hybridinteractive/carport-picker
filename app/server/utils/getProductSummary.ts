import carports from '../data/products/carports.json'
import patioCovers from '../data/products/patio-covers.json'
import gates from '../data/products/gates.json'
import fences from '../data/products/fences.json'
import entryDoors from '../data/products/entry-doors.json'

const products = [
  carports as ProductGroup,
  patioCovers as ProductGroup,
  gates as ProductGroup,
  fences as ProductGroup,
  entryDoors as ProductGroup,
]

interface SeriesDetail {
  name: string
  description?: string
  sizes?: string[]
  colors?: string
  priceRange?: string
  pdfUrl?: string
  detailUrl?: string
  galleryUrl?: string
}

interface ProductGroup {
  name: string
  description: string
  descriptionLong?: string
  series?: string[]
  styles?: string[]
  options?: string[]
  benefits?: string[]
  sizes?: string[]
  finishes?: string[]
  priceNote?: string
  attribution?: string
  seriesDetails?: Record<string, SeriesDetail>
}

function formatSeriesDetail(_key: string, s: SeriesDetail): string {
  const parts = [`### ${s.name}`]
  if (s.description) parts.push(s.description)
  if (s.colors) parts.push(`Colors: ${s.colors}`)
  if (s.sizes?.length) parts.push(`Sizes: ${s.sizes.join('; ')}`)
  if (s.priceRange) parts.push(`Price range: ${s.priceRange}`)
  if (s.detailUrl) parts.push(`Details: ${s.detailUrl}`)
  return parts.join('\n')
}

function formatGroup(p: ProductGroup): string {
  const parts = [`## ${p.name}\n${p.description}`]
  if (p.descriptionLong) parts.push(p.descriptionLong)
  if (p.series?.length) parts.push(`Series: ${p.series.join(', ')}`)
  if (p.styles?.length) parts.push(`Styles: ${p.styles.join(', ')}`)
  if (p.options?.length) parts.push(`Options: ${p.options.join(', ')}`)
  if (p.sizes?.length) parts.push(`Sizes/dimensions: ${p.sizes.join('; ')}`)
  if (p.finishes?.length) parts.push(`Finishes: ${p.finishes.join('; ')}`)
  if (p.benefits?.length) parts.push(`Benefits: ${p.benefits.join(', ')}`)
  if (p.priceNote) parts.push(`Pricing: ${p.priceNote}`)
  const details = p.seriesDetails ?? {}
  if (Object.keys(details).length) {
    parts.push('Series details (use for specific series questions):')
    for (const [key, s] of Object.entries(details)) {
      parts.push(formatSeriesDetail(key, s))
    }
  }
  return parts.join('\n')
}

/**
 * Returns a concise product knowledge summary for the LLM system prompt.
 * Used by the chat API to ground answers in KunkelWorks product lines.
 */
export function getProductSummary(): string {
  const intro = 'KunkelWorks is the distributor of authentic Japanese aluminum exterior systems (Sankyo-Tateyama, Takaoka, Japan). Product lines:\n\n'
  return intro + products.map(formatGroup).join('\n\n')
}
