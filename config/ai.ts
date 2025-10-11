/**
 * AI per-agent default model configuration (stubs)
 * Parent: #42, Issue: #45
 *
 * Provider-agnostic defaults. Estas defaults se combinan en AI_CONFIG y
 * se consumen por AgentFactory junto con los provider builders. Sin SDKs aquí.
 */

import type { ModelConfig } from "../lib/ai/contracts/model";
import type { AgentKey } from "../lib/ai/contracts/agent";
import { AGENT_KEYS } from "../lib/ai/contracts/agent";
import { env } from "./env";

/**
 * Default provider/model per agent. Adjust as needed in future issues.
 * Note: when integrating OpenRouter, you can set provider: "openrouter"
 * and use model: "deepseek/deepseek-chat" for DeepSeek.
 */
export const AI_DEFAULTS: Partial<Record<AgentKey, ModelConfig>> = {
  planner: {
    provider: "openai",
    model: "gpt-5-nano",
    temperature: 0.3,
    instructions: `
Eres un agente PLANIFICADOR experto. Devuelve exclusivamente JSON válido con este esquema:
{
  "milestones": [
    { "title": string, "description": string?, "dueDate": "YYYY-MM-DD"?, "weight": number }
  ],
  "traceId": string?
}
Reglas:
- Genera entre 3 y 6 milestones.
- La suma de "weight" debe ser 100.
- "dueDate" usa formato YYYY-MM-DD; si no aplica, omite el campo.
- Títulos claros y descripciones breves.
- Coherencia de fechas: usa la fecha de HOY proporcionada en el input como referencia.
- Si hay fecha límite de la meta, todos los dueDate deben estar entre HOY y la fecha límite (inclusive), en orden ascendente. El último milestone debe coincidir con la fecha límite o quedar muy próximo (±3 días), sin superarla.
- Si no hay fecha límite, distribuye dueDate de forma realista desde HOY (p. ej., 1-4 semanas), en orden ascendente y sin fechas en el pasado.
- No generes fechas inválidas ni fuera de rango; si no puedes determinar una fecha, omite el campo dueDate en ese hito.
`,
  },
  smart: {
    provider: "openai",
    model: "gpt-5-nano",
    temperature: 0.2,
    instructions: `Eres un agente que reescribe metas al formato SMART. Responde sólo texto.`,
  },
  coach: {
    provider: "openai",
    model: "gpt-5-nano",
    temperature: 0.5,
    instructions: `Eres un agente de coaching. Responde consejos prácticos y concisos.`,
  },
  scheduler: {
    provider: "openai",
    model: "gpt-5-nano",
    temperature: 0.2,
    instructions: `Eres un agente de agenda. Devuelve un plan diario o semanal en texto estructurado.`,
  },
  moderator: {
    provider: "openai",
    model: "omni-moderation-latest",
    temperature: 0,
    instructions: `Clasifica contenido. Devuelve un veredicto: allow|flag|block y motivos.`,
  },
};

/**
 * Compute per-agent ModelConfig by applying env overrides on top of AI_DEFAULTS.
 * Precedence: per-agent overrides > global AI_DEFAULT_* > AI_DEFAULTS.
 */
export function resolveAgentDefaults(agent: AgentKey): ModelConfig {
  const base = AI_DEFAULTS[agent] ?? {
    provider: (env.AI_DEFAULT_PROVIDER || "openai") as ModelConfig["provider"],
    model: env.AI_DEFAULT_MODEL || "gpt-5-nano",
    temperature: 0.2,
  };

  // per-agent overrides
  const agentProvider =
    agent === "planner"
      ? env.AI_PROVIDER_PLANNER
      : agent === "smart"
        ? env.AI_PROVIDER_SMART
        : agent === "coach"
          ? env.AI_PROVIDER_COACH
          : agent === "scheduler"
            ? env.AI_PROVIDER_SCHEDULER
            : agent === "moderator"
              ? env.AI_PROVIDER_MODERATOR
              : "";

  const agentModel =
    agent === "planner"
      ? env.AI_MODEL_PLANNER
      : agent === "smart"
        ? env.AI_MODEL_SMART
        : agent === "coach"
          ? env.AI_MODEL_COACH
          : agent === "scheduler"
            ? env.AI_MODEL_SCHEDULER
            : agent === "moderator"
              ? env.AI_MODEL_MODERATOR
              : "";

  // global fallbacks
  const globalProvider = env.AI_DEFAULT_PROVIDER;
  const globalModel = env.AI_DEFAULT_MODEL;
  const provider = (agentProvider || globalProvider || base.provider) as ModelConfig["provider"];
  const model = agentModel || globalModel || base.model;

  return {
    ...base,
    provider,
    model,
  };
}

/**
 * Effective, env-aware per-agent config used by the model resolver.
 */
export const AI_CONFIG: Record<AgentKey, ModelConfig> = AGENT_KEYS.reduce(
  (acc, key) => {
    acc[key] = resolveAgentDefaults(key);
    return acc;
  },
  {} as Record<AgentKey, ModelConfig>
);

/**
 * Ejemplo de override en tiempo de ejecución (conceptual):
 * AgentFactory.create("planner") usará AI_CONFIG["planner"], que surge de AI_DEFAULTS + overrides en env.
 * Para probar otro provider/model por request, puedes construir tu propio agente con un builder ad-hoc.
 */
