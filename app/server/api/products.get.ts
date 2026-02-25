import carports from '../data/products/carports.json'
import patioCovers from '../data/products/patio-covers.json'
import gates from '../data/products/gates.json'
import fences from '../data/products/fences.json'
import entryDoors from '../data/products/entry-doors.json'

const productGroups = [
  { id: 'carports', ...carports },
  { id: 'patio-covers', ...patioCovers },
  { id: 'gates', ...gates },
  { id: 'fences', ...fences },
  { id: 'entry-doors', ...entryDoors },
]

export default defineEventHandler(() => productGroups)
