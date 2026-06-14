import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'
import fsdPlugin from './scripts/eslint-plugin-fsd.ts'

const fsdRules = {
  'fsd/layer-hierarchy': 'error' as const,
  'fsd/cross-module-isolation': 'error' as const,
  'fsd/public-api': 'error' as const,
  'fsd/import-method': 'error' as const,
  'fsd/internal-segments': 'warn' as const,
  'fsd/prefer-shared-component': 'warn' as const,
}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: fsdRules,
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    files: ['scripts/**', 'src/router/**', 'src/main.ts', 'src/App.vue'],
    rules: {
      'fsd/layer-hierarchy': 'off',
      'fsd/cross-module-isolation': 'off',
      'fsd/public-api': 'off',
      'fsd/import-method': 'off',
      'fsd/internal-segments': 'off',
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
