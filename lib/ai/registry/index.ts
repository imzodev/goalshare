/**
 * Agent Registry and Factory (stubs)
 * Parent: #42, Issue: #44
 *
 * Provides an in-memory AgentRegistry and a default AgentFactory that returns
 * stub agents for: planner, smart, coach, scheduler, moderator.
 *
 * No business logic or SDK calls. Stubs return NotImplemented with AgentOutput shape.
 */

import type { AgentKey, IAgent, AgentRegistry as AgentRegistryContract, AgentContext } from "../contracts/agent";
import { AGENT_KEYS } from "../contracts/agent";
import type { AgentOutput } from "../contracts/agent";

/**
 * Minimal NotImplemented payload shape for stub agents.
 */
export interface NotImplementedData {
  status: "NotImplemented";
  agent: AgentKey;
}

/**
 * Simple generator for a trace id when none is provided by context.
 */
function genTraceId(prefix: string = "ai"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generic stub agent that returns a NotImplemented response.
 */
class StubAgent implements IAgent<unknown, AgentOutput<NotImplementedData>> {
  readonly key: AgentKey;

  constructor(key: AgentKey) {
    this.key = key;
  }

  async execute(_input: unknown, ctx?: AgentContext): Promise<AgentOutput<NotImplementedData>> {
    const traceId = ctx?.traceId ?? genTraceId(this.key);
    return {
      traceId,
      data: {
        status: "NotImplemented",
        agent: this.key,
      },
      meta: {
        note: "Stub agent placeholder. Wire real implementation in subsequent issues.",
      },
    };
  }
}

/**
 * In-memory implementation of AgentRegistry contract.
 */
class InMemoryAgentRegistry implements AgentRegistryContract {
  private map = new Map<AgentKey, IAgent<unknown, unknown>>();

  register(agent: IAgent<unknown, unknown>): void {
    this.map.set(agent.key as AgentKey, agent);
  }

  get<TIn = unknown, TOut = unknown>(key: AgentKey): IAgent<TIn, TOut> | undefined {
    return this.map.get(key) as unknown as IAgent<TIn, TOut> | undefined;
  }

  list(): AgentKey[] {
    return Array.from(this.map.keys());
  }
}

/**
 * Singleton registry instance for app-wide use.
 */
export const agentRegistry = new InMemoryAgentRegistry();

/**
 * Default factory that resolves known stubs via the registry.
 */
export const AgentFactory = {
  create(key: AgentKey): IAgent<unknown, unknown> {
    const existing = agentRegistry.get(key);
    if (existing) return existing;
    const stub = new StubAgent(key);
    agentRegistry.register(stub);
    return stub;
  },
};

// Pre-register known stub agents based on AGENT_KEYS
AGENT_KEYS.forEach((k) => {
  if (!agentRegistry.get(k)) {
    agentRegistry.register(new StubAgent(k));
  }
});
