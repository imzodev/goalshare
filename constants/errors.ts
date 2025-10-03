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

// User-friendly Spanish messages used by the app UI
export const AUTH_ERROR_MESSAGES = {
  UNKNOWN: "Error desconocido. Intenta de nuevo.",
  GENERIC: "Error al procesar tu solicitud. Intenta de nuevo.",
  INVALID_LOGIN: "Correo o contraseña incorrectos",
  EMAIL_NOT_CONFIRMED: "Por favor confirma tu correo antes de iniciar sesión",
  USER_ALREADY_REGISTERED: "Este correo ya está registrado. Intenta iniciar sesión.",
  WEAK_PASSWORD: "La contraseña es muy débil. Usa al menos 6 caracteres.",
  OAUTH_GENERIC: "Error al conectar con el proveedor. Intenta de nuevo.",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
