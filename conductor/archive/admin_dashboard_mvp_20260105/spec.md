# Specification: Build Admin Dashboard MVP

## 1. Overview

Create a dedicated Admin Dashboard to allow authorized administrators to oversee the platform. This includes viewing high-level metrics, managing users, and overseeing communities. The UI will strictly adhere to the project's design system, utilizing **shadcn/ui** components for a consistent and professional look.

## 2. Goals

- **Security:** Ensure only users with the 'admin' role can access dashboard routes.
- **Observability:** Provide a quick view of platform health (user count, active communities, recent activity).
- **Management:** Enable admins to view user details and manage community content.
- **Consistency:** Use shadcn/ui components (Cards, Tables, Dialogs, Sidebar) for all UI elements.

## 3. User Stories

- As an **Admin**, I want to log in and access a protected dashboard area.
- As an **Admin**, I want to see a summary of key metrics (total users, active goals) to gauge platform growth.
- As an **Admin**, I want to view a list of all users and search for specific individuals.
- As an **Admin**, I want to view and delete communities that violate platform guidelines.

## 4. Technical Requirements

### 4.1. Architecture & Routing

- **Route:** `/admin` (protected via Middleware and layout checks).
- **Layout:** Dedicated `AdminLayout` with a simplified sidebar distinct from the main app.

### 4.2. Components (shadcn/ui)

- **Layout:** `Sidebar`, `Sheet` (for mobile menu).
- **Display:** `Card` (metrics), `Table` (data lists), `Badge` (status).
- **Interaction:** `Button`, `Input` (search), `DropdownMenu` (actions), `Dialog` (confirmations).
- **Feedback:** `Skeleton` (loading states), `Toast` (notifications).

### 4.3. Data Fetching

- Use Server Actions for secure data fetching and mutations.
- Implement pagination for User and Community tables.

### 4.4. Security

- Implement a `requireAdmin` check in the layout and all Server Actions.
- Ensure sensitive user data (passwords, tokens) is never sent to the client.

### 4.5. Database Schema

- **Users Table:** Add a `role` column (Enum: 'user', 'admin') to the users table.
- **Default:** New users default to 'user'.
- **Migration:** Existing users should be backfilled as 'user'.

## 5. Visual Design

- **Theme:** Consistent with the main application (Light/Dark mode support).
- **Structure:**
  - **Sidebar:** Navigation links (Overview, Users, Communities, Settings).
  - **Header:** Breadcrumbs, Theme Toggle, User Menu.
  - **Content Area:** Padded container for page content.
