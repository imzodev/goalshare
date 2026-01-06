"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { validateAdminSession } from "@/lib/admin-auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userUpdateSchema = z.object({
  displayName: z.string().min(1, "Display name cannot be empty").max(100).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
  role: z.enum(["user", "admin"]).optional(),
});

/**
 * Updates a user profile or role.
 */
export async function updateUser(userId: string, data: z.infer<typeof userUpdateSchema>) {
  const admin = await validateAdminSession();

  const validated = userUpdateSchema.parse(data);

  // Safety check: Prevent self-demotion
  if (userId === admin.id && validated.role === "user") {
    throw new Error("You cannot demote yourself. Another admin must perform this action.");
  }

  try {
    const updated = await db.update(profiles).set(validated).where(eq(profiles.userId, userId)).returning();

    if (updated.length === 0) {
      throw new Error("User not found");
    }

    revalidatePath("/admin/users");

    return { success: true, user: updated[0] };
  } catch (error) {
    console.error("Failed to update user:", error);
    if (error instanceof Error) throw error;
    throw new Error("Internal Server Error");
  }
}

/**
 * Deletes a user account.
 */
export async function deleteUser(userId: string) {
  const admin = await validateAdminSession();

  // Safety check: Prevent self-deletion
  if (userId === admin.id) {
    throw new Error("You cannot delete yourself. Another admin must perform this action.");
  }

  try {
    const deleted = await db.delete(profiles).where(eq(profiles.userId, userId)).returning({ userId: profiles.userId });

    if (deleted.length === 0) {
      throw new Error("User not found");
    }

    revalidatePath("/admin/users");

    return { success: true, userId: deleted[0].userId };
  } catch (error) {
    console.error("Failed to delete user:", error);
    if (error instanceof Error) throw error;
    throw new Error("Internal Server Error");
  }
}
