import { db } from "@/db";
import { goalActionables, goalActionableCompletions, goals } from "@/db/schema";
import { withUserContext } from "@/lib/db-context";
import { GoalsService } from "@/services/goals-service";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { rrulestr } from "rrule";
import { TZDate } from "@date-fns/tz";

type Database = typeof db;

export type CalendarEventEntityType = "goal" | "actionable";

export interface CalendarEventItem {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  classNames?: string[];
  extendedProps?: Record<string, unknown>;
}

function parseTimeParts(time: string): { h: number; m: number; s: number } | null {
  const trimmed = time.trim();
  const m = /^([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?$/.exec(trimmed);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  const s = m[3] ? Number(m[3]) : 0;
  if ([h, mm, s].some((x) => Number.isNaN(x))) return null;
  return { h, m: mm, s };
}

function toLocalDateKey(date: Date, timeZone: string): string {
  const z = TZDate.tz(timeZone, date.getTime());
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${z.getFullYear()}-${pad(z.getMonth() + 1)}-${pad(z.getDate())}`;
}

function parseExDates(exDates: string | null | undefined): Set<string> {
  if (!exDates) return new Set();
  const parts = exDates
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const set = new Set<string>();
  for (const p of parts) {
    // Accept YYYY-MM-DD or YYYYMMDD
    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(p)) {
      set.add(p);
    } else if (/^[0-9]{8}$/.test(p)) {
      set.add(`${p.slice(0, 4)}-${p.slice(4, 6)}-${p.slice(6, 8)}`);
    } else {
      const d = new Date(p);
      if (!Number.isNaN(d.getTime())) {
        set.add(d.toISOString().slice(0, 10));
      }
    }
  }
  return set;
}

function normalizeRecurrence(rule: string | null | undefined): string | null {
  if (!rule) return null;
  let cleaned = rule.trim();
  if (!cleaned) return null;
  if (cleaned.toUpperCase().startsWith("RRULE:")) {
    cleaned = cleaned.slice("RRULE:".length).trim();
  }
  if (!/FREQ=/i.test(cleaned)) return null;

  // If UNTIL is provided as YYYYMMDD, normalize to an RFC-compliant UTC datetime at end-of-day.
  cleaned = cleaned.replace(/UNTIL=([0-9]{8})(?!T)/i, "UNTIL=$1T235959Z");

  return cleaned;
}

export class CalendarEventsService {
  constructor(private readonly dbInstance: Database = db) {}

  async listForRange(userId: string, rangeStart: Date, rangeEnd: Date): Promise<CalendarEventItem[]> {
    if (!userId) throw new Error("userId es requerido");
    if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
      throw new Error("Rango inválido");
    }

    const goalsService = new GoalsService(this.dbInstance);

    const goalEvents = (await goalsService.listUserGoals(userId)).map((goal) => ({
      id: `goal-${goal.id}`,
      title: goal.title,
      start: goal.deadline
        ? new Date(`${goal.deadline}T00:00:00Z`).toISOString()
        : new Date(goal.createdAt).toISOString(),
      allDay: true,
      extendedProps: {
        entityType: "goal" satisfies CalendarEventEntityType,
        ...goal,
      },
    }));

    const actionableRows = await withUserContext(userId, async (dbCtx) => {
      // Fetch all actionables owned by the user. We'll filter + expand in memory.
      return dbCtx
        .select({
          id: goalActionables.id,
          goalId: goalActionables.goalId,
          title: goalActionables.title,
          description: goalActionables.description,
          recurrence: goalActionables.recurrence,
          startDate: goalActionables.startDate,
          endDate: goalActionables.endDate,
          startTime: goalActionables.startTime,
          durationMinutes: goalActionables.durationMinutes,
          timezone: goalActionables.timezone,
          isPaused: goalActionables.isPaused,
          pausedUntil: goalActionables.pausedUntil,
          isArchived: goalActionables.isArchived,
          color: goalActionables.color,
          category: goalActionables.category,
          priority: goalActionables.priority,
          reminderMinutesBefore: goalActionables.reminderMinutesBefore,
          exDates: goalActionables.exDates,
        })
        .from(goalActionables)
        .innerJoin(goals, eq(goals.id, goalActionables.goalId))
        .where(eq(goals.ownerId, userId));
    });

    const actionableIds = actionableRows.map((a) => a.id);

    const completions =
      actionableIds.length === 0
        ? []
        : await withUserContext(userId, async (dbCtx) => {
            return dbCtx
              .select({
                actionableId: goalActionableCompletions.actionableId,
                occurrenceStart: goalActionableCompletions.occurrenceStart,
                notes: goalActionableCompletions.notes,
                completedAt: goalActionableCompletions.completedAt,
              })
              .from(goalActionableCompletions)
              .where(
                and(
                  inArray(goalActionableCompletions.actionableId, actionableIds),
                  gte(goalActionableCompletions.occurrenceStart, rangeStart),
                  lte(goalActionableCompletions.occurrenceStart, rangeEnd)
                )
              );
          });

    const completionKey = (actionableId: string, occurrenceStart: Date) =>
      `${actionableId}|${occurrenceStart.toISOString()}`;
    const completionsByKey = new Map<string, (typeof completions)[number]>();
    for (const c of completions) {
      completionsByKey.set(completionKey(c.actionableId, c.occurrenceStart), c);
    }

    const actionableEvents: CalendarEventItem[] = [];

    for (const a of actionableRows) {
      if (a.isArchived) continue;

      const tz = a.timezone ?? "UTC";
      const startTimeRaw = a.startTime ?? "09:00:00";
      const durationMinutes = a.durationMinutes ?? 30;
      const timeParts = parseTimeParts(startTimeRaw);
      if (!a.startDate || !timeParts) continue;

      const [y, mo, d] = String(a.startDate)
        .slice(0, 10)
        .split("-")
        .map((x) => Number(x));
      if (!y || !mo || !d) continue;

      const dtstartTz = new TZDate(y, mo - 1, d, timeParts.h, timeParts.m, timeParts.s, tz);
      const dtstart = new Date(dtstartTz.getTime());

      let effectiveRangeStart = rangeStart;
      if (a.isPaused) {
        if (!a.pausedUntil) {
          continue;
        }
        const pausedUntil = new Date(a.pausedUntil);
        if (!Number.isNaN(pausedUntil.getTime()) && pausedUntil > effectiveRangeStart) {
          effectiveRangeStart = pausedUntil;
        }
      }

      const exDateSet = parseExDates(a.exDates);

      const recurrence = normalizeRecurrence(a.recurrence);
      const occurrences: Date[] = [];

      if (recurrence) {
        try {
          const rule = rrulestr(recurrence, {
            dtstart,
            tzid: tz,
          });
          occurrences.push(...rule.between(effectiveRangeStart, rangeEnd, true));
        } catch {
          // Ignore invalid rules.
        }
      } else {
        if (dtstart >= effectiveRangeStart && dtstart <= rangeEnd) {
          occurrences.push(dtstart);
        }
      }

      for (const occ of occurrences) {
        const localKey = toLocalDateKey(occ, tz);
        if (exDateSet.has(localKey)) continue;

        const start = occ;
        const end = new Date(start.getTime() + durationMinutes * 60_000);

        const completion = completionsByKey.get(completionKey(a.id, start));
        const completed = Boolean(completion);

        actionableEvents.push({
          id: `actionable-${a.id}-${start.toISOString()}`,
          title: a.title,
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: false,
          backgroundColor: a.color ?? (completed ? "#10b981" : "#8b5cf6"),
          borderColor: a.color ?? (completed ? "#059669" : "#7c3aed"),
          classNames: completed ? ["opacity-70"] : undefined,
          extendedProps: {
            entityType: "actionable" satisfies CalendarEventEntityType,
            actionableId: a.id,
            goalId: a.goalId,
            description: a.description,
            occurrenceStart: start.toISOString(),
            durationMinutes,
            timezone: tz,
            completed,
            completionNotes: completion?.notes ?? null,
          },
        });
      }
    }

    return [...goalEvents, ...actionableEvents];
  }
}
