<script setup lang="ts">
import type { ChatSessionSummary } from '~/composables/useChat'

const route = useRoute()
const storedSession =
  typeof localStorage !== 'undefined' ? localStorage.getItem('carport-chat-session') : null
const initialSessionId = (route.query.session_id as string) ?? storedSession ?? null

const {
  messages,
  sessionId,
  loading,
  loadingHistory,
  error,
  verifiedEmail,
  send,
  loadHistory,
  linkSessionToEmail,
  fetchSessionsByEmail,
  requestMagicLink,
  refreshVerifiedEmail,
} = useChat({
  initialSessionId,
  persistSession: true,
})
const input = ref('')
const bottom = ref<HTMLElement | null>(null)

const emailForSaveRestore = ref('')
const linkLoading = ref(false)
const linkSuccess = ref(false)
const sessionsLoading = ref(false)
const pastSessions = ref<ChatSessionSummary[]>([])
const sessionsFetched = ref(false)
const emailSectionOpen = ref(false)
const magicLinkSent = ref(false)
const magicLinkLoading = ref(false)
const queryLinked = ref(false)
const queryVerifiedEmail = ref(false)
const queryErrorExpired = ref(false)

const isVerifiedForCurrentEmail = computed(
  () =>
    !!verifiedEmail.value &&
    !!emailForSaveRestore.value.trim() &&
    emailForSaveRestore.value.trim().toLowerCase() === verifiedEmail.value.toLowerCase()
)

function submit() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  send(text)
}

async function handleSaveToEmail() {
  const email = emailForSaveRestore.value.trim()
  if (!email || linkLoading.value || magicLinkLoading.value) return
  if (!isVerifiedForCurrentEmail.value) {
    magicLinkLoading.value = true
    magicLinkSent.value = false
    try {
      await requestMagicLink({
        email,
        intent: 'link_session',
        session_id: sessionId.value ?? undefined,
      })
      magicLinkSent.value = true
    } finally {
      magicLinkLoading.value = false
    }
    return
  }
  linkLoading.value = true
  linkSuccess.value = false
  try {
    await linkSessionToEmail(email)
    linkSuccess.value = true
  } finally {
    linkLoading.value = false
  }
}

async function handleLoadMyChats() {
  const email = emailForSaveRestore.value.trim()
  if (!email || sessionsLoading.value || magicLinkLoading.value) return
  if (!isVerifiedForCurrentEmail.value) {
    magicLinkLoading.value = true
    magicLinkSent.value = false
    try {
      await requestMagicLink({ email, intent: 'list_sessions' })
      magicLinkSent.value = true
    } finally {
      magicLinkLoading.value = false
    }
    return
  }
  sessionsLoading.value = true
  pastSessions.value = []
  sessionsFetched.value = false
  try {
    pastSessions.value = await fetchSessionsByEmail(email)
  } catch (e) {
    pastSessions.value = []
  } finally {
    sessionsLoading.value = false
    sessionsFetched.value = true
  }
}

function formatSessionDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function selectPastSession(sessionIdFromList: string) {
  await loadHistory(sessionIdFromList)
  pastSessions.value = []
  emailSectionOpen.value = false
}

onMounted(() => {
  watch(
    () => messages.value.length,
    () => nextTick(() => bottom.value?.scrollIntoView({ behavior: 'smooth' })),
    { flush: 'post' }
  )

  const prefillEmail = route.query.email
  if (typeof prefillEmail === 'string' && prefillEmail.trim()) {
    emailForSaveRestore.value = prefillEmail.trim()
    queryVerifiedEmail.value = true
    emailSectionOpen.value = true
  }
  if (route.query.linked === '1') {
    linkSuccess.value = true
    queryLinked.value = true
    emailSectionOpen.value = true
  }
  if (route.query.error === 'expired') {
    queryErrorExpired.value = true
    emailSectionOpen.value = true
  }

  if (emailSectionOpen.value) {
    refreshVerifiedEmail().then(async () => {
      if (queryVerifiedEmail.value && emailForSaveRestore.value.trim()) {
        sessionsLoading.value = true
        sessionsFetched.value = false
        try {
          pastSessions.value = await fetchSessionsByEmail(emailForSaveRestore.value)
        } catch {
          pastSessions.value = []
        } finally {
          sessionsLoading.value = false
          sessionsFetched.value = true
        }
      }
    })
  }
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

    <div class="border-t border-stone-200">
      <button
        type="button"
        class="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-stone-600 hover:bg-stone-50"
        @click="emailSectionOpen = !emailSectionOpen"
      >
        <span>Save or restore chats with your email</span>
        <span class="inline-block text-stone-400 transition-transform" :class="emailSectionOpen ? 'rotate-180' : ''">▼</span>
      </button>
      <div v-show="emailSectionOpen" class="border-t border-stone-100 bg-stone-50/50 px-4 pb-4 pt-2">
        <p v-if="queryErrorExpired" class="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Verification link expired. Please request a new one.
        </p>
        <p v-if="queryLinked" class="mb-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          This chat is now saved to your email.
        </p>
        <p v-if="queryVerifiedEmail && !magicLinkSent && !sessionsLoading" class="mb-2 text-sm text-green-700">
          Verified. You can load your past chats below.
        </p>
        <p v-if="isVerifiedForCurrentEmail && verifiedEmail && !magicLinkSent" class="mb-2 text-sm text-stone-600">
          Verified as {{ verifiedEmail }}
        </p>
        <p v-if="magicLinkSent" class="mb-2 rounded-lg border border-amber-100 bg-amber-50/50 px-3 py-2 text-sm text-amber-800">
          Check your email and click the link to continue.
        </p>
        <div class="flex flex-wrap items-end gap-2">
          <label class="flex-1 min-w-[200px]">
            <span class="sr-only">Your email</span>
            <input
              v-model="emailForSaveRestore"
              type="email"
              placeholder="you@example.com"
              class="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </label>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
              :disabled="!sessionId || messages.length === 0 || !emailForSaveRestore.trim() || linkLoading || magicLinkLoading"
              @click="handleSaveToEmail"
            >
              {{
                magicLinkLoading
                  ? 'Sending…'
                  : linkLoading
                    ? 'Saving…'
                    : !isVerifiedForCurrentEmail
                      ? 'Send verification email to save'
                      : 'Save this chat to my email'
              }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-amber-600 bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              :disabled="!emailForSaveRestore.trim() || sessionsLoading || magicLinkLoading"
              @click="handleLoadMyChats"
            >
              {{
                magicLinkLoading
                  ? 'Sending…'
                  : sessionsLoading
                    ? 'Loading…'
                    : !isVerifiedForCurrentEmail
                      ? 'Send verification email to load chats'
                      : 'Load my chats'
              }}
            </button>
          </div>
        </div>
        <p v-if="linkSuccess && !queryLinked" class="mt-2 text-sm text-green-700">Chat saved to your email.</p>
        <p v-if="sessionsLoading" class="mt-2 text-sm text-stone-500">Loading your chats…</p>
        <div v-else-if="pastSessions.length > 0" class="mt-3">
          <p class="mb-2 text-sm font-medium text-stone-700">Your past chats</p>
          <ul class="space-y-1">
            <li
              v-for="s in pastSessions"
              :key="s.session_id"
              class="cursor-pointer rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-amber-50 hover:border-amber-200"
              @click="selectPastSession(s.session_id)"
            >
              {{ formatSessionDate(s.updated_at) }}
            </li>
          </ul>
        </div>
        <p
          v-else-if="sessionsFetched && pastSessions.length === 0"
          class="mt-2 text-sm text-stone-500"
        >
          No past chats for this email.
        </p>
        <p v-else-if="!sessionsFetched && emailSectionOpen" class="mt-2 text-sm text-stone-500">
          Enter your email and click “Load my chats” to see previous conversations.
        </p>
      </div>
    </div>
  </div>
</template>
