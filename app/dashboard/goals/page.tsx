"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, RefreshCw, Loader2, AlertCircle, Sparkles, Plus } from "lucide-react";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import { DeleteGoalDialog } from "@/components/goals/delete-goal-dialog";
import { GoalsManagementSkeleton } from "@/components/skeletons/goals-management-skeleton";
import { GoalCard } from "@/components/goals/goal-card";
import { useGoalManagement } from "@/hooks/use-goal-management";
import type { UserGoalSummary } from "@/types/goals";

export default function GoalsManagementPage() {
  const [goals, setGoals] = useState<UserGoalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/goals", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudieron cargar las metas");
      }

      const nextGoals = Array.isArray(data?.goals) ? data.goals : [];
      setGoals(nextGoals);
    } catch (err) {
      console.error("[GoalsManagement]", err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar las metas");
      setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Hook de gestión de goals (edición y eliminación)
  const {
    editingGoal,
    editDialogOpen,
    deletingGoal,
    deleteDialogOpen,
    setEditDialogOpen,
    setDeleteDialogOpen,
    handleEditGoal,
    handleDeleteGoal,
    handleGoalUpdated,
    handleGoalDeleted,
  } = useGoalManagement({
    onGoalUpdated: () => fetchGoals({ silent: true }),
    onGoalDeleted: () => fetchGoals({ silent: true }),
  });

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleRefresh = () => fetchGoals({ silent: true });

  const showSkeleton = loading && !refreshing;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4 md:p-6 lg:p-8">
      {/* Header con gradiente atractivo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestión de Metas
            </h1>
            <p className="text-muted-foreground">Administra todas tus metas: edita, elimina y sigue tu progreso</p>
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
                  <Target className="h-4 w-4" />
                  <span>{goals.length} metas totales</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>{goals.filter((g) => g.status === "completed").length} completadas</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>{goals.filter((g) => g.status === "pending").length} en progreso</span>
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
        {showSkeleton && <GoalsManagementSkeleton />}

        {!loading && error && (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">No pudimos cargar tus metas</p>
                  <p className="text-muted-foreground">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
                    Reintentar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista vacía */}
        {!loading && !error && goals.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="rounded-lg border border-dashed bg-white/50 dark:bg-gray-800/40 px-6 py-16 text-center">
                <Target className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aún no tienes metas</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Crea tu primera meta para comenzar a gestionar tus objetivos y compartir tu progreso con la comunidad.
                </p>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear mi primera meta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de metas */}
        {!loading && !error && goals.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                layout="multi-column"
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Diálogos */}
      <EditGoalDialog
        goal={editingGoal}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onGoalUpdated={handleGoalUpdated}
      />

      <DeleteGoalDialog
        goal={deletingGoal}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onGoalDeleted={handleGoalDeleted}
      />
    </div>
  );
}
