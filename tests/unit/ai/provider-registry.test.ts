import { describe, it, expect } from "vitest";
import { ProviderRegistry } from "../../../lib/ai/model/provider-registry";
import type { ModelAdapter } from "../../../lib/ai/contracts/model";

function assertAdapter(adapter: ModelAdapter, expectedProvider: string, expectedModel: string) {
  expect(adapter.provider).toBe(expectedProvider);
  expect(adapter.model).toBe(expectedModel);
  expect(typeof (adapter as any).getSdkModel).toBe("function");
  // Do not invoke network; just ensure handle can be obtained without throwing
  const modelHandle = (adapter as any).getSdkModel();
  expect(modelHandle).toBeTruthy();
}

describe("ProviderRegistry factories", () => {
  it("creates OpenAI adapter with getSdkModel()", () => {
    const adapter = ProviderRegistry.openai.create({ provider: "openai", model: "gpt-4o-mini" });
    assertAdapter(adapter, "openai", "gpt-4o-mini");
  });

  it("creates Anthropic adapter with getSdkModel()", () => {
    const adapter = ProviderRegistry.anthropic.create({ provider: "anthropic", model: "claude-3-haiku" });
    assertAdapter(adapter, "anthropic", "claude-3-haiku");
  });

  it("creates DeepSeek adapter with getSdkModel()", () => {
    const adapter = ProviderRegistry.deepseek.create({ provider: "deepseek", model: "deepseek-chat" });
    assertAdapter(adapter, "deepseek", "deepseek-chat");
  });
});
