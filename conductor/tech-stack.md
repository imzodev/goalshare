# Technology Stack

## Core Framework & Language

- **Next.js 15 (App Router):** Primary framework for frontend and server-side logic.
- **React 19:** UI library.
- **TypeScript:** Primary language for type safety and developer productivity.
- **Bun:** JavaScript runtime and package manager.

## Frontend & Styling

- **Tailwind CSS 4:** Utility-first CSS framework for styling.
- **Radix UI:** Headless UI primitives for accessible components.
- **Lucide React:** Icon set.
- **next-themes:** Light/dark mode management.

## Backend & Infrastructure

- **Supabase:** Core infrastructure for Authentication and PostgreSQL database.
- **Upstash Redis:** Distributed rate limiting and caching.
- **Middleware:** Next.js middleware for auth and rate limit enforcement.

## Data Layer

- **PostgreSQL:** Primary relational database.
- **Drizzle ORM:** TypeScript-first ORM for database schema management and queries.

## AI Integration

- **Vercel AI SDK:** Unified interface for interacting with LLMs.
- **Providers:** OpenAI, Anthropic, DeepSeek, and Groq.
- **Features:** Conversational coaching, automated analysis, and smart suggestions.

## Internationalization (i18n)

- **next-intl:** Multi-language support (English and Spanish).
- **Strategy:** Cookie-based language detection without URL prefixes.

## Payments & Billing

- **Stripe:** Payment processing for subscriptions or one-time features.

## Testing & Quality

- **Vitest:** Unit and integration testing framework.
- **React Testing Library:** UI testing utilities.
- **ESLint & Prettier:** Code linting and formatting.
- **Husky & lint-staged:** Git hooks for pre-commit quality checks.
