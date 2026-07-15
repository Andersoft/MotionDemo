# Planning: Workspace + Page Lifecycle

*Domain alignment and scope contract for the Workspace and Page Lifecycle bounded contexts in the Motion Demo application (Notion clone).*

This planning pack captures the DDD strategic and tactical analysis that must precede implementation. It defines the language, boundaries, state machine, navigation model, user journeys, and requirements for the Workspace management and Page lifecycle features. Every downstream implementation task must trace back to one or more artifacts in this folder.

## Artifacts

| Document | Type | Description |
|----------|------|-------------|
| [Context & Bounded Context](01-context-and-bounded-context.md) | Strategic DDD | System context diagram, bounded context map, ownership rules, invariants, and key architectural decisions |
| [Domain Model](02-domain-model.md) | Tactical DDD | Complete class diagram, DDD concepts table, cardinalities, invariant constraints |
| [Page Lifecycle State Machine](03-page-lifecycle-state-machine.md) | Behavioral | State diagram, transition table, failure modes for page lifecycle states |
| [Workspace Structure & Navigation](04-workspace-structure-and-navigation.md) | Structural | Navigation graph, read/mutation flowcharts, partial class diagram, view model table |
| [User Journey & Behavior](05-user-journey-and-behavior.md) | UX Analysis | Core operation flowcharts, failure scenario tables |
| [Requirements](06-requirements.md) | Specification | Functional and non-functional requirement mind maps, FR and NFR tables, scope guardrails |

## Usage

1. **Read this README** first to understand the scope and navigate to relevant documents.
2. **Stakeholders and domain experts** review `01-context-and-bounded-context.md` to validate boundaries and language.
3. **Architects** align on decisions in `01-context-and-bounded-context.md` and the structural model in `04-workspace-structure-and-navigation.md`.
4. **Developers** study `02-domain-model.md` for entity design and `03-page-lifecycle-state-machine.md` for state transition logic before writing code.
5. **QA and product** use `05-user-journey-and-behavior.md` and `06-requirements.md` as the acceptance baseline.
6. **Any team member** references failure tables across documents to ensure edge cases are handled consistently.

## Scope

### ✅ In-scope

- Definition of `Workspace` as an organizational boundary containing pages.
- Definition of `Page` as a content unit with a well-defined lifecycle: draft, published, archived, deleted.
- Lifecycle transitions: create, rename, archive, restore, soft-delete, hard-delete.
- Workspace tree navigation: page hierarchy (parent-child), reordering, sidebar representation.
- Ownership model: workspace membership, page ownership, visibility scopes.
- Business invariants: no orphan pages, no duplicate names within a parent, archive cascading, restore reachability.
- Functional and non-functional requirements for the feature slice.

### ❌ Out-of-scope

- Database schema design or migration scripts.
- API endpoint signatures, HTTP methods, or request/response contracts.
- UI component implementation, Vue templates, or CSS.
- Authentication and authorization infrastructure (identity provider integration).
- Real-time collaboration (WebSocket/OT/CRDT logic).
- Rich text editor, block-based content model, or embedded media handling.
- Search indexing, full-text search, or query ranking.
- Permission system beyond basic workspace membership and page ownership.
- Audit logging, activity feeds, or notification triggers.
- Cross-workspace data sharing or federation.
