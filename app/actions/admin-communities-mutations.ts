"use server";

import { db } from "@/db";
import { communities } from "@/db/schema";
import { validateAdminSession } from "@/lib/admin-auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const communitySchema = z.object({
  name: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  kind: z.enum(["domain", "topic", "cohort"]),
  description: z.string().max(500).optional(),
});

/**
 * Deletes a community from the database.
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

/**
 * Creates a new community.
 */
export async function createCommunity(data: z.infer<typeof communitySchema>) {
  await validateAdminSession();

  const validated = communitySchema.parse(data);

  try {
    // Check if slug exists
    const existing = await db.query.communities.findFirst({
      where: eq(communities.slug, validated.slug),
    });

    if (existing) {
      throw new Error("Slug is already taken");
    }

    const created = await db
      .insert(communities)
      .values({
        ...validated,
        description: validated.description ?? null,
      })
      .returning();

    revalidatePath("/admin/communities");

    return { success: true, community: created[0] };
  } catch (error) {
    console.error("Failed to create community:", error);
    if (error instanceof Error) throw error;
    throw new Error("Internal Server Error");
  }
}

/**
 * Updates an existing community.
 */
export async function updateCommunity(id: string, data: Partial<z.infer<typeof communitySchema>>) {
  await validateAdminSession();

  const updateSchema = communitySchema.partial();
  const validated = updateSchema.parse(data);

  try {
    const updated = await db.update(communities).set(validated).where(eq(communities.id, id)).returning();

    if (updated.length === 0) {
      throw new Error("Community not found");
    }

    revalidatePath("/admin/communities");

    return { success: true, community: updated[0] };
  } catch (error) {
    console.error("Failed to update community:", error);
    if (error instanceof Error) throw error;
    throw new Error("Internal Server Error");
  }
}
