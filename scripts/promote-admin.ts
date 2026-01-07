import { db } from "../db";
import { profiles } from "../db/schema";
import { eq } from "drizzle-orm";

async function promoteAdmin() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: bun scripts/promote-admin.ts <userId>");
    process.exit(1);
  }

  console.log(`Promoting user ${userId} to admin...`);

  try {
    const result = await db.update(profiles).set({ role: "admin" }).where(eq(profiles.userId, userId)).returning();

    if (result.length === 0) {
      console.error(`User with ID ${userId} not found.`);
      process.exit(1);
    }

    console.log(`Successfully promoted ${result[0].username || result[0].userId} to admin.`);
  } catch (error) {
    console.error("Failed to promote user:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

promoteAdmin();
