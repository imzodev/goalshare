import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

import { db } from "@/db"
import { communityMembers, posts, profiles } from "@/db/schema"
import { withUserContext } from "@/lib/db-context"

const sanitizePlainText = (input: string): string => {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export const createCommunityPostSchema = z.object({
  communityId: z.string({ required_error: "El ID de la comunidad es requerido" }).uuid("communityId inválido"),
  body: z
    .string({ required_error: "El contenido es requerido" })
    .trim()
    .min(5, "El post debe tener al menos 5 caracteres")
    .max(1000, "El post supera el máximo de 1000 caracteres"),
})

export type CommunityPostDTO = {
  id: string
  communityId: string
  body: string
  createdAt: string
  author: {
    userId: string
    displayName?: string | null
    username?: string | null
    imageUrl?: string | null
  }
}

type Database = typeof db

export class PostsService {
  constructor(private readonly dbInstance: Database = db) {}

  async listCommunityPosts(userId: string, communityId: string, limit = 25): Promise<CommunityPostDTO[]> {
    if (!userId) {
      throw new Error("userId es requerido para listar posts de la comunidad")
    }

    if (!communityId) {
      throw new Error("communityId es requerido para listar posts de la comunidad")
    }

    return withUserContext(userId, async (dbCtx) => {
      const membership = await dbCtx
        .select({ userId: communityMembers.userId })
        .from(communityMembers)
        .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)))
        .limit(1)

      if (membership.length === 0) {
        throw new Error("No eres miembro de esta comunidad")
      }

      const rows = await dbCtx
        .select({
          id: posts.id,
          communityId: posts.communityId,
          body: posts.body,
          createdAt: posts.createdAt,
          authorId: posts.authorId,
          displayName: profiles.displayName,
          username: profiles.username,
          imageUrl: profiles.imageUrl,
        })
        .from(posts)
        .innerJoin(profiles, eq(posts.authorId, profiles.userId))
        .where(eq(posts.communityId, communityId))
        .orderBy(desc(posts.createdAt))
        .limit(limit)

      return rows.map((row) => ({
        id: row.id,
        communityId: row.communityId,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
        author: {
          userId: row.authorId,
          displayName: row.displayName,
          username: row.username,
          imageUrl: row.imageUrl,
        },
      }))
    })
  }

  async createPost(userId: string, input: z.infer<typeof createCommunityPostSchema>): Promise<CommunityPostDTO> {
    if (!userId) {
      throw new Error("userId es requerido para crear un post")
    }

    const validated = createCommunityPostSchema.parse(input)
    const sanitizedBody = sanitizePlainText(validated.body)

    if (!sanitizedBody) {
      throw new Error("El post no puede quedar vacío luego de limpiar el contenido")
    }

    return withUserContext(userId, async (dbCtx) => {
      const membership = await dbCtx
        .select({ userId: communityMembers.userId })
        .from(communityMembers)
        .where(and(eq(communityMembers.communityId, validated.communityId), eq(communityMembers.userId, userId)))
        .limit(1)

      if (membership.length === 0) {
        throw new Error("Necesitas ser miembro de la comunidad para publicar")
      }

      const [inserted] = await dbCtx
        .insert(posts)
        .values({
          communityId: validated.communityId,
          authorId: userId,
          body: sanitizedBody,
        })
        .returning({
          id: posts.id,
          communityId: posts.communityId,
          body: posts.body,
          createdAt: posts.createdAt,
        })

      const [authorProfile] = await dbCtx
        .select({
          userId: profiles.userId,
          displayName: profiles.displayName,
          username: profiles.username,
          imageUrl: profiles.imageUrl,
        })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1)

      return {
        id: inserted.id,
        communityId: inserted.communityId,
        body: inserted.body,
        createdAt: inserted.createdAt.toISOString(),
        author: {
          userId: authorProfile?.userId ?? userId,
          displayName: authorProfile?.displayName ?? null,
          username: authorProfile?.username ?? null,
          imageUrl: authorProfile?.imageUrl ?? null,
        },
      }
    })
  }
}
