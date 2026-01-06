import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateUser, deleteUser } from "../../../../app/actions/admin-users-mutations";
import { db } from "../../../../db";
import { profiles } from "../../../../db/schema";
import { validateAdminSession } from "../../../../lib/admin-auth-server";

// Mock dependencies
vi.mock("../../../../db", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn(),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn(),
    })),
    query: {
      profiles: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("../../../../db/schema", () => ({
  profiles: {
    userId: "userId",
    username: "username",
    displayName: "displayName",
    role: "role",
  },
  userRoleEnum: {
    enumValues: ["user", "admin"],
  },
}));

vi.mock("../../../../lib/admin-auth-server", () => ({
  validateAdminSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Admin User Mutations - updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const adminUser = { id: "admin-id" };
  const targetUser = "user-id";
  const updateData = { displayName: "New Name", role: "admin" as const };

  it("should throw an error if the user is not an admin", async () => {
    vi.mocked(validateAdminSession).mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(updateUser(targetUser, updateData)).rejects.toThrow("Unauthorized");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("should update the user if the requester is an admin", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce(adminUser as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([{ userId: targetUser, ...updateData }]);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    const result = await updateUser(targetUser, updateData);

    expect(result).toEqual({ success: true, user: { userId: targetUser, ...updateData } });
    expect(db.update).toHaveBeenCalledWith(profiles);
  });

  it("should prevent an admin from demoting themselves", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce(adminUser as any);

    await expect(updateUser(adminUser.id, { role: "user" })).rejects.toThrow("You cannot demote yourself");
    expect(db.update).not.toHaveBeenCalled();
  });

  it("should throw an error if the user does not exist", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce(adminUser as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([]);
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    await expect(updateUser("non-existent", updateData)).rejects.toThrow("User not found");
  });
});

describe("Admin User Mutations - deleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const adminUser = { id: "admin-id" };
  const targetUser = "user-id";

  it("should delete the user if the requester is an admin", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce(adminUser as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([{ userId: targetUser }]);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    const result = await deleteUser(targetUser);

    expect(result).toEqual({ success: true, userId: targetUser });
    expect(db.delete).toHaveBeenCalledWith(profiles);
  });

  it("should prevent an admin from deleting themselves", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce(adminUser as any);

    await expect(deleteUser(adminUser.id)).rejects.toThrow("You cannot delete yourself");
    expect(db.delete).not.toHaveBeenCalled();
  });

  it("should throw an error if the user does not exist", async () => {
    vi.mocked(validateAdminSession).mockResolvedValueOnce(adminUser as any);
    const mockReturning = vi.fn().mockResolvedValueOnce([]);
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      returning: mockReturning,
    } as any);

    await expect(deleteUser("non-existent")).rejects.toThrow("User not found");
  });
});
