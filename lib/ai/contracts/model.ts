/**
 * Model and provider contracts for multi-provider LLM support.
 * These contracts are provider-agnostic and do not import any SDKs.
 */

import type { AgentKey } from "./agent";

export type ProviderKey = "openai" | "anthropic" | "openrouter" | "deepseek";

export interface ModelConfig {
  provider: ProviderKey;
  model: string;
  temperature?: number;
  maxTokens?: number;
  // Free-form options per provider
  options?: Record<string, unknown>;
}

/**
 * Minimal normalized model interface the app will target.
 * Concrete adapters will wrap provider SDKs to implement this.
 */
export interface ModelAdapter {
  readonly provider: ProviderKey;
  readonly model: string;
  generate: (prompt: string, options?: Record<string, unknown>) => Promise<unknown>;
}

export interface ProviderFactory {
  create: (config: ModelConfig) => ModelAdapter;
}

export interface ModelResolver {
  /**
   * Resolves a normalized model adapter for a given agent key and optional per-request override
   * of the configuration.
   */
  resolve: (agentKey: AgentKey, override?: Partial<ModelConfig>) => Promise<ModelAdapter> | ModelAdapter;
}
