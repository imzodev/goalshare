"use client";

import { ActionableForm } from "./actionable-form";
import { ActionableItem } from "./actionable-item";

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

interface ActionablesSuggestionsListProps {
  suggestions: ActionableSuggestion[];
  selectedIndexes: Set<number>;
  onToggleIndex: (idx: number) => void;
  onEditStart: (idx: number) => void;
  onEditCancel: () => void;
  onEditSave: (idx: number, data: Record<string, unknown>) => void;
  editingIndex: number | null;
  editingFormData: Record<string, unknown> | null;
  onEditFormDataChange: (data: Record<string, unknown>) => void;
  loading: boolean;
}

export function ActionablesSuggestionsList({
  suggestions,
  selectedIndexes,
  onToggleIndex,
  onEditStart,
  onEditCancel,
  onEditSave,
  editingIndex,
  editingFormData,
  onEditFormDataChange,
  loading,
}: ActionablesSuggestionsListProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando sugerencias...</p>;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sugerencias de IA</p>
      <div className="space-y-2">
        {suggestions.map((s, idx) => {
          const checked = selectedIndexes.has(idx);
          const isEditing = editingIndex === idx;
          return (
            <ActionableItem
              key={idx}
              title={s.title}
              description={s.description ?? null}
              recurrence={s.recurrence ?? null}
              startDate={s.startDate ?? null}
              endDate={s.endDate ?? null}
              isEditing={isEditing}
              isSuggestion={true}
              isSelectable={true}
              isSelected={checked}
              onEdit={() => onEditStart(idx)}
              onToggleSelect={() => onToggleIndex(idx)}
            >
              {isEditing && (
                <ActionableForm
                  isSuggestion={true}
                  index={idx}
                  suggestion={s}
                  onCancel={onEditCancel}
                  onSave={() => onEditSave(idx, editingFormData ?? {})}
                  onChange={(key, value) => onEditFormDataChange({ ...editingFormData, [key]: value })}
                />
              )}
            </ActionableItem>
          );
        })}
      </div>
    </div>
  );
}
