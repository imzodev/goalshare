import { describe, it, expect, vi } from "vitest";
import { getAdminDashboardStats } from "../../../../app/actions/admin-stats";
import { db } from "../../../../db";

// Mock the database
vi.mock("../../../../db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(),
    })),
  },
}));

// Mock admin auth
vi.mock("../../../../lib/admin-auth-server", () => ({
  validateAdminSession: vi.fn(),
}));

describe("Admin Stats Action", () => {
  it("should return the correct counts for users, goals, and communities", async () => {
    // Setup the mock chain
    const mockFrom = vi.fn();
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

    // Mock responses for the three consecutive calls
    mockFrom
      .mockResolvedValueOnce([{ count: 50 }]) // Users
      .mockResolvedValueOnce([{ count: 120 }]) // Goals
      .mockResolvedValueOnce([{ count: 5 }]); // Communities

    const stats = await getAdminDashboardStats();

    expect(stats).toEqual({
      totalUsers: 50,
      totalGoals: 120,
      totalCommunities: 5,
    });

    expect(db.select).toHaveBeenCalledTimes(3);
  });
});
