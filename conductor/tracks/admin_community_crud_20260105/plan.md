# Plan: Full Admin Community Management

## Phase 1: Server Actions & Backend [checkpoint: 66b021f]

Implement the necessary server actions to handle database mutations.

- [x] Task: Implement Delete Community Action (b81f9e4)
  - [x] Subtask: Create `app/actions/admin-communities-mutations.ts`.
  - [x] Subtask: Implement `deleteCommunity` action with admin validation.
  - [x] Subtask: Test: Verify deletion works and associated data handling (cascades).
- [x] Task: Implement Create & Update Actions (bc40660)
  - [x] Subtask: Add `createCommunity` action with Zod validation and unique slug check.
  - [x] Subtask: Add `updateCommunity` action.
  - [x] Subtask: Test: Verify creation and updates work, including error handling for duplicates.
- [ ] Task: Conductor - User Manual Verification 'Server Actions & Backend' (Protocol in workflow.md)

## Phase 2: UI Implementation

Connect the backend actions to the frontend components.

- [x] Task: Wire up Delete Functionality (0d1900a)
  - [x] Subtask: Update `CommunitiesTable` to use the `deleteCommunity` action.
  - [x] Subtask: Add success/error toast notifications.
- [x] Task: Create Community Form Component (e44e1c5)
  - [x] Subtask: Create `components/admin/community-form.tsx` using `react-hook-form` and `zod`.
  - [x] Subtask: Define form schema for name, slug, kind, and description.
- [x] Task: Implement Create Community Dialog (3c53a0e)
  - [x] Subtask: Add "Create Community" button to the `AdminCommunitiesPage`.
  - [x] Subtask: Implement the dialog/sheet containing the `CommunityForm`.
  - [x] Subtask: Wire up submission to `createCommunity` action.
- [x] Task: Implement Edit Community Flow (0c05b99)
  - [x] Subtask: Add "Edit" action to the table row dropdown.
  - [x] Subtask: Implement edit dialog/sheet, pre-filling data from the selected row.
  - [x] Subtask: Wire up submission to `updateCommunity` action.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)
