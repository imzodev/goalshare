import { db } from "@/db";
import { communities, communityMembers, profiles } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { withUserContext } from "@/lib/db-context";
import type { Community } from "@/db/schema";
import type { CommunitySummary, CommunityWithMembers } from "@/types/communities";

type Database = typeof db;

export class CommunitiesService {
  constructor(private readonly dbInstance: Database = db) {}

  async listCommunities(userId?: string): Promise<CommunitySummary[]> {
    // Consulta 1: Obtener todas las comunidades con conteo de miembros
    const allCommunities = await this.dbInstance
      .select({
        id: communities.id,
        parentId: communities.parentId,
        kind: communities.kind,
        slug: communities.slug,
        name: communities.name,
        description: communities.description,
        createdAt: communities.createdAt,
        memberCount: sql<number>`cast(count(${communityMembers.userId}) as integer)`,
      })
      .from(communities)
      .leftJoin(communityMembers, eq(communityMembers.communityId, communities.id))
      .groupBy(communities.id)
      .orderBy(desc(communities.createdAt));

    // Si no hay userId, devolver comunidades sin información de membresía
    if (!userId) {
      return allCommunities.map((community) => ({
        id: community.id,
        parentId: community.parentId,
        kind: community.kind,
        slug: community.slug,
        name: community.name,
        description: community.description,
        createdAt: community.createdAt,
        memberCount: community.memberCount ?? 0,
        isMember: false,
      }));
    }

    // Consulta 2: Obtener solo las comunidades donde el usuario es miembro
    const userCommunities = await this.dbInstance
      .select({
        communityId: communityMembers.communityId,
        role: communityMembers.role,
      })
      .from(communityMembers)
      .where(eq(communityMembers.userId, userId));

    // Crear mapa para lookup rápido de membresías del usuario
    const userMembershipMap = new Map(userCommunities.map((uc) => [uc.communityId, uc.role]));

    // Cross match: Combinar ambas consultas
    return allCommunities.map((community) => {
      const userRole = userMembershipMap.get(community.id);
      const isMember = userRole !== undefined;

      return {
        id: community.id,
        parentId: community.parentId,
        kind: community.kind,
        slug: community.slug,
        name: community.name,
        description: community.description,
        createdAt: community.createdAt,
        memberCount: community.memberCount ?? 0,
        isMember,
        userRole: isMember ? userRole : undefined,
      };
    });
  }

  async listUserCommunities(userId: string): Promise<CommunitySummary[]> {
    if (!userId) {
      throw new Error("userId es requerido para listar comunidades del usuario");
    }

    return withUserContext(userId, async () => {
      // Obtener comunidades donde el usuario es miembro
      const rows = await this.dbInstance
        .select({
          id: communities.id,
          parentId: communities.parentId,
          kind: communities.kind,
          slug: communities.slug,
          name: communities.name,
          description: communities.description,
          createdAt: communities.createdAt,
          memberCount: sql<number>`cast(count(${communityMembers.userId}) as integer)`,
          userRole: communityMembers.role,
        })
        .from(communities)
        .innerJoin(communityMembers, eq(communityMembers.communityId, communities.id))
        .where(eq(communityMembers.userId, userId))
        .groupBy(communities.id, communityMembers.role)
        .orderBy(desc(communities.createdAt));

      return rows.map((row) => ({
        id: row.id,
        parentId: row.parentId,
        kind: row.kind,
        slug: row.slug,
        name: row.name,
        description: row.description,
        createdAt: row.createdAt,
        memberCount: row.memberCount ?? 0,
        isMember: true,
        userRole: row.userRole,
      }));
    });
  }

  async getCommunityById(communityId: string): Promise<Community | null> {
    if (!communityId) {
      throw new Error("communityId es requerido para obtener una comunidad");
    }

    const rows = await this.dbInstance.select().from(communities).where(eq(communities.id, communityId)).limit(1);

    return rows[0] ?? null;
  }

  async getCommunityBySlug(slug: string): Promise<Community | null> {
    if (!slug) {
      throw new Error("slug es requerido para obtener una comunidad");
    }

    const rows = await this.dbInstance.select().from(communities).where(eq(communities.slug, slug)).limit(1);

    return rows[0] ?? null;
  }

  async getCommunityWithDetails(userId: string, communityId: string): Promise<CommunitySummary | null> {
    if (!userId || !communityId) {
      throw new Error("userId y communityId son requeridos");
    }

    return withUserContext(userId, async () => {
      // Obtener la comunidad básica
      const community = await this.getCommunityById(communityId);
      if (!community) {
        return null;
      }

      // Contar miembros totales
      const memberCountResult = await this.dbInstance
        .select({ count: sql<number>`cast(count(${communityMembers.userId}) as integer)` })
        .from(communityMembers)
        .where(eq(communityMembers.communityId, communityId));

      const memberCount = memberCountResult[0]?.count ?? 0;

      // Verificar si el usuario es miembro
      const userMembership = await this.dbInstance
        .select({ role: communityMembers.role })
        .from(communityMembers)
        .where(sql`${communityMembers.communityId} = ${communityId} AND ${communityMembers.userId} = ${userId}`)
        .limit(1);

      const isMember = userMembership.length > 0;
      const userRole = isMember ? userMembership[0]?.role : undefined;

      return {
        ...community,
        memberCount,
        isMember,
        userRole,
      };
    });
  }

  async joinCommunity(userId: string, communityId: string): Promise<void> {
    if (!userId || !communityId) {
      throw new Error("userId y communityId son requeridos para unirse a una comunidad");
    }

    return withUserContext(userId, async () => {
      // Verificar que la comunidad existe
      const community = await this.getCommunityById(communityId);
      if (!community) {
        throw new Error("Comunidad no encontrada");
      }

      // Intentar unirse a la comunidad (sin verificar duplicados)
      try {
        await this.dbInstance.insert(communityMembers).values({
          communityId,
          userId,
          role: "member",
        });
      } catch (error: unknown) {
        // Manejar error de llave duplicada (PostgreSQL error code 23505)
        const dbError = error as { code?: string; message?: string };
        if (dbError?.code === "23505" || dbError?.message?.includes("duplicate key")) {
          throw new Error("Ya eres miembro de esta comunidad");
        }
        // Re-lanzar otros errores
        throw error;
      }
    });
  }

  async leaveCommunity(userId: string, communityId: string): Promise<void> {
    if (!userId || !communityId) {
      throw new Error("userId y communityId son requeridos para salir de una comunidad");
    }

    return withUserContext(userId, async () => {
      // Intentar salir de la comunidad
      const result = await this.dbInstance
        .delete(communityMembers)
        .where(sql`${communityMembers.communityId} = ${communityId} AND ${communityMembers.userId} = ${userId}`)
        .returning();

      if (result.length === 0) {
        throw new Error("No eres miembro de esta comunidad");
      }
    });
  }

  async getCommunityMembers(communityId: string): Promise<CommunityWithMembers | null> {
    if (!communityId) {
      throw new Error("communityId es requerido para obtener miembros de la comunidad");
    }

    // Obtener la comunidad
    const community = await this.getCommunityById(communityId);
    if (!community) {
      return null;
    }

    // Obtener miembros con sus perfiles
    const members = await this.dbInstance
      .select({
        userId: communityMembers.userId,
        username: profiles.username,
        displayName: profiles.displayName,
        role: communityMembers.role,
        joinedAt: communityMembers.joinedAt,
      })
      .from(communityMembers)
      .leftJoin(profiles, eq(profiles.userId, communityMembers.userId))
      .where(eq(communityMembers.communityId, communityId))
      .orderBy(desc(communityMembers.joinedAt));

    return {
      ...community,
      members: members.map((member) => ({
        userId: member.userId,
        username: member.username || undefined,
        displayName: member.displayName || undefined,
        role: member.role,
        joinedAt: member.joinedAt!.toISOString(),
      })),
    };
  }

  async searchCommunities(query: string, userId?: string): Promise<CommunitySummary[]> {
    const searchTerm = `%${query.toLowerCase()}%`;

    // Consulta 1: Buscar comunidades por nombre o descripción
    const matchingCommunities = await this.dbInstance
      .select({
        id: communities.id,
        parentId: communities.parentId,
        kind: communities.kind,
        slug: communities.slug,
        name: communities.name,
        description: communities.description,
        createdAt: communities.createdAt,
        memberCount: sql<number>`cast(count(${communityMembers.userId}) as integer)`,
      })
      .from(communities)
      .leftJoin(communityMembers, eq(communityMembers.communityId, communities.id))
      .where(sql`lower(${communities.name}) like ${searchTerm} or lower(${communities.description}) like ${searchTerm}`)
      .groupBy(communities.id)
      .orderBy(desc(communities.createdAt));

    // Si no hay userId, devolver comunidades sin información de membresía
    if (!userId) {
      return matchingCommunities.map((community) => ({
        id: community.id,
        parentId: community.parentId,
        kind: community.kind,
        slug: community.slug,
        name: community.name,
        description: community.description,
        createdAt: community.createdAt,
        memberCount: community.memberCount ?? 0,
        isMember: false,
      }));
    }

    // Consulta 2: Obtener membresías del usuario
    const userCommunities = await this.dbInstance
      .select({
        communityId: communityMembers.communityId,
        role: communityMembers.role,
      })
      .from(communityMembers)
      .where(eq(communityMembers.userId, userId));

    // Crear mapa para lookup rápido
    const userMembershipMap = new Map(userCommunities.map((uc) => [uc.communityId, uc.role]));

    // Combinar resultados
    return matchingCommunities.map((community) => {
      const userRole = userMembershipMap.get(community.id);
      const isMember = userRole !== undefined;

      return {
        id: community.id,
        parentId: community.parentId,
        kind: community.kind,
        slug: community.slug,
        name: community.name,
        description: community.description,
        createdAt: community.createdAt,
        memberCount: community.memberCount ?? 0,
        isMember,
        userRole: isMember ? userRole : undefined,
      };
    });
  }
}
