import type { AUTH_ERROR_CODES } from "@/constants/errors";
import { AUTH_ERROR_KEYS, AUTH_ERROR_MESSAGES } from "@/constants/errors";

/**
 * Maps Supabase Auth (and related) error messages to user-friendly Spanish messages.
 * Note: We rely on substring checks because upstream messages may vary slightly.
 */
export function getAuthErrorMessage(
  error: unknown,
  tErrors?: (key: (typeof AUTH_ERROR_KEYS)[keyof typeof AUTH_ERROR_KEYS]) => string
): string {
  if (!error) return AUTH_ERROR_MESSAGES.UNKNOWN;

  const raw = typeof error === "string" ? error : (error as { message?: string })?.message;
  if (!raw) return AUTH_ERROR_MESSAGES.UNKNOWN;

  const msg = raw.toLowerCase();

  // Login errors
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return tErrors ? tErrors(AUTH_ERROR_KEYS.INVALID_LOGIN) : AUTH_ERROR_MESSAGES.INVALID_LOGIN;
  }
  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
    return tErrors ? tErrors(AUTH_ERROR_KEYS.EMAIL_NOT_CONFIRMED) : AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }

  // Sign-up errors
  if (msg.includes("user already registered") || msg.includes("already exists")) {
    return tErrors ? tErrors(AUTH_ERROR_KEYS.USER_ALREADY_REGISTERED) : AUTH_ERROR_MESSAGES.USER_ALREADY_REGISTERED;
  }
  if (msg.includes("password") && msg.includes("weak")) {
    return tErrors ? tErrors(AUTH_ERROR_KEYS.WEAK_PASSWORD) : AUTH_ERROR_MESSAGES.WEAK_PASSWORD;
  }

  // OAuth errors
  if (msg.includes("oauth")) {
    return tErrors ? tErrors(AUTH_ERROR_KEYS.OAUTH_GENERIC) : AUTH_ERROR_MESSAGES.OAUTH_GENERIC;
  }

  // Generic fallback
  return tErrors ? tErrors(AUTH_ERROR_KEYS.GENERIC) : AUTH_ERROR_MESSAGES.GENERIC;
}

/**
 * Optional low-level classifier when we need a symbolic code before formatting.
 * This is not required by issue #37 but is useful as an internal utility.
 */
export function classifyAuthError(error: unknown): keyof typeof AUTH_ERROR_CODES | "UNKNOWN" {
  if (!error) return "UNKNOWN";
  const raw = typeof error === "string" ? error : (error as { message?: string })?.message;
  if (!raw) return "UNKNOWN";
  const msg = raw.toLowerCase();

  if (msg.includes("invalid login") || msg.includes("invalid credentials")) return "INVALID_LOGIN";
  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) return "EMAIL_NOT_CONFIRMED";
  if (msg.includes("user already registered") || msg.includes("already exists")) return "USER_ALREADY_REGISTERED";
  if (msg.includes("password") && msg.includes("weak")) return "WEAK_PASSWORD";
  if (msg.includes("oauth")) return "OAUTH_ERROR";

  return "UNKNOWN";
}
