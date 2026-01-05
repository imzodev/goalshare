"use server";

import { db } from "@/db";
import { communities } from "@/db/schema";
import { validateAdminSession } from "@/lib/admin-auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Deletes a community from the database.
 * @param id The UUID of the community to delete.
 */
export async function deleteCommunity(id: string) {
  await validateAdminSession();

  try {
    const deleted = await db.delete(communities).where(eq(communities.id, id)).returning({ id: communities.id });

    if (deleted.length === 0) {
      throw new Error("Community not found");
    }

    revalidatePath("/admin/communities");

    return { success: true, id: deleted[0].id };
  } catch (error) {
    console.error("Failed to delete community:", error);
    if (error instanceof Error) throw error;
    throw new Error("Internal Server Error");
  }
}
