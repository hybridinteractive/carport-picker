import carports from '../data/products/carports.json'
import patioCovers from '../data/products/patio-covers.json'
import poolCovers from '../data/products/pool-covers.json'
import gates from '../data/products/gates.json'
import fences from '../data/products/fences.json'
import entryDoors from '../data/products/entry-doors.json'

const products = [
  carports as ProductGroup,
  patioCovers as ProductGroup,
  poolCovers as ProductGroup,
  gates as ProductGroup,
  fences as ProductGroup,
  entryDoors as ProductGroup,
]

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
