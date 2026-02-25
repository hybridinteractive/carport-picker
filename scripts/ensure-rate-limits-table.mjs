#!/usr/bin/env node
/**
 * Ensures rate_limits and magic_links tables exist in the Turso DB (same URL as .env).
 * Run if you see "no such table: rate_limits" or "no such table: magic_links" after migrations.
 * Usage: node scripts/ensure-rate-limits-table.mjs
 */
import 'dotenv/config'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN || undefined

if (!url) {
  console.error('TURSO_DATABASE_URL is not set in .env')
  process.exit(1)
}

console.log('Using DB:', url.replace(/\/\/[^@]+@/, '//***@')) // hide auth in URL if any
const client = createClient({ url, authToken })

const statements = [
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT PRIMARY KEY NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    window_end INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS magic_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    token TEXT NOT NULL,
    email TEXT NOT NULL,
    intent TEXT NOT NULL,
    session_id TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS magic_links_token_unique ON magic_links (token)`,
]

try {
  for (const sql of statements) {
    await client.execute(sql)
  }
  console.log('rate_limits and magic_links tables are present (created if missing).')
} catch (e) {
  console.error('Failed to ensure tables:', e.message)
  process.exit(1)
}
