<script setup lang="ts">
const route = useRoute()
const storedSession =
  typeof localStorage !== 'undefined' ? localStorage.getItem('carport-chat-session') : null
const initialSessionId = (route.query.session_id as string) ?? storedSession ?? null

const { messages, sessionId, loading, loadingHistory, error, send } = useChat({
  initialSessionId,
  persistSession: true,
})
const input = ref('')
const bottom = ref<HTMLElement | null>(null)

function submit() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  send(text)
}

onMounted(() => {
  watch(
    () => messages.value.length,
    () => nextTick(() => bottom.value?.scrollIntoView({ behavior: 'smooth' })),
    { flush: 'post' }
  )
})
</script>

<template>
  <div class="flex flex-col rounded-xl border border-stone-200 bg-white shadow-sm">
    <div class="border-b border-stone-200 px-4 py-3">
      <h2 class="text-lg font-semibold text-stone-800">Chat with an expert</h2>
      <p class="text-sm text-stone-500">Ask about carports, patio covers, gates, fences, or entry doors.</p>
    </div>
    <div class="flex max-h-[70vh] min-h-[320px] flex-1 flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <template v-if="loadingHistory">
          <p class="text-center text-sm text-stone-500">Loading conversation…</p>
        </template>
        <template v-else-if="messages.length === 0">
          <p class="text-center text-sm text-stone-500">Send a message to get started.</p>
        </template>
        <template v-else>
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="[
              'rounded-lg px-3 py-2 text-sm',
              msg.role === 'user'
                ? 'ml-8 bg-amber-100 text-stone-900'
                : 'mr-8 bg-stone-100 text-stone-800'
            ]"
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </template>
        <div v-if="loading" class="mr-8 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-500">
          Thinking…
        </div>
        <div ref="bottom" />
      </div>
      <div v-if="error" class="border-t border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
        {{ error }}
      </div>
      <form class="border-t border-stone-200 p-3" @submit.prevent="submit">
        <div class="flex gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="Ask about products…"
            class="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            :disabled="loading || loadingHistory"
          />
          <button
            type="submit"
            class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            :disabled="loading || loadingHistory || !input.trim()"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
