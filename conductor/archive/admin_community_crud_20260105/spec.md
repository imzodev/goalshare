# Specification: Full Admin Community Management

## 1. Overview

Enhance the existing Admin Dashboard to support full CRUD operations for communities. Admins currently can only view a list of communities. This track will add the ability to create new communities, edit existing details (name, description, slug, kind), and permanently delete them.

## 2. Goals

- **Creation:** Enable admins to create new communities directly from the dashboard.
- **Editing:** Allow admins to modify community metadata (name, description, slug).
- **Deletion:** Implement the actual deletion logic (replacing the current placeholder).
- **UX:** Provide a seamless experience using shadcn/ui components (Dialogs, Forms, Toasts).

## 3. User Stories

- As an **Admin**, I want to create a new community by providing a name, slug, and type.
- As an **Admin**, I want to edit the description or name of an existing community to correct errors or update branding.
- As an **Admin**, I want to delete a community that is no longer needed or violates guidelines.

## 4. Technical Requirements

### 4.1. Server Actions

- `createCommunity`: Accepts name, slug, kind, description. Validates uniqueness of slug.
- `updateCommunity`: Accepts id and partial updates.
- `deleteCommunity`: Accepts id. Deletes the record from the database.

### 4.2. UI Components

- **CommunityForm:** A reusable form component (using `react-hook-form` + `zod`) for both creating and editing communities.
- **CreateCommunityDialog:** A dialog wrapping the form for creating new entries.
- **EditCommunitySheet:** A sheet (side drawer) or Dialog for editing an existing community.
- **DeleteConfirmation:** Integrate the actual delete action into the existing dialog.

### 4.3. Validation

- Use `zod` schema for form validation.
- Ensure `slug` is unique on creation and update.

## 5. Visual Design

- Consistent with the existing Admin Dashboard.
- Use `Sheet` for editing to allow more space for form fields if needed, or `Dialog` for quick edits.
- Use `Toast` notifications for success/error feedback.
