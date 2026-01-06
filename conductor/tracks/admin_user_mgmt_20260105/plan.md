# Plan: Full Admin User Management

## Phase 1: Server Actions & Backend

Implement the mutation logic for user management.

- [ ] Task: Implement Update User Action
  - [ ] Subtask: Create `app/actions/admin-users-mutations.ts`.
  - [ ] Subtask: Implement `updateUser` action with Zod validation and admin check.
  - [ ] Subtask: Add safety check to prevent self-demotion or self-deletion.
  - [ ] Subtask: Test: Verify role changes and profile updates work correctly.
- [ ] Task: Implement Delete User Action
  - [ ] Subtask: Implement `deleteUser` action in `app/actions/admin-users-mutations.ts`.
  - [ ] Subtask: Test: Verify user deletion and cascade handling.
- [ ] Task: Conductor - User Manual Verification 'Server Actions & Backend' (Protocol in workflow.md)

## Phase 2: UI Implementation

Integrate the actions into the existing Users Table.

- [ ] Task: Create User Edit Form Component
  - [ ] Subtask: Create `components/admin/user-form.tsx` using `react-hook-form` and `zod`.
  - [ ] Subtask: Include fields for display name, username, and a select for role.
- [ ] Task: Implement Edit User Dialog
  - [ ] Subtask: Update `components/admin/users-table.tsx` to handle the "Edit" button click.
  - [ ] Subtask: Create `components/admin/edit-user-dialog.tsx` wrapping the form.
  - [ ] Subtask: Wire up submission to `updateUser` action.
- [ ] Task: Wire up Delete User Functionality
  - [ ] Subtask: Add "Delete User" action to the table row dropdown.
  - [ ] Subtask: Implement confirmation dialog and wire up to `deleteUser` action.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)
