import OpenAI from 'openai'
import { eq, desc } from 'drizzle-orm'
import { getProductSummary } from '../utils/getProductSummary'
import { chatSessions, chatMessages } from '../db/schema'

const MAX_MESSAGE_LENGTH = 2000
const MAX_HISTORY_MESSAGES = 20
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const apiKey = config.openaiApiKey
    if (!apiKey) {
      throw createError({ statusCode: 503, statusMessage: 'OpenAI API key not configured' })
    }

    const body = await readBody<{ message: string; session_id?: string; email?: string }>(event)
    const userMessage = typeof body?.message === 'string' ? body.message.trim() : ''
    const clientSessionId = body?.session_id
    const clientEmail =
      typeof body?.email === 'string' && EMAIL_REGEX.test(body.email.trim()) ? body.email.trim() : undefined

    if (!userMessage) {
      throw createError({ statusCode: 400, statusMessage: 'message is required' })
    }
    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      throw createError({ statusCode: 400, statusMessage: `message must be at most ${MAX_MESSAGE_LENGTH} characters` })
    }

    const sessionId = clientSessionId || crypto.randomUUID()
    const db = useDb()
    const productSummary = getProductSummary()

    // Ensure session exists
    const existing = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId)).limit(1)
    if (existing.length === 0) {
      await db.insert(chatSessions).values({
        sessionId,
        email: clientEmail ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      const updates: { updatedAt: Date; email?: string } = { updatedAt: new Date() }
      if (clientEmail !== undefined && existing[0].email == null) {
        updates.email = clientEmail
      }
      await db.update(chatSessions).set(updates).where(eq(chatSessions.sessionId, sessionId))
    }

    // Load recent history
    const history = await db
      .select({ role: chatMessages.role, content: chatMessages.content })
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(MAX_HISTORY_MESSAGES)

    const orderedHistory = history.reverse()
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      {
        role: 'system',
        content: `You are an expert on KunkelWorks products: premium Japanese aluminum carports, patio covers, gates, fences, and entry doors (Sankyo-Tateyama). You help customers in Colorado and elsewhere find the right product. Be concise, friendly, and factual. Only recommend products from the knowledge below. If unsure, suggest they request a quote or contact for pricing.

When the customer shows clear interest in a specific product or is ready to get pricing (e.g. asking about cost, installation, or saying they want to buy), suggest they "Get a quote" and mention they can use the "Get a quote" link in this chat to request one—their conversation will be attached so we can help them faster.

${productSummary}`,
      },
      ...orderedHistory.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
    ]

    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1024,
    })

    const assistantContent = completion.choices[0]?.message?.content?.trim() ?? 'I’m sorry, I couldn’t generate a response. Please try again.'

    // Persist user message and assistant reply
    await db.insert(chatMessages).values([
      { sessionId, role: 'user', content: userMessage, createdAt: new Date() },
      { sessionId, role: 'assistant', content: assistantContent, createdAt: new Date() },
    ])

    return {
      session_id: sessionId,
      message: assistantContent,
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err) {
      throw err
    }
    console.error('[POST /api/chat]', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Chat request failed. Please try again.',
    })
  }
})
