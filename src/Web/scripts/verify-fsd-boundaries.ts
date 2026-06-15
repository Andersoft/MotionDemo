import { readFileSync, existsSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SRC = join(ROOT, 'src')

const LAYER_ORDER: Record<string, number> = { pages: 4, widgets: 3, features: 2, entities: 1, shared: 0 }

let errors = 0
function error(msg: string) { console.error(`  FAIL  ${msg}`); errors++ }
function ok(msg: string) { console.log(`  OK    ${msg}`) }
function heading(title: string) { console.log(`\n${title}\n${'-'.repeat(60)}`) }

interface TsProject {
  name: string
  path: string
  references: string[]
}

heading('Modular Monolith Boundary Verification')

// ── Step 1: Discover modules and tsconfigs ──────────────────────────
heading('Step 1: Module Discovery')
const modules: string[] = []
const modDir = join(SRC, 'modules')
if (existsSync(modDir)) {
  for (const entry of readdirSync(modDir, { withFileTypes: true })) {
    if (entry.isDirectory() && existsSync(join(modDir, entry.name, 'tsconfig.json'))) {
      modules.push(entry.name)
    }
  }
}

ok(`Found ${modules.length} modules: ${modules.join(', ') || '(none)'}`)

const sharedDirs = ['ui', 'lib', 'api'].filter(d => existsSync(join(SRC, 'shared', d, 'tsconfig.json')))
ok(`Shared kernel projects: ${sharedDirs.join(', ')}`)

// ── Step 2: Parse all project references ────────────────────────────
heading('Step 2: Project References')
const allProjects: TsProject[] = []

function loadProject(dir: string, name: string): TsProject | null {
  const tsconfigPath = join(dir, 'tsconfig.json')
  if (!existsSync(tsconfigPath)) return null
  try {
    const config = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
    const refs: string[] = (config.references ?? []).map((r: { path: string }) =>
      resolve(dir, r.path),
    )
    return { name, path: resolve(dir), references: refs }
  } catch { return null }
}

for (const m of modules) {
  const p = loadProject(join(SRC, 'modules', m), `module:${m}`)
  if (p) allProjects.push(p)
}
for (const d of sharedDirs) {
  const p = loadProject(join(SRC, 'shared', d), `shared:${d}`)
  if (p) allProjects.push(p)
}

for (const p of allProjects) {
  const refs = p.references.length > 0
    ? `  →  [${p.references.map(r => relative(SRC, r)).join(', ')}]`
    : '  →  (leaf, no deps)'
  ok(`"${p.name}"${refs}`)
}

// ── Step 3: Cross-module import scan ─────────────────────────────────
heading('Step 3: Cross-Module Import Analysis')

function collectModuleImports(dir: string): Map<string, { source: string; target: string }[]> {
  const results = new Map<string, { source: string; target: string }[]>()
  function walk(d: string) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name)
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== '__tests__') {
        walk(full)
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.vue'))) {
        const content = readFileSync(full, 'utf-8')
        const imports: { source: string; target: string }[] = []
        const regex = /from\s+['"]([^'"]+)['"]/g
        let m
        while ((m = regex.exec(content)) !== null) {
          const src = m[1]
          if (src.startsWith('@/modules/') || src.startsWith('@/shared/')) {
            imports.push({ source: src, target: src })
          }
        }
        if (imports.length > 0) {
          results.set(relative(SRC, full), imports)
        }
      }
    }
  }
  walk(dir)
  return results
}

// Build module home map
function getModuleHome(fileRel: string): string | null {
  const parts = fileRel.split('/')
  if (parts[0] === 'modules' && parts.length >= 2) return parts[1]
  if (parts[0] === 'shared') return 'shared'
  return null
}

const allImports = collectModuleImports(SRC)
let crossViolations = 0

for (const [fileRel, imports] of allImports) {
  const sourceHome = getModuleHome(fileRel)
  if (!sourceHome) continue

  for (const imp of imports) {
    const clean = imp.target.split('?')[0].replace(/\.(ts|vue|js)$/, '')
    const parts = clean.slice(2).split('/').filter(Boolean)

    if (parts[0] === 'modules') {
      const targetModule = parts[1]
      if (targetModule === sourceHome) continue
      if (targetModule === 'global') continue
      error(`"${fileRel}" imports from different module "${targetModule}" via "${imp.source}"`)
      crossViolations++
    }

    if (sourceHome === 'shared' && parts[0] === 'modules') {
      error(`"shared" kernel imports from module "${parts[1]}" via "${imp.source}"`)
      crossViolations++
    }
  }
}

if (crossViolations === 0) {
  ok('No cross-module import violations found')
}

// ── Step 4: Circular dependency check ────────────────────────────────
heading('Step 4: Circular Dependency Check')
const adj = new Map<string, string[]>()
for (const p of allProjects) {
  adj.set(p.path, p.references)
}

function detectCycle(
  node: string, visited: Set<string>, stack: Set<string>, graph: Map<string, string[]>,
): string[] | null {
  visited.add(node)
  stack.add(node)
  for (const n of graph.get(node) ?? []) {
    if (stack.has(n)) return [node, n]
    if (!visited.has(n)) {
      const r = detectCycle(n, visited, stack, graph)
      if (r) return [node, ...r]
    }
  }
  stack.delete(node)
  return null
}

const vis = new Set<string>()
let cycles = 0
for (const p of allProjects) {
  if (!vis.has(p.path)) {
    const c = detectCycle(p.path, vis, new Set(), adj)
    if (c) {
      error(`Cycle: ${c.map(x => relative(SRC, x)).join(' → ')}`)
      cycles++
    }
  }
}
if (cycles === 0) ok('No circular dependencies')

// ── Step 5: Shared kernel invariant ──────────────────────────────────
heading('Step 5: Shared Kernel Invariant')
let sharedDirty = false
for (const p of allProjects) {
  if (!p.name.startsWith('shared:')) continue
  for (const ref of p.references) {
    if (relative(SRC, ref).startsWith('modules')) {
      error(`"${p.name}" references module "${relative(SRC, ref)}" — shared kernel must be pure`)
      sharedDirty = true
    }
  }
}
if (!sharedDirty) ok('Shared kernel is pure (no module dependencies)')

// ── Step 6: Module layer hierarchy (internal FSD) ───────────────────
heading('Step 6: Module-Internal FSD Layer Hierarchy')
  const importScan = collectModuleImports(SRC)
let layerViolations = 0

for (const [fileRel, imports] of importScan) {
  const parts = fileRel.split('/')
  if (parts[0] !== 'modules' || parts.length < 4) continue
  const sourceLayer = parts[2]
  const sourceOrder = LAYER_ORDER[sourceLayer]
  if (sourceOrder === undefined) continue

  for (const imp of imports) {
    const clean = imp.target.split('?')[0]
    const iparts = clean.slice(2).split('/').filter(Boolean)
    if (iparts[0] !== 'modules' || iparts[1] !== parts[1] || iparts.length < 3) continue
    const targetLayer = iparts[2]
    const targetOrder = LAYER_ORDER[targetLayer]
    if (targetOrder === undefined) continue
    if (targetOrder >= sourceOrder) {
      error(`"${fileRel}" — ${sourceLayer} → ${targetLayer} (upward layer violation)`)
      layerViolations++
    }
  }
}

if (layerViolations === 0) {
  ok('All module-internal FSD layer dependencies are downward-only')
}

// ── Summary ─────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(60)}`)
if (errors === 0) {
  console.log('STATUS: PASS — All module boundaries correctly enforced')
} else {
  console.log(`STATUS: FAIL — ${errors} violation(s) detected`)
  process.exit(1)
}
