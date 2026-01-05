import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteCommunity } from "../../../../app/actions/admin-communities-mutations";
import { db } from "../../../../db";
import { communities } from "../../../../db/schema";
import { validateAdminSession } from "../../../../lib/admin-auth-server";

// Mock dependencies
vi.mock("../../../../db", () => ({
  db: {
    delete: vi.fn(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn(),
    })),
  },
}));

vi.mock("../../../../db/schema", () => ({
  communities: {
    id: "id",
  },
}));

vi.mock("../../../../lib/admin-auth-server", () => ({
  validateAdminSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Admin Community Mutations - deleteCommunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error if the user is not an admin", async () => {
    vi.mocked(validateAdminSession).mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(deleteCommunity("comm-id")).rejects.toThrow("Unauthorized");
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("should delete the community if the user is an admin", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce({ id: "admin-id" } as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([{ id: "comm-id" }]);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    const result = await deleteCommunity("comm-id");

    expect(result).toEqual({ success: true, id: "comm-id" });
    expect(db.delete).toHaveBeenCalledWith(communities);
  });

  it("should throw an error if the community does not exist", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce({ id: "admin-id" } as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([]);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    await expect(deleteCommunity("non-existent")).rejects.toThrow("Community not found");
  });
});
