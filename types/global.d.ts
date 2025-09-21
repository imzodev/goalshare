/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_DB_URL?: string;

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
    CLERK_SECRET_KEY?: string;
    CLERK_SIGN_IN_URL?: string;
    CLERK_SIGN_UP_URL?: string;

    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    NEXT_PUBLIC_APP_URL?: string;
  }
}
