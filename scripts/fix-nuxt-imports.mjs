#!/usr/bin/env node
/**
 * After `nuxt prepare`, Nuxt writes package.json "imports" with a long pnpm path
 * that can cause "Invalid imports target" at runtime. Rewrite it to the short
 * hoisted path so Node resolves #internal/nuxt/paths correctly.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

const key = '#internal/nuxt/paths'
const shortPath = './node_modules/@nuxt/nitro-server/dist/runtime/utils/paths.mjs'

if (pkg.imports?.[key] && pkg.imports[key] !== shortPath) {
  pkg.imports[key] = shortPath
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('fix-nuxt-imports: updated #internal/nuxt/paths to hoisted path')
}
