#!/usr/bin/env node
/**
 * Applies the quote_submissions sales columns (product_slug, series_slug, chat_session_id, source)
 * to the same DB used by the app (TURSO_DATABASE_URL from .env).
 * Safe to run multiple times; skips columns that already exist.
 */
import 'dotenv/config'
import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN || undefined

if (!url) {
  console.error('TURSO_DATABASE_URL is not set in .env')
  process.exit(1)
}

const client = createClient({ url, authToken })

const statements = [
  'ALTER TABLE quote_submissions ADD COLUMN product_slug text',
  'ALTER TABLE quote_submissions ADD COLUMN series_slug text',
  'ALTER TABLE quote_submissions ADD COLUMN chat_session_id text',
  'ALTER TABLE quote_submissions ADD COLUMN source text',
]

for (const sql of statements) {
  try {
    await client.execute(sql)
    const col = sql.includes('product_slug') ? 'product_slug' : sql.includes('series_slug') ? 'series_slug' : sql.includes('chat_session_id') ? 'chat_session_id' : 'source'
    console.log('Added column:', col)
  } catch (err) {
    if (err.message && err.message.includes('duplicate column name')) {
      console.log('Column already exists, skipping:', sql.split('ADD COLUMN ')[1]?.split(' ')[0] || sql)
    } else {
      console.error('Failed:', sql, err.message)
      process.exit(1)
    }
  }
}

console.log('Done. Restart your dev server (pnpm dev) and try logging in again.')
await client.close()
