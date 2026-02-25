import { GoogleGenAI } from '@google/genai'
import { HouseStyle, RoofPanelType } from '~/types/architect'
import type { GenerationConfig } from '~/types/architect'
import { setResponseHeader } from 'h3'
import { arrayBufferToBase64 } from '../utils/base64'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody(event)
  const config = body as GenerationConfig

  if (!config.carportReferenceImage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Carport reference image is required',
    })
  }

  if (config.style === HouseStyle.CUSTOM && !config.houseReferenceImage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'House reference image is required for custom style',
    })
  }

  const apiKey = runtimeConfig.googleAiApiKey || runtimeConfig.nanoBananaApiKey
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'API Key not configured',
    })
  }

  const ai = new GoogleGenAI({ apiKey })

  const stylePrompt: Record<HouseStyle, string> = {
    [HouseStyle.MINIMALIST]: 'a clean, minimalist modern house with large white volumes and floor-to-ceiling glass',
    [HouseStyle.BRUTALIST]: 'a sophisticated brutalist mansion with exposed raw concrete textures and sharp geometric angles',
    [HouseStyle.SCANDINAVIAN]: 'a warm Scandinavian-style home featuring light wood cladding, pitched roofs, and cozy lighting',
    [HouseStyle.MID_CENTURY_MODERN]: 'a classic mid-century modern residence with horizontal lines, open floor plans, and stone accents',
    [HouseStyle.CONTEMPORARY_LUXURY]: 'a high-end contemporary luxury villa with infinity pools, cantilevered decks, and premium stone finishes',
    [HouseStyle.CUSTOM]: 'a house designed precisely in the architectural style and form shown in the provided house reference image',
  }

  const metalColorDesc = config.metalColor || 'Urban Gray (UC)'
  let roofPanelDesc = ''
  if (config.roofPanelType === RoofPanelType.ALUMINUM) {
    const panelColor = config.aluminumPanelColor || 'Urban Gray Aluminum'
    roofPanelDesc = `The roof is made of ${panelColor.toLowerCase()} aluminum panels.`
  } else if (config.roofPanelType === RoofPanelType.POLYCARBONATE) {
    const panelType = config.polycarbonatePanelType || 'Blue Panel'
    roofPanelDesc = `The roof is made of ${panelType.toLowerCase()} polycarbonate (Lexan) panels, which are translucent and provide natural light filtering.`
  }

  const fullPrompt = `Architectural visualization task: 
  1. THE HOUSE: Create a rendering of ${stylePrompt[config.style]}. 
  2. THE CARPORT: Integrate a specific carport design. The carport must match the provided carport reference image. The carport frame is ${metalColorDesc.toLowerCase()}. ${roofPanelDesc} The carport structure should maintain the exact design and proportions shown in the reference image.
  3. INTEGRATION: Position this carport at the ${config.placement} of the house. 
  4. ENVIRONMENT: The scene should be shot in high-quality architectural photography style, during blue hour with warm interior lights glowing.`

  const parts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [{ text: fullPrompt }]

  if (config.houseReferenceImage && config.style === HouseStyle.CUSTOM) {
    const base64Data = config.houseReferenceImage.split(',')[1]
    const mimeType = config.houseReferenceImage.split(';')[0].split(':')[1]
    parts.push({
      inlineData: { data: base64Data, mimeType: mimeType ?? 'image/jpeg' },
    })
    parts.push({ text: 'This image is the reference for the house style and structure.' })
  }

  if (config.carportReferenceImage) {
    if (config.carportReferenceImage.startsWith('data:')) {
      const base64Data = config.carportReferenceImage.split(',')[1]
      const mimeType = config.carportReferenceImage.split(';')[0].split(':')[1]
      parts.push({
        inlineData: { data: base64Data, mimeType: mimeType ?? 'image/jpeg' },
      })
    } else {
      try {
        const imageResponse = await fetch(config.carportReferenceImage)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Data = arrayBufferToBase64(imageBuffer)
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
        parts.push({
          inlineData: { data: base64Data, mimeType: contentType },
        })
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: 'Failed to load carport reference image',
        })
      }
    }
    parts.push({ text: 'This image is the reference for the carport design that must be attached/placed near the house.' })
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    })

    let imageUrl = ''
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        break
      }
    }

    if (!imageUrl) {
      throw new Error('Failed to generate architectural image - no image data in response.')
    }

    setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    return imageUrl
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate architectural visual'
    throw createError({
      statusCode: 500,
      statusMessage: message,
    })
  }
})
