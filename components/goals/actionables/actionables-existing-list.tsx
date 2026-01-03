"use client";

import { ListChecks } from "lucide-react";
import { ActionableForm } from "./actionable-form";
import { ActionableItem } from "./actionable-item";
import { formatRecurrenceLabel } from "@/utils/actionables-utils";

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

interface ActionablesExistingListProps {
  existing: ExistingActionable[];
  loading: boolean;
  editingId: string | null;
  onEditStart: (actionable: ExistingActionable) => void;
  onEditCancel: () => void;
  onEditSave: () => void;
  editingFormData: Record<string, unknown> | null;
  onEditFormDataChange: (key: string, value: unknown) => void;
  saving: boolean;
}

export function ActionablesExistingList({
  existing,
  loading,
  editingId,
  onEditStart,
  onEditCancel,
  onEditSave,
  editingFormData,
  onEditFormDataChange,
  saving,
}: ActionablesExistingListProps) {
  if (loading) {
    return <p className="text-xs text-muted-foreground">Cargando accionables...</p>;
  }

  if (existing.length === 0) {
    return <p className="text-xs text-muted-foreground">Aún no has creado accionables para esta meta.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
        <ListChecks className="h-3 w-3" /> Accionables existentes
      </p>
      <div className="space-y-2">
        {existing.map((a) => {
          const isEditing = editingId === a.id;
          return (
            <ActionableItem
              key={a.id}
              title={a.title}
              description={a.description}
              recurrence={a.recurrence}
              startDate={a.startDate}
              endDate={a.endDate}
              isEditing={isEditing}
              onEdit={() => onEditStart(a)}
            >
              {isEditing && (
                <ActionableForm
                  isSuggestion={false}
                  actionable={a}
                  onCancel={onEditCancel}
                  onSave={onEditSave}
                  onChange={(key, value) => onEditFormDataChange(key, value)}
                />
              )}
            </ActionableItem>
          );
        })}
      </div>
    </div>
  );
}
