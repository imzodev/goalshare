import { useState, useCallback } from "react";
import type { UserGoalSummary } from "@/types/goals";
import { DATE_REGEX } from "@/constants/actionables";
import { getBrowserTimeZone, normalizeRecurrence } from "@/utils/actionables-utils";

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

export function useActionablesApi(goalId: string | "", onChanged?: () => void) {
  const [existing, setExisting] = useState<ExistingActionable[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadExistingActionables = useCallback(async () => {
    if (!goalId) return;
    try {
      setLoadingExisting(true);
      const res = await fetch(`/api/goals/${goalId}/actionables`);
      if (!res.ok) return;
      const data = await res.json();
      setExisting(data.actionables ?? []);
    } catch (e) {
      console.error("Error loading actionables", e);
    } finally {
      setLoadingExisting(false);
    }
  }, [goalId]);

  const generateSuggestions = useCallback(async (count: number = 3) => {
    if (!goalId) return;
    try {
      setLoadingSuggestions(true);
      const res = await fetch(`/api/goals/${goalId}/generate-actionables`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count })
      });
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
      return list as ActionableSuggestion[];
    } catch (e) {
      console.error("Error generating actionables", e);
      return [];
    } finally {
      setLoadingSuggestions(false);
    }
  }, [goalId]);

  const saveSelectedSuggestions = useCallback(
    async (suggestions: ActionableSuggestion[], selectedIndexes: Set<number>) => {
      if (!goalId || selectedIndexes.size === 0) return false;
      try {
        setSaving(true);
        const defaultTimezone = getBrowserTimeZone() || "UTC";
        const items = Array.from(selectedIndexes)
          .map((idx) => suggestions[idx]!)
          .map((s) => ({
            title: s.title,
            description: s.description,
            recurrence: normalizeRecurrence(s.recurrence),
            startDate:
              s.startDate && DATE_REGEX.test(String(s.startDate)) ? String(s.startDate).slice(0, 10) : undefined,
            endDate: s.endDate && DATE_REGEX.test(String(s.endDate)) ? String(s.endDate).slice(0, 10) : undefined,
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
        const res = await fetch(`/api/goals/${goalId}/actionables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        if (!res.ok) {
          const errorText = await res.text().catch(() => "<no-body>");
          console.error("Error saving actionables", res.status, errorText);
          return false;
        }
        const data = await res.json();
        setExisting(data.actionables ?? existing);
        onChanged?.();
        return true;
      } catch (e) {
        console.error("Error saving actionables", e);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [goalId, existing, onChanged]
  );

  const updateActionable = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      try {
        setSaving(true);
        const res = await fetch(`/api/actionables/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          console.error("Error updating actionable", await res.json().catch(() => undefined));
          return false;
        }
        const responseData = await res.json();
        const updated = responseData.actionable as ExistingActionable;
        setExisting((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
        onChanged?.();
        return true;
      } catch (e) {
        console.error("Error updating actionable", e);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [onChanged]
  );

  return {
    existing,
    loadingExisting,
    loadingSuggestions,
    saving,
    loadExistingActionables,
    generateSuggestions,
    saveSelectedSuggestions,
    updateActionable,
  };
}
