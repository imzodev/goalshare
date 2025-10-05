/**
 * Provider Registry wired to Vercel AI SDK + OpenAI Agents adapter
 * Parent: #42, Issue: #45
 */

import type { ModelConfig, ModelAdapter, ProviderFactory, ProviderKey } from "../../ai/contracts/model";
import { aisdk } from "@openai/agents-extensions";
import { openai as openaiProvider } from "@ai-sdk/openai";
import { anthropic as anthropicProvider } from "@ai-sdk/anthropic";
import { deepseek as deepseekProvider } from "@ai-sdk/deepseek";

/**
 * Adapter that stores the wrapped model handle produced by aisdk(provider(model)).
 * The generate implementation remains a placeholder until business logic is added.
 */
class AISDKModelAdapter implements ModelAdapter {
  readonly provider: ProviderKey;
  readonly model: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly handle: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(provider: ProviderKey, model: string, handle: any) {
    this.provider = provider;
    this.model = model;
    this.handle = handle;
  }

  async generate(_prompt: string, _options?: Record<string, unknown>): Promise<unknown> {
    // Touch handle to satisfy TS until real generation is wired.
    void this.handle;
    // Intentionally return a placeholder until concrete generation is wired.
    return { status: "NotImplemented", provider: this.provider, model: this.model };
  }
}

const openaiFactory: ProviderFactory = {
  create(config: ModelConfig): ModelAdapter {
    const handle = aisdk(openaiProvider(config.model));
    return new AISDKModelAdapter("openai", config.model, handle);
  },
};

const anthropicFactory: ProviderFactory = {
  create(config: ModelConfig): ModelAdapter {
    const handle = aisdk(anthropicProvider(config.model));
    return new AISDKModelAdapter("anthropic", config.model, handle);
  },
};

// Keep OpenRouter as a stub until the provider package or configuration is finalized.
const openrouterFactory: ProviderFactory = {
  create(config: ModelConfig): ModelAdapter {
    const handle = { provider: "openrouter", model: config.model };
    return new AISDKModelAdapter("openrouter", config.model, handle);
  },
};

const deepseekFactory: ProviderFactory = {
  create(config: ModelConfig): ModelAdapter {
    const handle = aisdk(deepseekProvider(config.model));
    return new AISDKModelAdapter("deepseek", config.model, handle);
  },
};

export const ProviderRegistry: Record<ProviderKey, ProviderFactory> = {
  openai: openaiFactory,
  anthropic: anthropicFactory,
  openrouter: openrouterFactory,
  deepseek: deepseekFactory,
};

/**
 * Notes:
 * - DeepSeek via OpenRouter: provider "openrouter" y modelo "deepseek/deepseek-chat".
 * - El adapter actual conserva el handle envuelto; la ejecución real se conectará después.
 */
