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
- [ ] Task: Create Community Form Component
  - [ ] Subtask: Create `components/admin/community-form.tsx` using `react-hook-form` and `zod`.
  - [ ] Subtask: Define form schema for name, slug, kind, and description.
- [ ] Task: Implement Create Community Dialog
  - [ ] Subtask: Add "Create Community" button to the `AdminCommunitiesPage`.
  - [ ] Subtask: Implement the dialog/sheet containing the `CommunityForm`.
  - [ ] Subtask: Wire up submission to `createCommunity` action.
- [ ] Task: Implement Edit Community Flow
  - [ ] Subtask: Add "Edit" action to the table row dropdown.
  - [ ] Subtask: Implement edit dialog/sheet, pre-filling data from the selected row.
  - [ ] Subtask: Wire up submission to `updateCommunity` action.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)
