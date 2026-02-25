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
| `RESEND_API_KEY` | Yes (for quote email) | Resend API key |
| `RESEND_FROM_EMAIL` | Recommended | Sender address (defaults to Resend onboarding) |
| `RESEND_RECIPIENT_EMAIL` | Recommended | Where to receive quote requests |
| `SENTRY_DSN` | Optional | Sentry DSN for error reporting |

For production with Wrangler CLI, set secrets:

```bash
wrangler secret put TURSO_AUTH_TOKEN
wrangler secret put NUXT_OPENAI_API_KEY
wrangler secret put RESEND_API_KEY
# etc.
```

Or use a `.env` file when running `wrangler pages deploy` (do not commit `.env`).

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
