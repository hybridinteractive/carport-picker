import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql/web'
import * as schema from '../db/schema'

export function useDb() {
  const config = useRuntimeConfig()
  const url = config.tursoDatabaseUrl
  const authToken = config.tursoAuthToken
  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set')
  }
  const client = createClient({
    url,
    authToken: authToken || undefined,
  })
  return drizzle(client, { schema })
}
