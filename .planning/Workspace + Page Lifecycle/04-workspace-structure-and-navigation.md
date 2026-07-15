# Workspace Structure & Navigation

## Navigation Tree — Concrete Instance

```mermaid
graph TB
    subgraph Workspace["Workspace: Engineering Wiki"]
        root["/ (workspace root)"]

        subgraph Team["Team Pages"]
            onboarding["Team Onboarding"]
            handbook["Engineering Handbook"]
            playbook["Runbook"]
        end

        subgraph Projects["Projects"]
            q3["Q3 Roadmap"]
            arch["Architecture Decisions"]
            subgraph Sprint["Sprint 24"]
                planning["Sprint Planning"]
                retro["Sprint Retro"]
                tickets["Ticket Tracker"]
            end
        end

        subgraph Reference["Reference"]
            api_docs["API Documentation"]
            style_guide["Style Guide"]
            glossary["Glossary"]
        end
    end

    root --> onboarding
    root --> handbook
    root --> playbook
    root --> q3
    root --> arch
    root --> planning
    root --> api_docs
    root --> style_guide
    root --> glossary
    arch --> Sprint
    q3 -.-> Sprint
    planning --> retro
    planning --> tickets
```

## Read Path — Navigation Tree Loading

```mermaid
flowchart LR
    A["User opens workspace"] --> B["Workspace Management: load tree"]
    B --> C{"Membership check"}
    C -- valid --> D["Fetch PageTreeEdge ordered by parentId + sortOrder"]
    C -- invalid --> E["Error: not a member"]
    D --> F["Fetch all page metadata for edges \n (id, name, state, icon)"]
    F --> G["Filter: exclude ARCHIVED and DELETED pages \n from default view"]
    G --> H["Build hierarchical tree in memory"]
    H --> I["Return serialized tree to client"]
```

## Mutation Path — Create Page

```mermaid
flowchart LR
    A["User: New Page intent \n (name, parentId, workspaceId)"] --> B{"Validate membership\n& permissions"}
    B -- valid --> C{"Validate parent\n(exists, not archived/deleted)"}
    C -- valid --> D{"Validate sibling\nname uniqueness"}
    D -- unique --> E["Create Page aggregate\n(state = DRAFT)"]
    E --> F["Create PageTreeEdge\n(link to parent)"]
    F --> G["Return created page"]
    B -- invalid --> ERR1["Error: access denied"]
    C -- invalid --> ERR2["Error: invalid parent"]
    D -- duplicate --> ERR3["Error: name taken"]
```

## Mutation Path — Archive Page Flow

```mermaid
flowchart LR
    A["User: Archive intent\n(pageId, workspaceId)"] --> B{"Validate state\nis PUBLISHED"}
    B -- valid --> C["Set state = ARCHIVED\nrecord archivedAt"]
    C --> D["Recursively archive\nall descendant pages"]
    D --> E["Remove page from\nactive navigation tree"]
    E --> F["Return success"]
    B -- invalid --> ERR1["Error: invalid transition\n(see state machine)"]
```

## Partial Domain Model — Navigation Focus

This diagram highlights the classes most relevant to workspace structure and navigation. It is a subset of the full domain model defined in `02-domain-model.md`.

```mermaid
classDiagram
    class Workspace {
        +WorkspaceId id
        +Slug slug
        +WorkspaceName name
        +getRootPages(): Page[]
        +getChildPages(PageId): Page[]
        +getNavigationTree(): PageTreeNode[]
    }

    class Page {
        +PageId id
        +PageName name
        +PageLifecycleState state
        +Icon icon
        +hasChildren(): bool
    }

    class PageTreeEdge {
        +PageId parentId
        +PageId childId
        +int sortOrder
    }

    class PageTreeNode {
        +Page page
        +PageTreeNode[] children
        +int depth
    }

    Workspace "1" --> "1" PageTreeNode : builds for client
    PageTreeNode "*" --> "1" Page : contains
    PageTreeNode "*" --> "*" PageTreeNode : nests
    Workspace "1" --> "*" PageTreeEdge : persisted via
    Page "1" --> "*" PageTreeEdge : participates in
```

## View Model Table

The following table describes the different views of the navigation tree and their content.

| View | Content | When Visible |
|------|---------|--------------|
| Active Tree | All pages with state `DRAFT` or `PUBLISHED`, organized hierarchically according to `PageTreeEdge` | Default view when a workspace is opened |
| Archive Tree | All pages with state `ARCHIVED`, organized hierarchically (preserving original parent-child structure) | When user explicitly opens archive view (e.g., "Trash" or "Archive" sidebar section) |
| Deleted List | All pages with state `DELETED`, flat list with deletion timestamp and remaining retention period | When user opens trash/deleted view; no hierarchy preserved |
| Search Results | Matching pages across all states (except `DELETED`), flat list ranked by relevance | When user performs a search query |
| Recent Pages | Pages the user has recently modified, flat list ordered by `updatedAt` descending | When user opens recent pages view or workspace switcher |
| Page Path (Breadcrumb) | Ancestor chain from workspace root to the current page, each with a link | When a single page is open; computed by walking parent edges upward |
