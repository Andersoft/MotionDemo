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
  'fsd/internal-segments': 'error' as const,
  'fsd/module-tsconfig': 'error' as const,
  'fsd/module-routes': 'error' as const,
  'fsd/module-layer-alias': 'error' as const,
  'fsd/types-outside-entities': 'error' as const,
  'fsd/prefer-shared-component': 'error' as const,
  'fsd/pinia-store-location': 'error' as const,
  'fsd/prefer-shared-component-style': 'error' as const,
  'fsd/shared-purity': 'error' as const,
  'fsd/no-inline-domain-data': 'error' as const,
  'fsd/entities-segments': 'error' as const,
}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/*.d.ts']),

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
    // Tooling and tests are fully exempt from FSD rules.
    files: ['scripts/**', 'src/__tests__/**'],
    rules: {
      'fsd/layer-hierarchy': 'off',
      'fsd/cross-module-isolation': 'off',
      'fsd/public-api': 'off',
      'fsd/import-method': 'off',
      'fsd/internal-segments': 'off',
      'fsd/module-tsconfig': 'off',
      'fsd/module-routes': 'off',
      'fsd/module-layer-alias': 'off',
      'fsd/types-outside-entities': 'off',
      'fsd/prefer-shared-component': 'off',
      'fsd/pinia-store-location': 'off',
      'fsd/prefer-shared-component-style': 'off',
      'fsd/shared-purity': 'off',
      'fsd/no-inline-domain-data': 'off',
      'fsd/entities-segments': 'off',
    },
  },

  {
    // App-layer root files: exempt from module-internal FSD rules, but they
    // still must reference modules via the @<name> alias (import-method stays on).
    files: ['src/router/**', 'src/main.ts', 'src/App.vue'],
    rules: {
      'fsd/layer-hierarchy': 'off',
      'fsd/cross-module-isolation': 'off',
      'fsd/public-api': 'off',
      'fsd/internal-segments': 'off',
      'fsd/module-tsconfig': 'off',
      'fsd/module-routes': 'off',
      'fsd/module-layer-alias': 'off',
      'fsd/types-outside-entities': 'off',
      'fsd/prefer-shared-component': 'off',
      'fsd/pinia-store-location': 'off',
      'fsd/prefer-shared-component-style': 'off',
      'fsd/shared-purity': 'off',
      'fsd/no-inline-domain-data': 'off',
      'fsd/entities-segments': 'off',
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
