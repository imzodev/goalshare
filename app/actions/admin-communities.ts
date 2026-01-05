"use server";

import { db } from "@/db";
import { communities } from "@/db/schema";
import { validateAdminSession } from "@/lib/admin-auth-server";
import { count, desc } from "drizzle-orm";

interface GetCommunitiesListParams {
  page?: number;
  pageSize?: number;
}

export async function getCommunitiesList({ page = 1, pageSize = 10 }: GetCommunitiesListParams = {}) {
  await validateAdminSession();

  const offset = (page - 1) * pageSize;

  try {
    const comms = await db.query.communities.findMany({
      limit: pageSize,
      offset: offset,
      orderBy: [desc(communities.createdAt)],
    });

    const [totalResult] = await db.select({ total: count() }).from(communities);

    return {
      communities: comms,
      pagination: {
        page,
        pageSize,
        total: totalResult?.total || 0,
        totalPages: Math.ceil((totalResult?.total || 0) / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch communities list:", error);
    throw new Error("Failed to fetch communities list");
  }
}
