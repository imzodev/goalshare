"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Users, MessageCircle, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CommunitySummary } from "@/types/communities";
import { getCommunityGradient } from "@/utils/community-utils";
import { CommunityCard } from "@/components/communities/community-card";

export function CommunitiesSection() {
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);

  // Cargar comunidades al montar el componente
  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch("/api/communities");
      if (!response.ok) throw new Error("Error al cargar comunidades");

      const data = await response.json();
      setCommunities(data.communities);
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Error al cargar las comunidades");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (community: CommunitySummary) => {
    if (community.isMember) {
      // Si ya es miembro, salir de la comunidad
      try {
        setJoiningCommunity(community.id);
        const response = await fetch(`/api/communities/${community.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Error al salir de la comunidad");

        toast.success(`Has salido de ${community.name}`);
        // Recargar comunidades para actualizar el estado
        await fetchCommunities();
      } catch (error) {
        console.error("Error leaving community:", error);
        toast.error("Error al salir de la comunidad");
      } finally {
        setJoiningCommunity(null);
      }
    } else {
      // Si no es miembro, unirse a la comunidad
      try {
        setJoiningCommunity(community.id);
        const response = await fetch(`/api/communities/${community.id}`, {
          method: "POST",
        });

        if (!response.ok) throw new Error("Error al unirte a la comunidad");

        toast.success(`Te has unido a ${community.name}!`);
        // Recargar comunidades para actualizar el estado
        await fetchCommunities();
      } catch (error) {
        console.error("Error joining community:", error);
        toast.error("Error al unirte a la comunidad");
      } finally {
        setJoiningCommunity(null);
      }
    }
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Comunidades
          </CardTitle>
          <Button variant="outline" size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" />
            Explorar
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Comunidades
        </CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Explorar
        </Button>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-4 pb-4 pr-4">
            {communities.map((community) => {
              const gradient = getCommunityGradient(community.id);
              const isJoining = joiningCommunity === community.id;

              const subtitle =
                community.kind === "topic"
                  ? "Comunidad de tema"
                  : community.kind === "domain"
                    ? "Comunidad de dominio"
                    : community.kind === "cohort"
                      ? "Cohorte"
                      : "Comunidad";

              return (
                <CommunityCard
                  key={community.id}
                  community={community}
                  gradientClass={gradient}
                  badges={undefined}
                  subtitle={<span className="truncate">{subtitle}</span>}
                  compact
                  rootClassName="w-[280px] shrink-0 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50"
                  contentClassName="p-4"
                  titleClassName="truncate"
                  descriptionClassName="truncate"
                  activeGoalsCount={0}
                  primaryAction={{
                    label: isJoining ? "Procesando..." : community.isMember ? "Salir" : "Unirse",
                    icon: isJoining ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <MessageCircle className="h-3 w-3 mr-1" />
                    ),
                    disabled: isJoining,
                    onClick: () => handleJoinCommunity(community),
                    className: `bg-gradient-to-r ${gradient} hover:shadow-lg transition-all disabled:opacity-50`,
                  }}
                />
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
