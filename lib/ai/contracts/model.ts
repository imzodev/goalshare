/**
 * Model and provider contracts for multi-provider LLM support.
 * These contracts are provider-agnostic and do not import any SDKs.
 */

export type ProviderKey = "openai" | "anthropic" | "openrouter" | "deepseek" | "groq";

export interface ModelConfig {
  provider: ProviderKey;
  model: string;
  temperature?: number;
  maxTokens?: number;
  // Free-form options per provider
  options?: Record<string, unknown>;
  /** Optional per-agent instructions to pass to Agent creation */
  instructions?: string;
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
