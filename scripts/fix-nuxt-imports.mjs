#!/usr/bin/env node
/**
 * After `nuxt prepare`, Nuxt writes package.json "imports" with a long pnpm path
 * that can cause "Invalid imports target" at runtime when running preview/server.
 * Use a relative path (./node_modules/...) so Node resolves #internal/nuxt/paths
 * relative to this package.json from any importer under the project.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

const key = '#internal/nuxt/paths'
const relativePath = './node_modules/@nuxt/nitro-server/dist/runtime/utils/paths.mjs'
const absolutePath = join(root, 'node_modules/@nuxt/nitro-server/dist/runtime/utils/paths.mjs')

if (!existsSync(absolutePath)) {
  console.warn('fix-nuxt-imports: paths.mjs not found at', absolutePath)
  process.exit(0)
}

if (pkg.imports?.[key] !== relativePath) {
  pkg.imports = pkg.imports || {}
  pkg.imports[key] = relativePath
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('fix-nuxt-imports: set #internal/nuxt/paths to relative path')
}
