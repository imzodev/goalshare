import { useCallback, useEffect, useRef, useState } from "react";
import type { EventClickArg, EventInput, EventSourceFuncArg } from "@fullcalendar/core";
import type FullCalendar from "@fullcalendar/react";

import { useGoals } from "@/hooks/use-goals";
import type { UserGoalSummary } from "@/types/goals";
import type { ActionableCompletionDialogData } from "@/components/calendar/actionable-completion-dialog";

export function useCalendarPageController() {
  const { goals, loading, fetchGoals } = useGoals();

  const [selectedGoal, setSelectedGoal] = useState<UserGoalSummary | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [actionablesOpen, setActionablesOpen] = useState(false);

  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionData, setCompletionData] = useState<ActionableCompletionDialogData | null>(null);

  const calendarRef = useRef<FullCalendar | null>(null);

  // FullCalendar puede llamar a la función `events` múltiples veces incluso para el mismo rango.
  // Además, en modo desarrollo React (StrictMode), el árbol puede montarse más de una vez.
  // Resultado: puedes ver 2+ requests idénticas a /api/calendar/events al cargar.
  //
  // Para evitar golpes redundantes al backend, hacemos 2 cosas:
  // 1) Dedupe de requests “in-flight” (si ya hay una request pendiente para start/end, la reutilizamos).
  // 2) Cache MUY corto (solo segundos) por rango, para absorber llamadas duplicadas inmediatas.
  //
  // Esto NO pretende cachear “para siempre”; solo evita duplicados por comportamiento de montaje/FullCalendar.
  const inFlightRequestsRef = useRef(new Map<string, Promise<EventInput[]>>());
  const lastResultsRef = useRef(new Map<string, { at: number; events: EventInput[] }>());

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Importante: `useCallback` mantiene estable la referencia de la función.
  // Si la referencia cambiara en cada render (por ejemplo al abrir/cerrar un diálogo),
  // FullCalendar interpretaría que cambió la fuente de eventos y volvería a pedirlos.
  const fetchCalendarEvents = useCallback(
    (
      info: EventSourceFuncArg,
      successCallback: (events: EventInput[]) => void,
      failureCallback: (error: Error) => void
    ) => {
      const start = info.start.toISOString();
      const end = info.end.toISOString();
      const key = `${start}|${end}`;

      const cached = lastResultsRef.current.get(key);
      // Cache corto: si FullCalendar llama inmediatamente otra vez (mismo rango),
      // devolvemos el resultado sin hacer otra request.
      // 5s es intencionalmente pequeño: solo buscamos evitar duplicados inmediatos.
      if (cached && Date.now() - cached.at < 5_000) {
        successCallback(cached.events);
        return;
      }

      const existing = inFlightRequestsRef.current.get(key);
      // Dedupe “in-flight”:
      // - Si ya existe una request pendiente para este key, NO creamos otra.
      // - Reutilizamos la misma Promise y todos reciben el mismo resultado.
      const promise =
        existing ??
        (async () => {
          const res = await fetch(
            `/api/calendar/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
            }
          );
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data?.error ?? "No se pudieron cargar eventos");
          }
          return Array.isArray(data?.events) ? (data.events as EventInput[]) : [];
        })();

      if (!existing) {
        inFlightRequestsRef.current.set(key, promise);
      }

      promise
        .then((events) => {
          lastResultsRef.current.set(key, { at: Date.now(), events });
          successCallback(events);
        })
        .catch((e) => {
          failureCallback(e instanceof Error ? e : new Error("No se pudieron cargar eventos"));
        })
        .finally(() => {
          const current = inFlightRequestsRef.current.get(key);
          if (current === promise) {
            inFlightRequestsRef.current.delete(key);
          }
        });
    },
    []
  );

  const refreshCalendar = useCallback(() => {
    const api = calendarRef.current?.getApi();
    api?.refetchEvents();
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const props = (info.event.extendedProps as Record<string, unknown>) ?? {};

    if (props?.entityType === "actionable") {
      const actionableId = String(props.actionableId ?? "");
      const occurrenceStart = String(props.occurrenceStart ?? "");
      if (!actionableId || !occurrenceStart) return;

      setCompletionData({
        actionableId,
        title: info.event.title,
        occurrenceStart,
        timezone: (props.timezone as string | null | undefined) ?? null,
        completed: Boolean(props.completed),
        completionNotes: (props.completionNotes as string | null | undefined) ?? null,
      });
      setCompletionOpen(true);
      return;
    }

    const goal = props as unknown as UserGoalSummary;
    setSelectedGoal(goal);
    setDetailDialogOpen(true);
  }, []);

  const handleGoalDialogOpenChange = useCallback((open: boolean) => {
    setDetailDialogOpen(open);
    if (!open) {
      setSelectedGoal(null);
    }
  }, []);

  const handleCompletionOpenChange = useCallback((open: boolean) => {
    setCompletionOpen(open);
    if (!open) setCompletionData(null);
  }, []);

  const setCalendarRef = useCallback((ref: FullCalendar | null) => {
    calendarRef.current = ref;
  }, []);

  return {
    goals,
    loading,

    selectedGoal,
    detailDialogOpen,
    handleGoalDialogOpenChange,

    actionablesOpen,
    setActionablesOpen,

    completionOpen,
    completionData,
    handleCompletionOpenChange,

    fetchCalendarEvents,
    handleEventClick,

    refreshCalendar,
    setCalendarRef,
  };
}
