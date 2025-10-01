"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Loader2, TrendingUp, Crown, ArrowUpRight } from "lucide-react";
import type { CommunitySummary } from "@/types/communities";

interface MyCommunitiesGridProps {
  communities: CommunitySummary[];
  onCommunityAction: () => void;
  getCommunityGradient: (communityId: string) => string;
}

export function MyCommunitiesGrid({ communities, onCommunityAction, getCommunityGradient }: MyCommunitiesGridProps) {
  const [leavingCommunity, setLeavingCommunity] = useState<string | null>(null);

  const handleLeaveCommunity = async (community: CommunitySummary) => {
    try {
      setLeavingCommunity(community.id);
      const response = await fetch(`/api/communities/${community.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al salir de la comunidad");

      onCommunityAction(); // Refresh data
    } catch (error) {
      console.error("Error leaving community:", error);
    } finally {
      setLeavingCommunity(null);
    }
  };

  if (communities.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
        <CardContent className="pt-6">
          <div className="rounded-lg border border-dashed bg-white/50 dark:bg-gray-800/40 px-6 py-16 text-center">
            <Users className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aún no perteneces a ninguna comunidad</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Explora comunidades disponibles y únete a grupos con intereses similares a los tuyos.
            </p>
            <Button
              variant="outline"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Explorar Comunidades
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {communities.map((community) => {
        const gradient = getCommunityGradient(community.id);
        const isLeaving = leavingCommunity === community.id;

        return (
          <Card
            key={community.id}
            className="group relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
            />

            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{community.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10 dark:bg-green-900/20 dark:text-green-300">
                      Miembro
                    </span>
                    {community.userRole === "admin" && (
                      <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10 dark:bg-yellow-900/20 dark:text-yellow-300">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300">
                      {community.kind === "topic"
                        ? "Tema"
                        : community.kind === "domain"
                          ? "Dominio"
                          : community.kind === "cohort"
                            ? "Cohorte"
                            : "Comunidad"}
                    </span>
                  </div>
                </div>

                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg"
                  style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                >
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {community.description || "Sin descripción disponible"}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="text-sm font-semibold">{community.memberCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Miembros</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="text-sm font-semibold">-</div>
                  <div className="text-xs text-muted-foreground">Metas activas</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Te uniste el {new Date(community.createdAt).toLocaleDateString("es-ES")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all hover:shadow-xl"
                >
                  <Link href={`/dashboard/communities/${community.id}`}>
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="ml-1">Ir a la comunidad</span>
                  </Link>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLeaving}
                  onClick={() => handleLeaveCommunity(community)}
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                >
                  {isLeaving ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <MessageCircle className="h-3 w-3 mr-1" />
                  )}
                  {isLeaving ? "Saliendo..." : "Salir"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
