// Constantes para el manejo de metas (goals)

// Estados de meta
export const GOAL_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

// Tipos de meta
export const GOAL_TYPE = {
  METRIC: "metric",
  MILESTONE: "milestone",
  CHECKIN: "checkin",
  MANUAL: "manual",
} as const;

// Etiquetas para estados de meta
export const GOAL_STATUS_LABELS = {
  [GOAL_STATUS.PENDING]: "En progreso",
  [GOAL_STATUS.COMPLETED]: "Completada",
} as const;

// Etiquetas para tipos de meta
export const GOAL_TYPE_LABELS = {
  [GOAL_TYPE.METRIC]: "Métrica",
  [GOAL_TYPE.MILESTONE]: "Hitos",
  [GOAL_TYPE.CHECKIN]: "Check-in",
  [GOAL_TYPE.MANUAL]: "Manual",
} as const;

// Descripciones para tipos de meta
export const GOAL_TYPE_DESCRIPTIONS = {
  [GOAL_TYPE.METRIC]: "Meta cuantificable con un objetivo numérico (ej: leer 12 libros)",
  [GOAL_TYPE.MILESTONE]: "Meta dividida en hitos o pasos (ej: aprender inglés)",
  [GOAL_TYPE.CHECKIN]: "Meta de hábito con repeticiones (ej: meditar 30 días)",
  [GOAL_TYPE.MANUAL]: "Meta subjetiva con progreso manual (ej: aumentar autoestima)",
} as const;

// Etiquetas para días restantes
export const DAYS_LEFT_LABELS = {
  COMPLETED: "Meta completada",
  NO_DEADLINE: "Sin fecha límite",
  DUE_TODAY: "Finaliza hoy",
  SINGLE_DAY: "1 día restante",
  MULTIPLE_DAYS_SUFFIX: "días restantes",
} as const;

// Etiquetas para formato de fecha
export const DATE_FORMAT = {
  LOCALE: "es-MX",
  DAY: "2-digit" as const,
  MONTH: "short" as const,
  YEAR: "numeric" as const,
} as const;

// Etiquetas para tiempo relativo
export const RELATIVE_TIME_LABELS = {
  JUST_NOW: "Actualizado hace instantes",
  MINUTES_SUFFIX: "min",
  HOURS_SUFFIX: "h",
  DAYS_SUFFIX: "d",
  MONTHS_SUFFIX: "m",
  YEARS_SUFFIX: "a",
  MINUTES_PREFIX: "Actualizado hace",
  HOURS_PREFIX: "Actualizado hace",
  DAYS_PREFIX: "Actualizado hace",
  MONTHS_PREFIX: "Actualizado hace",
  YEARS_PREFIX: "Actualizado hace",
} as const;

// Etiquetas para deadline
export const DEADLINE_LABELS = {
  NO_DEADLINE: "Sin fecha límite",
} as const;

// Valores numéricos
export const TIME_THRESHOLDS = {
  JUST_NOW_MS: 60_000, // 1 minuto
  HOUR_MS: 60 * 60_000, // 1 hora
  DAY_MS: 24 * 60 * 60_000, // 1 día
  MONTH_MS: 30 * 24 * 60 * 60_000, // 30 días
  YEAR_MS: 12 * 30 * 24 * 60 * 60_000, // 1 año
} as const;

export type GoalStatus = typeof GOAL_STATUS[keyof typeof GOAL_STATUS];
export type GoalType = typeof GOAL_TYPE[keyof typeof GOAL_TYPE];
