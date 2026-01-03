"use client";

import { Button } from "@/components/ui/button";
import {
  DEFAULT_ACTIONABLE_VALUES,
  FORM_FIELD_LABELS,
  FORM_PLACEHOLDERS,
  INTERVAL_LABELS,
  PRIORITY_OPTIONS,
  RECURRENCE_FREQUENCY,
  RECURRENCE_FREQUENCY_LABELS,
  WEEK_DAYS,
} from "@/constants/actionables";
import {
  getBrowserTimeZone,
  normalizeBoolean,
  normalizeDate,
  normalizeMinutes,
  normalizeOptionalNumber,
  normalizeOptionalString,
  normalizeTime,
  parseRecurrenceRule,
} from "@/utils/actionables-utils";

interface ActionableFormProps {
  isSuggestion?: boolean;
  index?: number;
  actionable?: {
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
  };
  suggestion?: {
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
  };
  onCancel: () => void;
  onSave: () => void;
  onChange?: (key: string, value: unknown) => void;
}

export function ActionableForm({
  isSuggestion = false,
  index,
  actionable,
  suggestion,
  onCancel,
  onSave,
  onChange,
}: ActionableFormProps) {
  const data = isSuggestion ? suggestion : actionable;
  const id = isSuggestion ? index : actionable?.id;

  // Parse recurrence rule
  const parsedRecurrence = parseRecurrenceRule(data?.recurrence ?? null);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground" htmlFor={`frequency-${id}`}>
          {FORM_FIELD_LABELS.FREQUENCY}
        </label>
        <select
          id={`frequency-${id}`}
          className="w-full rounded-md border bg-background px-2 py-1 text-xs"
          value={parsedRecurrence.freq}
          onChange={(e) => onChange?.("freq", e.target.value)}
        >
          <option value={RECURRENCE_FREQUENCY.NONE}>{RECURRENCE_FREQUENCY_LABELS.NONE}</option>
          <option value={RECURRENCE_FREQUENCY.DAILY}>{RECURRENCE_FREQUENCY_LABELS.DAILY}</option>
          <option value={RECURRENCE_FREQUENCY.WEEKLY}>{RECURRENCE_FREQUENCY_LABELS.WEEKLY}</option>
          <option value={RECURRENCE_FREQUENCY.MONTHLY}>{RECURRENCE_FREQUENCY_LABELS.MONTHLY}</option>
        </select>
      </div>
      {(parsedRecurrence.freq === RECURRENCE_FREQUENCY.WEEKLY ||
        parsedRecurrence.freq === RECURRENCE_FREQUENCY.MONTHLY) && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`interval-${id}`}>
            {FORM_FIELD_LABELS.INTERVAL}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              id={`interval-${id}`}
              className="w-16 rounded-md border bg-background px-2 py-1 text-xs"
              value={parsedRecurrence.interval}
              onChange={(e) => onChange?.("interval", e.target.value)}
            />
            <span className="text-[11px] text-muted-foreground">
              {parsedRecurrence.freq === RECURRENCE_FREQUENCY.WEEKLY ? INTERVAL_LABELS.WEEKLY : INTERVAL_LABELS.MONTHLY}
            </span>
          </div>
        </div>
      )}
      {parsedRecurrence.freq === RECURRENCE_FREQUENCY.WEEKLY && (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">{FORM_FIELD_LABELS.WEEK_DAYS}</span>
          <div className="flex flex-wrap gap-1">
            {WEEK_DAYS.map((d) => {
              const active = parsedRecurrence.days.includes(d.code);
              return (
                <button
                  key={d.code}
                  type="button"
                  className={`rounded-md border px-2 py-0.5 text-[11px] ${
                    active ? "bg-primary text-primary-foreground" : "bg-background"
                  }`}
                  onClick={() => {
                    const newDays = active
                      ? parsedRecurrence.days.filter((x) => x !== d.code)
                      : [...parsedRecurrence.days, d.code];
                    onChange?.("days", newDays);
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
          <label className="text-[11px] text-muted-foreground" htmlFor={`start-${id}`}>
            {FORM_FIELD_LABELS.START_DATE}
          </label>
          <input
            type="date"
            id={`start-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={normalizeDate(data?.startDate ?? null) ?? ""}
            onChange={(e) => onChange?.("startDate", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`end-${id}`}>
            {FORM_FIELD_LABELS.END_DATE}
          </label>
          <input
            type="date"
            id={`end-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={normalizeDate(data?.endDate ?? null) ?? ""}
            onChange={(e) => onChange?.("endDate", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`time-${id}`}>
            {FORM_FIELD_LABELS.TIME}
          </label>
          <input
            type="time"
            id={`time-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={normalizeTime(data?.startTime ?? null, DEFAULT_ACTIONABLE_VALUES.START_TIME)}
            onChange={(e) => onChange?.("startTime", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`duration-${id}`}>
            {FORM_FIELD_LABELS.DURATION}
          </label>
          <input
            type="number"
            min={1}
            id={`duration-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={normalizeMinutes(data?.durationMinutes ?? null, DEFAULT_ACTIONABLE_VALUES.DURATION_MINUTES)}
            onChange={(e) => onChange?.("durationMinutes", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground" htmlFor={`tz-${id}`}>
          {FORM_FIELD_LABELS.TIMEZONE}
        </label>
        <input
          type="text"
          id={`tz-${id}`}
          className="w-full rounded-md border bg-background px-2 py-1 text-xs"
          value={normalizeOptionalString(data?.timezone) ?? getBrowserTimeZone()}
          onChange={(e) => onChange?.("timezone", e.target.value)}
          placeholder={getBrowserTimeZone() || "UTC"}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-2">
          <label className="text-[11px] text-muted-foreground" htmlFor={`paused-${id}`}>
            {FORM_FIELD_LABELS.PAUSED}
          </label>
          <input
            type="checkbox"
            id={`paused-${id}`}
            checked={normalizeBoolean(data?.isPaused)}
            onChange={(e) => onChange?.("isPaused", e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-2 py-2">
          <label className="text-[11px] text-muted-foreground" htmlFor={`archived-${id}`}>
            {FORM_FIELD_LABELS.ARCHIVED}
          </label>
          <input
            type="checkbox"
            id={`archived-${id}`}
            checked={normalizeBoolean(data?.isArchived)}
            onChange={(e) => onChange?.("isArchived", e.target.checked)}
          />
        </div>
      </div>

      {normalizeBoolean(data?.isPaused) && (
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`paused-until-${id}`}>
            {FORM_FIELD_LABELS.PAUSED_UNTIL}
          </label>
          <input
            type="datetime-local"
            id={`paused-until-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={data?.pausedUntil ? new Date(data.pausedUntil).toISOString().slice(0, 16) : ""}
            onChange={(e) => onChange?.("pausedUntil", e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`color-${id}`}>
            {FORM_FIELD_LABELS.COLOR}
          </label>
          <input
            type="color"
            id={`color-${id}`}
            className="h-8 w-full rounded-md border bg-background px-1 py-1"
            value={normalizeOptionalString(data?.color) ?? DEFAULT_ACTIONABLE_VALUES.COLOR}
            onChange={(e) => onChange?.("color", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`category-${id}`}>
            {FORM_FIELD_LABELS.CATEGORY}
          </label>
          <input
            type="text"
            id={`category-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={normalizeOptionalString(data?.category)}
            onChange={(e) => onChange?.("category", e.target.value)}
            placeholder={FORM_PLACEHOLDERS.CATEGORY}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`priority-${id}`}>
            {FORM_FIELD_LABELS.PRIORITY}
          </label>
          <select
            id={`priority-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={normalizeOptionalNumber(data?.priority, DEFAULT_ACTIONABLE_VALUES.PRIORITY)}
            onChange={(e) => onChange?.("priority", Number(e.target.value))}
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-muted-foreground" htmlFor={`reminder-${id}`}>
            {FORM_FIELD_LABELS.REMINDER}
          </label>
          <input
            type="number"
            min={0}
            id={`reminder-${id}`}
            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            value={normalizeOptionalNumber(data?.reminderMinutesBefore)}
            onChange={(e) => onChange?.("reminderMinutesBefore", Number(e.target.value))}
            placeholder={FORM_PLACEHOLDERS.REMINDER}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-muted-foreground" htmlFor={`exdates-${id}`}>
          {FORM_FIELD_LABELS.EX_DATES}
        </label>
        <input
          type="text"
          id={`exdates-${id}`}
          className="w-full rounded-md border bg-background px-2 py-1 text-xs"
          value={normalizeOptionalString(data?.exDates)}
          onChange={(e) => onChange?.("exDates", e.target.value)}
          placeholder={FORM_PLACEHOLDERS.EX_DATES}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={onCancel}>
          {isSuggestion ? "Cerrar" : "Cancelar"}
        </Button>
        <Button type="button" size="sm" className="h-6 px-2 text-[11px]" onClick={onSave}>
          {isSuggestion ? "Aplicar" : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
