import { getVisualizerCarportOptions, getVisualizerCustomizationOptions } from '../../utils/visualizerCarports'

/** Returns carport options and customization options (frame colors, roof types, etc.) from carports.json. */
export default defineEventHandler(() => {
  return {
    carportOptions: getVisualizerCarportOptions(),
    customization: getVisualizerCustomizationOptions(),
  }
})
