"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserGoalSummary } from "@/types/goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, ListChecks } from "lucide-react";

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

const DAY_LABELS: Record<string, string> = {
  MO: "Lu",
  TU: "Ma",
  WE: "Mi",
  TH: "Ju",
  FR: "Vi",
  SA: "Sa",
  SU: "Do",
};

function normalizeRecurrence(rule: string | null | undefined): string | undefined {
  if (!rule) return undefined;
  let cleaned = rule.trim();
  if (!cleaned) return undefined;
  if (cleaned.toUpperCase().startsWith("RRULE:")) {
    cleaned = cleaned.slice("RRULE:".length).trim();
  }
  if (!/FREQ=/i.test(cleaned)) return undefined;
  return cleaned;
}

function formatRecurrenceLabel(rule: string | null): string | null {
  if (!rule) return null;
  try {
    let cleaned = rule.trim();
    if (cleaned.toUpperCase().startsWith("RRULE:")) {
      cleaned = cleaned.slice("RRULE:".length);
    }

    if (!/FREQ=/i.test(cleaned)) {
      return null;
    }

    const parts = cleaned.split(";");
    const map: Record<string, string> = {};
    for (const part of parts) {
      const [k, v] = part.split("=");
      if (k && v) map[k.toUpperCase()] = v;
    }
    const freq = map["FREQ"];
    if (!freq) return null;

    const intervalRaw = map["INTERVAL"];
    const interval = intervalRaw ? Number(intervalRaw) || 1 : 1;
    const byDayRaw = map["BYDAY"];
    const byDayList = byDayRaw ? byDayRaw.split(",").map((d) => DAY_LABELS[d] ?? d) : [];

    if (freq === "DAILY") {
      if (interval <= 1) return "Diario";
      return `Cada ${interval} días`;
    }

    if (freq === "WEEKLY") {
      const base = interval <= 1 ? "Semanal" : `Cada ${interval} semanas`;
      if (byDayList.length > 0) {
        return `${base} (${byDayList.join(", ")})`;
      }
      return base;
    }

    if (freq === "MONTHLY") {
      if (interval <= 1) return "Mensual";
      return `Cada ${interval} meses`;
    }

    return null;
  } catch {
    return rule;
  }
}

export function ActionablesModal({ open, onOpenChange, goals, initialGoalId, onChanged }: ActionablesModalProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | "">(initialGoalId ?? "");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<ActionableSuggestion[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
  const [existing, setExisting] = useState<ExistingActionable[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("07:30");
  const [editDurationMinutes, setEditDurationMinutes] = useState("15");
  const [editTimezone, setEditTimezone] = useState("");
  const [editIsPaused, setEditIsPaused] = useState(false);
  const [editPausedUntil, setEditPausedUntil] = useState("");
  const [editIsArchived, setEditIsArchived] = useState(false);
  const [editColor, setEditColor] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState("3");
  const [editReminderMinutesBefore, setEditReminderMinutesBefore] = useState("");
  const [editExDates, setEditExDates] = useState("");
  const [editFreq, setEditFreq] = useState("");
  const [editInterval, setEditInterval] = useState("1");
  const [editDays, setEditDays] = useState<string[]>([]);
  const [editingSuggestionIndex, setEditingSuggestionIndex] = useState<number | null>(null);
  const [suggFreq, setSuggFreq] = useState("");
  const [suggInterval, setSuggInterval] = useState("1");
  const [suggStartDate, setSuggStartDate] = useState("");
  const [suggEndDate, setSuggEndDate] = useState("");
  const [suggDays, setSuggDays] = useState<string[]>([]);
  const [suggStartTime, setSuggStartTime] = useState("07:30");
  const [suggDurationMinutes, setSuggDurationMinutes] = useState("15");
  const [suggTimezone, setSuggTimezone] = useState("");
  const [suggIsPaused, setSuggIsPaused] = useState(false);
  const [suggPausedUntil, setSuggPausedUntil] = useState("");
  const [suggIsArchived, setSuggIsArchived] = useState(false);
  const [suggColor, setSuggColor] = useState("");
  const [suggCategory, setSuggCategory] = useState("");
  const [suggPriority, setSuggPriority] = useState("3");
  const [suggReminderMinutesBefore, setSuggReminderMinutesBefore] = useState("");
  const [suggExDates, setSuggExDates] = useState("");

  const goalsOptions = useMemo(() => goals, [goals]);

  const browserTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    if (!selectedGoalId && goalsOptions.length > 0) {
      setSelectedGoalId(goalsOptions[0]!.id);
    }
  }, [selectedGoalId, goalsOptions]);

  useEffect(() => {
    if (!selectedGoalId) return;
    const load = async () => {
      try {
        setLoadingExisting(true);
        const res = await fetch(`/api/goals/${selectedGoalId}/actionables`);
        if (!res.ok) return;
        const data = await res.json();
        setExisting(data.actionables ?? []);
      } catch (e) {
        console.error("Error loading actionables", e);
      } finally {
        setLoadingExisting(false);
      }
    };
    load();
  }, [selectedGoalId]);

  const handleGenerate = async () => {
    if (!selectedGoalId) return;
    try {
      setLoadingSuggestions(true);
      setSuggestions([]);
      setSelectedIndexes(new Set());
      const res = await fetch(`/api/goals/${selectedGoalId}/generate-actionables`, { method: "POST" });
      if (!res.ok) {
        console.error("generate-actionables failed", await res.json().catch(() => undefined));
        return;
      }
      const data = await res.json();
      const rawList: unknown = data.actionables ?? data.actionables?.actionables ?? data.actionables;
      const list = Array.isArray(rawList)
        ? rawList
        : Array.isArray(data.actionables?.actionables)
          ? data.actionables.actionables
          : [];
      setSuggestions(list as ActionableSuggestion[]);
    } catch (e) {
      console.error("Error generating actionables", e);
    } finally {
      setLoadingSuggestions(false);
    }
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
    try {
      setSaving(true);
      const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;
      const defaultTimezone = browserTimeZone || "UTC";
      const items = Array.from(selectedIndexes)
        .map((idx) => suggestions[idx]!)
        .map((s) => ({
          title: s.title,
          description: s.description,
          recurrence: normalizeRecurrence(s.recurrence),
          startDate: s.startDate && dateRegex.test(String(s.startDate)) ? String(s.startDate).slice(0, 10) : undefined,
          endDate: s.endDate && dateRegex.test(String(s.endDate)) ? String(s.endDate).slice(0, 10) : undefined,
          startTime: typeof s.startTime === "string" ? s.startTime : "07:30:00",
          durationMinutes: typeof s.durationMinutes === "number" ? s.durationMinutes : 15,
          timezone: typeof s.timezone === "string" ? s.timezone : defaultTimezone,
          isPaused: typeof s.isPaused === "boolean" ? s.isPaused : undefined,
          pausedUntil: typeof s.pausedUntil === "string" && s.pausedUntil ? s.pausedUntil : undefined,
          isArchived: typeof s.isArchived === "boolean" ? s.isArchived : undefined,
          color: typeof s.color === "string" && s.color ? s.color : undefined,
          category: typeof s.category === "string" && s.category ? s.category : undefined,
          priority: typeof s.priority === "number" ? s.priority : undefined,
          reminderMinutesBefore: typeof s.reminderMinutesBefore === "number" ? s.reminderMinutesBefore : undefined,
          exDates: typeof s.exDates === "string" && s.exDates ? s.exDates : undefined,
        }));
      const res = await fetch(`/api/goals/${selectedGoalId}/actionables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => "<no-body>");
        console.error("Error saving actionables", res.status, errorText);
        return;
      }
      const data = await res.json();
      setExisting(data.actionables ?? existing);
      setSuggestions([]);
      setSelectedIndexes(new Set());
      onChanged?.();
    } catch (e) {
      console.error("Error saving actionables", e);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (a: ExistingActionable) => {
    setEditingId(a.id);
    const rule = a.recurrence ?? "";
    if (rule) {
      const parts = rule.split(";");
      const map: Record<string, string> = {};
      for (const part of parts) {
        const [k, v] = part.split("=");
        if (k && v) map[k.toUpperCase()] = v;
      }
      setEditFreq(map["FREQ"] ?? "");
      setEditInterval(map["INTERVAL"] ?? "1");
      setEditDays(map["BYDAY"] ? map["BYDAY"].split(",") : []);
    } else {
      setEditFreq("");
      setEditInterval("1");
      setEditDays([]);
    }
    setEditStartDate(a.startDate ? String(a.startDate).slice(0, 10) : "");
    setEditEndDate(a.endDate ? String(a.endDate).slice(0, 10) : "");
    setEditStartTime(a.startTime ? String(a.startTime).slice(0, 5) : "07:30");
    setEditDurationMinutes(a.durationMinutes != null ? String(a.durationMinutes) : "15");
    setEditTimezone(a.timezone ?? browserTimeZone ?? "UTC");
    setEditIsPaused(Boolean(a.isPaused));
    setEditPausedUntil(a.pausedUntil ? new Date(a.pausedUntil).toISOString().slice(0, 16) : "");
    setEditIsArchived(Boolean(a.isArchived));
    setEditColor(a.color ?? "");
    setEditCategory(a.category ?? "");
    setEditPriority(a.priority != null ? String(a.priority) : "3");
    setEditReminderMinutesBefore(a.reminderMinutesBefore != null ? String(a.reminderMinutesBefore) : "");
    setEditExDates(a.exDates ?? "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStartDate("");
    setEditEndDate("");
    setEditStartTime("07:30");
    setEditDurationMinutes("15");
    setEditTimezone("");
    setEditIsPaused(false);
    setEditPausedUntil("");
    setEditIsArchived(false);
    setEditColor("");
    setEditCategory("");
    setEditPriority("3");
    setEditReminderMinutesBefore("");
    setEditExDates("");
    setEditFreq("");
    setEditInterval("1");
    setEditDays([]);
  };

  const startEditingSuggestion = (idx: number) => {
    const s = suggestions[idx];
    if (!s) return;
    setEditingSuggestionIndex(idx);

    const rule = s.recurrence ?? "";
    if (rule) {
      const parts = rule.split(";");
      const map: Record<string, string> = {};
      for (const part of parts) {
        const [k, v] = part.split("=");
        if (k && v) map[k.toUpperCase()] = v;
      }
      setSuggFreq(map["FREQ"] ?? "");
      setSuggInterval(map["INTERVAL"] ?? "1");
      setSuggDays(map["BYDAY"] ? map["BYDAY"].split(",") : []);
    } else {
      setSuggFreq("");
      setSuggInterval("1");
      setSuggDays([]);
    }

    setSuggStartDate(s.startDate ? String(s.startDate).slice(0, 10) : "");
    setSuggEndDate(s.endDate ? String(s.endDate).slice(0, 10) : "");
    setSuggStartTime(s.startTime ? String(s.startTime).slice(0, 5) : "07:30");
    setSuggDurationMinutes(s.durationMinutes != null ? String(s.durationMinutes) : "15");
    setSuggTimezone(s.timezone ?? browserTimeZone ?? "UTC");
    setSuggIsPaused(Boolean(s.isPaused));
    setSuggPausedUntil(s.pausedUntil ? new Date(s.pausedUntil).toISOString().slice(0, 16) : "");
    setSuggIsArchived(Boolean(s.isArchived));
    setSuggColor(s.color ?? "");
    setSuggCategory(s.category ?? "");
    setSuggPriority(s.priority != null ? String(s.priority) : "3");
    setSuggReminderMinutesBefore(s.reminderMinutesBefore != null ? String(s.reminderMinutesBefore) : "");
    setSuggExDates(s.exDates ?? "");
  };

  const cancelEditingSuggestion = () => {
    setEditingSuggestionIndex(null);
    setSuggFreq("");
    setSuggInterval("1");
    setSuggDays([]);
    setSuggStartDate("");
    setSuggEndDate("");
    setSuggStartTime("07:30");
    setSuggDurationMinutes("15");
    setSuggTimezone("");
    setSuggIsPaused(false);
    setSuggPausedUntil("");
    setSuggIsArchived(false);
    setSuggColor("");
    setSuggCategory("");
    setSuggPriority("3");
    setSuggReminderMinutesBefore("");
    setSuggExDates("");
  };

  const applyEditingSuggestion = () => {
    if (editingSuggestionIndex === null) return;

    let recurrence: string | undefined = undefined;
    if (suggFreq) {
      const parts: string[] = [];
      parts.push(`FREQ=${suggFreq}`);
      const intVal = parseInt(suggInterval || "1", 10);
      if (!Number.isNaN(intVal) && intVal > 1) {
        parts.push(`INTERVAL=${intVal}`);
      }
      if (suggFreq === "WEEKLY" && suggDays.length > 0) {
        parts.push(`BYDAY=${suggDays.join(",")}`);
      }
      recurrence = parts.join(";");
    }

    setSuggestions((prev) => {
      const next = [...prev];
      const current = next[editingSuggestionIndex!];
      if (!current) return prev;
      next[editingSuggestionIndex!] = {
        ...current,
        recurrence: normalizeRecurrence(recurrence),
        startDate: suggStartDate || undefined,
        endDate: suggEndDate || undefined,
        startTime: suggStartTime ? `${suggStartTime}:00` : undefined,
        durationMinutes: suggDurationMinutes ? Number(suggDurationMinutes) || 15 : undefined,
        timezone: suggTimezone || browserTimeZone || "UTC",
        isPaused: suggIsPaused,
        pausedUntil: suggPausedUntil ? new Date(suggPausedUntil).toISOString() : undefined,
        isArchived: suggIsArchived,
        color: suggColor || undefined,
        category: suggCategory || undefined,
        priority: suggPriority ? Number(suggPriority) || 3 : undefined,
        reminderMinutesBefore: suggReminderMinutesBefore ? Number(suggReminderMinutesBefore) || undefined : undefined,
        exDates: suggExDates || undefined,
      };
      return next;
    });

    cancelEditingSuggestion();
  };

  const handleUpdateExisting = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      let recurrence: string | null = null;
      if (editFreq) {
        const parts: string[] = [];
        parts.push(`FREQ=${editFreq}`);
        const intVal = parseInt(editInterval || "1", 10);
        if (!Number.isNaN(intVal) && intVal > 1) {
          parts.push(`INTERVAL=${intVal}`);
        }
        if (editFreq === "WEEKLY" && editDays.length > 0) {
          parts.push(`BYDAY=${editDays.join(",")}`);
        }
        recurrence = parts.join(";");
      }

      const body: Record<string, unknown> = {
        recurrence: normalizeRecurrence(recurrence),
        startDate: editStartDate || undefined,
        endDate: editEndDate || undefined,
        startTime: editStartTime ? `${editStartTime}:00` : undefined,
        durationMinutes: editDurationMinutes ? Number(editDurationMinutes) || undefined : undefined,
        timezone: editTimezone || browserTimeZone || "UTC",
        isPaused: editIsPaused,
        pausedUntil: editPausedUntil ? new Date(editPausedUntil).toISOString() : undefined,
        isArchived: editIsArchived,
        color: editColor || undefined,
        category: editCategory || undefined,
        priority: editPriority ? Number(editPriority) || 3 : undefined,
        reminderMinutesBefore: editReminderMinutesBefore ? Number(editReminderMinutesBefore) || undefined : undefined,
        exDates: editExDates || undefined,
      };

      const res = await fetch(`/api/actionables/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error("Error updating actionable", await res.json().catch(() => undefined));
        return;
      }
      const data = await res.json();
      const updated = data.actionable as ExistingActionable;
      setExisting((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
      cancelEditing();
      onChanged?.();
    } catch (e) {
      console.error("Error updating actionable", e);
    } finally {
      setSaving(false);
    }
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
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Sugerencias de IA
                  </p>
                  <div className="space-y-2">
                    {suggestions.map((s, idx) => {
                      const checked = selectedIndexes.has(idx);
                      const isEditingSuggestion = editingSuggestionIndex === idx;
                      return (
                        <div
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleToggleIndex(idx)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") handleToggleIndex(idx);
                          }}
                          className={`w-full rounded-md border px-3 py-2 text-sm transition hover:bg-muted cursor-pointer ${checked ? "border-purple-400 bg-purple-50/70 dark:bg-purple-900/20" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-medium truncate">{s.title}</span>
                            <div className="flex items-center gap-2">
                              {checked && <Badge variant="outline">Seleccionado</Badge>}
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-[11px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isEditingSuggestion) {
                                    cancelEditingSuggestion();
                                  } else {
                                    startEditingSuggestion(idx);
                                  }
                                }}
                              >
                                {isEditingSuggestion ? "Cerrar" : "Editar"}
                              </Button>
                            </div>
                          </div>
                          {s.description && !isEditingSuggestion && (
                            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{s.description}</p>
                          )}
                          {!isEditingSuggestion ? (
                            <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                              {(() => {
                                const label = formatRecurrenceLabel(s.recurrence ?? null);
                                return label ? <Badge variant="outline">{label}</Badge> : null;
                              })()}
                              {s.startDate && <Badge variant="outline">Inicio: {s.startDate}</Badge>}
                              {s.endDate && <Badge variant="outline">Fin: {s.endDate}</Badge>}
                            </div>
                          ) : null}

                          {isEditingSuggestion && (
                            <div className="mt-2 space-y-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-frequency-${idx}`}>
                                  Frecuencia
                                </label>
                                <select
                                  id={`sugg-frequency-${idx}`}
                                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                  value={suggFreq}
                                  onChange={(e) => setSuggFreq(e.target.value)}
                                >
                                  <option value="">Sin recurrencia</option>
                                  <option value="DAILY">Diario</option>
                                  <option value="WEEKLY">Semanal</option>
                                  <option value="MONTHLY">Mensual</option>
                                </select>
                              </div>
                              {(suggFreq === "WEEKLY" || suggFreq === "MONTHLY") && (
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-interval-${idx}`}>
                                    Cada
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min={1}
                                      id={`sugg-interval-${idx}`}
                                      className="w-16 rounded-md border bg-background px-2 py-1 text-xs"
                                      value={suggInterval}
                                      onChange={(e) => setSuggInterval(e.target.value)}
                                    />
                                    <span className="text-[11px] text-muted-foreground">
                                      {suggFreq === "WEEKLY" ? "semana(s)" : "mes(es)"}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {suggFreq === "WEEKLY" && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[11px] text-muted-foreground">Días de la semana</span>
                                  <div className="flex flex-wrap gap-1">
                                    {[
                                      { code: "MO", label: "Lu" },
                                      { code: "TU", label: "Ma" },
                                      { code: "WE", label: "Mi" },
                                      { code: "TH", label: "Ju" },
                                      { code: "FR", label: "Vi" },
                                      { code: "SA", label: "Sa" },
                                      { code: "SU", label: "Do" },
                                    ].map((d) => {
                                      const active = suggDays.includes(d.code);
                                      return (
                                        <button
                                          key={d.code}
                                          type="button"
                                          className={`rounded-md border px-2 py-0.5 text-[11px] ${active ? "bg-primary text-primary-foreground" : "bg-background"}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSuggDays((prev) =>
                                              prev.includes(d.code)
                                                ? prev.filter((x) => x !== d.code)
                                                : [...prev, d.code]
                                            );
                                          }}
                                        >
                                          {d.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-start-${idx}`}>
                                    Inicio
                                  </label>
                                  <input
                                    type="date"
                                    id={`sugg-start-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggStartDate}
                                    onChange={(e) => setSuggStartDate(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-end-${idx}`}>
                                    Fin
                                  </label>
                                  <input
                                    type="date"
                                    id={`sugg-end-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggEndDate}
                                    onChange={(e) => setSuggEndDate(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-time-${idx}`}>
                                    Hora
                                  </label>
                                  <input
                                    type="time"
                                    id={`sugg-time-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggStartTime}
                                    onChange={(e) => setSuggStartTime(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-duration-${idx}`}>
                                    Duración (min)
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    id={`sugg-duration-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggDurationMinutes}
                                    onChange={(e) => setSuggDurationMinutes(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-tz-${idx}`}>
                                  Timezone
                                </label>
                                <input
                                  type="text"
                                  id={`sugg-tz-${idx}`}
                                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                  value={suggTimezone}
                                  onChange={(e) => setSuggTimezone(e.target.value)}
                                  placeholder={browserTimeZone || "UTC"}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-2">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-paused-${idx}`}>
                                    Pausado
                                  </label>
                                  <input
                                    type="checkbox"
                                    id={`sugg-paused-${idx}`}
                                    checked={suggIsPaused}
                                    onChange={(e) => setSuggIsPaused(e.target.checked)}
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-2">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-archived-${idx}`}>
                                    Archivado
                                  </label>
                                  <input
                                    type="checkbox"
                                    id={`sugg-archived-${idx}`}
                                    checked={suggIsArchived}
                                    onChange={(e) => setSuggIsArchived(e.target.checked)}
                                  />
                                </div>
                              </div>

                              {suggIsPaused && (
                                <div className="flex flex-col gap-1">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`sugg-paused-until-${idx}`}
                                  >
                                    Pausado hasta
                                  </label>
                                  <input
                                    type="datetime-local"
                                    id={`sugg-paused-until-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggPausedUntil}
                                    onChange={(e) => setSuggPausedUntil(e.target.value)}
                                  />
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-color-${idx}`}>
                                    Color
                                  </label>
                                  <input
                                    type="color"
                                    id={`sugg-color-${idx}`}
                                    className="h-8 w-full rounded-md border bg-background px-1 py-1"
                                    value={suggColor || "#6366f1"}
                                    onChange={(e) => setSuggColor(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-category-${idx}`}>
                                    Categoría
                                  </label>
                                  <input
                                    type="text"
                                    id={`sugg-category-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggCategory}
                                    onChange={(e) => setSuggCategory(e.target.value)}
                                    placeholder="Ej: Salud"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-priority-${idx}`}>
                                    Prioridad
                                  </label>
                                  <select
                                    id={`sugg-priority-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggPriority}
                                    onChange={(e) => setSuggPriority(e.target.value)}
                                  >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-reminder-${idx}`}>
                                    Recordatorio (min)
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    id={`sugg-reminder-${idx}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={suggReminderMinutesBefore}
                                    onChange={(e) => setSuggReminderMinutesBefore(e.target.value)}
                                    placeholder="Ej: 10"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-muted-foreground" htmlFor={`sugg-exdates-${idx}`}>
                                  ExDates (CSV)
                                </label>
                                <input
                                  type="text"
                                  id={`sugg-exdates-${idx}`}
                                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                  value={suggExDates}
                                  onChange={(e) => setSuggExDates(e.target.value)}
                                  placeholder="YYYY-MM-DD,YYYY-MM-DD"
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-[11px]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEditingSuggestion();
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-6 px-2 text-[11px]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyEditingSuggestion();
                                  }}
                                >
                                  Aplicar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <ListChecks className="h-3 w-3" /> Accionables existentes
                </p>
                {loadingExisting ? (
                  <p className="text-xs text-muted-foreground">Cargando accionables...</p>
                ) : existing.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aún no has creado accionables para esta meta.</p>
                ) : (
                  <div className="space-y-2">
                    {existing.map((a) => {
                      const isEditing = editingId === a.id;
                      return (
                        <div key={a.id} className="rounded-md border px-3 py-2 text-sm bg-muted/40 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">{a.title}</span>
                            {!isEditing && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[11px]"
                                onClick={() => startEditing(a)}
                              >
                                Editar
                              </Button>
                            )}
                          </div>
                          {a.description && !isEditing && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                          )}

                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-muted-foreground" htmlFor={`edit-freq-${a.id}`}>
                                  Frecuencia
                                </label>
                                <select
                                  id={`edit-freq-${a.id}`}
                                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                  value={editFreq}
                                  onChange={(e) => setEditFreq(e.target.value)}
                                >
                                  <option value="">Sin recurrencia</option>
                                  <option value="DAILY">Diario</option>
                                  <option value="WEEKLY">Semanal</option>
                                  <option value="MONTHLY">Mensual</option>
                                </select>
                              </div>
                              {(editFreq === "WEEKLY" || editFreq === "MONTHLY") && (
                                <div className="flex flex-col gap-1">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`edit-interval-${a.id}`}
                                  >
                                    Cada
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min={1}
                                      id={`edit-interval-${a.id}`}
                                      className="w-16 rounded-md border bg-background px-2 py-1 text-xs"
                                      value={editInterval}
                                      onChange={(e) => setEditInterval(e.target.value)}
                                    />
                                    <span className="text-[11px] text-muted-foreground">
                                      {editFreq === "WEEKLY" ? "semana(s)" : "mes(es)"}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {editFreq === "WEEKLY" && (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[11px] text-muted-foreground">Días de la semana</span>
                                  <div className="flex flex-wrap gap-1">
                                    {[
                                      { code: "MO", label: "Lu" },
                                      { code: "TU", label: "Ma" },
                                      { code: "WE", label: "Mi" },
                                      { code: "TH", label: "Ju" },
                                      { code: "FR", label: "Vi" },
                                      { code: "SA", label: "Sa" },
                                      { code: "SU", label: "Do" },
                                    ].map((d) => {
                                      const active = editDays.includes(d.code);
                                      return (
                                        <button
                                          key={d.code}
                                          type="button"
                                          className={`rounded-md border px-2 py-0.5 text-[11px] ${active ? "bg-primary text-primary-foreground" : "bg-background"}`}
                                          onClick={() => {
                                            setEditDays((prev) =>
                                              prev.includes(d.code)
                                                ? prev.filter((x) => x !== d.code)
                                                : [...prev, d.code]
                                            );
                                          }}
                                        >
                                          {d.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`edit-start-${a.id}`}>
                                    Inicio
                                  </label>
                                  <input
                                    type="date"
                                    id={`edit-start-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editStartDate}
                                    onChange={(e) => setEditStartDate(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`edit-end-${a.id}`}>
                                    Fin
                                  </label>
                                  <input
                                    type="date"
                                    id={`edit-end-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editEndDate}
                                    onChange={(e) => setEditEndDate(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`edit-time-${a.id}`}>
                                    Hora
                                  </label>
                                  <input
                                    type="time"
                                    id={`edit-time-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`edit-duration-${a.id}`}
                                  >
                                    Duración (min)
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    id={`edit-duration-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editDurationMinutes}
                                    onChange={(e) => setEditDurationMinutes(e.target.value)}
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-muted-foreground" htmlFor={`edit-tz-${a.id}`}>
                                  Timezone
                                </label>
                                <input
                                  type="text"
                                  id={`edit-tz-${a.id}`}
                                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                  value={editTimezone}
                                  onChange={(e) => setEditTimezone(e.target.value)}
                                  placeholder={browserTimeZone || "UTC"}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-2">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`edit-paused-${a.id}`}>
                                    Pausado
                                  </label>
                                  <input
                                    type="checkbox"
                                    id={`edit-paused-${a.id}`}
                                    checked={editIsPaused}
                                    onChange={(e) => setEditIsPaused(e.target.checked)}
                                  />
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-2">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`edit-archived-${a.id}`}
                                  >
                                    Archivado
                                  </label>
                                  <input
                                    type="checkbox"
                                    id={`edit-archived-${a.id}`}
                                    checked={editIsArchived}
                                    onChange={(e) => setEditIsArchived(e.target.checked)}
                                  />
                                </div>
                              </div>

                              {editIsPaused && (
                                <div className="flex flex-col gap-1">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`edit-paused-until-${a.id}`}
                                  >
                                    Pausado hasta
                                  </label>
                                  <input
                                    type="datetime-local"
                                    id={`edit-paused-until-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editPausedUntil}
                                    onChange={(e) => setEditPausedUntil(e.target.value)}
                                  />
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[11px] text-muted-foreground" htmlFor={`edit-color-${a.id}`}>
                                    Color
                                  </label>
                                  <input
                                    type="color"
                                    id={`edit-color-${a.id}`}
                                    className="h-8 w-full rounded-md border bg-background px-1 py-1"
                                    value={editColor || "#6366f1"}
                                    onChange={(e) => setEditColor(e.target.value)}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`edit-category-${a.id}`}
                                  >
                                    Categoría
                                  </label>
                                  <input
                                    type="text"
                                    id={`edit-category-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    placeholder="Ej: Salud"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`edit-priority-${a.id}`}
                                  >
                                    Prioridad
                                  </label>
                                  <select
                                    id={`edit-priority-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value)}
                                  >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label
                                    className="text-[11px] text-muted-foreground"
                                    htmlFor={`edit-reminder-${a.id}`}
                                  >
                                    Recordatorio (min)
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    id={`edit-reminder-${a.id}`}
                                    className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                    value={editReminderMinutesBefore}
                                    onChange={(e) => setEditReminderMinutesBefore(e.target.value)}
                                    placeholder="Ej: 10"
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-muted-foreground" htmlFor={`edit-exdates-${a.id}`}>
                                  ExDates (CSV)
                                </label>
                                <input
                                  type="text"
                                  id={`edit-exdates-${a.id}`}
                                  className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                                  value={editExDates}
                                  onChange={(e) => setEditExDates(e.target.value)}
                                  placeholder="YYYY-MM-DD,YYYY-MM-DD"
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-[11px]"
                                  onClick={cancelEditing}
                                  disabled={saving}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-7 px-3 text-[11px]"
                                  onClick={handleUpdateExisting}
                                  disabled={saving}
                                >
                                  {saving ? "Guardando..." : "Guardar"}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
                              {(() => {
                                const label = formatRecurrenceLabel(a.recurrence);
                                return label ? <Badge variant="outline">{label}</Badge> : null;
                              })()}
                              {a.startDate && <Badge variant="outline">Inicio: {String(a.startDate)}</Badge>}
                              {a.endDate && <Badge variant="outline">Fin: {String(a.endDate)}</Badge>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
