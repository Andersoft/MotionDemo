# Planning: Workspace + Page Lifecycle

**Foundational UI + domain contract for creating, navigating, and managing the structural spine of MotionDemo.**

This document is the single source of truth for the Workspace + Page Lifecycle feature slice. It defines what we build now, what we explicitly defer, and how every discipline stays aligned throughout delivery.

---

## Purpose

Enable users to create named **Workspaces** (isolated containers for their content), manage a hierarchy of **Pages** within them, and navigate seamlessly between pages. This is the first vertical slice of the Notion-clone experience — without it, no other feature (blocks, databases, templates) has a home.

**Expected business outcome for MVP progression:** A user can sign up, create a workspace, add pages, edit them, and reorder them via drag-and-drop. This unblocks the remaining slices (Block Editor, Database Views, Publishing).

---

## Terminology

| Term | Definition | Domain Type |
|------|------------|-------------|
| **Workspace** | A top-level container owned by one or more users. Has a name, avatar, and unique slug. Houses all pages. | Aggregate Root — encapsulates creation, rename, and deletion invariants. |
| **Page** | A single content document within a workspace. Has a title, icon, cover image, body (blocks), and path in the page tree. | Aggregate Root — encapsulates soft-delete, rename, move, and duplicate invariants. |
| **Page Tree** | The hierarchical, nestable sidebar representation of all pages in a workspace. Defaults are collapsed/expanded per user preference. | Derived projection — computed from the `Page` aggregate, not a separate entity. |
| **Workspace Switcher** | UI element in the sidebar footer that lists available workspaces and allows switching. | UI component — consumes `Workspace` list via API. |
| **Trash** | Soft-delete state for pages. Trashed pages remain recoverable for 30 days before permanent deletion. | State tracked via a `PageStatus` enum (`Active | Trashed`) on the `Page` aggregate; enforced on read/write boundaries. |
| **Slug** | URL-safe identifier derived from the workspace name, used in route paths. | Value Object — encapsulates generation, URL-safe validation, and uniqueness constraints. Never a raw `string`. |

> **Design rule:** Terms marked as "Value Object" or "Aggregate Root" must be modeled as dedicated types — never as raw primitives (`string`, `number`, `boolean`). Terms marked as "UI component" or "Derived projection" may use simple types.

---

## Artifacts Table

All artifacts live under `.planning/Workspace-Page-Lifecycle/` unless otherwise noted.

| Document | Type | Description |
|----------|------|-------------|
| [README.md](./README.md) | Contract | This file — scope, terminology, and usage guidance for the entire slice. |
| [Domain-Model.md](./Domain-Model.md) | Domain Artifact | Ubiquitous language definitions, entity relationships, aggregate boundaries, and value objects for Workspace and Page. |
| [API-Contract.md](./API-Contract.md) | Backend Artifact | OpenAPI 3.1 specification for all workspace and page endpoints (CRUD, tree operations, trash). |
| [UI-Component-Tree.md](./UI-Component-Tree.md) | Frontend Artifact | Component hierarchy, state ownership, and data-flow diagram for the sidebar, page editor shell, and workspace switcher. |
| [Data-Migrations.md](./Data-Migrations.md) | Backend Artifact | Sequential migration plan: schema evolution, seed data, and rollback strategy for workspace/page tables. |
| [User-Flows.md](./User-Flows.md) | Cross-Discipline | Step-by-step flows for workspace creation, page CRUD, tree navigation, drag-and-drop reorder, and trash lifecycle. |
| [Acceptance-Tests.md](./Acceptance-Tests.md) | QA Artifact | Gherkin feature files covering all in-scope scenarios organized by functional area. |
| [Edge-Cases.md](./Edge-Cases.md) | Cross-Discipline | Known edge cases, error states, empty states, and boundary conditions for workspace/page operations. |
| [Visual-Design-Spec.md](./Visual-Design-Spec.md) | Design Artifact | Mockups, spacing tokens, responsive breakpoints, and interaction states for sidebar, page header, and workspace switcher. |

> **Convention:** All artifact filenames use `kebab-case` with title-case words. Internal cross-references use relative markdown links.

---

## Usage: How Each Discipline Consumes These Artifacts

### Product
- Start with [README.md](./README.md) to verify scope boundaries before writing user stories.
- Reference [User-Flows.md](./User-Flows.md) when grooming backlog items.
- Use [Edge-Cases.md](./Edge-Cases.md) to validate that acceptance criteria cover real-world scenarios.
- **Alignment check:** Ensure every story maps back to exactly one row in the Artifacts Table.

### Backend
- Implement from [API-Contract.md](./API-Contract.md) and [Domain-Model.md](./Domain-Model.md) first — they define the service boundary.
- Run migrations per [Data-Migrations.md](./Data-Migrations.md); do not deviate from the planned schema evolution.
- Raise an issue if an endpoint's behavior contradicts [User-Flows.md](./User-Flows.md) — the flow document wins.
- **Domain model discipline:** All Value Objects (`Slug`, `PageIcon`, `CoverImage`, `PagePath`, `PageStatus`) must be dedicated types with encapsulated validation. Do not store or pass them as raw strings/enums. Aggregates (`Workspace`, `Page`) must enforce invariants internally — not rely on callers to check preconditions.

### Frontend
- Build UI components per [UI-Component-Tree.md](./UI-Component-Tree.md) and [Visual-Design-Spec.md](./Visual-Design-Spec.md).
- Route design must match the slug-based paths defined in [API-Contract.md](./API-Contract.md).
- Handle every error state documented in [Edge-Cases.md](./Edge-Cases.md) before marking a component complete.

### QA
- Author and run tests from [Acceptance-Tests.md](./Acceptance-Tests.md).
- Use [Edge-Cases.md](./Edge-Cases.md) to build the regression checklist.
- Flag any scenario that passes implementation but fails the flow defined in [User-Flows.md](./User-Flows.md).

### Design
- Deliver mockups that match [Visual-Design-Spec.md](./Visual-Design-Spec.md) and feed back into it.
- Validate every interaction against [User-Flows.md](./User-Flows.md).
- Ensure empty states, loading states, and error states are included in all mockups (they are in scope).

---

## Scope Summary

> **Baseline note:** The current codebase contains an early scaffold (a .NET weather-API template and a Vue task-board UI) that predates this planning document. All domain concepts (`Workspace`, `Page`, `Slug`, etc.) defined below are new. The scaffold will be replaced or reworked to match this slice's [Domain-Model.md](./Domain-Model.md). No existing code is exempt from alignment.

### ✅ In-scope

| Area | Details |
|------|---------|
| **Workspace CRUD** | Create, rename, delete workspace. Workspace-scoped slug generation. |
| **Page CRUD** | Create, rename, duplicate, delete (soft) pages. |
| **Page Hierarchy** | Nest pages arbitrarily deep. Drag-and-drop reorder in the page tree. Expand/collapse persisted per user. |
| **Page Editor Shell** | Title, icon picker, cover image. Empty-state onboarding prompt. |
| **Workspace Switcher** | Dropdown in sidebar footer to switch active workspace. List owned workspaces. |
| **Trash Lifecycle** | Soft delete with 30-day retention. Restore from trash. Empty trash (permanent delete). |
| **Routing** | Slug-based routes: `/w/:workspaceSlug/:pageId`. Deep-link to any page. |
| **Sidebar Navigation** | Collapsible sidebar. Active page highlighted. Scrollable page list. |
| **Error & Empty States** | 404 for missing pages/workspaces. Empty workspace welcome screen. Trash empty state. |
| **API Endpoints** | RESTful JSON API for all of the above, documented in OpenAPI 3.1. |
| **Domain Model** | Aggregates: `Workspace` (root), `Page` (root). Value Objects: `Slug`, `PageIcon`, `CoverImage`, `PagePath`, `PageStatus` (enum: `Active | Trashed`). Aggregates must encapsulate their invariants (e.g., a soft-deleted `Page` rejects mutations; a `Workspace` cannot be deleted while it still contains active pages). |
| **Edge Cases** | Concurrent rename + reorder, deeply nested paths exceeding URL limits, orphan pages on workspace deletion. |

### ❌ Out-of-scope

| Area | Rationale |
|------|-----------|
| **Real-time collaboration / Cursors** | Multi-user live editing — deferred to Collaboration slice. |
| **Comments & Annotations** | Page-level and block-level comments — deferred to Collaboration slice. |
| **Page-level permissions / sharing** | All workspace members see all pages by default — granular permissions are a separate slice. |
| **Templates marketplace** | Pre-built page templates from community — deferred to Templates slice. |
| **Block editor rich formatting** | Only the shell (title, icon, cover) is in scope. Block editing (text, headings, lists, databases) is the Block Editor slice. |
| **Database / Table views** | Dynamic database pages (table, board, calendar) — deferred to Database Views slice. |
| **Publishing / Public pages** | Sharing pages to the web — deferred to Publishing slice. |
| **Workspace invitations / Members** | Joining via link or email — deferred to Team Management slice. |
| **Workspace-level settings** | Billing, plan limits, export — deferred to Settings slice. |
| **Search across pages** | Full-text search — deferred to Search slice. |
| **Page version history** | Undo/redo beyond the current session — deferred to Version History slice. |
| **Keyboard shortcuts** | Global command palette — deferred to UX Polish slice. |
| **Mobile responsive layout** | Desktop-first MVP. Responsive breakpoints for tablet/mobile are deferred. |
| **Offline support / PWA** | Service workers, offline caching — deferred to Performance slice. |
| **Performance optimization** | Virtual scrolling for large page trees, lazy loading — acceptable as basic implementation only; optimization is deferred to Performance slice. |
| **Third-party integrations** | Slack, Google Drive, Figma embeds — deferred to Integrations slice. |
| **Analytics / Telemetry** | Usage tracking — deferred to Analytics slice. |

## Design Quality Principles

All artifacts produced for this slice must adhere to the following principles during review:

### Primitive Obsession — Avoid raw types for domain concepts
- Every Value Object (`Slug`, `PageIcon`, `CoverImage`, `PagePath`, `PageStatus`) must be a dedicated type (class, branded type, or enum) with encapsulated validation and behavior.
- Raw strings, numbers, or booleans must not represent concepts that carry business rules (identifier generation, date ranges, lifecycle states).
- Exception: purely informational data (`firstName`, `description`, `title`) may remain primitives.

### Rich Domain Models — Encapsulate behavior in Aggregates
- `Workspace` and `Page` as Aggregate Roots must enforce their own invariants internally:
  - A soft-deleted (`PageStatus.Trashed`) `Page` must reject mutations at the domain level, not just in the UI.
  - `Workspace` must validate slug uniqueness and prevent deletion while active pages remain.
- DTOs, ViewModels, API contracts, and simple configuration objects are exempt — they are permitted to be anemic.

### Duplication — Share only the same business concept
- If two behaviors share the same verb but represent different business concepts, keep them separate.
- Avoid twin hierarchies (e.g., a `WorkspaceDto` mirroring `Workspace` field-for-field) unless required by architectural boundaries (API vs. Domain vs. Persistence).

### Speculative Generality — Build for now, extend later
- Interfaces with only one implementation must be justified (testability, DI boundary) or omitted.
- No "reserved for future use" fields, methods, or types.
- Pass-through classes that only delegate without adding behavior or architectural value must not be introduced.

---

### Assumptions
1. **Single-owner default:** A workspace is created by a single user who is the owner. Multi-owner is deferred.
2. **Flat permission model within workspace:** Every member sees every page. Private pages are not in scope.
3. **Pages are independent documents:** Pages do not embed or transclude content from other pages (block references deferred).
4. **Browser session is the user context:** No cross-tab synchronisation (deferred to real-time collaboration).
5. **PostgreSQL as primary store:** All workspace/page data lives in PostgreSQL. No cache layer in this slice.
6. **API versioning is v1:** All endpoints are prefixed with `/api/v1/`. No breaking changes expected within this slice.
7. **Page IDs are stable UUIDs:** Used in routes and API requests. Slugs are for display only.

### Non-Goals
- Building a full Notion replica. This slice produces only the workspace-container and page-tree-shell.
- Supporting non-page content types (databases, whiteboards, docs) within the page tree. Only "pages" exist in this slice.
- Implementing undo/redo across sessions or syncing reorder state across tabs.
- Measuring or optimising query performance beyond correct behaviour.
- Providing a public API or webhook support.
- Internationalization (i18n) — UI text is English-only for MVP.

---

## Acceptance Checklist

Use this checklist during review to confirm the document meets its NFRs:

- [ ] **Readability (NFR1):** A junior engineer or PM can read the document and understand what is being built and what is not.
- [ ] **Traceability (NFR2):** Every artifact link resolves to a planned document under `.planning/Workspace-Page-Lifecycle/`. Naming follows the convention.
- [ ] **Reviewability (NFR3):** Every in-scope and out-of-scope item is concrete enough to be verified by a checklist or test case.
- [ ] **Scope boundary clear (FR3):** Adjacent concerns (collaboration, permissions, templates, publishing) are explicitly called out in out-of-scope.
- [ ] **Terminology consistent:** All terms in the Terminology section are used consistently throughout the document and match the anticipated domain model.
- [ ] **Artifacts inventory complete (FR2):** Every planned artifact is listed in the Artifacts Table with document type and description.
- [ ] **Assumptions documented (FR4):** Assumptions and non-goals are explicit, not implicit.
- [ ] **No primitive obsession (DQ1):** Every Value Object named in the terminology/domain model is planned as a dedicated type, not a raw primitive.
- [ ] **No anemic aggregates (DQ2):** `Workspace` and `Page` aggregates include behavioral invariants (e.g., rejection on soft-delete, guard on deletion) in the Domain Model artifact.
- [ ] **No speculative generality (DQ3):** Every artifact in the table is needed now for this slice — none are "reserved for future."
- [ ] **Design principles documented (DQ4):** The Design Quality Principles section exists and is linked from each discipline's usage guidance.

