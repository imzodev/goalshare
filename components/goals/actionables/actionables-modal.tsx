"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserGoalSummary } from "@/types/goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, ListChecks } from "lucide-react";
import { ActionablesSuggestionsList } from "./actionables-suggestions-list";
import { ActionablesExistingList } from "./actionables-existing-list";
import { useActionableForm } from "@/hooks/use-actionable-form";
import { useActionablesApi } from "@/hooks/use-actionables-api";

interface ActionableSuggestion {
  title: string;
  description?: string;
  recurrence?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  durationMinutes?: number;
  timezone?: string;
  isPaused?: boolean;
  pausedUntil?: string;
  isArchived?: boolean;
  color?: string;
  category?: string;
  priority?: number;
  reminderMinutesBefore?: number;
  exDates?: string;
}

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
  const [selectedGoalId, setSelectedGoalId] = useState<string | "">(initialGoalId ?? "");
  const [suggestions, setSuggestions] = useState<ActionableSuggestion[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [editingSuggestionIndex, setEditingSuggestionIndex] = useState<number | null>(null);
  const [editingExistingId, setEditingExistingId] = useState<string | null>(null);

  // Form state for editing existing actionables
  const {
    formData: editFormData,
    resetForm: resetEditForm,
    populateFromActionable: populateEditFromActionable,
    updateField: updateEditField,
    buildActionableData: buildEditActionableData,
  } = useActionableForm();

  // Form state for editing suggestions
  const {
    formData: suggFormData,
    resetForm: resetSuggForm,
    updateField: updateSuggField,
    buildActionableData: buildSuggActionableData,
  } = useActionableForm();

  // API hooks
  const {
    existing,
    loadingExisting,
    loadingSuggestions,
    saving,
    loadExistingActionables,
    generateSuggestions,
    saveSelectedSuggestions,
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

  const handleGenerate = async () => {
    if (!selectedGoalId) return;
    const newSuggestions = await generateSuggestions();
    setSuggestions(newSuggestions ?? []);
    setSelectedIndexes(new Set());
  };

  const handleToggleIndex = (idx: number) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSaveSelected = async () => {
    if (!selectedGoalId || selectedIndexes.size === 0) return;
    const success = await saveSelectedSuggestions(suggestions, selectedIndexes);
    if (success) {
      setSuggestions([]);
      setSelectedIndexes(new Set());
    }
  };

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

  const handleStartEditingSuggestion = (idx: number) => {
    const s = suggestions[idx];
    if (!s) return;
    setEditingSuggestionIndex(idx);
    populateEditFromActionable({
      recurrence: s.recurrence ?? null,
      startDate: s.startDate ?? null,
      endDate: s.endDate ?? null,
      startTime: s.startTime ?? null,
      durationMinutes: s.durationMinutes ?? null,
      timezone: s.timezone ?? null,
      isPaused: s.isPaused ?? null,
      pausedUntil: s.pausedUntil ?? null,
      isArchived: s.isArchived ?? null,
      color: s.color ?? null,
      category: s.category ?? null,
      priority: s.priority ?? null,
      reminderMinutesBefore: s.reminderMinutesBefore ?? null,
      exDates: s.exDates ?? null,
    });
  };

  const handleCancelEditingSuggestion = () => {
    setEditingSuggestionIndex(null);
    resetSuggForm();
  };

  const handleSaveEditingSuggestion = async (idx: number) => {
    const data = buildSuggActionableData();
    setSuggestions((prev) => {
      const next = [...prev];
      const current = next[idx];
      if (!current) return prev;
      next[idx] = {
        ...current,
        ...data,
      };
      return next;
    });
    setEditingSuggestionIndex(null);
    resetSuggForm();
  };

  const handleEditFormDataChange = (key: string, value: unknown) => {
    updateEditField(key as Parameters<typeof updateEditField>[0], value);
  };

  const handleSuggFormDataChange = (data: Record<string, unknown>) => {
    Object.entries(data).forEach(([key, value]) => {
      updateSuggField(key as Parameters<typeof updateSuggField>[0], value);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Plan de accionables
          </DialogTitle>
          <DialogDescription>
            Selecciona una meta, genera un plan con IA y guarda los accionables que quieras seguir en tu calendario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="space-y-2">
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

          <div className="flex items-center justify-between gap-2">
            <Button size="sm" onClick={handleGenerate} disabled={!selectedGoalId || loadingSuggestions}>
              <Sparkles className="h-4 w-4 mr-2" />
              {loadingSuggestions ? "Generando..." : "Generar con IA"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveSelected}
              disabled={selectedIndexes.size === 0 || saving}
            >
              <ListChecks className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar seleccionados"}
            </Button>
          </div>

          <ScrollArea className="flex-1 rounded-md border bg-background p-2">
            <div className="space-y-3">
              {suggestions.length > 0 && (
                <ActionablesSuggestionsList
                  suggestions={suggestions}
                  selectedIndexes={selectedIndexes}
                  onToggleIndex={handleToggleIndex}
                  onEditStart={handleStartEditingSuggestion}
                  onEditCancel={handleCancelEditingSuggestion}
                  onEditSave={handleSaveEditingSuggestion}
                  editingIndex={editingSuggestionIndex}
                  editingFormData={suggFormData as unknown as Record<string, unknown> | null}
                  onEditFormDataChange={handleSuggFormDataChange}
                  loading={loadingSuggestions}
                />
              )}

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
      </DialogContent>
    </Dialog>
  );
}
