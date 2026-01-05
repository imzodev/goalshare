import { describe, it, expect, vi } from "vitest";
import { db } from "../../../db";
import { isAdmin, requireAdmin } from "../../../lib/admin-auth";

// Mock the database
vi.mock("../../../db", () => ({
  db: {
    query: {
      profiles: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe("Admin Authentication", () => {
  describe("isAdmin", () => {
    it("should return true for a user with admin role", async () => {
      vi.mocked(db.query.profiles.findFirst).mockResolvedValueOnce({ role: "admin" } as any);
      const result = await isAdmin("admin-id");
      expect(result).toBe(true);
    });

    it("should return false for a user with user role", async () => {
      vi.mocked(db.query.profiles.findFirst).mockResolvedValueOnce({ role: "user" } as any);
      const result = await isAdmin("user-id");
      expect(result).toBe(false);
    });

    it("should return false if the user is not found", async () => {
      vi.mocked(db.query.profiles.findFirst).mockResolvedValueOnce(null as any);
      const result = await isAdmin("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("requireAdmin", () => {
    it("should not throw if the user is an admin", async () => {
      vi.mocked(db.query.profiles.findFirst).mockResolvedValueOnce({ role: "admin" } as any);
      await expect(requireAdmin("admin-id")).resolves.not.toThrow();
    });

    it("should throw a 403 error if the user is not an admin", async () => {
      vi.mocked(db.query.profiles.findFirst).mockResolvedValueOnce({ role: "user" } as any);
      await expect(requireAdmin("user-id")).rejects.toThrow("Forbidden");
    });
  });
});
