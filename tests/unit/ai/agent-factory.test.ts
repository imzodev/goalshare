import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
// Use hoisted store to synchronize between vi.mock and tests
const hoisted = vi.hoisted(() => ({
  constructed: [] as Array<{ name?: string; instructions?: string; model?: unknown }>,
}));

// Mock provider builders to avoid touching real SDKs
vi.mock("../../../lib/ai/registry/provider-builders", () => {
  return {
    PROVIDER_BUILDERS: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openai: (_modelName: string) => ({}) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      anthropic: (_modelName: string) => ({}) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deepseek: (_modelName: string) => ({}) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openrouter: (_modelName: string) => ({}) as any,
    },
  };
});

// Mock @openai/agents to avoid network and assert integration points
vi.mock("@openai/agents", () => {
  const run = vi.fn(async (_agent: unknown, _input: string) => {
    return { finalOutput: "MOCK_FINAL_OUTPUT" };
  });
  class Agent {
    name?: string;
    instructions?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model?: any;
    constructor(opts: { name?: string; instructions?: string; model?: unknown }) {
      hoisted.constructed.push(opts);
      this.name = opts.name;
      this.instructions = opts.instructions;
      this.model = opts.model;
    }
  }
  return { Agent, run };
});

import { AgentFactory, agentRegistry } from "../../../lib/ai/registry/index";
import { run as mockedRun } from "@openai/agents";
import { AI_CONFIG } from "../../../config/ai";

describe("AgentFactory + SdkAgentAdapter", () => {
  beforeEach(() => {
    // Ensure clean state before each test
    AgentFactory.clear();
  });

  afterEach(() => {
    AgentFactory.clear();
  });

  it("creates and caches a single SDK-backed agent per key", async () => {
    const a1 = AgentFactory.create("smart");
    const a2 = AgentFactory.create("smart");
    expect(a2).toBe(a1);

    const list = agentRegistry.list();
    expect(list).toContain("smart");
  });

  it("execute() runs the SDK agent and returns finalOutput envelope", async () => {
    const agent = AgentFactory.create("smart");
    // Basic string input
    const result1 = await agent.execute("hello");
    expect((mockedRun as any).mock.calls.length).toBe(1);
    expect(result1.data).toMatchObject({ agent: "smart", finalOutput: "MOCK_FINAL_OUTPUT" });

    // DTO with payload string
    const dto = { payload: "plan my week" };
    const result2 = await agent.execute(dto);
    expect((mockedRun as any).mock.calls.length).toBe(2);
    expect(result2.data).toMatchObject({ agent: "smart", finalOutput: "MOCK_FINAL_OUTPUT" });
  });

  it("refresh() rebuilds the SDK agent instance for a key", async () => {
    const a1 = AgentFactory.create("smart");
    const a2 = AgentFactory.refresh("smart");
    expect(a2).not.toBe(a1);
  });

  it("clear() empties the registry", async () => {
    AgentFactory.create("smart");
    expect(agentRegistry.list().length).toBeGreaterThan(0);
    AgentFactory.clear();
    expect(agentRegistry.list().length).toBe(0);
  });

  it("builds 'planner' with AI_CONFIG instructions and caches instance", () => {
    hoisted.constructed.length = 0;
    const cfg = AI_CONFIG.planner;
    const a1 = AgentFactory.create("planner");
    const a2 = AgentFactory.create("planner");
    expect(a2).toBe(a1);
    // Only one SDK Agent constructed
    expect(hoisted.constructed.length).toBe(1);
    const opts = hoisted.constructed[0]!;
    expect(opts.name).toBe("planner agent");
    expect(typeof opts.instructions).toBe("string");
    if (cfg.instructions) {
      expect(opts.instructions).toContain("PLANIFICADOR");
    }
    expect(opts.model).toBeTruthy();
  });
});
