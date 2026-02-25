.DEFAULT_GOAL := help

## dev - Start development server
dev:
	pnpm dev

## build - Build for production (Cloudflare Pages)
build:
	NODE_ENV=production CF_PAGES=1 pnpm build

## deploy - Build and deploy to Cloudflare Pages via Wrangler
deploy: build
	WRANGLER_AUTO_UPDATE=true npx --yes wrangler pages deploy dist --project-name=carport-picker

## deploy-only - Deploy existing dist without building
deploy-only:
	WRANGLER_AUTO_UPDATE=true npx --yes wrangler pages deploy dist --project-name=carport-picker

## db:generate - Generate Drizzle migrations
db\:generate:
	pnpm run db:generate

## db:migrate - Run Drizzle migrations against Turso (requires .env with TURSO_*)
db\:migrate:
	pnpm run db:migrate

## db:studio - Open Drizzle Studio
db\:studio:
	pnpm run db:studio

## clean - Remove build artifacts
clean:
	rm -rf dist .nuxt .output node_modules/.cache

## help - Show this help
help:
	@echo "Targets: dev, build, deploy, deploy-only, db:generate, db:migrate, db:studio, clean"
