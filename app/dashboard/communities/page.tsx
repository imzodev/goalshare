"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, RefreshCw, Loader2, AlertCircle, Sparkles } from "lucide-react";
import type { CommunitySummary } from "@/types/communities";
import { CommunitiesGrid } from "@/components/communities/communities-grid";
import { MyCommunitiesGrid } from "@/components/communities/my-communities-grid";
import { getCommunityGradient } from "@/utils/community-utils";

export default function CommunitiesPage() {
  const [allCommunities, setAllCommunities] = useState<CommunitySummary[]>([]);
  const [userCommunities, setUserCommunities] = useState<CommunitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("explore");

  const fetchCommunities = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch all communities
      const allResponse = await fetch("/api/communities", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const allData = await allResponse.json();
      if (!allResponse.ok) {
        throw new Error(allData?.error ?? "No se pudieron cargar las comunidades");
      }

      const allCommunitiesList = Array.isArray(allData?.communities) ? allData.communities : [];
      setAllCommunities(allCommunitiesList);

      // Filter user communities from all communities
      //   user.isMember()
      const userCommunitiesList = allCommunitiesList.filter((community: CommunitySummary) => community.isMember);
      setUserCommunities(userCommunitiesList);
    } catch (err) {
      console.error("[CommunitiesPage]", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar las comunidades");
      setAllCommunities([]);
      setUserCommunities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleRefresh = () => fetchCommunities({ silent: true });

  const showSkeleton = loading && !refreshing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4 md:p-6 lg:p-8">
      {/* Header con gradiente atractivo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Comunidades
            </h1>
            <p className="text-muted-foreground">Únete a comunidades y comparte tu progreso con otros</p>
          </div>
        </div>

        {/* Elementos decorativos flotantes */}
        <div className="absolute top-20 right-20 opacity-10">
          <Sparkles className="h-16 w-16 text-purple-500 animate-pulse" />
        </div>
        <div className="absolute top-32 left-16 opacity-10">
          <Sparkles className="h-12 w-12 text-blue-500 animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="space-y-6">
        {/* Barra de acciones */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{allCommunities.length} comunidades disponibles</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>{userCommunities.length} comunidades tuyas</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  Refrescar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estados de carga y error */}
        {showSkeleton && (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">No pudimos cargar las comunidades</p>
                  <p className="text-muted-foreground">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
                    Reintentar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs de navegación */}
        {!loading && !error && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="explore">Explorar Comunidades</TabsTrigger>
              <TabsTrigger value="my-communities">Mis Comunidades</TabsTrigger>
            </TabsList>

            <TabsContent value="explore" className="space-y-6">
              <CommunitiesGrid
                communities={allCommunities}
                onCommunityAction={fetchCommunities}
                getCommunityGradient={getCommunityGradient}
              />
            </TabsContent>

            <TabsContent value="my-communities" className="space-y-6">
              <MyCommunitiesGrid
                communities={userCommunities}
                onCommunityAction={fetchCommunities}
                getCommunityGradient={getCommunityGradient}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
