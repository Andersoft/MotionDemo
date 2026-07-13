# Planning: [PT-00] Define High-Level DDD Planning Baseline for Page Tree + Page Lifecycle

## Page Tree + Page Lifecycle — Feature Slice Planning Baseline

These artifacts capture the **domain context, relationships, expected behavior, and quality expectations** for the Motion Demo Page Tree + Page Lifecycle feature slice. They serve as the alignment reference the product and engineering team uses *before* implementation design begins. Every diagram, rule, and requirement herein is a design constraint — not an implementation detail.

---

## Artifacts

| # | Document | Type | Description |
|---|----------|------|-------------|
| 01 | [01-context-and-bounded-context.md](./01-context-and-bounded-context.md) | C4 Context + Boundary | System actors, bounded context map, ownership boundaries, and conceptual invariants |
| 02 | [02-domain-model.md](./02-domain-model.md) | UML Class Diagram | Canonical domain model: `Page` aggregate root, value objects (`PageId`, `WorkspaceId`, `ParentId`, `PageTitle`, `PagePosition`, `SortOrder`, `AuditInfo`), `ILifecycleState` state pattern (`ActiveState`, `ArchivedState`), invariants with enforcement loci, and design rules for encapsulation decisions |
| 03 | [03-page-lifecycle-state-machine.md](./03-page-lifecycle-state-machine.md) | State Diagram | Page lifecycle states (Active → Archived), all transitions including self-transitions, cascade semantics, and failure expectations |
| 04 | [04-page-tree-and-navigation.md](./04-page-tree-and-navigation.md) | Flow + Entity | Tree structure example, ordering semantics, structural rules, navigation flows decomposed across layers, view states |
| 05 | [05-user-journey-and-behavior.md](./05-user-journey-and-behavior.md) | Flowcharts | User journey diagrams per operation (create, rename, move, archive, restore, delete), behavioral expectations, product-level failure handling |
| 06 | [06-requirements.md](./06-requirements.md) | Mindmap + Tables | Functional requirements (FR-01–FR-22) and non-functional requirements (NFR-01–NFR-14) with priorities and measurable targets |

---

## How to Use These Artifacts

1. **Team Alignment** — Start with documents 01 and 02 in a design sync. Establish shared vocabulary (bounded context, aggregate root, invariant) before anyone writes code.

2. **Design Input** — Documents 02 and 04 directly feed aggregate and read-model design. The domain model in 02 is the single source of truth for entity structure; 04's layered decomposition informs the application-service and UI-store architecture.

3. **Acceptance Criteria** — Cite FR-01 through FR-22 to define the scope boundary. Every user-facing behaviour in 05 maps to one or more FRs. A feature slice is complete when all `Must`-priority FRs pass.

4. **Quality Gates** — NFR-01 through NFR-14 are the review criteria for every pull request in this slice. In particular NFR-09 (no speculative base types), NFR-10 (deterministic ordering), and NFR-11 (no invalid hierarchy states) are non-negotiable.

---

## Scope Summary

### ✅ In Scope

- Domain context and bounded context for page lifecycle within a workspace
- Core domain model: `Page` aggregate root, `PageId`, `WorkspaceId`, `ParentId`, `PageTitle`, `PagePosition`, `SortOrder`, `AuditInfo`, `ILifecycleState` state pattern (`ActiveState`, `ArchivedState`)
- Page lifecycle: Active and Archived states with cascade-on-archive semantics
- Page hierarchy: parent/child tree, sibling ordering, re-parenting
- User-visible operations: create, rename, move, archive, restore, delete, tree navigation
- Authorization boundary: access limited to workspace members
- Functional and non-functional requirements for the slice

### ❌ Out of Scope (Future Slices)

- API contracts, endpoint definitions, payload schemas, handler/repository design
- UI component implementation details (Vue components, templates, styling)
- Test implementation specifics (unit, integration, e2e)
- Page content types (rich text, blocks, databases, kanban boards — existing task/kanban types are prototypes, not part of this slice)
- Collaborative editing, real-time sync, or conflict resolution
- Version history, page templates, or page duplication
- Search, full-text indexing, or cross-workspace navigation
- Permissions model beyond basic workspace-membership check (role-based access, sharing, public pages)
- Soft-delete / trash (only archive/restore; permanent delete is immediate for this slice)
- Page-level comments, notifications, or activity log (including any hardcoded "last edited by" UI affordances — see Speculative UI Affordances in [06-requirements.md](./06-requirements.md))
