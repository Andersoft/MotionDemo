# User Journey & Behavior

## Core Operations — Flowcharts

### Create a New Page

```mermaid
flowchart TD
    A["User navigates to target location\n(workspace root or inside a parent page)"] --> B{"Does user have\nworkspace membership?"}
    B -- No --> B1["Show 'Request Access' or\n'Workspace Not Found'"]
    B -- Yes --> C["User triggers 'New Page'\n(e.g. + button, slash command)"]
    C --> D{"Is the parent location\narchived or deleted?"}
    D -- Yes --> D1["Disable creation;\nshow tooltip explaining why"]
    D -- No --> E["User enters page name\n(inline input or dialog)"]
    E --> F{"Is the name unique\namong siblings?"}
    F -- No --> F1["Show inline validation error:\n'Name already exists'"]
    F -- Yes --> G["System creates page\nwith state = DRAFT"]
    G --> H["Page appears in navigation tree\nat the correct position"]
    H --> I["User is redirected to\nthe new page in edit mode"]
```

### Rename a Page

```mermaid
flowchart TD
    A["User locates page in tree\nor opens page header"] --> B["User triggers rename\n(inline edit or context menu)"]
    B --> C["Input field becomes editable\nwith current name selected"]
    C --> D["User types new name\nand confirms (Enter / blur)"]
    D --> E{"Is new name unique\namong siblings?"}
    E -- No --> E1["Show validation error;\nrevert to original name"]
    E -- Yes --> F["System updates page name;\nupdatedAt refreshed"]
    F --> G["Navigation tree and page header\nreflect new name immediately"]
```

### Archive a Page

```mermaid
flowchart TD
    A["User opens page or\ncontext menu on tree item"] --> B["User selects 'Archive'"]
    B --> C{"Is page in PUBLISHED\nstate?"}
    C -- No --> C1["Option disabled or\nshows 'Already archived'"]
    C -- Yes --> D["System shows confirmation dialog\n'Archiving will hide this page\nand all sub-pages'"]
    D --> E["User confirms"]
    E --> F["System transitions page to ARCHIVED;\nrecursively archives descendants"]
    F --> G["Page and children disappear\nfrom active navigation tree"]
    G --> H["Confirmation toast:\n'Page archived. Undo?'"]
    H --> I{"User clicks Undo\n(time-limited: 10 seconds)?"}
    I -- Yes --> J["Restore page to\noriginal state and position"]
    I -- No --> K["Archive is finalized;\npage visible only in Archive view"]
```

### Restore a Page

```mermaid
flowchart TD
    A["User navigates to\nArchive view in sidebar"] --> B["User browses\nthe archived page tree"]
    B --> C["User selects page\nto restore"]
    C --> D["User clicks 'Restore'"]
    D --> E{"Are all ancestor pages\nin PUBLISHED or DRAFT state?"}
    E -- No --> E1["Show explanation:\n'Cannot restore — parent is also\narchived. Restore parent first.'"]
    E -- Yes --> F["System transitions page\nand all descendants to PUBLISHED"]
    F --> G["Page reappears in\nactive navigation tree\nat original position"]
    G --> H["Confirmation toast:\n'Page restored successfully'"]
```

### Delete a Page

```mermaid
flowchart TD
    A["User on page or\ncontext menu in tree"] --> B["User selects 'Delete'"]
    B --> C{"Is page already in\nDELETED state?"}
    C -- Yes --> C1["Option disabled;\nshow 'Already in trash'"]
    C -- No --> D["System shows confirmation dialog\n'Move to trash? Deleted pages\nare permanently removed after 30 days'"]
    D --> E["User confirms"]
    E --> F["System transitions page\nto DELETED state;\nrecords deletedAt timestamp"]
    F --> G["Page and descendants\ndisappear from all views"]
    G --> H["Confirmation toast:\n'Moved to trash. Undo?'"]
    H --> I{"User clicks Undo\n(time-limited: 10 seconds)?"}
    I -- Yes --> J["Restore page to\nprevious state\n(published or archived)"]
    I -- No --> K["Page remains in DELETED state\nuntil retention period expires"]
```

## Failure Scenarios — Expected User Experience

| Scenario | Expected User Experience |
|----------|--------------------------|
| Create under archived parent | User clicks "New page" inside an archived page (state = ARCHIVED). New Page button is disabled, or action produces inline error: "Cannot create pages under archived content." |
| Duplicate sibling name | User names a new page the same as an existing sibling. Inline field error: "A page with this name already exists." Field is not saved; user must change the name. |
| Archive already-archived page | User selects "Archive" on page already in ARCHIVED state. Archive option is grayed out in context menu. Tooltip: "This page is already archived." |
| Restore with archived ancestor | User clicks "Restore" but parent is still archived (state = ARCHIVED). Dialog appears: "This page cannot be restored because its parent folder is archived. Please restore the parent first." |
| Delete already-deleted page | User selects "Delete" on page already in DELETED state. Delete option is grayed out. Tooltip: "This page is already in the trash." |
| Non-member tries to create page | User without Membership uses workspace URL and attempts creation. Page displays 403-style message: "You don't have access to this workspace. Request access from the workspace owner." |
| Navigate to deleted page via direct URL | User enters or bookmarks a direct URL to a deleted page (state = DELETED). User sees a dedicated "This page has been deleted" screen with a link back to the workspace. No edit capability. |
| Navigate to archived page via direct URL | User enters direct URL to an archived page (state = ARCHIVED). User can view the page but a banner reads: "This page is archived. Restore to edit." Edit controls are disabled. |
| Reorder during conflict | User drags a page to a new position; another user changed the tree simultaneously. Optimistic UI updates immediately; server rejects stale version. Tree reverts to server state with toast: "Tree was updated by another user. Please try again." |
| Delete workspace root page (only page) | User attempts to delete the sole root page (workspace would become empty). Operation succeeds. Toast: "Page moved to trash." Workspace shows empty state illustration with CTA to create first page. |
