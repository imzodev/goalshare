# Plan: Build Admin Dashboard MVP

## Phase 1: Infrastructure & Security [checkpoint: 911b0f2]

Establish the secure foundation for the admin area, ensuring proper routing and access control.

- [x] Task: Update Database Schema for Admin Roles (305e4a5)
  - [x] Subtask: Update `db/schema.ts` to include a `role` enum ('user', 'admin') in the `users` table (default: 'user').
  - [x] Subtask: Generate and run the Drizzle migration (`bun run db:generate` & `bun run db:migrate`).
  - [x] Subtask: Create a seed script or manual instruction to promote a specific user to 'admin' for testing.
- [x] Task: Configure Admin Routes & Middleware (562c5f5)
  - [x] Subtask: Define `/admin` route group in Next.js App Router.
  - [x] Subtask: Update `middleware.ts` to protect `/admin` routes (allow only specific role/ID).
  - [x] Subtask: Create `admin-auth.ts` utility to verify admin status in Server Components/Actions.
  - [x] Subtask: Test: Verify non-admins are redirected and admins can access the route.
- [x] Task: Create Admin Layout Shell (c9193e4)
  - [x] Subtask: Implement `app/admin/layout.tsx`.
  - [x] Subtask: Create `AdminSidebar` component using shadcn/ui.
  - [x] Subtask: Create `AdminHeader` component with mobile menu trigger (Sheet).
  - [x] Subtask: Test: Verify layout responsiveness and theme toggle integration.
- [ ] Task: Conductor - User Manual Verification 'Infrastructure & Security' (Protocol in workflow.md)

## Phase 2: Dashboard Overview [checkpoint: 7d720fc]

Build the landing page for admins with high-level statistics.

- [x] Task: Create Metrics Cards (b47ac9a)
  - [x] Subtask: Create `MetricCard` component using shadcn/ui `Card`.
  - [x] Subtask: Implement `getAdminDashboardStats` Server Action to fetch counts (Users, Goals, Communities).
  - [x] Subtask: Assemble `app/admin/page.tsx` with a grid of metric cards.
  - [x] Subtask: Test: Verify stats load correctly and skeleton states appear during loading.
- [ ] Task: Conductor - User Manual Verification 'Dashboard Overview' (Protocol in workflow.md)

## Phase 3: User Management [checkpoint: b45ed49]

Enable admins to view and manage the user base.

- [x] Task: Implement Users Table (aa6eda0)
  - [x] Subtask: Create `UsersTable` component using shadcn/ui `Table`.
  - [x] Subtask: Implement `getUsersList` Server Action with pagination and search support.
  - [x] Subtask: Add `Input` component for search filtering.
  - [x] Subtask: Create `app/admin/users/page.tsx` and integrate the table.
  - [x] Subtask: Test: Verify search functionality and pagination.
- [ ] Task: Conductor - User Manual Verification 'User Management' (Protocol in workflow.md)

## Phase 4: Community Management

Provide tools to oversee user-created communities.

- [x] Task: Implement Communities Table (fc0e33c)
  - [x] Subtask: Create `CommunitiesTable` component using shadcn/ui `Table`.
  - [x] Subtask: Implement `getCommunitiesList` Server Action.
  - [x] Subtask: Add "Delete Community" action with shadcn/ui `Dialog` for confirmation.
  - [x] Subtask: Create `app/admin/communities/page.tsx`.
  - [x] Subtask: Test: Verify community deletion flow and permission checks.
- [ ] Task: Conductor - User Manual Verification 'Community Management' (Protocol in workflow.md)
