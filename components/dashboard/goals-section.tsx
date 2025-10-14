"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { GoalsSectionSkeleton } from "@/components/skeletons/goals-section-skeleton";
import { useGoals } from "@/hooks/use-goals";
import { useGoalSheet } from "@/components/dashboard/goal-sheet-provider";
import { GoalCard } from "@/components/goals/goal-card";
import { EditGoalDialog } from "@/components/goals/edit-goal-dialog";
import { DeleteGoalDialog } from "@/components/goals/delete-goal-dialog";
import { useGoalManagement } from "@/hooks/use-goal-management";

export function GoalsSection() {
  const { goals, loading, refreshing, error, fetchGoals } = useGoals();
  const { openSheet } = useGoalSheet();

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
    const onCreated = () => fetchGoals({ silent: true });
    if (typeof window !== "undefined") {
      window.addEventListener("goal-created", onCreated as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("goal-created", onCreated as EventListener);
      }
    };
  }, [fetchGoals]);

  const handleRefresh = () => fetchGoals({ silent: true });

  const showSkeleton = loading && !refreshing;

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Mis Metas
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={() => openSheet()}>
            Crear meta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSkeleton && <GoalsSectionSkeleton />}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">No pudimos cargar tus metas</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && goals.length === 0 && (
          <div className="rounded-lg border border-dashed bg-white/50 dark:bg-gray-800/40 px-6 py-10 text-center">
            <Target className="mx-auto h-10 w-10 text-blue-500" />
            <h3 className="mt-4 text-base font-semibold">Aún no tienes metas activas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primera meta para comenzar a compartir tu progreso con la comunidad.
            </p>
            <Button className="mt-4" onClick={() => openSheet()}>
              Crear mi primera meta
            </Button>
          </div>
        )}

        {!loading && !error && goals.length > 0 && (
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                layout="single-column"
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </CardContent>
      {/* CreateGoalSheet is provided globally by GoalSheetProvider */}

      {/* Diálogos de edición y eliminación */}
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
    </Card>
  );
}
