import type { ProviderKey } from "@/lib/ai/contracts/model";
import { PROVIDER_BUILDERS } from "@/lib/ai/registry/provider-builders";

export interface PlainLLMModel {
  readonly provider: ProviderKey;
  readonly model: string;
  generate: (prompt: string, options?: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Minimal plain LLM adapter built on top of provider builders.
 * NOTE: This is a scaffold. Wire actual generation once the plain SDK is selected.
 */
export function createPlainLLM(provider: ProviderKey, model: string): PlainLLMModel {
  // We reuse the provider builders to ensure a single place to add providers.
  const build = PROVIDER_BUILDERS[provider];
  if (!build) throw new Error(`Provider builder missing: ${provider}`);

  // Build handle (currently Agents Model). Real plain LLM generation will replace this path.
  const _handle = build(model);
  void _handle; // placeholder to avoid lint error until real implementation

  return {
    provider,
    model,
    async generate(_prompt: string, _options?: Record<string, unknown>) {
      // Intentionally not wired. Choose and integrate a plain LLM SDK here (e.g., Vercel AI SDK core).
      // Keep signature stable so callers won't change when wiring real generation.
      return { status: "NotImplemented", provider, model };
    },
  };
}
