# Plan: Full Admin User Management

## Phase 1: Server Actions & Backend

Implement the mutation logic for user management.

- [x] Task: Implement Update User Action (2e8d7f3)
  - [x] Subtask: Create `app/actions/admin-users-mutations.ts`.
  - [x] Subtask: Implement `updateUser` action with Zod validation and admin check.
  - [x] Subtask: Add safety check to prevent self-demotion or self-deletion.
  - [x] Subtask: Test: Verify role changes and profile updates work correctly.
- [x] Task: Implement Delete User Action (2e8d7f3)
  - [x] Subtask: Implement `deleteUser` action in `app/actions/admin-users-mutations.ts`.
  - [x] Subtask: Test: Verify user deletion and cascade handling.
- [ ] Task: Conductor - User Manual Verification 'Server Actions & Backend' (Protocol in workflow.md)

## Phase 2: UI Implementation

Integrate the actions into the existing Users Table.

- [x] Task: Create User Edit Form Component (3b070a7)
  - [x] Subtask: Create `components/admin/user-form.tsx` using `react-hook-form` and `zod`.
  - [x] Subtask: Include fields for display name, username, and a select for role.
- [x] Task: Implement Edit User Dialog (d285cde)
  - [x] Subtask: Update `components/admin/users-table.tsx` to handle the "Edit" button click.
  - [x] Subtask: Create `components/admin/edit-user-dialog.tsx` wrapping the form.
  - [x] Subtask: Wire up submission to `updateUser` action.
- [ ] Task: Wire up Delete User Functionality
  - [ ] Subtask: Add "Delete User" action to the table row dropdown.
  - [ ] Subtask: Implement confirmation dialog and wire up to `deleteUser` action.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)
