import { describe, it, expect } from "vitest";
import { profiles, userRoleEnum } from "../../../db/schema";
import { getTableColumns } from "drizzle-orm";

describe("Database Schema", () => {
  describe("Profiles Table", () => {
    it("should have a role column with default value 'user'", () => {
      const columns = getTableColumns(profiles);
      expect(columns).toHaveProperty("role");
      expect(columns.role.default).toBe("user");
      expect(columns.role.notNull).toBe(true);
    });

    it("should have a userRoleEnum defined", () => {
      expect(userRoleEnum).toBeDefined();
      expect(userRoleEnum.enumValues).toEqual(["user", "admin"]);
    });
  });
});
