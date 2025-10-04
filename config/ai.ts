/**
 * AI per-agent default model configuration (stubs)
 * Parent: #42, Issue: #45
 *
 * Provider-agnostic defaults. These are read by the ModelResolver and can be
 * overridden per-request. No SDK imports here.
 */

import type { ModelConfig } from "../lib/ai/contracts/model";
import type { AgentKey } from "../lib/ai/contracts/agent";

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
 * Example override usage:
 * ModelResolver.resolve("planner", { provider: "openrouter", model: "deepseek/deepseek-chat" })
 */
