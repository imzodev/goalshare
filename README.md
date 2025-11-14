This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 🌐 Internationalization (i18n)

This project supports multiple languages using [next-intl](https://next-intl-docs.vercel.app/):

- **Supported Languages**: Spanish (ES) and English (EN)
- **Default Language**: Spanish (ES)
- **Language Detection**: Cookie-based (no URL prefixes)

### Usage in Components

```tsx
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("namespace");

  return <h1>{t("title")}</h1>;
}
```

### Adding Translations

1. Add your keys to both language files:
   - `i18n/messages/es.json`
   - `i18n/messages/en.json`

2. Use namespaces to organize translations by feature:
   - `common.*` - Shared translations
   - `auth.*` - Authentication
   - `dashboard.*` - Dashboard
   - `goals.*` - Goals management
   - `communities.*` - Communities

3. For detailed documentation, see `docs/I18N.md`

### Testing i18n

```bash
# Run i18n-specific tests
bun test tests/i18n

# Test components with translations
import { withI18n } from '@/tests/helpers/i18n-test-wrapper';

render(withI18n(<YourComponent />));
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Rate Limiting (Distributed with Upstash Redis)

This project includes a distributed rate limiter integrated in `middleware.ts`. It uses **Upstash Redis** when credentials are provided, and falls back to an in-memory limiter in local development.

### Setup

1. Install dependency (already added):

```bash
bun add @upstash/redis
```

2. Configure environment variables (see `.env.example`):

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Optional (defaults in parentheses)
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_LIMIT_AUTHED=60
RATE_LIMIT_LIMIT_ANON=60
```

3. Behavior

- Limits are enforced per identity and window:
  - Authenticated users: `uid:{userId}`
  - Anonymous users: `ip:{ip}`
- Headers are attached on `/api/*` responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset` (unix seconds)
- When exceeded, responses return `429` with `Retry-After` seconds.

4. Local development

- If Upstash credentials are not present, an in-memory limiter is used.
- This is sufficient for dev but not distributed in production.

5. Notes

- Keep existing CORS/CSRF checks before the limiter.
- You can tune limits via envs without code changes.
