// https://nuxt.com/docs/api/configuration/nuxt-config
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  devtools: { enabled: true },
  srcDir: 'app',

  app: {
    head: {
      titleTemplate: '%s | Carport Picker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Premium Japanese aluminum carports and shade structures for Colorado. Talk to an expert or get a quote.' },
      ],
    },
  },

  modules: ['@sentry/nuxt/module'],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias:
        process.env.NODE_ENV !== 'production'
          ? { '#app-manifest': join(rootDir, '.nuxt/manifest/meta/dev.json') }
          : {},
    },
  },

  sentry: {
    org: 'hybrid-interactive',
    project: 'carport-picker',
  },

  sourcemap: {
    client: 'hidden',
  },

  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
    resendApiKey: process.env.RESEND_API_KEY,
    resendFromEmail: process.env.RESEND_FROM_EMAIL,
    resendRecipientEmail: process.env.RESEND_RECIPIENT_EMAIL,
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
  },

  nitro: {
    preset: 'cloudflare-pages',
    rollupConfig: {
      external: ['fs', 'path', 'sharp'],
    },
    virtual: {
      '@react-email/render': 'export default function() { return ""; }',
    },
    cloudflare: {
      pages: {
        routes: { exclude: ['/uploads/*'] },
      },
    },
    compatibilityDate: '2024-01-01',
    minify: process.env.NODE_ENV === 'production',
  },
})