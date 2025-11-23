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
    milestoneId: z.string().uuid().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debe proporcionar al menos un campo para actualizar",
  });

export type ActionableItemInput = z.infer<typeof ActionableItemInputSchema>;
export type PersistActionablesInput = z.infer<typeof PersistActionablesSchema>;
export type UpdateActionableInput = z.infer<typeof UpdateActionableSchema>;
