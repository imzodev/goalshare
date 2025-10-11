"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type MilestoneItem = { title: string; description?: string; dueDate?: string; weight: number };

type Props = {
  index: number;
  item: MilestoneItem;
  expanded: boolean;
  onToggle: () => void;
  onChangeTitle: (val: string) => void;
  onChangeDue: (val: string) => void;
  onChangeDescription: (val: string) => void;
  onChangeWeight: (val: number) => void;
};

export function MilestoneCard({
  index,
  item,
  expanded,
  onToggle,
  onChangeTitle,
  onChangeDue,
  onChangeDescription,
  onChangeWeight,
}: Props) {
  const weeksUntil = (date?: string) => {
    if (!date) return null;
    const due = new Date(date + "T00:00:00");
    if (isNaN(due.getTime())) return null;
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const weeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    return weeks;
  };

  const weeks = weeksUntil(item.dueDate);

  return (
    <div className="rounded-2xl border border-foreground/10 bg-card shadow-sm p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base font-semibold tracking-tight placeholder:text-muted-foreground/60"
          value={item.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder={`Hito ${index + 1}`}
        />
        <span className="rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500">
          {item.weight}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={onToggle}
          title={expanded ? "Ocultar detalles" : "Editar"}
        >
          ⋯
        </Button>
      </div>

      <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
        {weeks !== null
          ? `${weeks} semana${weeks === 1 ? "" : "s"} para completar`
          : item.dueDate
            ? item.dueDate
            : "Sin fecha"}
      </div>

      <div className="mt-2 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, item.weight))}%` }} />
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="space-y-1">
            <label htmlFor={`ms-${index}-due`} className="text-[11px] text-muted-foreground">
              Fecha objetivo (YYYY-MM-DD)
            </label>
            <Input
              id={`ms-${index}-due`}
              className="h-8"
              placeholder="YYYY-MM-DD"
              value={item.dueDate || ""}
              onChange={(e) => onChangeDue(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span id={`ms-${index}-weight-label`} className="text-[11px] text-muted-foreground">
                Peso (%)
              </span>
              <span className="text-[11px] text-muted-foreground">{item.weight}%</span>
            </div>
            <Slider
              aria-labelledby={`ms-${index}-weight-label`}
              value={[item.weight]}
              min={0}
              max={100}
              step={1}
              onValueChange={(vals) => {
                const val = typeof vals[0] === "number" ? vals[0] : item.weight;
                onChangeWeight(val);
              }}
            />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <label htmlFor={`ms-${index}-desc`} className="text-[11px] text-muted-foreground">
              Descripción
            </label>
            <Textarea
              id={`ms-${index}-desc`}
              placeholder="Descripción (opcional)"
              value={item.description || ""}
              onChange={(e) => onChangeDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
