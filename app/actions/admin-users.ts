"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { validateAdminSession } from "@/lib/admin-auth-server";
import { count, eq, or, ilike, sql, desc } from "drizzle-orm";

interface GetUsersListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function getUsersList({ page = 1, pageSize = 10, search }: GetUsersListParams = {}) {
  await validateAdminSession();

  const offset = (page - 1) * pageSize;

  try {
    const whereClause = search
      ? or(
          ilike(profiles.username, `%${search}%`),
          ilike(profiles.displayName, `%${search}%`),
          eq(profiles.userId, search)
        )
      : undefined;

    const users = await db.query.profiles.findMany({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      orderBy: [desc(profiles.createdAt)],
    });

    const [totalResult] = await db.select({ total: count() }).from(profiles).where(whereClause);

    return {
      users,
      pagination: {
        page,
        pageSize,
        total: totalResult?.total || 0,
        totalPages: Math.ceil((totalResult?.total || 0) / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch users list:", error);
    throw new Error("Failed to fetch users list");
  }
}
