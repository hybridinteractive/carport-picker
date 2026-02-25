# Carport Picker

Nuxt 3 app for KunkelWorks: premium Japanese aluminum carports, patio covers, gates, fences, and entry doors. Includes product browsing, chat with an expert (OpenAI), quote requests (with contextual product/series and optional chat-session link), chat history tied to user email (magic-link verification), a sales admin dashboard for leads and conversation context, and an optional webhook for new quotes (CRM/Zapier).

## Quick start

```bash
pnpm install
cp .env.example .env   # then edit .env with your keys
pnpm dev
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deploy (Cloudflare Pages) and database migrations.

## Environment variables

Local development: copy [.env.example](.env.example) to `.env` and set values.

**Production (Cloudflare Pages):** Set environment variables in the dashboard under **Project → Settings → Environment variables** (not in the repo). For **NUXT_COOKIE_SECRET**, use a long random string and mark it as **Encrypted** so it is not visible in logs. This secret signs the “verified email” cookie used for magic-link chat; without it, email verification will not work.

| Variable | Purpose |
|----------|---------|
| `NUXT_APP_BASE_URL` | Full site URL (e.g. `https://your-site.pages.dev`) for magic-link emails |
| `NUXT_COOKIE_SECRET` | Secret for signing the verified-email cookie (required for chat-by-email verification) |

Full list and deployment details: [DEPLOYMENT.md](DEPLOYMENT.md).

## Scripts

- `pnpm dev` — local dev server
- `pnpm build` — production build (output in `dist`)
- `pnpm db:migrate` — run Drizzle migrations against Turso
- `pnpm exec wrangler ...` — Wrangler CLI (e.g. `wrangler secret put NUXT_COOKIE_SECRET` for Workers; for Pages, set vars in the dashboard instead)
