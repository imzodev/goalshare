// Centralized error constants to ensure consistent references across the codebase.
// Note: This file intentionally contains constants only. Wiring/replacements across the app
// will be handled in a separate issue as requested.

// Low-level (provider/raw) identifiers we commonly detect in error messages
export const AUTH_ERROR_CODES = {
  INVALID_LOGIN: "invalid_login_credentials",
  INVALID_CREDENTIALS: "invalid_credentials",
  EMAIL_NOT_CONFIRMED: "email_not_confirmed",
  USER_ALREADY_REGISTERED: "user_already_registered",
  ALREADY_EXISTS: "already_exists",
  WEAK_PASSWORD: "weak_password",
  OAUTH_ERROR: "oauth_error",
} as const;

// i18n keys for user-friendly messages (namespace: auth.errors)
export const AUTH_ERROR_KEYS = {
  UNKNOWN: "unknown",
  GENERIC: "generic",
  INVALID_LOGIN: "invalidLogin",
  INVALID_CREDENTIALS: "invalidCredentials",
  EMAIL_NOT_CONFIRMED: "emailNotConfirmed",
  USER_ALREADY_REGISTERED: "userAlreadyRegistered",
  WEAK_PASSWORD: "weakPassword",
  OAUTH_GENERIC: "oauthGeneric",
} as const;

// User-friendly Spanish messages used by the app UI (legacy fallback)
export const AUTH_ERROR_MESSAGES = {
  UNKNOWN: "Unknown error. Please try again.",
  GENERIC: "Error processing your request. Please try again.",
  INVALID_LOGIN: "Invalid email or password",
  EMAIL_NOT_CONFIRMED: "Please confirm your email before logging in",
  USER_ALREADY_REGISTERED: "This email is already registered. Try logging in.",
  WEAK_PASSWORD: "Password is too weak. Use at least 6 characters.",
  OAUTH_GENERIC: "Error connecting with provider. Please try again.",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
