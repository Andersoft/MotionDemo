import type { Rule } from 'eslint'
import { existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const MODULE_INTERNAL_LAYER_ORDER: Record<string, number> = {
  pages: 4, widgets: 3, features: 2, entities: 1, shared: 0,
}

function normalizePath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const srcIndex = normalized.lastIndexOf('/src/')
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
  type: 'root' | 'global' | 'module'
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

  if (parts[1] === 'global') {
    const segment = parts.length >= 3 ? parts[2] : undefined
    return { type: 'global', layer: segment, segment }
  }

  if (parts[1] === 'modules' && parts.length >= 3) {
    const moduleName = parts[2]
    if (moduleName === 'global') {
      const segment = parts.length >= 4 ? parts[3] : undefined
      return { type: 'global', layer: segment, segment }
    }
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
  type: 'node_module' | 'root' | 'global' | 'module'
  moduleName?: string
  layer?: string
  segment?: string
} {
  if (isBareSpecifier(importSource)) return { type: 'node_module' }

  const clean = stripQueryAndExt(importSource)

  if (clean.startsWith('@/')) {
    const p = clean.slice(2).split('/').filter(Boolean)
    if (p.length === 0) return { type: 'root' }
    if (p[0] === 'global') return { type: 'global', layer: p[1] }
    if (p[0] === 'modules' && p.length >= 2) {
      const moduleName = p[1]
      if (moduleName === 'global') {
        const layer = p[2]
        return { type: 'global', layer, segment: layer ? p[3] : undefined }
      }
      if (p.length >= 3) {
        const layer = p[2]
        if (MODULE_INTERNAL_LAYER_ORDER[layer] !== undefined) {
          const segment = p.length >= 4 ? p[3] : undefined
          return { type: 'module', moduleName, layer, segment }
        }
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

    if (resolved[1] === 'global')
      return { type: 'global', layer: resolved[2] }

    if (resolved[1] === 'modules' && resolved.length >= 3) {
      const moduleName = resolved[2]
      if (moduleName === 'global') {
        const layer = resolved[3]
        return { type: 'global', layer, segment: layer ? resolved[4] : undefined }
      }
      const layer =
        resolved.length >= 4 &&
        MODULE_INTERNAL_LAYER_ORDER[resolved[3]] !== undefined
          ? resolved[3]
          : undefined
      const segment =
        layer && resolved.length >= 5 ? resolved[4] : undefined
      return { type: 'module', moduleName, layer, segment }
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

        // Only strictly-upward imports violate the hierarchy. Same-layer imports
        // are allowed: within a layer, segments (e.g. entities/ui → entities/model)
        // are meant to compose. Segment *direction* is governed by internal-segments.
        if (sourceOrder < targetOrder) {
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
        'Cross-module imports must go through the module\'s public API (index.ts). Deep imports into module internals are forbidden. Global kernel cannot import from modules.',
      recommended: true,
    },
    messages: {
      moduleToModuleDeep:
        "Cross-module isolation violation: '{{sourceType}}'{{sourceModule}} cannot import '{{targetLayer}}' from module '{{targetModule}}'. Import from '@{{targetModule}}' (the module's public API) instead.",
      sharedToModule:
        "Global kernel violation: '{{sourceType}}' cannot import from module '{{targetModule}}'. Global kernel must stay pure — it cannot depend on modules.",
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

        if (source.type === 'global') {
          context.report({
            node,
            messageId: 'sharedToModule',
            data: {
              sourceType: 'shared kernel',
              targetModule: target.moduleName,
            },
          })
          return
        }

        if (source.type === 'module') {
          if (target.moduleName !== source.moduleName && target.layer) {
            context.report({
              node,
              messageId: 'moduleToModuleDeep',
              data: {
                sourceType: 'module',
                sourceModule: ` '${source.moduleName}'`,
                targetLayer: target.layer,
                targetModule: target.moduleName,
              },
            })
          }
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
        "Public API violation: Import from module '{{moduleName}}' must go through its public API. Use '@{{moduleName}}' instead of '@/modules/{{moduleName}}/{{deepLayer}}'.",
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
    fixable: 'code',
    docs: {
      description:
        'Enforce relative paths for internal imports and the @<moduleName> alias for cross-module imports — never a deep @/modules/<name> path.',
      recommended: true,
    },
    messages: {
      sameModuleAbsolute:
        "Import method violation: Use a relative path for imports within module '{{moduleName}}', not an absolute @/modules/{{moduleName}} path.",
      crossModuleRelative:
        "Import method violation: Use an absolute '@/' path to import from outside the module '{{sourceModule}}'.",
      useModuleAlias:
        "Import method violation: Reference module '{{moduleName}}' by its '{{alias}}' alias, not '{{path}}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    // Module files are fully governed; root files (App.vue, main.ts, router)
    // may import modules but must do so via the @<name> alias.
    if (source.type !== 'module' && source.type !== 'root') return {}

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource || isBareSpecifier(importSource)) return

        const target = resolveImport(importSource, filename)

        if (importSource.startsWith('@/')) {
          // Resolve which module this @/ path points at (global counts as a module).
          const targetModule =
            target.type === 'global'
              ? 'global'
              : target.type === 'module'
                ? target.moduleName
                : undefined

          if (targetModule) {
            if (
              target.type === 'module' &&
              target.moduleName === source.moduleName
            ) {
              context.report({
                node,
                messageId: 'sameModuleAbsolute',
                data: { moduleName: source.moduleName! },
              })
            } else {
              // Cross-module (or global) imports must use the @<moduleName> alias.
              const alias = `@${targetModule}`
              const isBarrel =
                importSource === `@/modules/${targetModule}` ||
                importSource === `@/${targetModule}`
              context.report({
                node,
                messageId: 'useModuleAlias',
                data: { moduleName: targetModule, alias, path: importSource },
                fix: isBarrel
                  ? (fixer) => fixer.replaceText(node.source, `'${alias}'`)
                  : undefined,
              })
            }
          }
          return
        }

        if (importSource.startsWith('.')) {
          // Relative-path rules only apply to module-internal source files.
          if (source.type !== 'module') return
          if (target.type === 'module') {
            if (target.moduleName !== source.moduleName) {
              context.report({
                node,
                messageId: 'crossModuleRelative',
                data: { sourceModule: source.moduleName! },
              })
            }
          } else if (target.type === 'global' || target.type === 'root') {
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

const COMPONENT_WORTHY_ELEMENTS = ['button', 'input', 'table', 'textarea', 'select'] as const

const GLOBAL_UI_DIR = resolve(import.meta.dirname, '..', 'src', 'modules', 'global', 'shared', 'ui')

function discoverSharedComponents(): Map<string, string> {
  const map = new Map<string, string>()
  try {
    const entries = readdirSync(GLOBAL_UI_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.name.endsWith('.vue')) continue
      const name = entry.name.replace(/\.vue$/, '')
      const element = elementForComponentName(name)
      if (element) map.set(element, name)
    }
  } catch {
    return map
  }
  return map
}

function elementForComponentName(name: string): string | null {
  const match = name.match(/^App(.+)$/)
  if (!match) return null
  const element = match[1].charAt(0).toLowerCase() + match[1].slice(1)
  return element
}

function componentNameForElement(element: string): string {
  return 'App' + element.charAt(0).toUpperCase() + element.slice(1)
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
      useComponent:
        "Use '{{component}}' from @/modules/global/shared/ui instead of native <{{element}}>.",
      createComponent:
        "Create a shared '{{component}}' component in @/modules/global/shared/ui to replace native <{{element}}> patterns.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const normalized = filename.replace(/\\/g, '/')

    if (normalized.includes('/shared/ui/')) return {}
    if (!normalized.endsWith('.vue')) return {}

    const sharedComponents = discoverSharedComponents()

    return {
      'Program:exit'() {
        const sourceCode = context.sourceCode
        if (!sourceCode) return
        const templateBody = (sourceCode.ast as unknown as { templateBody?: { children: Array<{ type: string; name: string; startTag: { attributes: Array<{ key?: { name: string }; value?: { value: string } }> } }> } }).templateBody
        if (!templateBody?.children) return

        visitNodes(templateBody.children, (node) => {
          if (node.type !== 'VElement') return
          const tagName = node.name
          if (!(COMPONENT_WORTHY_ELEMENTS as readonly string[]).includes(tagName)) return

          if (tagName === 'input') {
            const attrs = node.startTag?.attributes ?? []
            const typeAttr = attrs.find(
              (a) => a.key?.name === 'type',
            )
            const typeVal = typeAttr?.value?.value
            if (typeVal && ['checkbox', 'radio', 'hidden', 'file', 'submit'].includes(typeVal))
              return
          }

          const existingComponent = sharedComponents.get(tagName)
          if (existingComponent) {
            context.report({
              node: node as never,
              messageId: 'useComponent',
              data: { component: existingComponent, element: tagName },
            })
          } else {
            context.report({
              node: node as never,
              messageId: 'createComponent',
              data: { component: componentNameForElement(tagName), element: tagName },
            })
          }
        })
      },
    }
  },
}

const moduleTsconfig: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Every module in src/modules/ must have a tsconfig.json with composite:true and references to its shared dependencies.',
      recommended: true,
    },
    messages: {
      missing:
        "Module '{{moduleName}}' is missing tsconfig.json. Create one at src/modules/{{moduleName}}/tsconfig.json with composite:true and references pointing to shared projects it uses (e.g. shared/ui, shared/lib, shared/api).",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const normalized = filename.replace(/\\/g, '/')
    const modMatch = normalized.match(/\/src\/modules\/([^/]+)\//)
    if (!modMatch) return {}

    const moduleName = modMatch[1]
    const tsconfigPath = join(resolve(import.meta.dirname, '..'), 'src', 'modules', moduleName, 'tsconfig.json')
    if (existsSync(tsconfigPath)) return {}

    return {
      Program(node) {
        context.report({
          node,
          messageId: 'missing',
          data: { moduleName },
        })
      },
    }
  },
}

const moduleRoutes: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Modules should export route definitions rather than page components directly. The router should import route arrays from each module and compose them.',
      recommended: true,
    },
    messages: {
      violation:
        "Module '{{moduleName}}' should export route definitions instead of page components. Change '{{imported}}' to a route array export (e.g. '{{routesName}}') from the module's index.ts.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const normalized = filename.replace(/\\/g, '/')

    if (!normalized.endsWith('src/app/providers/router.ts')) return {}

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource) return
        if (!importSource.startsWith('@/modules/')) return

        const moduleName = importSource.slice('@/modules/'.length).split('/')[0]
        if (!moduleName) return

        const specifiers = node.specifiers.filter(
          (s) => s.type === 'ImportSpecifier',
        )

        for (const specifier of specifiers) {
          const importedName = specifier.imported.name

          if (importedName.endsWith('Routes')) continue

          if (importedName.endsWith('Page')) {
            const prefix = importedName.replace(/Page$/, '')
            const camelPrefix = prefix.charAt(0).toLowerCase() + prefix.slice(1)
            const routesName = `${camelPrefix}Routes`

            context.report({
              node: specifier,
              messageId: 'violation',
              data: {
                moduleName,
                imported: importedName,
                routesName,
              },
            })
          }
        }
      },
    }
  },
}

const INTERNAL_LAYERS = ['pages', 'widgets', 'features', 'entities'] as const

const moduleLayerAlias: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Cross-layer imports within a module must use the layer alias (@entities/, @features/, @widgets/, @pages/) instead of relative paths.',
      recommended: true,
    },
    messages: {
      violation:
        "Use the layer alias '{{suggested}}' instead of a relative path to import from the '{{targetLayer}}' layer within module '{{moduleName}}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    if (source.type !== 'module' || !source.layer) return {}
    if (!INTERNAL_LAYERS.includes(source.layer as typeof INTERNAL_LAYERS[number])) return {}

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource || !importSource.startsWith('.')) return

        const target = resolveImport(importSource, filename)
        if (
          target.type !== 'module' ||
          target.moduleName !== source.moduleName ||
          !target.layer ||
          !INTERNAL_LAYERS.includes(target.layer as typeof INTERNAL_LAYERS[number])
        )
          return

        if (target.layer === source.layer) return

        const suffix = target.segment ? `/${target.segment}` : ''
        const suggested = `@${target.layer}${suffix}`

        context.report({
          node,
          messageId: 'violation',
          data: {
            suggested,
            targetLayer: target.layer,
            moduleName: target.moduleName,
          },
        })
      },
    }
  },
}

const typesOutsideEntities: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Type and interface definitions should live in the entities layer, not in pages, widgets, or features.',
      recommended: true,
    },
    messages: {
      violation:
        "Type definition '{{name}}' should be in the entities layer. Move it to 'modules/{{moduleName}}/entities/' or 'shared/types/'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const normalized = filename.replace(/\\/g, '/')
    if (normalized.includes('node_modules') || normalized.endsWith('.d.ts')) return {}

    const parts = normalized.split('/')
    const srcIndex = parts.findLastIndex(p => p === 'src')
    if (srcIndex === -1) return {}
    const relParts = parts.slice(srcIndex + 1)

    if (relParts[0] !== 'modules') return {}
    if (relParts.length < 3) return {}
    const moduleName = relParts[1]
    const layer = relParts[2]
    if (layer === 'entities' || layer === 'shared') return {}
    if (normalized.includes('__tests__')) return {}

    const foundTypes: string[] = []

    function isExported(node: { parent?: { type?: string } }): boolean {
      return node.parent?.type === 'ExportNamedDeclaration' || node.parent?.type === 'Program'
    }

    return {
      TSInterfaceDeclaration(node: { id: { name: string }; parent?: { type?: string } }) {
        if (isExported(node) && node.id?.name) {
          foundTypes.push(node.id.name)
        }
      },
      TSTypeAliasDeclaration(node: { id: { name: string }; parent?: { type?: string } }) {
        if (isExported(node) && node.id?.name) {
          foundTypes.push(node.id.name)
        }
      },
      'Program:exit'() {
        for (const name of foundTypes) {
          context.report({
            node: context.sourceCode.ast,
            messageId: 'violation',
            data: { name, moduleName },
          })
        }
      },
    }
  },
}

const piniaStoreLocation: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Pinia stores must be defined in the shared layer of a module (modules/{name}/shared/).',
      recommended: true,
    },
    messages: {
      violation:
        "Pinia store '{{name}}' must live in 'entities/model' (entity state) or the 'features' layer (interaction state), not in '{{location}}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const normalized = filename.replace(/\\/g, '/')
    if (normalized.includes('node_modules')) return {}

    // Canonical FSD state ownership: entity state → entities/model,
    // interaction state → features.
    function isValidStoreLocation(
      layer: string | undefined,
      segment: string | undefined,
    ): boolean {
      return layer === 'features' || (layer === 'entities' && segment === 'model')
    }

    const source = classifyFile(filename)

    return {
      CallExpression(node: { callee: { type: string; name?: string }; arguments: unknown[] }) {
        if (
          node.callee.type !== 'Identifier' ||
          node.callee.name !== 'defineStore'
        )
          return

        const storeName = node.arguments[0] && typeof node.arguments[0] === 'object' && 'value' in (node.arguments[0] as { value?: unknown })
          ? (node.arguments[0] as { value: string }).value
          : '(unnamed)'

        if (source.type === 'module') {
          if (!isValidStoreLocation(source.layer, source.segment)) {
            context.report({
              node: node as never,
              messageId: 'violation',
              data: {
                name: storeName,
                location: `module '${source.moduleName}' (${source.layer ?? 'root'} layer)`,
              },
            })
          }
        } else if (source.type === 'root') {
          const modMatch = normalized.match(/\/src\/modules\/([^/]+)\//)
          if (modMatch) {
            const modName = modMatch[1]
            const segMatch = normalized.match(/\/src\/modules\/[^/]+\/([^/]+)\/(?:([^/]+)\/)?/)
            const layer = segMatch?.[1] ?? '(unknown)'
            const segment = segMatch?.[2]
            if (!isValidStoreLocation(layer, segment)) {
              context.report({
                node: node as never,
                messageId: 'violation',
                data: {
                  name: storeName,
                  location: `module '${modName}' (${layer} layer)`,
                },
              })
            }
          }
        }
      },
    }
  },
}

interface VDirectiveKey {
  name?: string | { name?: string }
  argument?: { name?: string }
  modifiers?: string[]
}

interface VAttribute {
  key?: VDirectiveKey
  value?: { value?: string }
}

function getKeyName(key: VDirectiveKey | undefined): string | undefined {
  if (!key) return undefined
  if (typeof key.name === 'string') return key.name
  if (key.name && typeof key.name.name === 'string') return key.name.name
  return undefined
}

function getKeyArgument(key: VDirectiveKey | undefined): string | undefined {
  return key?.argument?.name
}

interface VElementNode {
  type: string
  name: string
  startTag: { attributes: VAttribute[] }
  children?: VElementNode[]
}

function visitNodes(
  children: VElementNode[],
  visit: (node: VElementNode) => void,
): void {
  for (const node of children) {
    visit(node)
    if (node.children) visitNodes(node.children, visit)
  }
}

function usesAttrsBinding(attrs: VAttribute[]): boolean {
  return attrs.some((a) => {
    const name = getKeyName(a.key)
    if (name !== 'bind') return false
    if (getKeyArgument(a.key)) return false
    const text = a.value && 'expression' in a.value
      ? (a.value as { expression: string }).expression
      : undefined
    return text === '$attrs'
  })
}

function hasClassAttribute(attrs: VAttribute[]): boolean {
  return attrs.some((a) => {
    const name = getKeyName(a.key)
    if (name === 'class') return true
    if (name === 'bind' && getKeyArgument(a.key) === 'class') return true
    return false
  })
}

function collectSharedComponentNames(): Set<string> {
  const names = new Set<string>()
  try {
    const entries = readdirSync(GLOBAL_UI_DIR, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.name.endsWith('.vue')) continue
      names.add(entry.name.replace(/\.vue$/, '').toLowerCase())
    }
  } catch {
    return names
  }
  return names
}

const preferSharedComponentStyle: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Shared components must not use v-bind="$attrs" (define typed props instead), and consumers must not override class on shared components (use component props instead).',
      recommended: true,
    },
    messages: {
      attrsBinding:
        "Shared component '{{name}}' uses v-bind=\"$attrs\" on <{{element}}>. Define typed props/emits instead of blindly passing attributes through.",
      classOverride:
        "Avoid passing 'class' to <{{component}}>. The shared component provides default styling — use its props (e.g. variant, size) to customize. If an override is truly needed, add a eslint-disable comment.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const normalized = filename.replace(/\\/g, '/')

    if (!normalized.endsWith('.vue')) return {}

    const isDefinition = normalized.includes('/global/shared/ui/') && !normalized.endsWith('index.ts')
    const sharedComponentNames = isDefinition ? new Set<string>() : collectSharedComponentNames()

    return {
      'Program:exit'() {
        const sourceCode = context.sourceCode
        if (!sourceCode) return

        const templateBody = (
          sourceCode.ast as unknown as {
            templateBody?: { children: VElementNode[] }
          }
        ).templateBody
        if (!templateBody?.children) return

        visitNodes(templateBody.children, (node) => {
          if (node.type !== 'VElement') return
          const attrs = node.startTag?.attributes ?? []

          if (isDefinition) {
            if (usesAttrsBinding(attrs)) {
              context.report({
                node: node as never,
                messageId: 'attrsBinding',
                data: { name: fileName, element: node.name },
              })
            }
          } else {
            if (!sharedComponentNames.has(node.name.toLowerCase())) return
            if (hasClassAttribute(attrs)) {
              context.report({
                node: node as never,
                messageId: 'classOverride',
                data: { component: node.name },
              })
            }
          }
        })
      },
    }
  },
}

const SHARED_FORBIDDEN_DEPS = ['vue-router', 'pinia']

const sharedPurity: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'The shared kernel (modules/global/shared) must stay framework-infra- and business-agnostic: no vue-router or pinia imports.',
      recommended: true,
    },
    messages: {
      forbiddenDep:
        "Shared kernel must not import '{{dep}}'. The global/shared layer must be generic enough to copy into another project — keep router/store wiring in the App layer or feature modules.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    if (source.type !== 'global') return {}

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string | undefined
        if (!importSource) return
        const dep = SHARED_FORBIDDEN_DEPS.find(
          (d) => importSource === d || importSource.startsWith(`${d}/`),
        )
        if (dep) {
          context.report({ node, messageId: 'forbiddenDep', data: { dep } })
        }
      },
    }
  },
}

const DOMAIN_DATA_LAYERS = ['pages', 'widgets', 'features']
// Heuristic thresholds: a "domain record collection" is ≥3 object literals each
// carrying ≥4 fields. This deliberately ignores small UI-config arrays (tabs,
// table columns, menu items) which typically have 2–3 fields.
const MIN_RECORDS = 3
const MIN_FIELDS = 4
// Reactivity wrappers whose first argument is the real initializer.
const REACTIVE_WRAPPERS = ['ref', 'reactive', 'shallowRef', 'shallowReactive', 'readonly']

interface ArrayLikeNode {
  type: string
  elements?: ({ type: string; properties?: unknown[] } | null)[]
  callee?: { type: string; name?: string }
  arguments?: ArrayLikeNode[]
}

const noInlineDomainData: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Collections of domain records belong in the entities layer, not hard-coded inside pages/widgets/features.',
      recommended: false,
    },
    messages: {
      inlineData:
        "Inline domain data '{{name}}' ({{count}} records) in the '{{layer}}' layer. Move this collection into the module's entities layer (model/api) and import it.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    if (
      source.type !== 'module' ||
      !source.layer ||
      !DOMAIN_DATA_LAYERS.includes(source.layer)
    )
      return {}

    // Unwrap ref(...)/reactive(...) etc. to reach the underlying array literal.
    function unwrap(node: ArrayLikeNode | null | undefined): ArrayLikeNode | null {
      if (!node) return null
      if (
        node.type === 'CallExpression' &&
        node.callee?.type === 'Identifier' &&
        node.callee.name &&
        REACTIVE_WRAPPERS.includes(node.callee.name)
      ) {
        return unwrap(node.arguments?.[0])
      }
      return node
    }

    return {
      VariableDeclarator(node: {
        id?: { type: string; name?: string }
        init?: ArrayLikeNode
      }) {
        const init = unwrap(node.init)
        if (!init || init.type !== 'ArrayExpression' || !init.elements) return
        if (init.elements.length < MIN_RECORDS) return
        const records = init.elements.filter(
          (el) =>
            !!el &&
            el.type === 'ObjectExpression' &&
            (el.properties?.length ?? 0) >= MIN_FIELDS,
        )
        if (records.length < MIN_RECORDS) return
        const name =
          node.id && node.id.type === 'Identifier' ? node.id.name : '(anonymous)'
        context.report({
          node: node as never,
          messageId: 'inlineData',
          data: { name: name!, count: String(records.length), layer: source.layer! },
        })
      },
    }
  },
}

const ENTITY_SEGMENTS = ['model', 'api', 'ui']

const entitiesSegments: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Files in the entities layer must live in a segment (model/api/ui); representational components belong in entities/ui/.',
      recommended: true,
    },
    messages: {
      missingSegment:
        "Entity file '{{file}}' sits directly in 'entities/'. Move it into a segment: 'ui/' for components, 'model/' for types/stores, 'api/' for data access.",
      componentNotInUi:
        "Entity component '{{file}}' must live in 'entities/ui/', not 'entities/{{segment}}/'.",
      unknownSegment:
        "Entity file '{{file}}' is in unrecognized segment 'entities/{{segment}}/'. Use 'model/', 'api/', or 'ui/'.",
      deepEntityPath:
        "Re-export/import entities through the layer barrel ('./entities' or '@entities'), not the deep segment path '{{path}}'.",
    },
    schema: [],
  },
  create(context) {
    const filename = context.filename ?? context.physicalFilename ?? ''
    const source = classifyFile(filename)
    if (source.type !== 'module') return {}

    // Mode A — a file *inside* the entities layer: enforce segment placement.
    if (source.layer === 'entities') {
      const parts = normalizePath(filename).split('/').filter(Boolean)
      const afterLayer = parts.slice(parts.indexOf('entities') + 1)
      const base = afterLayer[afterLayer.length - 1] ?? ''
      if (base === 'index.ts') return {}

      return {
        'Program:exit'() {
          const ast = context.sourceCode.ast
          const isVue = base.endsWith('.vue')
          const hasSegment = afterLayer.length >= 2

          if (!hasSegment) {
            context.report({ node: ast, messageId: 'missingSegment', data: { file: base } })
            return
          }
          const segment = afterLayer[0]!
          if (isVue && segment !== 'ui') {
            context.report({ node: ast, messageId: 'componentNotInUi', data: { file: base, segment } })
          } else if (!ENTITY_SEGMENTS.includes(segment)) {
            context.report({ node: ast, messageId: 'unknownSegment', data: { file: base, segment } })
          }
        },
      }
    }

    // Mode B — any other module file (e.g. the module-root barrel): entity
    // re-exports/imports must go through the entities barrel, not a deep path.
    function check(node: { source?: { value?: unknown } & Rule.Node }) {
      const importSource = node.source?.value
      if (typeof importSource !== 'string' || !importSource.startsWith('.')) return
      const target = resolveImport(importSource, filename)
      if (
        target.type === 'module' &&
        target.moduleName === source.moduleName &&
        target.layer === 'entities' &&
        target.segment !== undefined
      ) {
        context.report({
          node: node.source as Rule.Node,
          messageId: 'deepEntityPath',
          data: { path: importSource },
        })
      }
    }

    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
    }
  },
}

export default {
  rules: {
    'layer-hierarchy': layerHierarchy,
    'entities-segments': entitiesSegments,
    'cross-module-isolation': crossModuleIsolation,
    'public-api': publicApi,
    'import-method': importMethod,
    'internal-segments': internalSegments,
    'module-tsconfig': moduleTsconfig,
    'module-routes': moduleRoutes,
    'module-layer-alias': moduleLayerAlias,
    'types-outside-entities': typesOutsideEntities,
    'prefer-shared-component': preferSharedComponent,
    'pinia-store-location': piniaStoreLocation,
    'prefer-shared-component-style': preferSharedComponentStyle,
    'shared-purity': sharedPurity,
    'no-inline-domain-data': noInlineDomainData,
  },
}
