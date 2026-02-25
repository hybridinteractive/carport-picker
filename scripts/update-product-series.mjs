#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '../app/server/data/products')

const fenceUpdates = {
  'cef-fence': {
    description: 'CEF and the taller CEF-H fence series are the newest additions to the KunkelWorks product lines.',
    sizes: ['Finished Height: 23.5"/31.5"/39"/47" (taller see CEF-H or Stacking)', "Panel Width: 2000mm, 6.5'"],
    pdfUrl: 'https://www.kunkelworks.com/s/CEF-Fence-600-1200.pdf',
  },
  'cefh-fence': {
    description: 'CEF and the taller CEF-H fence series are the newest additions to the KunkelWorks product lines.',
    pdfUrl: 'https://www.kunkelworks.com/s/CEF-H-Fence-1400-1600.pdf',
  },
  'fngfv': {
    description: 'The FV and FNG are the Tall & Private fences that can reach 6.5\' without stacking. Both have 3 panel styles; all three totally private. FNG-3 and FV-9H have scalloped profiles and allow air flow.',
    colors: 'Black, Deep Brown and Urban Gray',
    sizes: ['Fence Heights: 55", 63", 71", 78.7"', "Panel Width: 6.5'"],
    pdfUrl: 'https://www.kunkelworks.com/s/FNG-Fence-18-20.pdf',
  },
  'fve': {
    description: 'The FVE Fence System has 3 panel styles: horizontal with small gaps, vertical with small gaps, and scalloped horizontal which lets air through. Wood laminate options available.',
    sizes: ['Fence Heights: 23.5"/31.5"/39.4"/47.2"', "Panel Width: 6.5'"],
    pdfUrl: 'https://www.kunkelworks.com/s/FVE-Fence-Series.pdf',
  },
  'fvx': {
    description: '13 FVX panel styles and 6 colors; FVX-2 with vertical pickets is the most popular. Fixed panel for strength. 3 heights; can stack up to 9.6\'.',
    colors: '6 colors available',
    sizes: ['Fence Heights: 23.5"/31.5"/39.4"/47.2" (47.2" only FVX-6)', "Panel Width: 6.5'"],
    pdfUrl: 'https://www.kunkelworks.com/s/FVX-Fence.pdf',
  },
  'sfc': {
    description: 'Well priced, easy to install. 7 colors and 3 styles. Fixed panel; can stack up to 9.8\'. Posts behind or between panels. No iron, no rust.',
    colors: '7 colors available',
    sizes: ['Fence Heights: 23.6"/31.5"/39.4"', "Panel Width: 6.5'"],
    pdfUrl: 'https://www.kunkelworks.com/s/SFC-Fence.pdf',
  },
  'vof': {
    description: 'Most versatile tall fence. 5 picket options; 4 square picket styles; VOF-4 rounded, VOF-6 metal point tips, VOF-7 bent for security. Matching gates: VOMC, VPMC.',
    sizes: ["Tallest panel (no stack): 2m/6.56' all styles; VOF-1 up to 3m/9.8'"],
    pdfUrl: 'https://www.kunkelworks.com/s/VOF-Fence-1-7.pdf',
  },
  'fex': {
    description: 'Companion line for MEX Gates. 8 panel styles: 5 semi-private, 3 fully private. Can stack for higher height. Matching gate: MEX.',
    sizes: ['Fence Heights: 23.5"/31.5"/39.4"/47.2"', "Stacked: up to 9.8'"],
    pdfUrl: 'https://www.kunkelworks.com/s/FEX-Fence.pdf',
  },
  'ref': {
    description: 'REPF and REOF: simple 4" pickets, very good price point. REPF has closed top rail; REOF has open pickets top and bottom. Height up to 5\'. For taller fence see VOF or VPF.',
    colors: 'Silver, pewter and deep brown (almost black)',
    sizes: ['Fence Heights: 39.4"/47.2"/59"', "Panel Width: 6.5'"],
    pdfUrl: 'https://www.kunkelworks.com/s/REOF-REPF-Fence.pdf',
  },
  'vpf': {
    description: 'Tall fence solution. 2 picket spacing options, 3 colors. Commercial grade; individual picket caps and panel connectors; pickets riveted so water wicks off. Fixed and sloping panel styles. Posts behind or between. Matching gates: VPMC.',
    colors: '3 colors available',
    sizes: ['Fence Heights: 39.4"/47.2"/59"/70.9"/78.7"'],
    pdfUrl: 'https://www.kunkelworks.com/s/VPF-Fence.pdf',
  },
  'wf': {
    description: 'Wood-look panels. 8 panel styles with wood-look options. Styles Y1, YP also available in all metal Pewter or Deep Brown. Frosted privacy inserts available. Can stack to 9.8\'. Matching gates: WM (Lower & Tall).',
    sizes: ['Fence Heights: 23.5"/31.5"/39.4"/47.2"', "Stack to 9.8'"],
    pdfUrl: 'https://www.kunkelworks.com/s/WF-Fence.pdf',
  },
  'cast-aluminum': {
    description: 'Cast aluminum fences and gates: solid aluminum pickets (not hollow extruded). Wrought-iron look without rust. Various heights depending on style. Matching: Cast Aluminum Gates.',
    sizes: ['Fence heights: various, depending on style'],
    pdfUrl: 'https://www.kunkelworks.com/s/Cast-Aluminum-Fence-KW.pdf',
  },
  'fl': {
    description: 'Beefy FL profiles; favorite for privacy walls. Metal and wood laminate options; different picket sizes and shapes. Standard 2m (6.5\') wide; 5\'+ heights can order 1m panels.',
    sizes: ['Fence Heights: 23.5"/31.5"/39.4"/47.2"/55.2"/63"/70.8"/78.7"/98.4"/118"', 'Panel Width: 1000mm or 2000mm'],
    pdfUrl: 'https://www.kunkelworks.com/s/FL-Profile-LO.pdf',
  },
  'bamboo': {
    description: 'Artificial PVC bamboo; lasts much longer than natural. Traditional look with stainless steel wire under decorative black bindings. Horizontal panels 3-dimensional; vertical often facades.',
    sizes: ['Low Heights: 23.5"/31.5"/39.4"', 'Tall Heights: 35.4"/47.2"/59"/70.8"', 'Panel Width: 1800mm'],
    pdfUrl: 'https://www.kunkelworks.com/s/FTK-Bamboo.pdf',
  },
  'stacking': {
    description: 'Japanese fence panels can be stacked to almost 10\' (3 panels). Posts generally behind to show panels. Panel styles can be combined; lower panels often more see-through, upper solid for privacy.',
    sizes: ["Stack up to almost 10' (3 panels)"],
    pdfUrl: 'https://www.kunkelworks.com/s/Stacking-Fence-2019.pdf',
  },
  'lifting-fence': {
    description: 'Stacking posts can lift fence panels high (e.g. to use neighbor\'s wall). All residential fence panels can be "lifted" on stacking posts.',
    sizes: ["Lift panels on stacking posts; stack to almost 10'"],
  },
}

const gateUpdates = {
  'mex': {
    description: 'The MEX is the most popular gate series in Hawaii. 8 panel styles and 5 colors. Can reach height of 5\'-6" which looks great next to a 6\' wall. For higher gates see MF Series. All gates can be fitted on site; multi-pane bi-fold available up to 4.85\'.',
    sizes: ['Finished Heights: 3.54\'/4.19\'/4.85\'/5.51\'', 'Max. Width Single: 3.96\' or less', 'Max. Width Double: 7.34\' or less', 'Max. Width Multiple Panel: 12.79\' or less', 'Matching Fence: FEX Series'],
    pdfUrl: 'https://www.kunkelworks.com/s/MEX-Gates-2019.pdf',
  },
  'mf': {
    description: 'The MF is the Tall Gate Series. Same profile styles as MEX but larger, taller panels and more substantial posts. 8 panel styles, 4 metal colors; wood-look panels with horizontal semi-private or fully private options.',
    sizes: ['Finished Heights: 5.51\'/6.16\'/6.82\'', 'Max. Width Single: 4.29\' or less', 'Max. Width Double: 8\' or less', 'Matching Fence: FEX Series - Stacked'],
    pdfUrl: 'https://www.kunkelworks.com/s/MF-2019.pdf',
  },
  'wm': {
    description: 'WM is the choice for Wood-Look gates. 5 wood-look combinations and 8 panel styles. Since 2018, style Y1 and SD available in all metal finish (Peter or Deep Brown). Taller: WM-T Series. Matching Fence: WF Series.',
    sizes: ['Finished Heights: 4.19\'/4.85\'/5.51\'', 'Max. Width Single: 3.54\' or less', 'Max. Width Double: 6.57\' or less'],
    pdfUrl: 'https://www.kunkelworks.com/s/WM-Gates-2019.pdf',
  },
  'vomc': {
    description: 'Commercial grade gate series with open pickets. 6 picket styles and 3 colors. Style #5 beefy picket, #3 tight spacing, #1 can go to almost 10\' with bent pickets up to 8.2\'. Gates can be fitted on site. Matching Fence: VOF and REOF.',
    sizes: ['Finished Heights: 3.28\'/3.93\'/4.92\'/5.9\'/6.56\'/8.2\'/9.84\'', 'Max. Width Single: 4.39\' or less', 'Max. Width Double: 8\' or less', 'Max. Width DWG Single: 7.46\' or less', 'Max. Width DWG Double: 14\' or less'],
    pdfUrl: 'https://www.kunkelworks.com/s/VOMC-Open-2019.pdf',
  },
  'mv': {
    description: 'One of the most popular gate series in Japan for lower height gates. 13 panel styles and 7 colors. Ideal for 4\' tall gates. Fitted on site; multi-panel bi-fold up to 4.19\'. Matching Fence: FVX Series.',
    sizes: ['Finished Heights: 3.54\'/4.19\'', 'Max. Width Single: 3.54\' or less', 'Max. Width Double: 6.49\' or less', 'Max. Width Multiple Panel: 12.79\' or less'],
    pdfUrl: 'https://www.kunkelworks.com/s/MV-Gates-2019.pdf',
  },
  'mlw': {
    description: 'Alternative to MEX gates. 3 panel styles: strong vertical picket and two decorative designs. 3 colors: Black, Deep Brown and Bronze. Max height 4.85\'. Multi-panel bi-fold up to 14.1\' width. Matching Fence: FIN Series.',
    colors: 'Black, Deep Brown and Bronze',
    sizes: ['Finished Heights: 3.54\'/4.19\'/4.85\'', 'Max. Width Single: 3.96\' or less', 'Max. Width Double: 7.34\' or less', 'Max. Width Multiple Panel: 14.1\' or less'],
    pdfUrl: 'https://www.kunkelworks.com/s/MLW-Gates-2019.pdf',
  },
  'mce-gates': {
    description: 'MCE and the taller MCE-H are the newest gate series; they replace MEX, MLW and MF. Panels re-designed with metal profile covering the whole panel top (no plastic top-caps). New vertical picket styles. See MCE Detail PDF.',
    pdfUrl: 'https://www.kunkelworks.com/s/MCE-Gates-2021.pdf',
  },
  'mceh-gates': {
    description: 'Taller MCE-H gate series. New heights: H1700 (5.84\') and H1900 (6.5\'). Same metal panel top and new vertical picket styles as MCE. See MCE-H Detail PDF.',
    sizes: ['New heights: H1700 (5.84\'), H1900 (6.5\')'],
    pdfUrl: 'https://www.kunkelworks.com/s/MCE-H-Gates-2021.pdf',
  },
  'vpmc': {
    description: 'Super popular in the US; good match for any 4" picket fence. Heights from 3.3\' to 6\'. Standard panel width 43"; easily fitted to any opening. Matching Fence: REPF and VPF.',
    sizes: ['Finished Heights: 3.28\'/3.9\'/4.9\'/5.9\'', 'Max. Width Single: 4.3\' or less', 'Max. Width Double: 8\' or less'],
    pdfUrl: 'https://www.kunkelworks.com/s/VPMC-Closed-2019.pdf',
  },
  'cast-aluminum-gates': {
    description: 'Cast aluminum gates: solid aluminum (wrought-iron look without rust). Multiple styles; see Product Detail PDFs for ABS/ABB, ACS-1, AGB, AGC, AGK, AGY, APR, ALW, ART/AAM.',
    pdfUrl: 'https://www.kunkelworks.com/s/CastAlu-Gate-ABS-ABB.pdf',
  },
  'bamboo-gates': {
    description: 'PVC Bamboo gates—look like real bamboo but stand up to weather. Traditional Japanese style; black ropes decorative. Light and dark color options. Same PDF as Bamboo fence.',
    pdfUrl: 'https://www.kunkelworks.com/s/FTK-Bamboo.pdf',
  },
  'sliding-gates': {
    description: 'Sliding gate series; 8 styles. See Product Details PDF for specifications.',
    pdfUrl: 'https://www.kunkelworks.com/s/SRN-Slide-2019.pdf',
  },
  'other-gates': {
    description: 'Many more gate styles from Japan, including various luxury styles. See Product Details PDF for options.',
    pdfUrl: 'https://www.kunkelworks.com/s/kunkelworks-pjr-port.pdf',
  },
}

const carportUpdates = {
  'css': {
    description: 'Same shape as the popular LJ port—slope from front to back, straight edge on the front. Can carry heavy snow loads or solar panels.',
    sizes: ['Single projections: 3100mm', 'Double projections: 54/61 (×100mm)', 'Triple projections: 8000mm', 'Length units: 51/58 (×100mm)', 'Height: 23/25 (×100mm)', 'Snow-loads: 50/100/150cm'],
    pdfUrl: 'https://www.kunkelworks.com/s/CSS-Port-2019.pdf',
  },
  'uec': {
    description: 'Bearing beam port like U-Style; roof canopy is suspended below the beams.',
    sizes: ['Double projections: 48/54/60 (×100mm)', 'Length units: 51/58 (×100mm)', 'Height: 26/30 (×100mm)'],
    pdfUrl: 'https://www.kunkelworks.com/s/UEC-PORT-2019.pdf',
  },
  'atld': {
    description: 'NEW for 2019. Very heavy grade profiles. Many options for color, panel styles, and accessories (e.g. lights). Extremely strong: up to 150cm (5ft) snow, rated to 46m/s (104 mph) wind.',
    sizes: ['Single projections: 3400mm', 'Double projections: 5800mm', 'Length units: 55/60 (×100mm)', 'Height: 25/30 (×100mm)'],
    pdfUrl: 'https://www.kunkelworks.com/s/Atlade-PORT-2019.pdf',
  },
  'sae': {
    description: 'The "Space-port"—striking structure for customers with style and vision. A major statement.',
    colors: 'Silver, Urban Gray and Black',
    sizes: ['Double projections: 5800mm', 'Triple projections: 8100mm', 'Length units: 54/58 (×100mm)', 'Height: 23/26 (×100mm)'],
    pdfUrl: 'https://www.kunkelworks.com/s/SAE-Aero-Shade-2019.pdf',
  },
  'mts': {
    description: 'One of 3 port systems that can carry photovoltaic panels and major snow loads. Distinct modern look.',
    colors: 'Silver, Urban Gray and Black',
    sizes: ['Cantilever projections: 18/27/36 (×100mm)', 'Double projections: 27/36/54 (×100mm)', 'Triple projections: 81/90/99 (×100mm)', 'Length units: 28/49/54/58 (×100mm)', 'Height: 23/26/30 (×100mm)'],
    pdfUrl: 'https://www.kunkelworks.com/s/MTS-Port-2019.pdf',
  },
}

function updateFences() {
  const path = join(dataDir, 'fences.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const [key, updates] of Object.entries(fenceUpdates)) {
    if (data.seriesDetails[key]) {
      data.seriesDetails[key] = { ...data.seriesDetails[key], ...updates }
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log('Updated fences.json')
}

function updateGates() {
  const path = join(dataDir, 'gates.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const [key, updates] of Object.entries(gateUpdates)) {
    if (data.seriesDetails[key]) {
      data.seriesDetails[key] = { ...data.seriesDetails[key], ...updates }
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log('Updated gates.json')
}

function updateCarports() {
  const path = join(dataDir, 'carports.json')
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const [key, updates] of Object.entries(carportUpdates)) {
    if (data.seriesDetails[key]) {
      data.seriesDetails[key] = { ...data.seriesDetails[key], ...updates }
    }
  }
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log('Updated carports.json')
}

updateFences()
updateGates()
updateCarports()
