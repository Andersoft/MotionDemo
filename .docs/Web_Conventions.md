# Web Conventions

**Scope:** `src/Web/` (Vue 3 + TS)

## Architecture: Modular Monolith + Feature-Sliced Design

Top-level: `shared/` (pure kernel) and `modules/{name}/` (isolated features).  
Modules never import each other — only `shared/` or node_modules.

## Structure

```
src/Web/src/
  main.ts, App.vue, router/          # root (exempt from FSD rules)
  shared/{ui,lib,api,assets}/        # shared kernel (pure — no module deps)
    ui/  → layout: AppHeader, AppLayout, AppSidebar
         → primitives: AppButton, AppInput, AppBadge, AppNavItem
         → composites: AppTable, AppModal, AppPageLayout
    lib/ → utilities
    api/ → base API client
  modules/
    workspace/   pages/  widgets/  features/  entities/  shared/
    templates/   pages/  widgets/  features/  entities/  shared/
```

Module `tsconfig.json` — `composite: true`, `references: [shared/{ui,lib,api}]` only.

## FSD Layer Order (inside each module)

pages(4) → widgets(3) → features(2) → entities(1) → shared(0)  
Import only from lower numbers. `widgets` cannot import `pages`.

## Rules

| Rule | Enforced | Summary |
|------|----------|---------|
| Cross-module isolation | compile + lint + CI | `modules/workspace` cannot import `modules/templates` |
| Layer hierarchy | compile + lint + CI | pages → widgets ↓ OK; widgets → pages ↑ ERROR |
| Public API | lint | `@/modules/workspace` OK; deep paths ERROR |
| Import method | lint | Same-module: relative `../widgets`. External: absolute `@/shared/ui` |
| Shared kernel purity | CI | `shared/` cannot import from `modules/` |
| Prefer shared components | lint (warn) | Raw `<button>`/`<table>`/`<input>` flagged outside `shared/ui/` — use AppButton/AppTable/AppInput instead |

## Enforcement

- **Compile**: `vue-tsc --build` respects `composite` + `references` (5 tsconfig files)
- **Lint**: Custom ESLint plugin `scripts/eslint-plugin-fsd.ts` (6 rules, 5 errors + 1 warn)
- **CI**: `npm run lint:modules` → `scripts/verify-fsd-boundaries.ts` (static scan)

## Commands

- `npm run type-check` — compile-time boundary check
- `npm run lint` — full pipeline (module check + ESLint + oxlint)
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

1. `mkdir modules/invoice/{pages,widgets,features,entities,shared}`
2. Create `tsconfig.json` (copy from workspace, change name)
3. Create `index.ts` (public API barrel)
4. Add `{ "path": "./src/modules/invoice" }` to root `tsconfig.app.json`
5. Wire routes in `router/index.ts` if needed
6. Run `npm run lint && npm run type-check`
