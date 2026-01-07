import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Checks if a user has the admin role.
 * @param userId The ID of the user to check (Clerk user ID).
 * @returns A boolean indicating if the user is an admin.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: {
      role: true,
    },
  });

  return profile?.role === "admin";
}

/**
 * Throws an error if the user does not have the admin role.
 * Useful for Server Actions and protected routes.
 * @param userId The ID of the user to check.
 */
export async function requireAdmin(userId: string): Promise<void> {
  const isUserAdmin = await isAdmin(userId);
  if (!isUserAdmin) {
    throw new Error("Forbidden: Admin access required");
  }
}
