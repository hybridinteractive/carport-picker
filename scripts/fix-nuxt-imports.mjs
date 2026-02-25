#!/usr/bin/env node
/**
 * After `nuxt prepare`, Nuxt writes package.json "imports" with a long pnpm path
 * that can cause "Invalid imports target" at runtime. Rewrite it to an absolute
 * path so Node resolves #internal/nuxt/paths correctly from any CWD.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

const key = '#internal/nuxt/paths'
const relativePath = './node_modules/@nuxt/nitro-server/dist/runtime/utils/paths.mjs'
const absolutePath = resolve(root, relativePath)

if (!existsSync(absolutePath)) {
  console.warn('fix-nuxt-imports: paths.mjs not found at', absolutePath)
  process.exit(0)
}

const targetPath = absolutePath
if (pkg.imports?.[key] !== targetPath) {
  pkg.imports = pkg.imports || {}
  pkg.imports[key] = targetPath
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log('fix-nuxt-imports: set #internal/nuxt/paths to absolute path')
}
