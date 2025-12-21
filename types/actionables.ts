import { z } from "zod";

export interface ActionableInput {
  title: string;
  description?: string;
  /** RRULE string, e.g. "FREQ=WEEKLY;BYDAY=MO,WE" */
  recurrence?: string;
  /** Date-only start date in YYYY-MM-DD */
  startDate?: string;
  /** Date-only end date in YYYY-MM-DD */
  endDate?: string;
  /** Time-only start time in HH:MM or HH:MM:SS */
  startTime?: string;
  /** Duration in minutes */
  durationMinutes?: number;
  /** IANA timezone, e.g. America/Mexico_City */
  timezone?: string;
  /** Optional pause/archive/presentation fields */
  isPaused?: boolean;
  pausedUntil?: string;
  isArchived?: boolean;
  color?: string;
  category?: string;
  priority?: number;
  reminderMinutesBefore?: number;
  exDates?: string;
  /** Optional milestone this actionable belongs to */
  milestoneId?: string | null;
}

export interface CreateActionablesPayload {
  items: ActionableInput[];
}

export type UpdateActionablePayload = Partial<ActionableInput>;

export const ActionableItemInputSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  recurrence: z.string().optional(),
  startDate: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    .optional(),
  startTime: z
    .string()
    .regex(/^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$/)
    .optional(),
  durationMinutes: z.number().int().positive().optional(),
  timezone: z.string().optional(),
  isPaused: z.boolean().optional(),
  pausedUntil: z.string().optional(),
  isArchived: z.boolean().optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  priority: z.number().int().optional(),
  reminderMinutesBefore: z.number().int().optional(),
  exDates: z.string().optional(),
  milestoneId: z.string().uuid().optional(),
});

export const PersistActionablesSchema = z.object({
  items: z.array(ActionableItemInputSchema).min(1),
});

export const UpdateActionableSchema = z
  .object({
    title: z.string().min(1, "El título es requerido").optional(),
    description: z.string().optional(),
    recurrence: z.string().optional(),
    startDate: z
      .string()
      .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
      .optional(),
    startTime: z
      .string()
      .regex(/^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$/)
      .optional(),
    durationMinutes: z.number().int().positive().optional(),
    timezone: z.string().optional(),
    isPaused: z.boolean().optional(),
    pausedUntil: z.string().optional(),
    isArchived: z.boolean().optional(),
    color: z.string().optional(),
    category: z.string().optional(),
    priority: z.number().int().optional(),
    reminderMinutesBefore: z.number().int().optional(),
    exDates: z.string().optional(),
    milestoneId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
  });

export type ActionableItemInput = z.infer<typeof ActionableItemInputSchema>;
export type PersistActionablesInput = z.infer<typeof PersistActionablesSchema>;
export type UpdateActionableInput = z.infer<typeof UpdateActionableSchema>;
