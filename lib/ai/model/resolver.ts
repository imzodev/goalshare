/**
 * Model Resolver (stubs)
 * Parent: #42, Issue: #45
 *
 * Resolves provider-agnostic models using ProviderRegistry and per-agent defaults.
 * No external SDK imports. Hook points exist to integrate Vercel AI SDK and
 * OpenAI Agents extensions via aisdk(...) in a later issue.
 */

import type { AgentKey } from "../../ai/contracts/agent";
import type { ModelAdapter, ModelConfig } from "../../ai/contracts/model";
import { ProviderRegistry } from "./provider-registry";
import { AI_DEFAULTS } from "../../../config/ai";

/**
 * Merge default configuration with per-request override.
 */
function mergeConfig(base: ModelConfig, override?: Partial<ModelConfig>): ModelConfig {
  return {
    ...base,
    ...override,
    options: { ...(base.options ?? {}), ...(override?.options ?? {}) },
  };
}

/**
 * Resolver returning a normalized ModelAdapter. In the future, this can wrap
 * the provider model with @openai/agents-extensions `aisdk(...)`.
 */
export const ModelResolver = {
  resolve(agentKey: AgentKey, override?: Partial<ModelConfig>): ModelAdapter {
    const base = AI_DEFAULTS[agentKey];
    if (!base) {
      throw new Error(`No default model config for agent: ${agentKey}`);
    }
    const finalConfig = mergeConfig(base, override);
    const factory = ProviderRegistry[finalConfig.provider];
    if (!factory) {
      throw new Error(`No provider factory for: ${finalConfig.provider}`);
    }
    return factory.create(finalConfig);
  },
};

/**
 * Notes:
 * - DeepSeek via OpenRouter: use provider "openrouter" and model "deepseek/deepseek-chat".
 * - API keys and headers will be handled when wiring real adapters.
 */
