/**
 * Zod DTO schemas for AI routes.
 */

import { z } from "zod";

/** Common helpers */
export const LocaleSchema = z.string().min(2).max(10).default("es");
export const TraceIdSchema = z.string().min(1).optional();
/** Date-only in format YYYY-MM-DD to align with DB 'date' columns */
export const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

/** Milestones */
export const MilestonesRequestSchema = z.object({
  goal: z.string().min(1, "Goal is required"),
  context: z.record(z.string(), z.any()).optional(),
  locale: LocaleSchema.optional(),
  traceId: TraceIdSchema,
});
export type MilestonesRequest = z.infer<typeof MilestonesRequestSchema>;

export const MilestoneItemSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  /** Date-only string; previously datetime */
  dueDate: DateOnlySchema.optional(),
  /** Percentage weight 0-100 determined by AI */
  weight: z.number().int().min(0).max(100),
});

export const MilestonesResponseSchema = z.object({
  milestones: z.array(MilestoneItemSchema),
  traceId: z.string().optional(),
});
export type MilestonesResponse = z.infer<typeof MilestonesResponseSchema>;

/** SMART rewriting */
export const SmartRequestSchema = z.object({
  goalText: z.string().min(1),
  locale: LocaleSchema.optional(),
  traceId: TraceIdSchema,
});
export type SmartRequest = z.infer<typeof SmartRequestSchema>;

export const SmartResponseSchema = z.object({
  rewritten: z.string(),
  reasons: z.array(z.string()).optional(),
  traceId: z.string().optional(),
});
export type SmartResponse = z.infer<typeof SmartResponseSchema>;

/** Coaching advice */
export const AdviceRequestSchema = z.object({
  question: z.string().min(1),
  context: z.record(z.string(), z.any()).optional(),
  locale: LocaleSchema.optional(),
  traceId: TraceIdSchema,
});
export type AdviceRequest = z.infer<typeof AdviceRequestSchema>;

export const AdviceResponseSchema = z.object({
  advice: z.string(),
  bullets: z.array(z.string()).optional(),
  traceId: z.string().optional(),
});
export type AdviceResponse = z.infer<typeof AdviceResponseSchema>;

/** Daily/weekly plan */
export const PlanRequestSchema = z.object({
  timeframe: z.enum(["daily", "weekly"]),
  focus: z.string().min(1),
  context: z.record(z.string(), z.any()).optional(),
  locale: LocaleSchema.optional(),
  traceId: TraceIdSchema,
});
export type PlanRequest = z.infer<typeof PlanRequestSchema>;

export const PlanTaskSchema = z.object({
  title: z.string(),
  notes: z.string().optional(),
  when: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
});

export const PlanResponseSchema = z.object({
  tasks: z.array(PlanTaskSchema),
  traceId: z.string().optional(),
});
export type PlanResponse = z.infer<typeof PlanResponseSchema>;

/** Moderation */
export const ModerateRequestSchema = z.object({
  content: z.string().min(1),
  locale: LocaleSchema.optional(),
  traceId: TraceIdSchema,
});
export type ModerateRequest = z.infer<typeof ModerateRequestSchema>;

export const ModerateResponseSchema = z.object({
  verdict: z.enum(["allow", "flag", "block"]),
  reasons: z.array(z.string()).optional(),
  traceId: z.string().optional(),
});
export type ModerateResponse = z.infer<typeof ModerateResponseSchema>;

/** Autocomplete: suggest description from title */
export const AutocompleteDescriptionRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tone: z.string().optional(),
  audience: z.string().optional(),
  locale: LocaleSchema.optional(),
  traceId: TraceIdSchema,
});
export type AutocompleteDescriptionRequest = z.infer<typeof AutocompleteDescriptionRequestSchema>;

export const AutocompleteDescriptionResponseSchema = z.object({
  suggestion: z.string(),
  traceId: z.string().optional(),
});
export type AutocompleteDescriptionResponse = z.infer<typeof AutocompleteDescriptionResponseSchema>;

/** Coaching Chat */
export const CoachRequestSchema = z.object({
  goalId: z.string().uuid(),
  message: z.string().min(1),
  locale: LocaleSchema.optional(),
  traceId: TraceIdSchema,
});
export type CoachRequest = z.infer<typeof CoachRequestSchema>;

export const CoachResponseSchema = z.object({
  response: z.string(),
  traceId: z.string().optional(),
});
export type CoachResponse = z.infer<typeof CoachResponseSchema>;
