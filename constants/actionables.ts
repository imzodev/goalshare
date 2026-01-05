// Constantes para el manejo de accionables

// Etiquetas para días de la semana (en formato RRULE)
export const DAY_LABELS: Record<string, string> = {
  MO: "Lu",
  TU: "Ma",
  WE: "Mi",
  TH: "Ju",
  FR: "Vi",
  SA: "Sa",
  SU: "Do",
} as const;

// Valores por defecto para accionables
export const DEFAULT_ACTIONABLE_VALUES = {
  START_TIME: "07:30",
  DURATION_MINUTES: 15,
  PRIORITY: 3,
  COLOR: "#6366f1",
} as const;

// Frecuencias de recurrencia
export const RECURRENCE_FREQUENCY = {
  NONE: "",
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
} as const;

// Etiquetas para frecuencia
export const RECURRENCE_FREQUENCY_LABELS = {
  NONE: "Sin recurrencia",
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
} as const;

// Etiquetas para intervalos
export const INTERVAL_LABELS = {
  WEEKLY: "semana(s)",
  MONTHLY: "mes(es)",
} as const;

// Etiquetas para estados de edición
export const EDIT_STATE_LABELS = {
  EDIT: "Editar",
  CLOSE: "Cerrar",
  CANCEL: "Cancelar",
  APPLY: "Aplicar",
  SAVE: "Guardar",
  SAVING: "Guardando...",
  SELECTED: "Seleccionado",
} as const;

// Etiquetas para campos de formulario
export const FORM_FIELD_LABELS = {
  FREQUENCY: "Frecuencia",
  INTERVAL: "Cada",
  WEEK_DAYS: "Días de la semana",
  START_DATE: "Inicio",
  END_DATE: "Fin",
  TIME: "Hora",
  DURATION: "Duración (min)",
  TIMEZONE: "Timezone",
  PAUSED: "Pausado",
  ARCHIVED: "Archivado",
  PAUSED_UNTIL: "Pausado hasta",
  COLOR: "Color",
  CATEGORY: "Categoría",
  PRIORITY: "Prioridad",
  REMINDER: "Recordatorio (min)",
  EX_DATES: "ExDates (CSV)",
  GOAL_TARGET: "Meta objetivo",
} as const;

// Placeholders para campos de formulario
export const FORM_PLACEHOLDERS = {
  CATEGORY: "Ej: Salud",
  REMINDER: "Ej: 10",
  EX_DATES: "YYYY-MM-DD,YYYY-MM-DD",
} as const;

// Opciones de prioridad
export const PRIORITY_OPTIONS = [1, 2, 3, 4, 5] as const;

// Regex para validación de fechas
export const DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;

// Días de la semana para selección
export const WEEK_DAYS = [
  { code: "MO", label: "Lu" },
  { code: "TU", label: "Ma" },
  { code: "WE", label: "Mi" },
  { code: "TH", label: "Ju" },
  { code: "FR", label: "Vi" },
  { code: "SA", label: "Sa" },
  { code: "SU", label: "Do" },
] as const;
