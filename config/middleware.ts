import { env } from "@/config/env";

export const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ALLOWED_ORIGINS = [DEFAULT_APP_URL, "http://localhost:3000", "https://localhost:3000"] as const;

export const GENERAL_WINDOW_SECONDS = Number(env.RATE_LIMIT_WINDOW_SECONDS || "60");
export const GENERAL_LIMIT_AUTHED = Number(env.RATE_LIMIT_LIMIT_AUTHED || "60");
export const GENERAL_LIMIT_ANON = Number(env.RATE_LIMIT_LIMIT_ANON || "60");
export const GENERAL_RATE_LIMIT_BACKEND = env.GENERAL_RATE_LIMIT_BACKEND === "upstash" ? "upstash" : "memory";
