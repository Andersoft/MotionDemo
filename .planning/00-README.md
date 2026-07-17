# Planning: Page Tree + Page Lifecycle

**Motion Demo — Notion Clone, Feature Slice 1**

This directory holds the **planning baseline** for the first feature slice of the Motion Demo application. These artifacts capture the domain context, relationships, expected behavior, and quality expectations that the team aligns on *before* implementation design begins. They follow Domain-Driven Design conventions and use Mermaid diagrams to visualise models and flows.

## Artifacts

| Document | Type | Description |
|---|---|---|
| [01-context-and-bounded-context.md](./01-context-and-bounded-context.md) | Context | System context diagram, bounded context map, ownership boundaries, and domain invariants |
| [02-domain-model.md](./02-domain-model.md) | Domain Model | Canonical class diagram with Value Objects, Aggregate Roots, Entities, and behavioural contracts |
| [03-page-lifecycle-state-machine.md](./03-page-lifecycle-state-machine.md) | State Machine | Page lifecycle states (active/archived), transition triggers, side effects, and failure modes |
| [04-tree-structure-and-navigation.md](./04-tree-structure-and-navigation.md) | Structure & Navigation | Hierarchy model, tree ordering, instance examples, read/mutation paths, and view states |
| [05-user-journey-and-behavior.md](./05-user-journey-and-behavior.md) | Behavior | User journey flows, behavioural expectations, and user-facing failure scenarios |
| [06-requirements.md](./06-requirements.md) | Requirements | Functional and non-functional requirements tables, priorities, and targets |

## Usage

1. **Team alignment** — Product and engineering review these artifacts to agree on scope, vocabulary, and boundaries before implementation.
2. **Design decisions** — Architects and senior developers reference domain rules and invariants when authoring technical design documents.
3. **Estimation** — Teams use the scope contract and requirements to size the slice.
4. **Acceptance criteria** — QA and product owners validate delivery against the behavioural expectations in docs 03–05.
5. **Onboarding** — New team members read these artifacts for a concise understanding of the domain model and design philosophy.

## Scope Summary

| Scope | Detail |
|---|---|
| ✅ **In-scope** | Page lifecycle (active ↔ archived); hierarchical page tree (parent/child); create, rename, move, archive, restore; tree navigation and view states; workspace membership as access boundary |
| ✅ **In-scope (conceptual)** | Domain model with Aggregate Roots, Value Objects, and Invariants; state machine with transitions and guard conditions; user journeys and failure behaviour |
| ❌ **Out-of-scope** | API contracts, endpoint definitions, payload schemas, handler/repository design; UI component implementation details; test implementation specifics; real-time collaboration; page versioning/history; permissions model beyond workspace membership; search; templates; future features outside this slice |
