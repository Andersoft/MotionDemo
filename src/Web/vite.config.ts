import { fileURLToPath, URL } from 'node:url'
import { readdirSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

function fsdModuleAliases(): import('vite').Plugin {
  // Same-module layer aliases (@entities, @widgets, …) resolve relative to the importer.
  const LAYERS = ['entities', 'features', 'widgets', 'pages', 'shared']
  // Cross-module aliases (@global, @workspace, …) resolve to a module's public API barrel.
  const modulesDir = fileURLToPath(new URL('./src/modules', import.meta.url))
  const MODULES = readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  return {
    name: 'fsd-module-aliases',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('@') || source.startsWith('@/')) return null
      const parts = source.slice(1).split('/')
      const first = parts[0]
      const segment = parts.slice(1).join('/')

      if (LAYERS.includes(first)) {
        const match = importer.match(/\/src\/modules\/([^/]+)\//)
        if (!match) return null
        const moduleName = match[1]
        const resolved = fileURLToPath(new URL(`./src/modules/${moduleName}/${first}/${segment}`, import.meta.url))
        return this.resolve(resolved, importer, { skipSelf: true })
      }

      if (MODULES.includes(first)) {
        const suffix = segment ? `/${segment}` : ''
        const resolved = fileURLToPath(new URL(`./src/modules/${first}${suffix}`, import.meta.url))
        return this.resolve(resolved, importer, { skipSelf: true })
      }

      return null
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    fsdModuleAliases(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
