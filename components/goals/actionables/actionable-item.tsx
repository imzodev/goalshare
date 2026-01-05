"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRecurrenceLabel } from "@/utils/actionables-utils";
import { EDIT_STATE_LABELS } from "@/constants/actionables";

interface ActionableItemProps {
  title: string;
  description?: string | null;
  recurrence?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isEditing?: boolean;
  isSuggestion?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onEdit?: () => void;
  onToggleSelect?: () => void;
  children?: React.ReactNode;
}

export function ActionableItem({
  title,
  description,
  recurrence,
  startDate,
  endDate,
  isEditing = false,
  isSuggestion = false,
  isSelectable = false,
  isSelected = false,
  onEdit,
  onToggleSelect,
  children,
}: ActionableItemProps) {
  return (
    <div
      role={isSelectable ? "button" : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onClick={isSelectable ? onToggleSelect : undefined}
      onKeyDown={
        isSelectable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onToggleSelect?.();
            }
          : undefined
      }
      className={`w-full rounded-md border px-3 py-2 text-sm bg-muted/40 flex flex-col gap-2 ${
        isSelectable
          ? `transition hover:bg-muted cursor-pointer ${isSelected ? "border-purple-400 bg-purple-50/70 dark:bg-purple-900/20" : ""}`
          : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium truncate">{title}</span>
        <div className="flex items-center gap-2">
          {isSelected && <Badge variant="outline">{EDIT_STATE_LABELS.SELECTED}</Badge>}
          {!isEditing && onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              {EDIT_STATE_LABELS.EDIT}
            </Button>
          )}
        </div>
      </div>
      {description && !isEditing && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}

      {!isEditing ? (
        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
          {(() => {
            const label = formatRecurrenceLabel(recurrence ?? null);
            return label ? <Badge variant="outline">{label}</Badge> : null;
          })()}
          {startDate && <Badge variant="outline">Inicio: {startDate}</Badge>}
          {endDate && <Badge variant="outline">Fin: {endDate}</Badge>}
        </div>
      ) : null}

      {isEditing && children}
    </div>
  );
}
