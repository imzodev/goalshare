import { useState, useCallback } from "react";
import { DEFAULT_ACTIONABLE_VALUES, RECURRENCE_FREQUENCY } from "@/constants/actionables";
import {
  buildRecurrenceRule,
  getBrowserTimeZone,
  normalizeBoolean,
  normalizeDate,
  normalizeMinutes,
  normalizeOptionalString,
  parseRecurrenceRule,
} from "@/utils/actionables-utils";

interface ActionableFormData {
  freq: string;
  interval: string;
  days: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  durationMinutes: string;
  timezone: string;
  isPaused: boolean;
  pausedUntil: string;
  isArchived: boolean;
  color: string;
  category: string;
  priority: string;
  reminderMinutesBefore: string;
  exDates: string;
}

export function useActionableForm() {
  const [formData, setFormData] = useState<ActionableFormData>({
    freq: "",
    interval: "1",
    days: [],
    startDate: "",
    endDate: "",
    startTime: DEFAULT_ACTIONABLE_VALUES.START_TIME,
    durationMinutes: String(DEFAULT_ACTIONABLE_VALUES.DURATION_MINUTES),
    timezone: getBrowserTimeZone(),
    isPaused: false,
    pausedUntil: "",
    isArchived: false,
    color: DEFAULT_ACTIONABLE_VALUES.COLOR,
    category: "",
    priority: String(DEFAULT_ACTIONABLE_VALUES.PRIORITY),
    reminderMinutesBefore: "",
    exDates: "",
  });

  const resetForm = useCallback(() => {
    setFormData({
      freq: "",
      interval: "1",
      days: [],
      startDate: "",
      endDate: "",
      startTime: DEFAULT_ACTIONABLE_VALUES.START_TIME,
      durationMinutes: String(DEFAULT_ACTIONABLE_VALUES.DURATION_MINUTES),
      timezone: getBrowserTimeZone(),
      isPaused: false,
      pausedUntil: "",
      isArchived: false,
      color: DEFAULT_ACTIONABLE_VALUES.COLOR,
      category: "",
      priority: String(DEFAULT_ACTIONABLE_VALUES.PRIORITY),
      reminderMinutesBefore: "",
      exDates: "",
    });
  }, []);

  const populateFromActionable = useCallback(
    (actionable: {
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
    }) => {
      const parsed = parseRecurrenceRule(actionable.recurrence ?? null);
      setFormData({
        freq: parsed.freq,
        interval: parsed.interval,
        days: parsed.days,
        startDate: normalizeDate(actionable.startDate) ?? "",
        endDate: normalizeDate(actionable.endDate) ?? "",
        startTime: actionable.startTime
          ? String(actionable.startTime).slice(0, 5)
          : DEFAULT_ACTIONABLE_VALUES.START_TIME,
        durationMinutes:
          actionable.durationMinutes != null
            ? String(actionable.durationMinutes)
            : String(DEFAULT_ACTIONABLE_VALUES.DURATION_MINUTES),
        timezone: actionable.timezone ?? getBrowserTimeZone() ?? "UTC",
        isPaused: normalizeBoolean(actionable.isPaused),
        pausedUntil: actionable.pausedUntil ? new Date(actionable.pausedUntil).toISOString().slice(0, 16) : "",
        isArchived: normalizeBoolean(actionable.isArchived),
        color: actionable.color ?? "",
        category: actionable.category ?? "",
        priority:
          actionable.priority != null ? String(actionable.priority) : String(DEFAULT_ACTIONABLE_VALUES.PRIORITY),
        reminderMinutesBefore: actionable.reminderMinutesBefore != null ? String(actionable.reminderMinutesBefore) : "",
        exDates: actionable.exDates ?? "",
      });
    },
    []
  );

  const updateField = useCallback((key: keyof ActionableFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const buildRecurrence = useCallback((): string | undefined => {
    return buildRecurrenceRule(formData.freq, formData.interval, formData.days);
  }, [formData.freq, formData.interval, formData.days]);

  const buildActionableData = useCallback(() => {
    const recurrence = buildRecurrence();
    return {
      title: undefined as unknown as string,
      description: undefined as unknown as string | undefined,
      recurrence: recurrence,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      startTime: formData.startTime ? `${formData.startTime}:00` : undefined,
      durationMinutes: formData.durationMinutes ? Number(formData.durationMinutes) || 15 : undefined,
      timezone: formData.timezone || getBrowserTimeZone() || "UTC",
      isPaused: formData.isPaused,
      pausedUntil: formData.pausedUntil ? new Date(formData.pausedUntil).toISOString() : undefined,
      isArchived: formData.isArchived,
      color: formData.color || undefined,
      category: formData.category || undefined,
      priority: formData.priority ? Number(formData.priority) || 3 : undefined,
      reminderMinutesBefore: formData.reminderMinutesBefore
        ? Number(formData.reminderMinutesBefore) || undefined
        : undefined,
      exDates: formData.exDates || undefined,
    };
  }, [formData, buildRecurrence]);

  return {
    formData,
    resetForm,
    populateFromActionable,
    updateField,
    buildRecurrence,
    buildActionableData,
  };
}
