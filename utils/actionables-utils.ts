import { DAY_LABELS } from "@/constants/actionables";

/**
 * Normaliza una regla de recurrencia RRULE
 * @param rule - La regla de recurrencia a normalizar
 * @returns La regla normalizada o undefined si es inválida
 */
export function normalizeRecurrence(rule: string | null | undefined): string | undefined {
  if (!rule) return undefined;
  let cleaned = rule.trim();
  if (!cleaned) return undefined;
  if (cleaned.toUpperCase().startsWith("RRULE:")) {
    cleaned = cleaned.slice("RRULE:".length).trim();
  }
  if (!/FREQ=/i.test(cleaned)) return undefined;
  return cleaned;
}

/**
 * Formatea una etiqueta legible para una regla de recurrencia RRULE
 * @param rule - La regla de recurrencia a formatear
 * @returns Una etiqueta legible o null si la regla es inválida
 */
export function formatRecurrenceLabel(rule: string | null): string {
  if (!rule) return "";
  try {
    let cleaned = rule.trim();
    if (cleaned.toUpperCase().startsWith("RRULE:")) {
      cleaned = cleaned.slice("RRULE:".length);
    }

    if (!/FREQ=/i.test(cleaned)) {
      return "";
    }

    const parts = cleaned.split(";");
    const map: Record<string, string> = {};
    for (const part of parts) {
      const [k, v] = part.split("=");
      if (k && v) map[k.toUpperCase()] = v;
    }
    const freq = map["FREQ"];
    if (!freq) return "";

    const intervalRaw = map["INTERVAL"];
    const interval = intervalRaw ? Number(intervalRaw) || 1 : 1;
    const byDayRaw = map["BYDAY"];
    const byDayList = byDayRaw ? byDayRaw.split(",").map((d) => DAY_LABELS[d] ?? d) : [];

    if (freq === "DAILY") {
      if (interval <= 1) return "Diario";
      return `Cada ${interval} días`;
    }

    if (freq === "WEEKLY") {
      const base = interval <= 1 ? "Semanal" : `Cada ${interval} semanas`;
      if (byDayList.length > 0) {
        return `${base} (${byDayList.join(", ")})`;
      }
      return base;
    }

    if (freq === "MONTHLY") {
      if (interval <= 1) return "Mensual";
      return `Cada ${interval} meses`;
    }

    return "";
  } catch {
    return rule;
  }
}

/**
 * Parsea una regla de recurrencia RRULE en sus componentes
 * @param rule - La regla de recurrencia a parsear
 * @returns Un objeto con los componentes de la regla
 */
export function parseRecurrenceRule(rule: string | null | undefined): {
  freq: string;
  interval: string;
  days: string[];
} {
  const result = {
    freq: "",
    interval: "1",
    days: [] as string[],
  };

  if (!rule) return result;

  let cleaned = rule.trim();
  if (cleaned.toUpperCase().startsWith("RRULE:")) {
    cleaned = cleaned.slice("RRULE:".length).trim();
  }

  if (!/FREQ=/i.test(cleaned)) return result;

  const parts = cleaned.split(";");
  const map: Record<string, string> = {};
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k && v) map[k.toUpperCase()] = v;
  }

  result.freq = map["FREQ"] ?? "";
  result.interval = map["INTERVAL"] ?? "1";
  result.days = map["BYDAY"] ? map["BYDAY"].split(",") : [];

  return result;
}

/**
 * Construye una regla de recurrencia RRULE a partir de sus componentes
 * @param freq - La frecuencia (DAILY, WEEKLY, MONTHLY)
 * @param interval - El intervalo (número)
 * @param days - Los días de la semana (para WEEKLY)
 * @returns La regla de recurrencia construida
 */
export function buildRecurrenceRule(freq: string, interval: string, days: string[]): string | undefined {
  if (!freq) return undefined;

  const parts: string[] = [];
  parts.push(`FREQ=${freq}`);
  const intVal = parseInt(interval || "1", 10);
  if (!Number.isNaN(intVal) && intVal > 1) {
    parts.push(`INTERVAL=${intVal}`);
  }
  if (freq === "WEEKLY" && days.length > 0) {
    parts.push(`BYDAY=${days.join(",")}`);
  }
  return parts.join(";");
}

/**
 * Obtiene el timezone del navegador
 * @returns El timezone del navegador o una cadena vacía si no está disponible
 */
export function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/**
 * Normaliza una fecha a formato YYYY-MM-DD
 * @param date - La fecha a normalizar
 * @returns La fecha normalizada o undefined si es inválida
 */
export function normalizeDate(date: string | null | undefined): string | undefined {
  if (!date) return undefined;
  const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;
  const dateStr = String(date);
  if (dateRegex.test(dateStr)) {
    return dateStr.slice(0, 10);
  }
  return undefined;
}

/**
 * Normaliza una hora a formato HH:MM:SS
 * @param time - La hora a normalizar
 * @param defaultTime - La hora por defecto si time es inválido
 * @returns La hora normalizada
 */
export function normalizeTime(time: string | null | undefined, defaultTime: string = "07:30:00"): string {
  if (typeof time === "string") {
    return time.endsWith(":00") ? time : `${time}:00`;
  }
  return defaultTime;
}

/**
 * Normaliza un número de minutos
 * @param minutes - Los minutos a normalizar
 * @param defaultMinutes - Los minutos por defecto si minutes es inválido
 * @returns Los minutos normalizados
 */
export function normalizeMinutes(minutes: number | null | undefined, defaultMinutes: number = 15): number {
  return typeof minutes === "number" ? minutes : defaultMinutes;
}

/**
 * Normaliza un valor booleano
 * @param value - El valor a normalizar
 * @param defaultValue - El valor por defecto si value es inválido
 * @returns El valor normalizado
 */
export function normalizeBoolean(value: boolean | null | undefined, defaultValue: boolean = false): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

/**
 * Normaliza un valor de string opcional
 * @param value - El valor a normalizar
 * @param defaultValue - El valor por defecto si value es inválido
 * @returns El valor normalizado o undefined
 */
export function normalizeOptionalString(value: string | null | undefined, defaultValue?: string): string | undefined {
  if (typeof value === "string" && value) {
    return value;
  }
  return defaultValue;
}

/**
 * Normaliza un valor de número opcional
 * @param value - El valor a normalizar
 * @param defaultValue - El valor por defecto si value es inválido
 * @returns El valor normalizado o undefined
 */
export function normalizeOptionalNumber(value: number | null | undefined, defaultValue?: number): number | undefined {
  if (typeof value === "number") {
    return value;
  }
  return defaultValue;
}
