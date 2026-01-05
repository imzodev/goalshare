"use server";

import { db } from "@/db";
import { profiles, goals, communities } from "@/db/schema";
import { validateAdminSession } from "@/lib/admin-auth-server";
import { count } from "drizzle-orm";

export async function getAdminDashboardStats() {
  await validateAdminSession();

  try {
    const [userCount] = await db.select({ count: count() }).from(profiles);
    const [goalCount] = await db.select({ count: count() }).from(goals);
    const [communityCount] = await db.select({ count: count() }).from(communities);

    return {
      totalUsers: userCount?.count || 0,
      totalGoals: goalCount?.count || 0,
      totalCommunities: communityCount?.count || 0,
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    throw new Error("Failed to fetch admin dashboard statistics");
  }
}
