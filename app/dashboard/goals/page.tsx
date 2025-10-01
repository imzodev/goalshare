"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, Clock, RefreshCw, Loader2, AlertCircle, Edit, Trash2, Sparkles, Plus } from "lucide-react";
import type { UserGoalSummary } from "@/types/goals";
import { EditGoalDialog } from "./components/edit-goal-dialog";
import { DeleteGoalDialog } from "./components/delete-goal-dialog";
import { formatDeadline } from "@/utils/date-utils";
import { getDaysLeftLabel } from "@/utils/goals-ui-utils";
import { GoalsManagementSkeleton } from "@/components/skeletons/goals-management-skeleton";
import { GOAL_STATUS_LABELS } from "@/constants/goals";

const colorPalette = [
  "from-blue-500/50 via-blue-500/20 to-transparent",
  "from-purple-500/50 via-purple-500/20 to-transparent",
  "from-emerald-500/50 via-emerald-500/20 to-transparent",
  "from-amber-500/50 via-amber-500/20 to-transparent",
  "from-pink-500/50 via-pink-500/20 to-transparent",
  "from-rose-500/50 via-rose-500/20 to-transparent",
  "from-cyan-500/50 via-cyan-500/20 to-transparent",
  "from-violet-500/50 via-violet-500/20 to-transparent",
];

export default function GoalsManagementPage() {
  const [goals, setGoals] = useState<UserGoalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para edición
  const [editingGoal, setEditingGoal] = useState<UserGoalSummary | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Estados para eliminación
  const [deletingGoal, setDeletingGoal] = useState<UserGoalSummary | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleRefresh = () => fetchGoals({ silent: true });

  const handleEditGoal = (goal: UserGoalSummary) => {
    setEditingGoal(goal);
    setEditDialogOpen(true);
  };

  const handleDeleteGoal = (goal: UserGoalSummary) => {
    setDeletingGoal(goal);
    setDeleteDialogOpen(true);
  };

  const handleGoalUpdated = () => {
    fetchGoals({ silent: true });
    setEditDialogOpen(false);
    setEditingGoal(null);
  };

  const handleGoalDeleted = () => {
    fetchGoals({ silent: true });
    setDeleteDialogOpen(false);
    setDeletingGoal(null);
  };

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
            {goals.map((goal, index) => {
              const gradient = colorPalette[index % colorPalette.length];
              const statusLabel = GOAL_STATUS_LABELS[goal.status];
              const deadlineLabel = formatDeadline(goal.deadline);
              const daysLeftLabel = getDaysLeftLabel(goal.status, goal.daysLeft);

              return (
                <Card
                  key={goal.id}
                  className="group relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />

                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{goal.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {goal.topicCommunity?.name || "Sin categoría"}
                          </Badge>
                          <Badge
                            className={`text-xs capitalize ${
                              goal.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGoal(goal)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal)}
                          className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{goal.description}</p>

                    {/* Información temporal */}
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{deadlineLabel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{daysLeftLabel}</span>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
