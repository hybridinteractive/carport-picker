<script setup lang="ts">
useHead({ title: 'Chat with an expert | Carport Picker' })
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-12">
    <h1 class="text-2xl font-bold text-stone-900">Talk to an expert</h1>
    <p class="mt-2 text-stone-600">
      Get recommendations for carports, patio covers, gates, fences, and entry doors.
    </p>
    <div class="mt-8">
      <ChatPanel />
    </div>
  </div>
</template>
