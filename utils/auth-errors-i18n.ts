/**
 * i18n-aware auth error utilities
 * Use these functions in client components where useTranslations is available
 */

/**
 * Maps Supabase Auth error messages to i18n translation keys
 */
export function getAuthErrorKey(error: unknown): string {
  if (!error) return "auth.errors.unknown";

  const raw = typeof error === "string" ? error : (error as { message?: string })?.message;
  if (!raw) return "auth.errors.unknown";

  const msg = raw.toLowerCase();

  // Login errors
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "auth.errors.invalidLogin";
  }
  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
    return "auth.errors.emailNotConfirmed";
  }

  // Sign-up errors
  if (msg.includes("user already registered") || msg.includes("already exists")) {
    return "auth.errors.userAlreadyRegistered";
  }
  if (msg.includes("password") && msg.includes("weak")) {
    return "auth.errors.weakPassword";
  }

  // OAuth errors
  if (msg.includes("oauth")) {
    return "auth.errors.oauthGeneric";
  }

  // Generic fallback
  return "auth.errors.generic";
}

/**
 * Get translated error message using the translation function
 * Usage in client components:
 *
 * const t = useTranslations();
 * const errorMsg = getAuthErrorMessageI18n(error, t);
 */
export function getAuthErrorMessageI18n(error: unknown, t: (key: string) => string): string {
  const key = getAuthErrorKey(error);
  return t(key);
}
