import { describe, it, expect, vi } from "vitest";
import { getUsersList } from "../../../../app/actions/admin-users";
import { db } from "../../../../db";

// Mock the database
vi.mock("../../../../db", () => ({
  db: {
    query: {
      profiles: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock admin auth
vi.mock("../../../../lib/admin-auth-server", () => ({
  validateAdminSession: vi.fn(),
}));

describe("Admin Users Action", () => {
  it("should return a list of users with pagination metadata", async () => {
    const mockUsers = [
      { userId: "1", username: "user1", role: "user", createdAt: new Date() },
      { userId: "2", username: "admin1", role: "admin", createdAt: new Date() },
    ];

    vi.mocked(db.query.profiles.findMany).mockResolvedValueOnce(mockUsers as any);

    const mockWhere = vi.fn().mockResolvedValueOnce([{ total: 2 }]);
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

    const result = await getUsersList({ page: 1, pageSize: 10 });

    expect(result.users).toHaveLength(2);
    expect(result.users[0].userId).toBe("1");
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.page).toBe(1);
  });
});
