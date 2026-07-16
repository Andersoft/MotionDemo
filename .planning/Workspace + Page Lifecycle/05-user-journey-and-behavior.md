# User Journey & Behavior — Workspace + Page Lifecycle

> **Artifact:** 05-user-journey-and-behavior.md  
> **Feature Slice:** Workspace + Page Lifecycle  
> **Status:** Planning — fifth mandatory artifact  
> **Preceded by:** [04-workspace-structure-and-navigation.md](./04-workspace-structure-and-navigation.md)  
> **Blocked by:** [04-workspace-structure-and-navigation.md](./04-workspace-structure-and-navigation.md) — navigation tree visibility rules and hierarchy constraints define the landscape within which these journeys execute.  
> **Source of truth for:** QA scenario authoring, product behavior contracts, error-handling UX requirements, accessibility messaging patterns.  
> **Architectural relationship:** Maps state-machine legality (03) and navigation constraints (04) to user-perceived flows and error-handling UX.

---

## 1. Primary User Journeys Overview

```mermaid
flowchart TD
    %% ──────────────────────────────────────────────
    %% Entry Point: User lands in workspace
    %% ──────────────────────────────────────────────
    START(["User lands in workspace"]) --> J01

    %% ──────────────────────────────────────────────
    %% Journey J01: Navigate Hierarchy
    %% ──────────────────────────────────────────────
    subgraph J01["J01: Navigate Hierarchy"]
        direction TB
        J01_A["Sidebar tree renders<br/>root-level Active pages"] --> J01_B["User expands a parent<br/>→ children load"]
        J01_B --> J01_C{"Child status &<br/>caller role?"}
        J01_C -->|"Active — any member"| J01_D["Node renders normally<br/>Expand icon if children exist"]
        J01_C -->|"Archived — any member<br/>(only if 'Show archived' ON)"| J01_E["Node dimmed/italic<br/>Expand icon preserved"]
        J01_C -->|"Draft — creator or Admin"| J01_F["Node with 'Draft' badge<br/>Hidden from others"]
        J01_C -->|"Draft — non-creator,<br/>role < Admin"| J01_G["Node hidden entirely"]
        J01_C -->|"Deleted — caller ≥ Admin<br/>(only if 'Show deleted' ON)"| J01_H["Red-tinted node<br/>Strikethrough title<br/>Expiry tooltip"]
        J01_C -->|"Deleted — caller < Admin"| J01_I["Node hidden entirely"]
        J01_C -->|"Restricted branch —<br/>caller below min role"| J01_J["Lock icon on parent<br/>Children hidden"]
    end

    %% ──────────────────────────────────────────────
    %% Journey J02: Create Workspace Page
    %% ──────────────────────────────────────────────
    subgraph J02["J02: Create Workspace Page"]
        direction TB
        J02_A["User clicks 'New page'<br/>on a parent or workspace root"] --> J02_B["Inline editor opens<br/>Title input + slug preview"]
        J02_B --> J02_C{"User confirms?"}
        J02_C -->|"Cancels"| J02_D["Editor closes<br/>No state change"]
        J02_C -->|"Confirms"| J02_E["Frontend: optimistically<br/>add node to tree"]
        J02_E --> J02_F["Backend: validate +<br/>create Page aggregate<br/>(status = Draft)"]
        J02_F -->|"Success"| J02_G["Page node confirmed<br/>in tree. Navigate to<br/>detail view (Draft state)"]
        J02_F -->|"Failure"| J02_H["Rollback: remove<br/>optimistic node<br/>Show error toast"]
    end

    %% ──────────────────────────────────────────────
    %% Journey J03: Publish / Unpublish
    %% ──────────────────────────────────────────────
    subgraph J03["J03: Publish / Unpublish"]
        direction TB
        J03_A["User views Draft page<br/>→ sees 'Publish' CTA"] --> J03_B["User clicks 'Publish'"]
        J03_B --> J03_C{"Backend validates<br/>(slug unique,<br/>role ≥ Admin or creator)"}
        J03_C -->|"Success"| J03_D["Page → Active<br/>'Draft' badge removed<br/>Visible to all members<br/>Tree node: normal<br/>Toast: 'Page published'"]
        J03_C -->|"FORBIDDEN<br/>(not creator,<br/>role < Admin)"| J03_E["Toast: 'You don't have<br/>permission to publish<br/>this page.'<br/>No state change"]
        J03_C -->|"SLUG_CONFLICT"| J03_F["Toast: 'A page with<br/>this URL already exists.'<br/>Inline slug editor opens<br/>for correction"]
        J03_C -->|"NOT_FOUND"| J03_G["404 view shown<br/>Page may have been<br/>deleted concurrently"]
    end

        %% Unpublish is explicitly excluded from MVP — see §5 Exclusions
    end

    %% ──────────────────────────────────────────────
    %% Journey J04: Archive / Restore
    %% ──────────────────────────────────────────────
    subgraph J04["J04: Archive / Restore"]
        direction TB
        J04_A["User triggers archive<br/>from toolbar or context menu"] --> J04_B{"Are there<br/>descendants?"}
        J04_B -->|"Yes"| J04_C["Confirmation dialog:<br/>'Archive this page and<br/>all subpages?'"]
        J04_B -->|"No"| J04_D["Confirmation dialog:<br/>'Archive this page?'"]
        J04_C --> J04_E
        J04_D --> J04_E
        J04_E{"User confirms?"}
        J04_E -->|"Cancels"| J04_F["Dialog closes<br/>No state change"]
        J04_E -->|"Confirms"| J04_G["Backend: archive +<br/>cascade to descendants"]
        J04_G -->|"Success"| J04_H["Page + descendants<br/>→ Archived. Tree hides<br/>nodes (or dims if<br/>'Show archived' ON).<br/>Detail view: read-only<br/>+ 'Archived' banner.<br/>Toast: 'Page archived'"]
        J04_G -->|"Failure"| J04_I["Toast with error reason<br/>Tree nodes restored<br/>(rollback optimistic)"]

        J04_J["Restore flow<br/>(from Archived banner<br/>or context menu)"] --> J04_K{"Was page<br/>archivedByCascade<br/>or independently?"}
        J04_K -->|"Independently archived<br/>(or root of cascade)"| J04_L["Confirmation dialog:<br/>'Restore this page and<br/>subpages?'"]
        J04_K -->|"Cascade-archived<br/>(non-root)"| J04_M["Restore requires<br/>restoring the parent first<br/>OR restoring individually<br/>with warning"]
        J04_L --> J04_N{"User confirms?"}
        J04_N -->|"Cancels"| J04_O["No action"]
        J04_N -->|"Confirms"| J04_P["Backend: restore<br/>(cascade-archived descendants<br/>restored; independently<br/>archived descendants remain)"]
        J04_P -->|"Success"| J04_Q["Page + cascade-restored<br/>descendants → Active.<br/>Tree: nodes reappear.<br/>Detail: read-write mode.<br/>Toast: 'Page restored'"]
        J04_P -->|"Failure"| J04_R["Toast with error reason<br/>Rollback tree state"]
    end

    %% ──────────────────────────────────────────────
    %% Journey J05: Recover from Errors
    %% ──────────────────────────────────────────────
    subgraph J05["J05: Recover from Errors"]
        direction TB
        J05_A["Any failure occurs<br/>(auth, validation,<br/>concurrency, state)"] --> J05_B{"Error category?"}

        J05_B -->|"UNAUTHORIZED (401)"| J05_C["Redirect to sign-in.<br/>Preserve return URL.<br/>After sign-in, navigate<br/>back to intended page."]
        J05_B -->|"FORBIDDEN (403)"| J05_D["Inline message:<br/>'You don't have permission<br/>to perform this action.'<br/>Disabled controls."]
        J05_B -->|"NOT_FOUND (404)"| J05_E["Show 404 page.<br/>Do not reveal whether<br/>the page exists vs.<br/>is hidden/deleted."]
        J05_B -->|"CONFLICT (409)"| J05_F["Toast: 'The page was<br/>modified by another user.<br/>Please reload.'<br/>Auto-refresh on confirm."]
        J05_B -->|"SLUG_CONFLICT (409)"| J05_G["Inline suggestion:<br/>'A page with this URL<br/>already exists. Try: [slug]-2'<br/>Auto-fill suggested slug."]
        J05_B -->|"Validation errors (422)"| J05_H["Inline field-level errors.<br/>Highlight offending fields.<br/>Block save until resolved."]
        J05_B -->|"CONFIRMATION_REQUIRED (428)"| J05_I["Show confirmation<br/>dialog with details.<br/>Require explicit checkbox<br/>or secondary confirm."]
        J05_B -->|"GRACE_PERIOD_EXPIRED (410)"| J05_J["Message: 'The deletion<br/>grace period has expired.<br/>This page cannot be<br/>restored.' Disable button."]
        J05_B -->|"Network error (0)"| J05_K["Toast: 'Could not reach<br/>server. Check your<br/>connection and try again.'<br/>Auto-retry for reads;<br/>manual retry for writes."]
    end

    %% ──────────────────────────────────────────────
    %% Edge: Journey transitions
    %% ──────────────────────────────────────────────
    START --> J02
    J02 --> J01
    J02 --> J03
    J01 --> J04
    J03 --> J04
    J04 --> J05
    J01 --> J05
    J02 --> J05
    J03 --> J05
```

---

## 2. Behavioral Expectations by Journey

### J01: Navigate Hierarchy

- **Tree loading:** When the workspace loads, the sidebar tree MUST display root-level `Active` pages within 2 seconds under normal network conditions. A skeleton placeholder MUST be shown during loading.
- **Expand/collapse latency:** Expanding a parent node MUST reveal its children within 500 ms. Children are loaded eagerly (all pages loaded on workspace entry per NAV-10) — no additional network request on expand.
- **Visibility correctness:** Archived pages MUST NOT appear in the default tree. A `PageStatus == Draft` page MUST only appear for the page creator and workspace admins/owners. Deleted pages MUST only appear for admins/owners with the "Show deleted" toggle active.
- **Restricted branches:** A parent node with a minimum role requirement MUST render with a lock icon when the caller's role is below the threshold. Clicking the lock icon MUST show a tooltip: "You don't have access to this section."
- **Archived visibility toggle:** When the user activates "Show archived", archived nodes MUST appear dimmed (italic title, grey icon) nested under their original parent. The toggle state MUST persist for the session.
- **Deleted visibility toggle (admin only):** When an admin activates "Show deleted", deleted nodes MUST appear with a red tint and strikethrough title. A tooltip on hover MUST show "Deleted — expires in N days."
- **Drag-and-drop preview:** While dragging a node over a valid target parent, the target MUST highlight with a blue outline. Over an invalid target (self, descendant, non-Active parent), the target MUST highlight red and show tooltip "Cannot move here."
- **Keyboard navigation:** Arrow keys (Up/Down) MUST navigate between tree nodes. Right arrow expands a collapsed node; Left arrow collapses an expanded node or moves to parent. Enter opens the selected page.
- **Focus management:** After creating a page, focus MUST move to the new page's node in the tree. After deleting a page, focus MUST move to the parent node or the next sibling.

### J02: Create Workspace Page

- **Inline creation flow:** Clicking "New page" on a parent node MUST open an inline title editor directly below the parent in the tree. The editor MUST auto-generate a slug preview from the title as the user types (lowercased, hyphens for spaces).
- **Optimistic insertion:** The new page node MUST appear in the tree immediately on user confirmation (before the backend responds). A subtle "Saving..." indicator may appear on the node.
- **Slug conflict handling:** If the auto-generated slug conflicts with an existing page, the backend MUST reject with `SLUG_CONFLICT`. The frontend MUST auto-suggest an alternative slug (append `-2`, `-3`, etc.) and open the slug field for user correction before retry.
- **Post-creation navigation:** On successful creation, the UI MUST navigate to the new page's detail view. The detail view MUST show the page in `Draft` state with a "Draft" badge, a "Publish" call-to-action button, and an empty content area with placeholder text ("Press '/' for commands or start typing").
- **Parent validation:** If the selected parent no longer exists or belongs to a different workspace at the time of backend processing, the creation MUST fail with `INVALID_PARENT`. The optimistic node MUST be removed, and a toast MUST explain the failure.
- **Workspace capacity:** If the workspace has reached its page limit, the creation MUST fail with `WORKSPACE_LIMIT_REACHED`. The inline editor MUST close, and a toast MUST state "This workspace has reached its page limit."
- **Cancel behavior:** Cancelling the inline editor MUST remove the editor with no side effects. No API calls are made.

### J03: Publish / Unpublish

- **Publish CTA visibility:** The "Publish" button MUST only appear on pages in `Draft` state. It MUST be visible to the page creator and to workspace admins/owners. For non-creator members with role < Admin viewing a Draft page, the page MUST appear as 404 (page not found per §2.2 of 04).
- **Publish success behavior:** On successful publish, the page transitions from `Draft` to `Active`. The "Draft" badge is removed. The page becomes visible to all workspace members in the tree. The detail view transitions to full read-write mode. A success toast appears: "Page published."
- **Publish — insufficient permissions:** If a non-creator member with role < Admin attempts to publish, the backend returns `FORBIDDEN`. The frontend MUST show the publish button as disabled (with tooltip: "Only the page creator or an admin can publish this page") or hide it entirely.
- **Publish — slug conflict on publish:** If between creation and publish another page claimed the slug, the backend returns `SLUG_CONFLICT`. The frontend MUST show the slug conflict inline and offer to auto-generate a unique slug.
- **Concurrent publish conflict:** If the page was modified (title, slug) since the user last opened it, the publish MUST fail with `CONFLICT`. The frontend MUST prompt the user to refresh and retry.
- **Unpublish is excluded from MVP:** See §5 Exclusions. Draft→Active is the only publishing direction in scope.

### J04: Archive / Restore

- **Archive confirmation:** Archiving a page MUST always show a confirmation dialog. If the page has descendants, the dialog MUST read: "Archive this page and all subpages?" and show the descendant count. If the page has no descendants: "Archive this page?"
- **Archive cascade visibility:** After archive confirmation, the page and all its descendants MUST transition to `Archived`. The tree MUST remove the nodes (or dim them if "Show archived" is active). The detail view (if open) MUST switch to read-only mode with an "Archived" banner. The banner MUST include a "Restore" button (if the user has role ≥ Member).
- **Archive — insufficient permissions:** Members can archive pages they can edit. If for some reason the user lacks permission, the archive action button MUST be disabled or hidden. The backend MUST reject with `FORBIDDEN` if attempted via API.
- **Restore — cascade-archived descendants:** When restoring a page that was the root of an archive cascade, all descendants that were archived `byCascade=true` MUST be restored to `Active`. Descendants that were independently archived (direct user action, not cascade) MUST remain `Archived` — they are not auto-restored.
- **Restore — from deleted:** Restoring from `Deleted` state (T11) transitions the page to `Archived`, not `Active`. The UI MUST show an additional "Restore to Active" option after the first restore completes if the user wants the page fully active.
- **Restore — grace period check:** When restoring from `Deleted`, the backend MUST verify the grace period has not elapsed. If elapsed, return `GRACE_PERIOD_EXPIRED`. The frontend MUST show "The deletion grace period has expired and this page can no longer be restored." The restore button MUST be disabled.
- **Restore — cascade-archived child (not root):** If a user attempts to restore a child page that was cascade-archived (because its parent was archived), the frontend MUST show a dialog: "This page was archived because its parent was archived. Restore the parent first to restore this page and its siblings." The dialog offers "Go to parent" as an action.
- **Archive/Restore undo:** There is no "undo" for archive or restore. Both operations are immediate and persistent. Reversal requires the opposite action (restore after archive, archive after restore).

### J05: Recover from Errors

- **No silent failures:** Every failure MUST produce a visible, understandable user-facing signal. The system MUST NOT fail silently (no swallowed errors, no unhandled promise rejections, no console-only errors).
- **Error message clarity:** Every error message MUST state (1) what happened, (2) why it happened (if discernible), and (3) what the user can do next. Example: "Could not save changes because another user modified the page. [Reload page]" — not "Conflict error."
- **Field-level validation:** Validation errors (422) MUST be displayed inline adjacent to the offending field, not in a generic toast. The offending field MUST receive focus. The save/submit button MUST remain enabled so the user can correct and retry without re-entering all data.
- **Concurrency resolution:** On `CONFLICT` (409), the frontend MUST offer to reload the page to fetch the latest version. The user's unsaved changes may be preserved in a local buffer and offered for manual re-application after reload.
- **Graceful degradation on network loss:** If the network is unavailable, the UI MUST remain interactive. Read operations show cached data (if available) with a "working offline" indicator. Write operations show a "Changes saved locally — will sync when back online" message and queue for retry.
- **Confirmation failures:** If a confirmation-required operation (delete) is submitted without the confirmation token, the backend returns `CONFIRMATION_REQUIRED` (428). The frontend MUST show the confirmation dialog with the required checkbox unchecked and the confirm button disabled until the checkbox is checked.
- **Auth expiry during session:** If the user's session/token expires mid-session (`UNAUTHORIZED` on any API call), the frontend MUST attempt a silent token refresh. If refresh fails, show a modal: "Your session has expired. Please sign in again." with a "Sign in" button that returns to the same page after re-authentication.
- **Idempotent retry:** The frontend SHOULD NOT automatically retry write operations. Users MUST explicitly retry after reading the error. Read operations MAY retry automatically (with exponential backoff, max 3 retries).
- **Accessibility of errors:** Error messages MUST use `role="alert"` for dynamic content. Toasts MUST have `aria-live="polite"`. Confirmation dialogs MUST trap focus and support Escape to dismiss.

---

## 3. Role-Sensitive Behavior Differences

| Behavior | Owner | Admin | Member | Guest |
|----------|-------|-------|--------|-------|
| **View Active page** | ✅ Full access | ✅ Full access | ✅ Full access | ✅ Only shared pages |
| **View Draft page** | ✅ Yes | ✅ Yes | ❌ 404 (unless creator) | ❌ 404 |
| **View Archived page** | ✅ Read-only | ✅ Read-only | ✅ Read-only | ❌ 404 |
| **View Deleted page** | ✅ Within grace period | ✅ Within grace period | ❌ 404 | ❌ 404 |
| **Create page** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ |
| **Edit content (Active)** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ |
| **Edit content (Draft)** | ✅ Yes (any draft) | ✅ Yes (any draft) | ✅ Only own drafts | ❌ |
| **Edit content (Archived)** | ❌ Read-only | ❌ Read-only | ❌ Read-only | ❌ |
| **Publish (Draft → Active)** | ✅ Yes (any draft) | ✅ Yes (any draft) | ✅ Only own drafts | ❌ |
| **Archive (Active → Archived)** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ |
| **Delete (Archived → Deleted)** | ✅ Requires confirm | ✅ Requires confirm | ❌ | ❌ |
| **Restore (Archived → Active)** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ |
| **Restore from Deleted** | ✅ Within grace | ✅ Within grace | ❌ | ❌ |
| **Move page (Active)** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ |
| **Move page (Archived)** | ✅ Yes | ✅ Yes | ❌ | ❌ |
| **Move page (Deleted)** | ❌ | ❌ | ❌ | ❌ |
| **Expunge (background job)** | ✅ System only | ❌ | ❌ | ❌ |
| **View "Show archived" toggle** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ |
| **View "Show deleted" toggle** | ✅ Yes | ✅ Yes | ❌ | ❌ |
| **Delete workspace** | ✅ (requires all pages archived) | ❌ | ❌ | ❌ |
| **Manage members** | ✅ Yes | ✅ Yes (except owners) | ❌ | ❌ |
| **Manage workspace settings** | ✅ Yes | ❌ | ❌ | ❌ |

> **Members & Drafts:** A regular Member who creates a page becomes its creator. That member can view, edit, and publish their own Draft pages. They cannot view other members' Draft pages.

---

## 4. Failure Table

| Scenario | Expected User Experience |
|----------|-------------------------|
| **Unauthenticated user attempts any page operation** | Redirected to sign-in page. Return URL is preserved so the user lands back on the intended page after authentication. |
| **Authenticated user (non-member) attempts to view workspace** | 404 "Workspace not found" — no indication that the workspace exists but the user lacks access. |
| **Member views a Draft page they did not create (role < Admin)** | 404 "Page not found" — no indication the page exists. The tree also hides the node. |
| **Member views an Archived page (any role)** | Page renders in read-only mode with a prominent "Archived" banner at the top. Edit controls are hidden or disabled. A "Restore" button is shown if role ≥ Member. |
| **Non-admin views a Deleted page** | 404 "Page not found" — no revelation of the page's existence or deletion status. |
| **Admin views a Deleted page within grace period** | Page renders in read-only mode with a "Deleted" banner, the deletion timestamp, and the expiration date. A "Restore from deleted" button is shown. |
| **Admin views a Deleted page after grace period expires** | 404 "Page not found" — page has been expunged or the grace period has closed. |
| **User attempts to create a page with a duplicate slug** | Inline editor shows error: "A page with this URL already exists. Try: [suggested-slug-2]". The slug field is editable so the user can correct it. |
| **User attempts to create a page with an invalid title** | Inline editor shows field-level error: "Title must be between 1 and 500 characters." Save button remains enabled. |
| **User attempts to create a page exceeding workspace capacity** | Toast: "This workspace has reached its page limit. Remove or archive pages before creating new ones." Inline editor closes. |
| **User attempts to move a page under itself** | Drag-and-drop shows red highlight on the page itself. Tooltip: "Cannot move a page under itself." On drop, the page returns to original position. |
| **User attempts to move a page under a descendant** | Drag-and-drop shows red highlight on the descendant. Tooltip: "Cannot move a page under its own subpage." On drop, the page returns to original position. |
| **User attempts to move a page under an Archived/Deleted parent** | Drag-and-drop shows red highlight. Tooltip: "Cannot move under an archived or deleted page." Backend rejects with `PARENT_INACTIVE`. |
| **User attempts to edit an Archived page's content** | Edit controls are disabled. If the user attempts a direct API call, backend rejects with `INVALID_STATE`. Frontend shows banner: "This page is archived and cannot be edited." |
| **User encounters an optimistic concurrency conflict (stale version)** | Toast: "The page was modified by another user. Please reload and try again." A "Reload" button is provided. Unsaved changes are buffered locally and offered for re-application after reload. |
| **User attempts to delete an archived page without explicit confirmation** | Confirmation dialog appears with a checkbox: "I understand this will permanently delete this page and all subpages. This can be undone within 30 days." The "Delete" button is disabled until the checkbox is checked. |
| **User attempts to restore a Deleted page after grace period** | Toast: "The deletion grace period has expired and this page can no longer be restored." The restore button is disabled. A "Contact support" link may be shown for out-of-band recovery. |
| **User attempts to publish a Draft page whose slug was taken** | Inline slug conflict error: "A page with this URL already exists. Update the URL to continue." Slug field opens with auto-suggested alternative. |
| **User who is not the creator (role < Admin) attempts to publish a Draft page** | Publish button is disabled (or hidden). Tooltip: "Only the page creator or an admin can publish this page." |
| **Network error during page save** | Toast: "Could not reach server. Check your connection and try again." The page remains editable. Unsaved changes are preserved. An auto-retry for the next network recovery may be attempted. |
| **Network error during page load** | Error state in the detail view: "Could not load page. [Retry]" with a retry button. Tree remains interactive with previously loaded data. |
| **Network error during tree load** | Error state in sidebar: "Could not load pages. [Retry]" with a retry button. Tree shows skeleton if first load; preserves previous data if a refresh. |
| **User attempts to move a page while lacking permission** | Drag handle is hidden or disabled. If attempted via keyboard/API, toast: "You don't have permission to move this page." |
| **User attempts to restore a cascade-archived child without restoring the parent** | Dialog: "This page was archived because its parent was archived. Restore the parent first." Offers a "Go to parent" action button. |
| **Session expires during an active editing session** | On next API call, frontend attempts silent token refresh. If refresh fails, modal: "Your session has expired. Please sign in again." with "Sign In" button. Unsaved changes are preserved in local storage until the user returns. |
| **Server returns 500 / unexpected error** | Toast: "Something went wrong. Please try again. If the problem persists, contact support." The error is logged server-side with a correlation ID (shown in the toast for support reference). |
| **Breadcrumb ancestor slug changes** | Breadcrumbs recompute on next page load. The current page remains navigable via its PageId. Old slug-based bookmarks for descendants may break; users are directed to use PageId-based links for stability. |
| **Tree shows stale data due to eventual consistency lag** | Tree may briefly show an outdated title or status. The detail view (always authoritative) shows the correct data. The tree catches up within ≤ 1s (in-process projection) or longer (outbox). No user action is required. |

---

## 5. Exclusions (Non-MVP Behaviors)

> **Unpublish (Active → Draft):** Reversing a publish to return a page to Draft is not in scope for this slice. Once a page is published to Active, it remains Active until explicitly Archived. If unpublishing is needed, users should Archive the page (which is reversible via Restore). This simplifies the state machine and avoids the complexity of "what happens to published content visibility during unpublish."

> **Hard page deletion before Archive (Active → Deleted):** Users cannot skip the Archive step to delete an Active page directly. The two-step process (Active → Archived → Deleted) provides a deliberate safety net. The only exception is Draft → Deleted (admin shortcut), which is in scope.

> **Batch archive/restore/delete (multi-select in tree):** This slice supports cascade operations (archive/restore/delete a parent affects descendants) but does not support selecting multiple unrelated pages in the tree and performing a bulk action. Multi-select tree interactions are deferred to a future UX improvement slice.

> **Page templates on creation:** Creating a page from a predefined template (e.g., "Meeting Notes", "Project Plan") is not in scope. All pages are created as empty Drafts. The Template Catalog integration is defined structurally in the bounded context map (01) but is not implemented in this slice.

> **Real-time collaboration indicators:** Showing other users' cursors, presence dots, or "X is editing" indicators in the tree or detail view is not in scope. The Collaboration Events context is defined but not implemented in this slice. Only the event emission infrastructure (outbox) is built.

> **Page version diff and restore UI:** While version history is recorded (append-only revision log), there is no user interface for viewing diffs between versions or restoring a specific historical version. This is deferred to Page Lifecycle — Phase 2.

> **Page export (PDF, Markdown, CSV):** Exporting page content to external formats is not in scope. This is a utility concern, not a lifecycle invariant, and is deferred.

> **Search integration in tree:** The tree does not include a search/filter input to narrow down nodes by title. This is owned by the Search bounded context and is not part of the workspace navigation slice.

> **Trash bin UI (centralized deleted-items view):** There is no dedicated "Trash" view showing all deleted pages across the workspace. Deleted pages are visible only under their original parent via the admin "Show deleted" toggle. A centralized trash view is deferred.

> **Guest page-scoped access in navigation:** Guest users are defined as actors but the navigation tree does not implement a special "shared with me" section for guests. Guest access is purely page-scoped via direct links. Guest tree rendering is deferred to the Collaboration slice.

> **Undo for archive/restore operations:** There is no "Undo" toast/action after archiving or restoring a page. Both operations are immediate and require the opposite explicit action to reverse. Undo support would require a timed hold-and-revert mechanism that adds complexity beyond MVP.

> **Deep hierarchy pagination / virtual scrolling:** For parents with >200 children, the tree may experience rendering performance degradation. Virtual scrolling and lazy-load-on-expand optimisations are deferred as post-MVP enhancements. The MVP assumes practical hierarchy sizes (<200 children per parent, <10k total pages).

---

## 6. Feedback Loop Definitions

### 6.1 Success Feedback

| Operation | Feedback Type | Message / Behavior | Duration |
|-----------|--------------|-------------------|----------|
| Page created | Optimistic tree insertion + detail navigation | Node appears in tree immediately; detail view opens in Draft state | Persistent |
| Page published | Toast | "Page published" with checkmark icon | 4 seconds |
| Title updated | Inline update | Title changes in header, tree node, and breadcrumbs simultaneously | Persistent |
| Slug updated | Inline update + URL change | Browser address bar updates; toast "URL updated" briefly | 3 seconds |
| Page moved | Tree animation | Node animates to new parent position; breadcrumbs update if detail view open | Persistent |
| Page archived | Toast + tree update | "Page archived" toast; nodes dim/disappear from tree; detail view switches to read-only + banner | Toast: 4s; state: persistent |
| Page restored | Toast + tree update | "Page restored" toast; nodes reappear in tree; detail view switches to read-write | Toast: 4s; state: persistent |
| Page deleted | Toast + tree update | "Page deleted" toast; nodes removed from tree; detail view shows read-only deleted banner (admin) or 404 (others) | Toast: 4s; state: persistent |
| Page restored from deleted | Toast + tree update | "Page restored from deleted" toast; page returns to Archived state (not Active) | Toast: 4s; state: persistent |

### 6.2 Conflict / Error Feedback

| Condition | Feedback Type | Message / Behavior | Recovery Action |
|-----------|--------------|-------------------|-----------------|
| Concurrency conflict (409) | Toast + inline | "The page was modified by another user." with Reload button | Reload page; buffered changes offered for re-apply |
| Slug conflict (409) | Inline error | "A page with this URL already exists. Try: [suggestion]" | Edit slug field and retry |
| Validation error (422) | Inline field error | Specific message per field (e.g., "Title cannot be empty") | Correct field and retry |
| Permission denied (403) | Disabled control + tooltip | "You don't have permission to [action] this page." | Contact workspace admin |
| Not found (404) | Full page view | "Page not found" with link back to workspace | Navigate via tree or contact support |
| Authentication expired (401) | Modal | "Your session has expired. Please sign in again." with Sign In button | Re-authenticate; return URL preserved |
| Grace period expired (410) | Toast + disabled button | "The deletion grace period has expired. This page can no longer be restored." | Contact support for out-of-band recovery |
| Confirmation required (428) | Dialog with checkbox | "This action will permanently delete this page and all subpages." | Check confirmation checkbox and confirm |
| Network error | Toast | "Could not reach server. Check your connection and try again." | Retry manually; auto-retry for reads |
| Server error (5xx) | Toast | "Something went wrong. Please try again. [Correlation ID: xxx]" | Retry; contact support with correlation ID |
| Workspace limit reached (422) | Toast | "This workspace has reached its page limit." | Archive or delete existing pages |

### 6.3 Permission Denial Messaging

| Scenario | Where Denied | Message | Visual Treatment |
|----------|-------------|---------|------------------|
| Member attempts to delete (Archived → Deleted) | Context menu + API | "Only admins and owners can delete pages." | Delete option hidden from menu; API returns 403 |
| Non-creator member (role < Admin) attempts to publish | Detail view button | "Only the page creator or an admin can publish this page." | Publish button disabled with tooltip |
| Member attempts to move an Archived page | Drag handle | "Only admins can move archived pages." | Drag handle hidden |
| Non-admin attempts to view Deleted page | Direct URL / tree | "Page not found." | 404 view (no existence revealed) |
| Non-creator (role < Admin) attempts to view Draft page | Direct URL / tree | "Page not found." | 404 view (no existence revealed) |
| Member attempts to view Guest-only shared page | Direct URL | "Page not found." | 404 view |
| Member below min role attempts to expand restricted branch | Tree lock icon | "You don't have access to this section." | Tooltip on lock icon; children not loaded |
| Guest attempts any write operation | All edit controls | Write controls not rendered | Controls are absent; read-only shell only |

### 6.4 Interaction Latency Expectations

| Operation | Expected Latency | Loading Indicator | Fallback Behavior |
|-----------|-----------------|-------------------|-------------------|
| Tree load (initial) | < 2 seconds | Skeleton placeholders | Error state with retry; cached tree shown if available |
| Page detail load | < 1.5 seconds | Skeleton: title + blocks | Error state with retry; stale cache for reads |
| Create page | < 800 ms | Optimistic insertion; "Saving..." indicator on node | Rollback with error toast |
| Update title | < 500 ms | Inline update (no spinner) | Revert to original with error toast |
| Move page | < 1 second | Animated move; no spinner | Snap back to original position with error toast |
| Archive / Restore | < 2 seconds (cascade may vary) | Tree update (optimistic removal/insertion) | Rollback tree with error toast |
| Delete | < 2 seconds (cascade may vary) | Confirmation dialog before action; no optimistic delete | Error toast; no state change |
| Ancestor query (breadcrumbs) | < 300 ms | No indicator (sub-millisecond on cached data) | Breadcrumbs omitted on failure; page title shown alone |

> **Accessibility note:** All loading states MUST use `aria-busy="true"` on the loading container. Skeleton placeholders MUST NOT use `role="alert"` (they are not errors). Once loaded, `aria-busy` is set to `false`.

---

## 7. Consistency Verification

### 7.1 Journey ↔ State Machine (03) Cross-Reference

| Journey | State Machine Transitions Used | Illegal Transitions Avoided |
|---------|-------------------------------|----------------------------|
| J02: Create Workspace Page | T01: `[*] → Draft` | Draft → Draft (no-op), Draft → Archived (illegal) |
| J03: Publish | T02: `Draft → Active` | Active → Draft (illegal), Draft → Draft (no-op) |
| J04: Archive | T08: `Active → Archived` | Active → Deleted (illegal, must archive first) |
| J04: Restore (from Archived) | T09: `Archived → Active` | Archived → Draft (illegal), Archived → Archived (no-op) |
| J04: Delete | T10: `Archived → Deleted` | Active → Deleted (illegal), Deleted → Deleted (no-op) |
| J04: Restore from Deleted | T11: `Deleted → Archived` | Deleted → Active (illegal, must go through Archived) |
| J05: Error Recovery | All failure codes from §5 of 03 | N/A — error recovery is orthogonal to state transitions |
| N/A (system only) | T12: `Deleted → [*]` (expunge) | Expunge is not user-facing; no journey required |

### 7.2 Journey ↔ Navigation (04) Cross-Reference

| Journey | Navigation Rules Applied | View States Affected |
|---------|--------------------------|---------------------|
| J01: Navigate Hierarchy | Tree visibility rules (§6.1), hierarchy integrity rules (§6.2), depth constraints (§6.3) | Sidebar Tree (all states), Breadcrumbs, Restricted Branch views |
| J02: Create Workspace Page | Create child page flow (§3.1), NAV-01 (parent required), NAV-03 (same workspace) | Create Child (inline), Page Detail (Draft), Page Detail (loading/error) |
| J03: Publish | Draft page visibility (§2.2 — 404 for non-creator non-admin) | Page Detail (Draft — creator/admin), Page Detail (Draft — non-creator member) |
| J04: Archive / Restore | Archive flow (§3.3), NAV-07 (cascade), NAV-08 (independent vs cascade descendants) | Page Detail (Archived), Page Detail (Deleted — admin), Archive Confirm Dialog, Delete Confirm Dialog |
| J05: Error Recovery | Error states from View States table (§5 of 04) | Page Detail (error), Page Detail (404), Sidebar Tree (error) |

### 7.3 Role Permission Consistency

| Role | Source Definition |
|------|------------------|
| **Owner** | Defined in 01 (§1.1): Full control over workspace, members, billing, and all pages. |
| **Admin** | Derived from 01 (§1.1): Can manage members (except owners) and settings. In the page lifecycle context: can view any Draft, can delete, can move Archived pages. |
| **Member** | Derived from 01 (§1.1): Can create, read, update, and organize pages. Cannot delete or manage workspace. |
| **Guest** | Derived from 01 (§1.1): View-only access to specific shared pages. Not a workspace member. |

All role-sensitive behaviors in §3 above are consistent with the Content Operation Permissions by State table in 03 (§4) and the navigation visibility rules in 04 (§6.1).

---

## 8. QA Scenario Authoring Guidance

Each journey in this document is structured to support direct translation into test scenarios. The pattern for authoring QA scenarios from these journeys is:

1. **Select a journey** (J01–J05)
2. **Select a behavioral expectation bullet** from that journey
3. **Select a role** (Owner, Admin, Member, Guest) and a page state (Draft, Active, Archived, Deleted)
4. **Define preconditions** (page exists, user is authenticated, etc.)
5. **Define action** (click, drag, type, navigate)
6. **Define expected outcome** (success state, error message, view state change)
7. **Define failure path** (what happens when preconditions are not met)

The Failure Table in §4 provides the authoritative list of scenario→outcome mappings. Every row in the Failure Table corresponds to at least one E2E test case.

### Recommended Test Coverage by Journey

| Journey | Minimum E2E Scenarios | Unit / Integration Tests |
|---------|-----------------------|--------------------------|
| J01: Navigate Hierarchy | 12 (expand, collapse, archived toggle, deleted toggle, restricted branch, keyboard nav, drag preview, empty tree, loading, error, 404 workspace, deep link) | Hierarchy service: acyclic validation, ancestor/descendant computation, visibility gating logic |
| J02: Create Workspace Page | 6 (create root, create child, slug conflict, title validation, workspace limit, cancel) | Page factory: slug uniqueness, parent validation, Draft creation |
| J03: Publish | 4 (publish success, permission denied, slug conflict on publish, concurrent conflict) | State machine: Draft→Active transition, publish guard conditions |
| J04: Archive / Restore | 10 (archive no children, archive with children, restore independently archived, restore cascade-archived, restore from deleted within grace, restore from deleted expired, delete with confirmation, delete without confirmation, cascade-archived child restore attempt, move Archived page) | Cascade operation: Archive, Restore, Delete; grace period logic; archivedByCascade flag |
| J05: Error Recovery | 14 (one per Failure Table row type: 401, 403, 404, 409 conflict, 409 slug, 422 field, 428 confirm, 410 expired, network read, network write, 500, session expiry, stale tree, restricted deep link) | Error mapping service: every `PageCommandError` code maps to a deterministic HTTP status + message template |

---

## 9. Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-07-16 | AI Agent | Initial version — primary user journeys (navigate, create, publish, archive/restore, error recovery), behavioral expectations, role-sensitive behaviors, failure table, exclusions, feedback loops, consistency cross-references, QA guidance. |
