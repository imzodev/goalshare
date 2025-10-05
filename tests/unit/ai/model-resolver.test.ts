import { describe, it, expect } from "vitest";
import { ModelResolver } from "../../../lib/ai/model/resolver";
import { AI_CONFIG } from "../../../config/ai";
import type { AgentKey } from "../../../lib/ai/contracts/agent";

function isAdapterLike(x: unknown): x is { provider: string; model: string } {
  return !!x && typeof x === "object" && "provider" in (x as any) && "model" in (x as any);
}

describe("ModelResolver", () => {
  it("resolves default adapter based on AI_CONFIG for smart", () => {
    const key: AgentKey = "smart";
    const adapter = ModelResolver.resolve(key);
    const expected = AI_CONFIG[key];
    expect(isAdapterLike(adapter)).toBe(true);
    expect((adapter as any).provider).toBe(expected.provider);
    expect((adapter as any).model).toBe(expected.model);
  });

  it("applies override provider/model on top of defaults", () => {
    const key: AgentKey = "planner";
    const adapter = ModelResolver.resolve(key, { provider: "anthropic", model: "claude-3-haiku" });
    expect(isAdapterLike(adapter)).toBe(true);
    expect((adapter as any).provider).toBe("anthropic");
    expect((adapter as any).model).toBe("claude-3-haiku");
  });

  it("throws if provider factory is missing", () => {
    const key: AgentKey = "coach";
    // Force an invalid provider; cast to bypass TS union for test purposes
    expect(() => ModelResolver.resolve(key, { provider: "__invalid__" as any })).toThrow(/No provider factory/);
  });
});
