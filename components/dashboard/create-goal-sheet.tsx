"use client";

import { useEffect, useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
};

export function CreateGoalSheet({ open, onOpenChange, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [topicCommunityId, setTopicCommunityId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [communities, setCommunities] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  // Milestones (two-step flow)
  type MilestoneItem = { title: string; description?: string; dueDate?: string; weight: number };
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const reset = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setTopicCommunityId("");
    setTemplateId("");
    setError(null);
    setMilestones([]);
    setGenerating(false);
    setPersisting(false);
    setStep("form");
  };

  // Set weight with 100% constraint: if increasing one, automatically reduce others to make room
  const setWeightWithConstraint = (index: number, desired: number) => {
    const next = [...milestones];
    if (index < 0 || index >= next.length) return;
    const current = next[index]?.weight ?? 0;
    const target = Math.max(0, Math.min(100, Math.round(desired)));
    if (target === current) return;

    const sumOthers = next.reduce((acc, m, i) => (i === index ? acc : acc + (Number(m.weight) || 0)), 0);
    const maxAllowed = Math.max(0, 100 - sumOthers);

    // If decreasing or within room, simple set
    if (target <= current || target <= maxAllowed) {
      next[index] = { ...next[index]!, weight: target } as (typeof next)[number];
      setMilestones(next);
      return;
    }

    // Need to free room: reduce others until we can reach target
    let need = target - Math.min(target, maxAllowed); // initial overflow relative to room
    // Actually we want to reach 'target'; total will be sumOthers + target.
    // Overflow above 100 is overflow = sumOthers + target - 100
    need = Math.max(0, sumOthers + target - 100);

    if (need > 0) {
      // Reduce from other milestones with weight > 0
      // Iterate starting after index, then wrap, to distribute reductions
      const order = [...Array(next.length).keys()].filter((i) => i !== index);
      // Prefer reducing from items with larger weight first
      order.sort((a, b) => (next[b]?.weight ?? 0) - (next[a]?.weight ?? 0));
      for (const i of order) {
        if (need <= 0) break;
        const w = next[i]?.weight ?? 0;
        if (w <= 0) continue;
        const take = Math.min(w, need);
        next[i] = { ...next[i]!, weight: w - take } as (typeof next)[number];
        need -= take;
      }
    }

    // Set the target (cap to ensure total <= 100)
    const newSumOthers = next.reduce((acc, m, i) => (i === index ? acc : acc + (Number(m.weight) || 0)), 0);
    const capped = Math.min(target, 100 - newSumOthers);
    next[index] = { ...next[index]!, weight: capped } as (typeof next)[number];
    setMilestones(next);
  };

  // UX helper: weeks until due date
  const weeksUntil = (date?: string) => {
    if (!date) return null;
    const due = new Date(date + "T00:00:00");
    if (isNaN(due.getTime())) return null;
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const weeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    return weeks;
  };

  // Helpers: weight summary and redistribution
  const weightSum = milestones.reduce((acc, m) => acc + (Number(m.weight) || 0), 0);
  const redistributeWeights = () => {
    const n = milestones.length;
    if (!n) return;
    const base = Math.floor(100 / n);
    const items: MilestoneItem[] = milestones.map((m, i) => ({
      ...m,
      weight: i < n - 1 ? base : 100 - base * (n - 1),
    }));
    setMilestones(items);
  };

  useEffect(() => {
    if (!open) return;
    setLoadingCommunities(true);
    fetch("/api/communities/topics", { method: "GET" })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setCommunities(data.communities ?? []);
        } else {
          console.warn("No se pudieron cargar comunidades", data?.error);
          setCommunities([]);
        }
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoadingCommunities(false));
  }, [open]);

  const handleSubmit = () => {
    setError(null);
    if (!title || title.length < 3) {
      setError("El título debe tener al menos 3 caracteres");
      return;
    }
    if (!description || description.length < 10) {
      setError("La descripción debe tener al menos 10 caracteres");
      return;
    }
    if (!topicCommunityId) {
      setError("Debes seleccionar una comunidad (topic)");
      return;
    }
    // Step 1 -> request AI milestones and go to preview
    generateMilestones();
  };

  const generateMilestones = async () => {
    try {
      setGenerating(true);
      const res = await fetch("/api/ai/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: `${title}. ${description}`.trim(),
          context: { deadline: deadline || undefined },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error || "No se pudieron generar milestones";
        setError(typeof msg === "string" ? msg : "No se pudieron generar milestones");
        setGenerating(false);
        return;
      }
      const items = Array.isArray(data?.milestones) ? data.milestones : [];
      setMilestones(items as MilestoneItem[]);
      setStep("preview");
    } catch {
      setError("Error de red");
    } finally {
      setGenerating(false);
    }
  };

  const persistGoalWithMilestones = () => {
    setError(null);
    startTransition(async () => {
      try {
        setPersisting(true);
        // 1) Create goal
        const resGoal = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            deadline: deadline || null,
            topicCommunityId,
            templateId: templateId || null,
          }),
        });
        const goalResp = await resGoal.json();
        if (!resGoal.ok) {
          const msg = goalResp?.error?.message || goalResp?.error || "No se pudo crear la meta";
          setError(typeof msg === "string" ? msg : "No se pudo crear la meta");
          setPersisting(false);
          return;
        }
        const goalId = goalResp?.goal?.id;
        if (!goalId) {
          setError("Respuesta inválida del servidor (sin goal.id)");
          setPersisting(false);
          return;
        }
        // 2) Persist milestones
        const resMs = await fetch(`/api/goals/${goalId}/milestones`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: milestones }),
        });
        const msResp = await resMs.json();
        if (!resMs.ok) {
          const msg = msResp?.error || "No se pudieron guardar los milestones";
          setError(typeof msg === "string" ? msg : "No se pudieron guardar los milestones");
          setPersisting(false);
          return;
        }
        // éxito total
        onOpenChange(false);
        reset();
        onCreated?.();
      } catch {
        setError("Error de red");
      } finally {
        setPersisting(false);
      }
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Crear nueva meta</SheetTitle>
          <SheetDescription>
            Define un título, una descripción y (opcional) una fecha límite. Después podrás revisar y ajustar los
            milestones sugeridos antes de guardar.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 px-4 space-y-4 flex-1 min-h-0 flex flex-col">
          {step === "form" ? (
            <>
              <div className="space-y-2">
                <label htmlFor="goal-title" className="text-sm font-medium">
                  Título
                </label>
                <Input
                  id="goal-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Correr 5K diarios"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="goal-description" className="text-sm font-medium">
                  Descripción
                </label>
                <Textarea
                  id="goal-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu meta y cómo la medirás"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="goal-deadline" className="text-sm font-medium">
                  Fecha límite (opcional)
                </label>
                <Input id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label htmlFor="goal-community" className="text-sm font-medium">
                  Comunidad (topic)
                </label>
                <Select value={topicCommunityId} onValueChange={setTopicCommunityId}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={loadingCommunities ? "Cargando comunidades..." : "Selecciona una comunidad"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.length === 0 && !loadingCommunities ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No hay comunidades disponibles</div>
                    ) : (
                      communities.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Elige la comunidad temática a la que pertenece tu meta.</p>
              </div>
            </>
          ) : (
            <div className="rounded-md border p-3 space-y-2 text-sm">
              <div className="font-medium">Resumen</div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{title || "Sin título"}</Badge>
                {deadline && <Badge variant="outline">{deadline}</Badge>}
                {topicCommunityId && (
                  <Badge variant="default">
                    {communities.find((c) => c.id === topicCommunityId)?.name || "Comunidad"}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={() => setStep("form")}>
                  Editar datos
                </Button>
              </div>
            </div>
          )}

          {/* Preview step (rediseño) */}
          {step === "preview" && (
            <div className="space-y-4 flex-1 min-h-0 flex flex-col">
              {/* Summary bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">Milestones propuestos</span>
                    <span className={weightSum === 100 ? "text-green-600" : "text-red-600"}>
                      Suma de pesos: {weightSum}%
                    </span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, weightSum))} />
                </div>
                <Button variant="outline" onClick={redistributeWeights} className="shrink-0">
                  Redistribuir pesos
                </Button>
              </div>

              <ScrollArea className="h-full pr-3 pb-28">
                <div className="space-y-3">
                  {milestones.map((m, idx) => {
                    const weeks = weeksUntil(m.dueDate);
                    return (
                      <div key={idx} className="rounded-2xl border border-foreground/10 bg-card shadow-sm p-3 sm:p-4">
                        {/* Header line (title + pill + menu) */}
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base font-semibold tracking-tight placeholder:text-muted-foreground/60"
                            value={m.title}
                            onChange={(e) => {
                              const copy: MilestoneItem[] = [...milestones];
                              copy[idx] = { ...copy[idx], title: e.target.value } as MilestoneItem;
                              setMilestones(copy);
                            }}
                            placeholder={`Hito ${idx + 1}`}
                          />
                          <span className="rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500">
                            {m.weight}%
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                            title={expanded[idx] ? "Ocultar detalles" : "Editar"}
                          >
                            ⋯
                          </Button>
                        </div>

                        {/* Subtitle */}
                        <div className="mt-1 text-xs sm:text-sm text-muted-foreground">
                          {weeks !== null
                            ? `${weeks} semana${weeks === 1 ? "" : "s"} para completar`
                            : m.dueDate
                              ? m.dueDate
                              : "Sin fecha"}
                        </div>

                        {/* Tiny progress bar (visual only, uses weight as fill %) */}
                        <div className="mt-2 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${Math.max(0, Math.min(100, m.weight))}%` }}
                          />
                        </div>

                        {/* Collapsible edit area */}
                        {expanded[idx] && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                            <div className="space-y-1">
                              <label htmlFor={`ms-${idx}-due`} className="text-[11px] text-muted-foreground">
                                Fecha objetivo (YYYY-MM-DD)
                              </label>
                              <Input
                                id={`ms-${idx}-due`}
                                className="h-8"
                                placeholder="YYYY-MM-DD"
                                value={m.dueDate || ""}
                                onChange={(e) => {
                                  const copy: MilestoneItem[] = [...milestones];
                                  copy[idx] = { ...copy[idx], dueDate: e.target.value } as MilestoneItem;
                                  setMilestones(copy);
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span id={`ms-${idx}-weight-label`} className="text-[11px] text-muted-foreground">
                                  Peso (%)
                                </span>
                                <span className="text-[11px] text-muted-foreground">{m.weight}%</span>
                              </div>
                              <Slider
                                aria-labelledby={`ms-${idx}-weight-label`}
                                value={[m.weight]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(vals) => {
                                  const val = typeof vals[0] === "number" ? vals[0] : m.weight;
                                  setWeightWithConstraint(idx, val);
                                }}
                              />
                            </div>
                            <div className="sm:col-span-3 space-y-1">
                              <label htmlFor={`ms-${idx}-desc`} className="text-[11px] text-muted-foreground">
                                Descripción
                              </label>
                              <Textarea
                                id={`ms-${idx}-desc`}
                                placeholder="Descripción (opcional)"
                                value={m.description || ""}
                                onChange={(e) => {
                                  const copy: MilestoneItem[] = [...milestones];
                                  copy[idx] = { ...copy[idx], description: e.target.value } as MilestoneItem;
                                  setMilestones(copy);
                                }}
                                rows={2}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Bottom spacer to avoid footer overlap */}
                  <div className="h-8" />
                </div>
              </ScrollArea>

              {/* Sticky footer actions */}
              <div className="sticky bottom-0 pt-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={persistGoalWithMilestones} disabled={persisting || pending || weightSum !== 100}>
                    {persisting
                      ? "Guardando..."
                      : weightSum !== 100
                        ? "Ajusta los pesos a 100%"
                        : "Crear meta y guardar milestones"}
                  </Button>
                  <Button variant="outline" onClick={() => setStep("form")} disabled={persisting || pending}>
                    Volver
                  </Button>
                  <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={persisting || pending}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-600 dark:text-red-500">{error}</div>}

          {step === "form" && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Button onClick={handleSubmit} disabled={generating || pending}>
                {generating ? "Generando..." : "Siguiente: Generar milestones"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating || pending}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
