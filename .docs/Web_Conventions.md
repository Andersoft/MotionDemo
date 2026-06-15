# Web Conventions

**Scope:** `src/Web/src/` (Vue 3 + TS)

## Architecture: Modular Monolith + Feature-Sliced Design

Everything lives under `modules/{name}/`. The `global` module is the pure shared kernel
(`modules/global/shared/{ui,lib,api}`) — it holds the design-system components and utilities
every feature may use. Feature modules (`workspace`, `templates`, …) never import each other —
only `@global` or node_modules.

## Example Structure

```
src/Web/src/
  main.ts, App.vue, router/, main.css   # App layer (root); exempt from module-internal FSD rules except import-method
  modules/
    global/      shared/{ui,lib,api}            # pure shared kernel (no module deps)
    workspace/   pages/  widgets/  features/  entities/{model,api,ui}/  shared/
    templates/   pages/  widgets/  features/  entities/{model,api,ui}/  shared/
```

Feature-module `tsconfig.json` — `composite: true` (inherited from `tsconfig.base.json`),
`references: [../global]`. Only the `global` module references `shared/{ui,lib,api}` directly.

## App layer (root)

The root files (`main.ts`, `App.vue`, `router/`, `main.css`) are the FSD **App layer**: app
init and entry point, global Pinia *setup* (`createPinia()`), the top-level router, global
context providers, and global CSS. It holds no domain slices and composes modules via routes.
Exempt from module-internal FSD rules, but `import-method` still applies (reference modules as
`@{name}`).

## FSD Layer Order (inside each module)

pages(4) → widgets(3) → features(2) → entities(1) → shared(0)  
Import only from lower numbers. `widgets` cannot import `pages`.

### Entity segments

The `entities` layer is split into segments — files do **not** sit directly in `entities/`:

- `entities/model/` — TypeScript types/interfaces and stores
- `entities/api/` — data-access for the entity
- `entities/ui/` — simple representational components (e.g. `TemplateCard.vue`), props-in,
  emit-out, no business logic

Enforced by `fsd/entities-segments` (a `.vue` directly in `entities/` errors → move to `ui/`).
Consumers still import through the layer/module barrel (`@entities` / `@templates`), never deep paths.

## Rules

Enforced by the custom ESLint plugin `scripts/eslint-plugin-fsd.ts` (15 rules: 12 error, 3 warn),
plus compile-time project references and the CI static scan.

| Rule | Severity | Summary |
|------|----------|---------|
| `cross-module-isolation` | error | `modules/workspace` cannot import `modules/templates`; deep imports forbidden; `global` kernel cannot import from `modules/` |
| `layer-hierarchy` | error | A layer may import only from layers strictly below it (`widgets → pages` ↑ ERROR) |
| `public-api` | error | Import a module through its public API (`@workspace` / `@global`), not internal deep paths |
| `import-method` | error | Same-module: relative path or layer alias. Cross-module: the `@{name}` alias (`@global`, `@workspace`, …) — never a `@/modules/{name}` path (barrel form autofixable) |
| `module-layer-alias` | error | Cross-layer imports within a module must use the layer alias (`@entities`, `@features`, `@widgets`, `@pages`), not relative paths |
| `module-tsconfig` | error | Every module needs `tsconfig.json` with `composite: true` + references to its shared deps |
| `module-routes` | error | Modules export route definitions, not page components; the router composes them |
| `types-outside-entities` | error | Type/interface definitions live in the `entities` layer, not pages/widgets/features |
| `pinia-store-location` | error | Pinia stores live in `entities/model` (entity state) or `features` (interaction state) — not pages/widgets/shared. Global Pinia *setup* stays in the App layer |
| `prefer-shared-component-style` | error | Shared components must not use `v-bind="$attrs"`; consumers must not override `class` (use props) |
| `entities-segments` | error | Files in `entities/` must live in a `model`/`api`/`ui` segment (components in `ui/`); other layers/barrels must re-export entities via the `./entities` barrel, not deep segment paths |
| `shared-purity` | error | The `global/shared` kernel must not import `vue-router` or `pinia` — keep router/store wiring in the App layer or features |
| `internal-segments` | warn | Within a module, `model`/`lib` should not depend on `ui` |
| `prefer-shared-component` | warn | Raw `<button>`/`<table>`/`<input>` flagged — use `AppButton`/`AppTable`/`AppInput` |
| `no-inline-domain-data` | warn | Collections of domain records (≥3 objects, ≥4 fields each) hard-coded in pages/widgets/features — move to the `entities` layer |

`import-method` also applies to App-layer root files (`App.vue`, `main.ts`, `router/`): they may
import modules but must use the `@<name>` alias.

## Import Aliases

Two kinds of alias:

- **Layer aliases** (same-module): `@entities`, `@widgets`, `@features`, `@pages`, `@shared`.
  Resolved relative to the importing module by the `fsd-module-aliases` Vite plugin.
- **Module aliases** (cross-module): every module is referenced by its name — `@global`,
  `@workspace`, `@templates`, and any future `@{name}`. The Vite plugin resolves `@{name}`
  to that module's public API barrel automatically (discovered from `src/modules/`).

A `@/modules/{name}` path is always a lint error (`fsd/import-method`); the barrel form is
autofixable to `@{name}`. Module names must not collide with layer names.

## Enforcement

- **Compile**: `vue-tsc` respects `composite` + `references` across the per-module/per-segment tsconfigs (`tsconfig.base.json`, `tsconfig.app.json`, one per module, one per `global` shared segment)
- **Lint**: ESLint plugin `scripts/eslint-plugin-fsd.ts` (15 rules above)
- **CI**: `npm run lint:modules` → `scripts/verify-fsd-boundaries.ts` (static scan: module discovery, project references, cross-module imports, circular deps, kernel purity, layer hierarchy)

## Commands

- `npm run type-check` — `vue-tsc --noEmit`, compile-time boundary check
- `npm run lint` — full pipeline (`lint:modules` + ESLint + oxlint)
- `npm run test:module` — module isolation static analysis only

## Page Layout Pattern

Pages with a breadcrumb, title, view-switching tabs, and a footer use `AppPageLayout`:

```vue
<AppPageLayout
  :breadcrumb="['Engineering', 'Q3 Roadmap']"
  title="System Architecture Tasks"
  :tabs="[{ key: 'table', icon: 'table_chart', label: 'Table' }, ...]"
  :active-tab="activeView"
  @update:active-tab="activeView = $event"
>
  <template #tab-actions>
    <AppButton variant="ghost" size="sm" icon="filter_list">Filter</AppButton>
  </template>
  <MyWidget v-if="activeView === 'table'" />
</AppPageLayout>
```

The layout handles scroll container, max-width (1000px), spacing, and the footer. Pages only supply content.

## Add a Module

1. `mkdir -p modules/invoice/{pages,widgets,features,entities/{model,api,ui},shared}`
2. Create `tsconfig.json` (copy from `workspace`, change `outDir`/`tsBuildInfoFile` names)
3. Create `index.ts` (public API barrel) — export route definitions, not page components
4. Add `{ "path": "./src/modules/invoice" }` to root `tsconfig.app.json` `references`, and add
   `"@invoice": ["./src/modules/invoice"]` to its `paths` (Vite resolves `@invoice` automatically)
5. Wire routes in `router/index.ts` by composing the module's exported route array (import via `@invoice`)
6. Run `npm run lint && npm run type-check`
