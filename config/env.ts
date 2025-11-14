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

  // AI provider API keys (server-only)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",

  // Feature flags
  AI_ENABLE_MCP: process.env.AI_ENABLE_MCP ?? "",

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

  AI_PROVIDER_AUTOCOMPLETE: process.env.AI_PROVIDER_AUTOCOMPLETE ?? "",
  AI_MODEL_AUTOCOMPLETE: process.env.AI_MODEL_AUTOCOMPLETE ?? "",

  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
  RATE_LIMIT_WINDOW_SECONDS: process.env.RATE_LIMIT_WINDOW_SECONDS ?? "60",
  RATE_LIMIT_LIMIT_AUTHED: process.env.RATE_LIMIT_LIMIT_AUTHED ?? "60",
  RATE_LIMIT_LIMIT_ANON: process.env.RATE_LIMIT_LIMIT_ANON ?? "60",
  // "memory" (default) or "upstash" for general API rate limiting
  GENERAL_RATE_LIMIT_BACKEND: process.env.GENERAL_RATE_LIMIT_BACKEND ?? "memory",
} as const;
