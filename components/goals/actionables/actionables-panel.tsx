"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserGoalSummary } from "@/types/goals";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
}

interface ExistingActionable {
  id: string;
  title: string;
  description: string | null;
  recurrence: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface ActionablesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: UserGoalSummary[];
  initialGoalId?: string | null;
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
  // Solo aceptamos strings que parecen RRULE válidas
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

    // Si no parece una RRULE con FREQ=, no mostramos nada
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

export function ActionablesPanel({ open, onOpenChange, goals, initialGoalId }: ActionablesPanelProps) {
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
  const [editFreq, setEditFreq] = useState("");
  const [editInterval, setEditInterval] = useState("1");
  const [editDays, setEditDays] = useState<string[]>([]);
  const [editingSuggestionIndex, setEditingSuggestionIndex] = useState<number | null>(null);
  const [suggFreq, setSuggFreq] = useState("");
  const [suggInterval, setSuggInterval] = useState("1");
  const [suggStartDate, setSuggStartDate] = useState("");
  const [suggEndDate, setSuggEndDate] = useState("");
  const [suggDays, setSuggDays] = useState<string[]>([]);

  const goalsOptions = useMemo(() => goals, [goals]);

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
      const items = Array.from(selectedIndexes)
        .map((idx) => suggestions[idx]!)
        .map((s) => ({
          title: s.title,
          description: s.description,
          recurrence: normalizeRecurrence(s.recurrence),
          startDate: s.startDate && dateRegex.test(String(s.startDate)) ? String(s.startDate).slice(0, 10) : undefined,
          endDate: s.endDate && dateRegex.test(String(s.endDate)) ? String(s.endDate).slice(0, 10) : undefined,
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
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStartDate("");
    setEditEndDate("");
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
  };

  const cancelEditingSuggestion = () => {
    setEditingSuggestionIndex(null);
    setSuggFreq("");
    setSuggInterval("1");
    setSuggDays([]);
    setSuggStartDate("");
    setSuggEndDate("");
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
    } catch (e) {
      console.error("Error updating actionable", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex h-full flex-col gap-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" /> Plan de accionables
          </SheetTitle>
          <SheetDescription>
            Selecciona una meta, genera un plan con IA y guarda los accionables que quieras seguir en tu calendario.
          </SheetDescription>
        </SheetHeader>

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

          <ScrollArea className="flex-1 rounded-md border bg-background p-2 max-h-[calc(100vh-220px)]">
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
      </SheetContent>
    </Sheet>
  );
}
