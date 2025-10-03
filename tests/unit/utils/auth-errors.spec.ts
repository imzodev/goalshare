import { describe, it, expect } from "vitest";
import { getAuthErrorMessage, classifyAuthError } from "@/utils/auth-errors";
import { AUTH_ERROR_MESSAGES } from "@/constants/errors";

describe("getAuthErrorMessage", () => {
  it("returns INVALID_LOGIN message for invalid credentials variants", () => {
    expect(getAuthErrorMessage("Invalid login credentials")).toBe(AUTH_ERROR_MESSAGES.INVALID_LOGIN);
    expect(getAuthErrorMessage("invalid credentials provided")).toBe(AUTH_ERROR_MESSAGES.INVALID_LOGIN);
  });

  it("returns EMAIL_NOT_CONFIRMED for unconfirmed email", () => {
    expect(getAuthErrorMessage("Email not confirmed")).toBe(AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED);
    expect(getAuthErrorMessage("email_not_confirmed")).toBe(AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED);
  });

  it("returns USER_ALREADY_REGISTERED for duplicate user", () => {
    expect(getAuthErrorMessage("User already registered")).toBe(AUTH_ERROR_MESSAGES.USER_ALREADY_REGISTERED);
    expect(getAuthErrorMessage("already exists")).toBe(AUTH_ERROR_MESSAGES.USER_ALREADY_REGISTERED);
  });

  it("returns WEAK_PASSWORD for weak password errors", () => {
    expect(getAuthErrorMessage("Password too weak")).toBe(AUTH_ERROR_MESSAGES.WEAK_PASSWORD);
  });

  it("returns OAUTH_GENERIC for oauth-related errors", () => {
    expect(getAuthErrorMessage("OAuth provider error")).toBe(AUTH_ERROR_MESSAGES.OAUTH_GENERIC);
  });

  it("returns GENERIC for unknown strings", () => {
    expect(getAuthErrorMessage("some unexpected error")).toBe(AUTH_ERROR_MESSAGES.GENERIC);
  });

  it("returns UNKNOWN when error is empty", () => {
    expect(getAuthErrorMessage(undefined)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN);
    expect(getAuthErrorMessage(null as unknown as string)).toBe(AUTH_ERROR_MESSAGES.UNKNOWN);
    expect(getAuthErrorMessage({})).toBe(AUTH_ERROR_MESSAGES.UNKNOWN);
  });
});

describe("classifyAuthError", () => {
  it("classifies invalid credentials", () => {
    expect(classifyAuthError("Invalid credentials")).toBe("INVALID_LOGIN");
  });

  it("classifies email not confirmed", () => {
    expect(classifyAuthError("email not confirmed")).toBe("EMAIL_NOT_CONFIRMED");
  });

  it("classifies duplicate user", () => {
    expect(classifyAuthError("already exists")).toBe("USER_ALREADY_REGISTERED");
  });

  it("classifies weak password", () => {
    expect(classifyAuthError("weak password")).toBe("WEAK_PASSWORD");
  });

  it("classifies oauth errors", () => {
    expect(classifyAuthError("oauth error")).toBe("OAUTH_ERROR");
  });

  it("returns UNKNOWN for other cases", () => {
    expect(classifyAuthError("random")).toBe("UNKNOWN");
  });
});
