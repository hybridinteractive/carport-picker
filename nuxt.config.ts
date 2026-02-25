// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  devtools: { enabled: true },
  devServer: { port: 3000 },
  srcDir: 'app',

  // Avoid "Failed to resolve import #app-manifest" when using pnpm (Nuxt internal alias not resolved in node_modules).
  experimental: {
    appManifest: false,
  },

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
    resendAdditionalRecipients: process.env.RESEND_ADDITIONAL_RECIPIENTS,
    tursoDatabaseUrl: process.env.TURSO_DATABASE_URL,
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
    appBaseUrl: process.env.NUXT_APP_BASE_URL || 'http://localhost:3000',
    cookieSecret: process.env.NUXT_COOKIE_SECRET,
  },

  nitro: {
    preset: 'cloudflare-pages',
    scanDirs: ['app/server'],
    alias: {
      // Resolve at bundle time so we don't rely on package.json "imports" at runtime (avoids pnpm/Node "Invalid imports target").
      '#internal/nuxt/paths': './node_modules/@nuxt/nitro-server/dist/runtime/utils/paths.mjs',
    },
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