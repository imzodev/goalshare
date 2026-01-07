import { describe, it, expect } from "vitest";
import {
  isProtectedRoute,
  isAdminRoute,
  isApiRoute,
  isAiRoute,
  isAuthRoute,
} from "../../../../utils/middleware/routes";

describe("Middleware Routes Utility", () => {
  describe("isProtectedRoute", () => {
    it("should return true for dashboard routes", () => {
      expect(isProtectedRoute("/dashboard")).toBe(true);
      expect(isProtectedRoute("/dashboard/goals")).toBe(true);
    });

    it("should return true for admin routes", () => {
      expect(isProtectedRoute("/admin")).toBe(true);
      expect(isProtectedRoute("/admin/users")).toBe(true);
    });

    it("should return false for public routes", () => {
      expect(isProtectedRoute("/")).toBe(false);
      expect(isProtectedRoute("/auth/login")).toBe(false);
    });
  });

  describe("isAdminRoute", () => {
    it("should return true for admin routes", () => {
      expect(isAdminRoute("/admin")).toBe(true);
      expect(isAdminRoute("/admin/settings")).toBe(true);
    });

    it("should return false for non-admin routes", () => {
      expect(isAdminRoute("/dashboard")).toBe(false);
      expect(isAdminRoute("/api/users")).toBe(false);
    });
  });
});
