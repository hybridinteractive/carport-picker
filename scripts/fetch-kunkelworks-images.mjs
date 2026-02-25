#!/usr/bin/env node
/**
 * Fetches KunkelWorks category pages, extracts per-series image URLs from
 * #projectThumbs .project cards, and merges them into product JSON.
 * Run: node scripts/fetch-kunkelworks-images.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../app/server/data/products')
const BASE = 'https://www.kunkelworks.com'

// href path (no trailing slash) -> our seriesDetails key
const CARPORT_HREF_TO_SLUG = {
  '/pjr': 'pjr',
  '/pjf-series': 'pjf',
  '/eln-series': 'eln',
  '/mlr-series': 'mlr',
  '/lj-series': 'lj',
  '/kwc-series': 'kwc',
  '/skc-port': 'skc',
  '/ustyle-series': 'ustyle',
  '/gss-port': 'gss',
  '/css-port': 'css',
  '/rsc-series': 'rsc',
  '/uec-port': 'uec',
  '/atld-port': 'atld',
  '/sae-port': 'sae',
  '/mts-port': 'mts',
}
const PATIO_HREF_TO_SLUG = {
  '/tfna': 'tf1na',
  '/trna': 'tr1na',
  '/tfma': 'tf1ma',
  '/trma': 'tr1ma',
  '/woodlook-patio-covers': 'woodlook',
  '/side-panels-lc': 'sidepanels',
}
const GATE_HREF_TO_SLUG = {
  '/mce-gates': 'mce-gates',
  '/mceh-gates-new': 'mceh-gates',
  '/vomc-series': 'vomc',
  '/vpmc-series': 'vpmc',
  '/wm-series': 'wm',
  '/cast-aluminum-gates': 'cast-aluminum-gates',
  '/bamboo-gates': 'bamboo-gates',
  '/sliding-gates': 'sliding-gates',
  '/other-gates': 'other-gates',
  '/mex-series': 'mex',
  '/mf-series': 'mf',
  '/mlw-series': 'mlw',
  '/mv-series': 'mv',
}
const FENCE_HREF_TO_SLUG = {
  '/cef-fence': 'cef-fence',
  '/cefh-fence-new': 'cefh-fence',
  '/fin': 'fin',
  '/fngfv': 'fngfv',
  '/fve': 'fve',
  '/fvx': 'fvx',
  '/repfreof': 'ref',
  '/sfc': 'sfc',
  '/vof': 'vof',
  '/vpf': 'vpf',
  '/pagewf': 'wf',
  '/cast-aluminum': 'cast-aluminum',
  '/fence-fl': 'fl',
  '/bamboo': 'bamboo',
  '/stacking': 'stacking',
  '/lifting-fence': 'lifting-fence',
  '/fex': 'fex',
}

function parseProjectThumbs(html, hrefToSlug) {
  const out = {}
  const re = /<a\s+class="project"\s+href="([^"]+)"[^>]*>[\s\S]*?<img[^>]+(?:data-src="([^"]+)"|data-image="([^"]+)")/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const href = m[1].replace(/\/$/, '') // strip trailing slash
    const imgUrl = m[2] || m[3]
    const slug = hrefToSlug[href]
    if (slug && imgUrl) {
      out[slug] = imgUrl.startsWith('//') ? `https:${imgUrl}` : imgUrl
    }
  }
  return out
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'CarportPicker/1.0' } })
  if (!res.ok) throw new Error(`${url} ${res.status}`)
  return res.text()
}

function mergeImagesIntoProduct(fileName, images) {
  const path = join(dataDir, fileName)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  if (!data.seriesDetails) return
  let count = 0
  let firstImage = null
  for (const [slug, url] of Object.entries(images)) {
    if (data.seriesDetails[slug]) {
      data.seriesDetails[slug].image = url
      if (!firstImage) firstImage = url
      count++
    }
  }
  if (firstImage) {
    data.image = firstImage
  }
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`  ${fileName}: set category image + ${count} series images`)
}

async function main() {
  console.log('Fetching KunkelWorks category pages...')

  const [carportsHtml, patioHtml, gatesHtml, fencesHtml] = await Promise.all([
    fetchHtml(`${BASE}/carports/`),
    fetchHtml(`${BASE}/patio-styles`),
    fetchHtml(`${BASE}/gate-series`),
    fetchHtml(`${BASE}/fence-styles`),
  ])

  const carportImages = parseProjectThumbs(carportsHtml, CARPORT_HREF_TO_SLUG)
  const patioImages = parseProjectThumbs(patioHtml, PATIO_HREF_TO_SLUG)
  const gateImages = parseProjectThumbs(gatesHtml, GATE_HREF_TO_SLUG)
  const fenceImages = parseProjectThumbs(fencesHtml, FENCE_HREF_TO_SLUG)

  console.log('Merging images into product JSON...')
  mergeImagesIntoProduct('carports.json', carportImages)
  mergeImagesIntoProduct('patio-covers.json', patioImages)
  mergeImagesIntoProduct('gates.json', gateImages)
  mergeImagesIntoProduct('fences.json', fenceImages)

  // Entry doors: single product page, set category-level image from first content image
  try {
    const entryHtml = await fetchHtml(`${BASE}/entry-doors`)
    const mainImgMatch = entryHtml.match(/data-image="(https:\/\/images\.squarespace-cdn\.com[^"]+)"/) ||
      entryHtml.match(/data-src="(https:\/\/images\.squarespace-cdn\.com[^"]+)"/)
    if (mainImgMatch) {
      const path = join(dataDir, 'entry-doors.json')
      const data = JSON.parse(readFileSync(path, 'utf8'))
      data.image = mainImgMatch[1]
      writeFileSync(path, JSON.stringify(data, null, 2))
      console.log('  entry-doors.json: set category image')
    }
  } catch (e) {
    console.warn('  entry-doors image:', e.message)
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
