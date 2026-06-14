import type { Rule } from 'eslint'

const MODULE_INTERNAL_LAYER_ORDER: Record<string, number> = {
  pages: 4, widgets: 3, features: 2, entities: 1, shared: 0,
}

function normalizePath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const srcIndex = normalized.indexOf('/src/')
  if (srcIndex !== -1) return normalized.slice(srcIndex + 1)
  if (normalized.startsWith('src/')) return normalized
  return normalized
}

function stripQueryAndExt(p: string): string {
  const q = p.indexOf('?')
  const clean = q !== -1 ? p.slice(0, q) : p
  return clean.replace(/\.(ts|vue|js|tsx|jsx)$/, '')
}

function isBareSpecifier(s: string): boolean {
  return !(s.startsWith('.') || s.startsWith('@/') || s.startsWith('/'))
}

function classifyFile(filePath: string): {
  type: 'root' | 'shared' | 'module'
  moduleName?: string
  layer?: string
  segment?: string
} {
  const normalized = normalizePath(filePath)
  const parts = normalized.split('/').filter(Boolean)

  if (parts.length < 2 || parts[0] !== 'src') return { type: 'root' }

  if (
    parts[1] === 'main.ts' ||
    parts[1] === 'App.vue' ||
    parts[1] === 'env.d.ts'
  )
    return { type: 'root' }

  if (parts[1] === 'router') return { type: 'root' }

  if (parts[1] === 'scripts') return { type: 'root' }

  if (parts[1] === 'shared') {
    const segment = parts[2]
    if (['ui', 'lib', 'api', 'assets'].includes(segment)) {
      return { type: 'shared', layer: segment, segment }
    }
    return { type: 'root' }
  }

  if (parts[1] === 'modules' && parts.length >= 3) {
    const moduleName = parts[2]
    if (parts.length >= 4) {
      const layer = parts[3]
      if (MODULE_INTERNAL_LAYER_ORDER[layer] !== undefined) {
        const segment = parts.length >= 5 ? parts[4] : undefined
        return { type: 'module', moduleName, layer, segment }
      }
    }
    return { type: 'module', moduleName }
  }

  return { type: 'root' }
}

function resolveImport(
  importSource: string,
  currentFile: string,
): {
  type: 'node_module' | 'root' | 'shared' | 'module'
  moduleName?: string
  layer?: string
} {
  if (isBareSpecifier(importSource)) return { type: 'node_module' }

  const clean = stripQueryAndExt(importSource)

  if (clean.startsWith('@/')) {
    const p = clean.slice(2).split('/').filter(Boolean)
    if (p.length === 0) return { type: 'root' }
    if (p[0] === 'shared') return { type: 'shared', layer: p[1] }
    if (p[0] === 'modules' && p.length >= 2) {
      const moduleName = p[1]
      if (p.length >= 3) {
        const layer = p[2]
        if (MODULE_INTERNAL_LAYER_ORDER[layer] !== undefined)
          return { type: 'module', moduleName, layer }
      }
      return { type: 'module', moduleName }
    }
    return { type: 'root' }
  }

  if (clean.startsWith('.')) {
    const currentParts = normalizePath(currentFile).split('/').filter(Boolean)
    const importParts = clean.split('/').filter(Boolean)

    let upCount = 0
    const remaining: string[] = []
    for (const part of importParts) {
      if (part === '..') upCount++
      else if (part !== '.') remaining.push(part)
    }

    const dir = currentParts.slice(0, -1)
    const base = upCount > 0 ? dir.slice(0, -upCount) : dir
    const resolved = [...base, ...remaining]

    if (resolved.length < 2 || resolved[0] !== 'src')
      return { type: 'root' }

    if (resolved[1] === 'shared')
      return { type: 'shared', layer: resolved[2] }

    if (resolved[1] === 'modules' && resolved.length >= 3) {
      const moduleName = resolved[2]
      const layer =
        resolved.length >= 4 &&
        MODULE_INTERNAL_LAYER_ORDER[resolved[3]] !== undefined
          ? resolved[3]
          : undefined
      return { type: 'module', moduleName, layer }
    }

    return { type: 'root' }
  }

  return { type: 'root' }
}

const layerHierarchy: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Within a module, a layer can only import from layers strictly below it.',
      recommended: true,
    },
    messages: {
      violation:
        "Layer hierarchy violation: '{{sourceLayer}}' (level {{sourceOrder}}) cannot import from '{{targetLayer}}' (level {{targetOrder}}). Imports must go to layers strictly below.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    if (source.type !== 'module' || !source.layer) return {}

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource || isBareSpecifier(importSource)) return

        const target = resolveImport(importSource, filename)
        if (
          target.type !== 'module' ||
          target.moduleName !== source.moduleName ||
          !target.layer
        )
          return

        const sourceOrder = MODULE_INTERNAL_LAYER_ORDER[source.layer!]
        const targetOrder = MODULE_INTERNAL_LAYER_ORDER[target.layer]
        if (targetOrder >= sourceOrder) {
          context.report({
            node,
            messageId: 'violation',
            data: {
              sourceLayer: source.layer!,
              sourceOrder: String(sourceOrder),
              targetLayer: target.layer,
              targetOrder: String(targetOrder),
            },
          })
        }
      },
    }
  },
}

const crossModuleIsolation: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Modules cannot import from each other. Shared kernel cannot import from modules.',
      recommended: true,
    },
    messages: {
      moduleToModule:
        "Cross-module isolation violation: '{{sourceType}}'{{sourceModule}} cannot import from module '{{targetModule}}'. Modules can only import from @/shared/*, node_modules, or their own code.",
      sharedToModule:
        "Shared kernel violation: '{{sourceType}}' cannot import from module '{{targetModule}}'. Shared kernel must stay pure — it cannot depend on modules.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource || isBareSpecifier(importSource)) return

        const target = resolveImport(importSource, filename)
        if (target.type !== 'module' || !target.moduleName) return

        if (source.type === 'module') {
          if (target.moduleName !== source.moduleName) {
            context.report({
              node,
              messageId: 'moduleToModule',
              data: {
                sourceType: 'module',
                sourceModule: ` '${source.moduleName}'`,
                targetModule: target.moduleName,
              },
            })
          }
        } else if (source.type === 'shared') {
          context.report({
            node,
            messageId: 'sharedToModule',
            data: {
              sourceType: 'shared kernel',
              targetModule: target.moduleName,
            },
          })
        }
      },
    }
  },
}

const publicApi: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Import from a module through its public API (index.ts), not through internal paths.',
      recommended: true,
    },
    messages: {
      violation:
        "Public API violation: Import from module '{{moduleName}}' must go through its public API. Use '@/modules/{{moduleName}}' instead of '@/modules/{{moduleName}}/{{deepLayer}}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource || isBareSpecifier(importSource)) return

        const target = resolveImport(importSource, filename)
        if (
          target.type !== 'module' ||
          !target.moduleName ||
          !target.layer
        )
          return

        if (
          source.type === 'module' &&
          source.moduleName === target.moduleName
        )
          return

        context.report({
          node,
          messageId: 'violation',
          data: {
            moduleName: target.moduleName,
            deepLayer: target.layer,
          },
        })
      },
    }
  },
}

const importMethod: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce absolute @/ paths for external imports, relative paths for internal imports.',
      recommended: true,
    },
    messages: {
      sameModuleAbsolute:
        "Import method violation: Use a relative path for imports within module '{{moduleName}}', not an absolute @/modules/{{moduleName}} path.",
      crossModuleRelative:
        "Import method violation: Use an absolute '@/' path to import from outside the module '{{sourceModule}}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    if (source.type !== 'module') return {}

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource || isBareSpecifier(importSource)) return

        const target = resolveImport(importSource, filename)

        if (importSource.startsWith('@/')) {
          if (
            target.type === 'module' &&
            target.moduleName === source.moduleName
          ) {
            context.report({
              node,
              messageId: 'sameModuleAbsolute',
              data: { moduleName: source.moduleName! },
            })
          }
          return
        }

        if (importSource.startsWith('.')) {
          if (target.type === 'module') {
            if (target.moduleName !== source.moduleName) {
              context.report({
                node,
                messageId: 'crossModuleRelative',
                data: { sourceModule: source.moduleName! },
              })
            }
          } else if (target.type === 'shared' || target.type === 'root') {
            context.report({
              node,
              messageId: 'crossModuleRelative',
              data: { sourceModule: source.moduleName! },
            })
          }
        }
      },
    }
  },
}

const internalSegments: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce segment dependency rules within a module: model/lib should not depend on ui.',
      recommended: true,
    },
    messages: {
      violation:
        "Internal segment violation: '{{sourceCategory}}' (layer '{{sourceLayer}}') should not import from '{{targetCategory}}' (layer '{{targetLayer}}'). Business logic should not depend on UI components.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    if (source.type !== 'module' || !source.layer) return {}

    const LAYER_CATEGORY: Record<string, 'ui' | 'model' | 'lib'> = {
      pages: 'ui',
      widgets: 'ui',
      features: 'model',
      entities: 'model',
      shared: 'lib',
    }

    const sourceCategory = LAYER_CATEGORY[source.layer]
    if (!sourceCategory || sourceCategory === 'ui') return {}

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource || isBareSpecifier(importSource)) return

        const target = resolveImport(importSource, filename)
        if (
          target.type !== 'module' ||
          target.moduleName !== source.moduleName ||
          !target.layer
        )
          return

        const targetCategory = LAYER_CATEGORY[target.layer]
        if (targetCategory === 'ui') {
          context.report({
            node,
            messageId: 'violation',
            data: {
              sourceCategory,
              sourceLayer: source.layer,
              targetCategory,
              targetLayer: target.layer,
            },
          })
        }
      },
    }
  },
}

const SHARED_COMPONENT_MAP: Record<string, string> = {
  button: 'AppButton',
  table: 'AppTable',
  input: 'AppInput',
}

const preferSharedComponent: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer shared UI components over raw HTML elements for consistent styling.',
      recommended: true,
    },
    messages: {
      preferComponent:
        "Prefer '{{component}}' over native <{{element}}>. Import from '@/shared/ui' instead.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const normalized = filename.replace(/\\/g, '/')

    if (normalized.includes('/shared/ui/')) return {}
    if (!normalized.endsWith('.vue')) return {}

    return {
      VElement(node: unknown) {
        const el = node as { name: string; startTag: { attributes: Array<{ key?: { name: string }; value?: { value: string } }> } }
        const tagName = el.name
        const mapped = SHARED_COMPONENT_MAP[tagName]
        if (!mapped) return

        if (tagName === 'input') {
          const attrs = el.startTag?.attributes ?? []
          const typeAttr = attrs.find(
            (a) => a.key?.name === 'type',
          )
          const typeVal = typeAttr?.value?.value
          if (typeVal && ['checkbox', 'radio', 'hidden', 'file', 'submit'].includes(typeVal))
            return
        }

        context.report({
          node: node as never,
          messageId: 'preferComponent',
          data: { component: mapped, element: tagName },
        })
      },
    }
  },
}

export default {
  rules: {
    'layer-hierarchy': layerHierarchy,
    'cross-module-isolation': crossModuleIsolation,
    'public-api': publicApi,
    'import-method': importMethod,
    'internal-segments': internalSegments,
    'prefer-shared-component': preferSharedComponent,
  },
}
