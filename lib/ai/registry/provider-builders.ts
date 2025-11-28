import type { Model } from "@openai/agents";
import { aisdk } from "@openai/agents-extensions";
import { openai as openaiProvider } from "@ai-sdk/openai";
import { anthropic as anthropicProvider } from "@ai-sdk/anthropic";
import { deepseek as deepseekProvider } from "@ai-sdk/deepseek";
import { groq as groqProvider } from "@ai-sdk/groq";
import type { ProviderKey } from "@/lib/ai/contracts/model";

export type ProviderBuilder = (modelName: string) => Model;

export const PROVIDER_BUILDERS: Record<ProviderKey, ProviderBuilder> = {
  openai: (modelName) => aisdk(openaiProvider(modelName)) as unknown as Model,
  anthropic: (modelName) => aisdk(anthropicProvider(modelName)) as unknown as Model,
  deepseek: (modelName) => aisdk(deepseekProvider(modelName)) as unknown as Model,
  groq: (modelName) => aisdk(groqProvider(modelName)) as unknown as Model,
  // For OpenRouter, wire its provider adapter when available
  openrouter: (_modelName) => {
    throw new Error("openrouter provider is not wired yet. Add its provider adapter in PROVIDER_BUILDERS.");
  },
};
