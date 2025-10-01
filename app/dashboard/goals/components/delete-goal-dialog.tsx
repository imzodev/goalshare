"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import type { UserGoalSummary } from "@/types/goals";

type Props = {
  goal: UserGoalSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalDeleted?: () => void;
};

export function DeleteGoalDialog({ goal, open, onOpenChange, onGoalDeleted }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!goal) return;

    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/goals/${goal.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data?.error?.message || data?.error || "No se pudo eliminar la meta";
          setError(typeof msg === "string" ? msg : "No se pudo eliminar la meta");
          return;
        }

        // éxito
        onOpenChange(false);
        onGoalDeleted?.();
      } catch {
        setError("Error de red");
      }
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setError(null);
  };

  if (!goal) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-white/20">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle>Eliminar Meta</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                ¿Estás seguro de que quieres eliminar esta meta? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium text-sm mb-2">{goal.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
            {goal.deadline && (
              <p className="text-xs text-muted-foreground mt-2">
                Fecha límite: {new Date(goal.deadline).toLocaleDateString("es-MX")}
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Se eliminarán permanentemente todos los registros de progreso asociados a esta meta.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={pending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={pending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Eliminando...
              </>
            ) : (
              "Eliminar meta"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
