/**
 * Provider Registry (stubs)
 * Parent: #42, Issue: #45
 *
 * Provider-agnostic factories that later will wrap concrete SDKs (Vercel AI SDK)
 * and OpenAI Agents extensions (aisdk(...)). No external imports here.
 */

import type { ModelConfig, ModelAdapter, ProviderFactory, ProviderKey } from "../../ai/contracts/model";

/**
 * Minimal adapter that simply records provider/model. In real code this would
 * wrap a provider-specific model and expose a normalized generate(...).
 */
class StubModelAdapter implements ModelAdapter {
  readonly provider: ProviderKey;
  readonly model: string;

  constructor(provider: ProviderKey, model: string) {
    this.provider = provider;
    this.model = model;
  }

  async generate(_prompt: string, _options?: Record<string, unknown>): Promise<unknown> {
    return { status: "NotImplemented", provider: this.provider, model: this.model };
  }
}

/**
 * Factory implementations per provider. Replace the return with an adapter that
 * uses the Vercel AI SDK provider and wrap with Agents extensions via aisdk(...).
 */
const openaiFactory: ProviderFactory = {
  create(config: ModelConfig): ModelAdapter {
    return new StubModelAdapter("openai", config.model);
  },
};

const anthropicFactory: ProviderFactory = {
  create(config: ModelConfig): ModelAdapter {
    return new StubModelAdapter("anthropic", config.model);
  },
};

const openrouterFactory: ProviderFactory = {
  create(config: ModelConfig): ModelAdapter {
    return new StubModelAdapter("openrouter", config.model);
  },
};

/**
 * Exported registry map. Extend with new providers as needed.
 */
export const ProviderRegistry: Record<ProviderKey, ProviderFactory> = {
  openai: openaiFactory,
  anthropic: anthropicFactory,
  openrouter: openrouterFactory,
};

/**
 * Integration note (DeepSeek via OpenRouter):
 * - Use provider "openrouter" and model "deepseek/deepseek-chat" in ModelConfig.
 * - When wiring the real adapter, the OpenRouter API key and headers are required.
 */
