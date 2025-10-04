/**
 * AI per-agent default model configuration (stubs)
 * Parent: #42, Issue: #45
 *
 * Provider-agnostic defaults. These are read by the ModelResolver and can be
 * overridden per-request. No SDK imports here.
 */

import type { ModelConfig } from "../lib/ai/contracts/model";
import type { AgentKey } from "../lib/ai/contracts/agent";
import { env } from "./env";

/**
 * Default provider/model per agent. Adjust as needed in future issues.
 * Note: when integrating OpenRouter, you can set provider: "openrouter"
 * and use model: "deepseek/deepseek-chat" for DeepSeek.
 */
export const AI_DEFAULTS: Record<AgentKey, ModelConfig> = {
  planner: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.3,
  },
  smart: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.2,
  },
  coach: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.5,
  },
  scheduler: {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.2,
  },
  moderator: {
    provider: "openai",
    model: "omni-moderation-latest",
    temperature: 0,
  },
};

/**
 * Compute per-agent ModelConfig by applying env overrides on top of AI_DEFAULTS.
 * Precedence: per-agent overrides > global AI_DEFAULT_* > AI_DEFAULTS.
 */
export function resolveAgentDefaults(agent: AgentKey): ModelConfig {
  const base = AI_DEFAULTS[agent];

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
export const AI_CONFIG: Record<AgentKey, ModelConfig> = {
  planner: resolveAgentDefaults("planner"),
  smart: resolveAgentDefaults("smart"),
  coach: resolveAgentDefaults("coach"),
  scheduler: resolveAgentDefaults("scheduler"),
  moderator: resolveAgentDefaults("moderator"),
};

/**
 * Example override usage:
 * ModelResolver.resolve("planner", { provider: "openrouter", model: "deepseek/deepseek-chat" })
 */
