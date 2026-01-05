"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserGoalSummary } from "@/types/goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Plus } from "lucide-react";
import { ActionablesExistingList } from "./actionables-existing-list";
import { useActionableForm } from "@/hooks/use-actionable-form";
import { useActionablesApi } from "@/hooks/use-actionables-api";
import { CreateActionableView } from "./create-actionable-view";

interface ExistingActionable {
  id: string;
  title: string;
  description: string | null;
  recurrence: string | null;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  durationMinutes: number | null;
  timezone: string | null;
  isPaused: boolean | null;
  pausedUntil: string | null;
  isArchived: boolean | null;
  color: string | null;
  category: string | null;
  priority: number | null;
  reminderMinutesBefore: number | null;
  exDates: string | null;
}

interface ActionablesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: UserGoalSummary[];
  initialGoalId?: string | null;
  onChanged?: () => void;
}

export function ActionablesModal({ open, onOpenChange, goals, initialGoalId, onChanged }: ActionablesModalProps) {
  const [view, setView] = useState<"list" | "create">("list");
  const [selectedGoalId, setSelectedGoalId] = useState<string | "">(initialGoalId ?? "");
  const [editingExistingId, setEditingExistingId] = useState<string | null>(null);

  // Form state for editing existing actionables
  const {
    formData: editFormData,
    resetForm: resetEditForm,
    populateFromActionable: populateEditFromActionable,
    updateField: updateEditField,
    buildActionableData: buildEditActionableData,
  } = useActionableForm();

  // API hooks
  const {
    existing,
    loadingExisting,
    saving,
    loadExistingActionables,
    updateActionable,
  } = useActionablesApi(selectedGoalId, onChanged);

  const goalsOptions = useMemo(() => goals, [goals]);

  useEffect(() => {
    if (!selectedGoalId && goalsOptions.length > 0) {
      setSelectedGoalId(goalsOptions[0]!.id);
    }
  }, [selectedGoalId, goalsOptions]);

  useEffect(() => {
    loadExistingActionables();
  }, [selectedGoalId, loadExistingActionables]);

  // Reset view when modal closes/opens
  useEffect(() => {
    if (open) {
      setView("list");
    }
  }, [open]);

  const handleStartEditing = (actionable: ExistingActionable) => {
    setEditingExistingId(actionable.id);
    populateEditFromActionable({
      recurrence: actionable.recurrence,
      startDate: actionable.startDate,
      endDate: actionable.endDate,
      startTime: actionable.startTime,
      durationMinutes: actionable.durationMinutes,
      timezone: actionable.timezone,
      isPaused: actionable.isPaused,
      pausedUntil: actionable.pausedUntil,
      isArchived: actionable.isArchived,
      color: actionable.color,
      category: actionable.category,
      priority: actionable.priority,
      reminderMinutesBefore: actionable.reminderMinutesBefore,
      exDates: actionable.exDates,
    });
  };

  const handleCancelEditing = () => {
    setEditingExistingId(null);
    resetEditForm();
  };

  const handleSaveEditing = async () => {
    if (!editingExistingId) return;
    const data = buildEditActionableData();
    const success = await updateActionable(editingExistingId, data);
    if (success) {
      handleCancelEditing();
    }
  };

  const handleEditFormDataChange = (key: string, value: unknown) => {
    updateEditField(key as Parameters<typeof updateEditField>[0], value);
  };

  const handleCreateSuccess = () => {
    setView("list");
    loadExistingActionables();
    onChanged?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={view !== "create"}
        className="sm:max-w-6xl w-full h-[85vh] p-0 gap-0 overflow-hidden flex flex-col"
      >
        {view === "create" ? (
          <CreateActionableView
            goals={goals}
            selectedGoalId={selectedGoalId}
            onCancel={() => setView("list")}
            onSuccess={handleCreateSuccess}
          />
        ) : (
          <>
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Plan de accionables
              </DialogTitle>
              <DialogDescription>
                Gestiona tus tareas y hábitos para alcanzar tus metas.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 flex-1 flex flex-col min-h-0 p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xs space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Meta objetivo</p>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                  >
                    {goalsOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button onClick={() => setView("create")} className="self-end bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Accionable
                </Button>
              </div>

              <ScrollArea className="flex-1 rounded-md border bg-background p-2">
                <div className="space-y-3">
                  <ActionablesExistingList
                    existing={existing}
                    loading={loadingExisting}
                    editingId={editingExistingId}
                    onEditStart={handleStartEditing}
                    onEditCancel={handleCancelEditing}
                    onEditSave={handleSaveEditing}
                    editingFormData={editFormData as unknown as Record<string, unknown> | null}
                    onEditFormDataChange={handleEditFormDataChange}
                    saving={saving}
                  />
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
