# Supabase OAuth (Google/GitHub) Configuration Guide

This guide explains how to enable Google and GitHub OAuth with Supabase for this app.

- App auth pages: `app/auth/login/page.tsx`, `app/auth/sign-up/page.tsx`
- Forms: `components/auth/login-form.tsx`, `components/auth/sign-up-form.tsx`
- Supabase client utils: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`

The UI is already wired to call `supabase.auth.signInWithOAuth()`. You only need to configure the providers.

---

## 1) Prerequisites

- Supabase project ready and accessible.
- Site URL and Redirect URLs configured in Supabase (Step 2).
- Google Cloud and/or GitHub Developer accounts to create OAuth apps (Steps 3 and 4).

---

## 2) Supabase URL Configuration

Supabase → Authentication → Settings → URL Configuration

- Site URL (Dev):
  - `http://localhost:3000`
- Additional Redirect URLs (Dev):
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/auth/login`
  - `http://localhost:3000/auth/sign-up`
- Site URL (Prod):
  - `https://<your-domain>`
- Additional Redirect URLs (Prod):
  - `https://<your-domain>/dashboard`
  - `https://<your-domain>/auth/login`
  - `https://<your-domain>/auth/sign-up`

Note: Adjust to match your deployment domain(s).

---

## 3) Google OAuth

1. Google Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth client ID
2. Application type: Web application
3. Authorized redirect URIs (REQUIRED):
   - `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
   - Example: `https://uosmhurtjcjoznqagcvj.supabase.co/auth/v1/callback`
4. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://<your-domain>` (prod)
5. Save and copy the Client ID and Client Secret
6. Supabase → Authentication → Providers → Google
   - Toggle ON
   - Paste Client ID & Client Secret
   - Save

The app already sets `redirectTo: ${window.location.origin}/dashboard`, so after Supabase handles the callback, users land on `/dashboard`.

---

## 4) GitHub OAuth

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Homepage URL:
   - Dev: `http://localhost:3000`
   - Prod: `https://<your-domain>`
3. Authorization callback URL (REQUIRED):
   - `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
4. Register application → Generate Client Secret
5. Supabase → Authentication → Providers → GitHub
   - Toggle ON
   - Paste Client ID & Client Secret
   - Save

(Optional) Update the UI button wiring similar to Google once provider is enabled.

---

## 5) App Code References

- Login Google button handler: `components/auth/login-form.tsx` → `handleGoogleSignIn()`
- Sign-up Google button handler: `components/auth/sign-up-form.tsx` → `handleGoogleSignUp()`
- Both use:

```ts
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google", // or "github"
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  },
});
```

No code changes are needed after enabling providers in Supabase.

---

## 6) Local vs Production Checklist

- Supabase → URL Configuration:
  - Site URL matches your environment (dev or prod)
  - Additional Redirect URLs include all app redirects you use
- Provider console (Google/GitHub):
  - Redirect URI is exactly `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
  - JS origins include your dev/prod base URLs
- Environment:
  - `.env` has valid Supabase URL and anon key

---

## 7) Troubleshooting

- Unsupported provider / provider not enabled:
  - Enable the provider in Supabase Providers page
  - Ensure Client ID/Secret are set and saved
- redirect_uri_mismatch / invalid redirect:
  - The Redirect URI must be EXACT in the provider console:
    `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
- Infinite redirect or stale session:
  - Clear cookies, ensure `Site URL` is correct in Supabase
  - Confirm `redirectTo` URL is present in Additional Redirect URLs
- 500 after auth in dev:
  - Stop dev server, delete `.next` folder, restart

---

## 8) Security Notes

- Do not expose Client Secret in the repository
- Keep provider secrets in Supabase only (server-side)
- Ensure HTTPS in production for all origins and redirects

---

## 9) Next Steps

- After enabling Google/GitHub, test from:
  - `/auth/login` (Google button)
  - `/auth/sign-up` (Google button)
- If you deploy (Vercel/Netlify), repeat URL configuration with the production domain.
