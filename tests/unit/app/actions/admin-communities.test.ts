import { describe, it, expect, vi } from "vitest";
import { getCommunitiesList } from "../../../../app/actions/admin-communities";
import { db } from "../../../../db";

// Mock the database
vi.mock("../../../../db", () => ({
  db: {
    query: {
      communities: {
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

describe("Admin Communities Action", () => {
  it("should return a list of communities with pagination", async () => {
    const mockCommunities = [
      { id: "1", name: "Community 1", slug: "comm-1", kind: "topic", createdAt: new Date() },
      { id: "2", name: "Community 2", slug: "comm-2", kind: "cohort", createdAt: new Date() },
    ];

    vi.mocked(db.query.communities.findMany).mockResolvedValueOnce(mockCommunities as any);

    const mockFrom = vi.fn().mockResolvedValueOnce([{ total: 2 }]);
    vi.mocked(db.select).mockReturnValue({ from: mockFrom } as any);

    const result = await getCommunitiesList({ page: 1, pageSize: 10 });

    expect(result.communities).toHaveLength(2);
    expect(result.communities[0].id).toBe("1");
    expect(result.pagination.total).toBe(2);
  });
});
