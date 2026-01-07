import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteCommunity, createCommunity, updateCommunity } from "../../../../app/actions/admin-communities-mutations";
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
    insert: vi.fn(() => ({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn(),
    })),
    update: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn(),
    })),
    query: {
      communities: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("../../../../db/schema", () => ({
  communities: {
    id: "id",
    slug: "slug",
    name: "name",
    kind: "kind",
    description: "description",
  },
  communityKindEnum: {
    enumValues: ["domain", "topic", "cohort"],
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

describe("Admin Community Mutations - createCommunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validData = {
    name: "New Community",
    slug: "new-community",
    kind: "topic" as const,
    description: "A test community",
  };

  it("should create a community with valid data", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce({ id: "admin-id" } as any);
    vi.mocked(db.query.communities.findFirst).mockResolvedValueOnce(null as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([{ id: "new-id", ...validData }]);
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    const result = await createCommunity(validData);

    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledWith(communities);
  });

  it("should throw an error if the slug is already taken", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce({ id: "admin-id" } as any);
    vi.mocked(db.query.communities.findFirst).mockResolvedValueOnce({ id: "existing" } as any);

    await expect(createCommunity(validData)).rejects.toThrow("Slug is already taken");
  });

  it("should throw an error with invalid data", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce({ id: "admin-id" } as any);

    await expect(createCommunity({ ...validData, name: "" })).rejects.toThrow();
  });
});

describe("Admin Community Mutations - updateCommunity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const updateData = {
    name: "Updated Name",
  };

  it("should update a community with valid data", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce({ id: "admin-id" } as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([{ id: "comm-id", name: "Updated Name" }]);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    const result = await updateCommunity("comm-id", updateData);

    expect(result.success).toBe(true);
    expect(db.update).toHaveBeenCalledWith(communities);
  });

  it("should throw an error if the community does not exist", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce({ id: "admin-id" } as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([]);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    await expect(updateCommunity("non-existent", updateData)).rejects.toThrow("Community not found");
  });
});
