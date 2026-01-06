# Specification: Full Admin User Management

## 1. Overview

Enhance the Admin Dashboard to allow full management of user profiles. This includes updating display names and usernames, changing user roles (Admin vs. User), and deleting user accounts. This build on the existing read-only users table.

## 2. Goals

- **Profile Management:** Allow admins to correct or update user profile information.
- **Role Control:** Provide a way to promote or demote users.
- **Account Deletion:** Enable permanent removal of user accounts and their associated data.
- **Security:** Ensure these operations are strictly limited to authorized admins.

## 3. User Stories

- As an **Admin**, I want to update a user's display name if it's inappropriate or incorrect.
- As an **Admin**, I want to promote a trusted user to an administrator role to help manage the platform.
- As an **Admin**, I want to delete accounts that violate terms of service or are no longer active.

## 4. Technical Requirements

### 4.1. Server Actions

- `updateUser`: Accepts userId and fields to update (displayName, username, role).
- `deleteUser`: Accepts userId. Performs a cascade delete or handles associated records (goals, posts, memberships).

### 4.2. UI Components

- **UserEditForm:** Reusable form for updating user details.
- **EditUserDialog:** Dialog/Sheet containing the form, triggered from the Users Table.
- **DeleteUserConfirmation:** Confirmation dialog for account removal.

### 4.3. Validation

- Use `zod` for input validation.
- Ensure username remains unique if changed.
- Prevent an admin from deleting their own account or demoting themselves (safety check).

## 5. Visual Design

- Consistent with the existing Admin UI.
- Use `Badge` to clearly indicate the current role in the edit form.
- Use `Toast` for success/error feedback.
