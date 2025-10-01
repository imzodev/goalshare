import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { withUserContext } from "@/lib/db-context";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const data = await withUserContext(userId, async (dbCtx) => {
      const rows = await dbCtx
        .select({ id: communities.id, name: communities.name, slug: communities.slug })
        .from(communities)
        .where(eq(communities.kind, "topic" as any));
      return rows;
    });

    return NextResponse.json({ communities: data }, { status: 200 });
  } catch (e) {
    console.error("[GET /api/communities/topics]", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
