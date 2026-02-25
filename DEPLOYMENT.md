# Deployment (Cloudflare Pages via Wrangler)

## Prerequisites

- Node.js 18+
- pnpm
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (or use `npx wrangler`)
- Turso database (for chat and optional quote log)
- Resend account (for quote emails)
- OpenAI API key (for chat)

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `TURSO_DATABASE_URL` | Yes (for chat/quote DB) | Turso libSQL URL, e.g. `libsql://carport-picker-chatbot-hybridinteractive.aws-us-west-2.turso.io` |
| `TURSO_AUTH_TOKEN` | Yes (for Turso) | Turso auth token |
| `NUXT_OPENAI_API_KEY` | Yes (for chat) | OpenAI API key |
| `GOOGLE_AI_API_KEY` | Optional (for Carport Builder) | Google AI API key for visualizer image generation (Gemini). Alternative: `NANO_BANANA_API_KEY`. |
| `RESEND_API_KEY` | Yes (for quote email) | Resend API key |
| `RESEND_FROM_EMAIL` | Recommended | Sender address (defaults to Resend onboarding) |
| `RESEND_RECIPIENT_EMAIL` | Recommended | Where to receive quote requests |
| `NUXT_APP_BASE_URL` | Yes (for magic-link email) | Full site URL, e.g. `https://your-project.pages.dev` |
| `NUXT_COOKIE_SECRET` | Yes (for chat email verification) | Long random string; signs the verified-email cookie. Set as **Encrypted** in the dashboard. |
| `NUXT_ADMIN_SECRET` | Optional | Password for the sales admin dashboard at `/admin`. If unset, admin API returns 503. |
| `QUOTE_WEBHOOK_URL` | Optional | URL to POST new quote payloads (for CRM/Zapier/Make). |
| `NUXT_CALENDLY_URL` or `CALENDLY_URL` | Optional | Calendly booking URL; shows "Schedule a call" on quote success and admin lead view. |
| `SENTRY_DSN` | Optional | Sentry DSN for error reporting |

### Cloudflare Pages (dashboard)

If you deploy via the Cloudflare Pages dashboard (Git connection): set all variables under **Project → Settings → Environment variables**. For **NUXT_COOKIE_SECRET**, use a long random value (e.g. `openssl rand -hex 32`) and mark it as **Encrypted** so it is not exposed in build logs. Without this secret, chat-by-email magic-link verification will not work.

### Wrangler CLI

For production with Wrangler CLI, set secrets:

```bash
pnpm exec wrangler secret put TURSO_AUTH_TOKEN
pnpm exec wrangler secret put NUXT_OPENAI_API_KEY
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put NUXT_COOKIE_SECRET
# etc.
```

Note: `wrangler secret put` applies to **Workers**. For **Pages** deploys (`wrangler pages deploy`), use the dashboard for env vars or pass them via a `.env` file when running the deploy (do not commit `.env`).

## Database migrations

Before or after deploying, apply Drizzle migrations to Turso:

```bash
# Ensure .env has TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
pnpm run db:migrate
# or
make db:migrate
```

## Build and deploy

```bash
# Build for Cloudflare Pages
make build
# or: NODE_ENV=production CF_PAGES=1 pnpm build

# Deploy (builds then deploys)
make deploy
# or deploy existing dist only:
make deploy-only
```

Build output is `dist`. Wrangler deploys it with:

```bash
npx wrangler pages deploy dist --project-name=carport-picker
```

## Cloudflare Pages dashboard

Alternatively, connect the repo in Cloudflare Pages and set the same env vars under **Settings → Environment variables**. Use:

- **Build command:** `pnpm build` (or `NODE_ENV=production CF_PAGES=1 pnpm build`)
- **Build output directory:** `dist`
- **Root directory:** (leave empty)

Run migrations separately (e.g. in CI or manually) after deploy.

## Follow-up email (second email)

The app sends one confirmation email when a quote is submitted. To send a **second follow-up email** (e.g. 24–48 hours later: “Still have questions? Chat or reply.”) without adding cron or a queue in the app:

1. Set **`QUOTE_WEBHOOK_URL`** to a Zapier/Make/n8n webhook that receives the quote payload.
2. In Zapier/Make: when the webhook fires, add a **Delay** step (e.g. 24 hours), then send an email (Resend, Gmail, or your provider) using the contact info from the payload.

No code changes are required in the app. The webhook payload includes `name`, `email`, `phone`, `message`, and other quote fields so you can personalize the follow-up.
