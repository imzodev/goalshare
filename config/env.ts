export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",

  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL ?? "",

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

  // AI global defaults (optional)
  AI_DEFAULT_PROVIDER: process.env.AI_DEFAULT_PROVIDER ?? "",
  AI_DEFAULT_MODEL: process.env.AI_DEFAULT_MODEL ?? "",

  // AI per-agent overrides (optional)
  AI_PROVIDER_PLANNER: process.env.AI_PROVIDER_PLANNER ?? "",
  AI_MODEL_PLANNER: process.env.AI_MODEL_PLANNER ?? "",

  AI_PROVIDER_SMART: process.env.AI_PROVIDER_SMART ?? "",
  AI_MODEL_SMART: process.env.AI_MODEL_SMART ?? "",

  AI_PROVIDER_COACH: process.env.AI_PROVIDER_COACH ?? "",
  AI_MODEL_COACH: process.env.AI_MODEL_COACH ?? "",

  AI_PROVIDER_SCHEDULER: process.env.AI_PROVIDER_SCHEDULER ?? "",
  AI_MODEL_SCHEDULER: process.env.AI_MODEL_SCHEDULER ?? "",

  AI_PROVIDER_MODERATOR: process.env.AI_PROVIDER_MODERATOR ?? "",
  AI_MODEL_MODERATOR: process.env.AI_MODEL_MODERATOR ?? "",
} as const;
