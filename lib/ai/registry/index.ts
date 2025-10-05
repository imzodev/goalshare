/**
 * Agent Registry and Factory unified with OpenAI Agents SDK
 * Parent: #42, Issue: #44
 *
 * Provides an in-memory AgentRegistry and a default AgentFactory that returns
 * SDK-backed agents through a thin IAgent adapter. Output remains NotImplemented
 * until business logic is added.
 */

import type { AgentKey, IAgent, AgentRegistry as AgentRegistryContract, AgentContext } from "../contracts/agent";
import { AGENT_KEYS } from "../contracts/agent";
import type { AgentOutput } from "../contracts/agent";
import type { Model } from "@openai/agents";
import { Agent, run } from "@openai/agents";
import { ModelResolver } from "../model/resolver";
import type { ModelAdapter } from "../contracts/model";

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
class SdkAgentAdapter implements IAgent<unknown, AgentOutput<unknown>> {
  readonly key: AgentKey;
  private readonly sdkAgent: Agent;

  constructor(key: AgentKey, sdkAgent: Agent) {
    this.key = key;
    this.sdkAgent = sdkAgent;
  }

  async execute(input: unknown, ctx?: AgentContext): Promise<AgentOutput<unknown>> {
    const traceId = ctx?.traceId ?? genTraceId(this.key);

    // Derive a basic input string for the SDK. Later we can map DTOs to prompts.
    let userInput: string;
    if (typeof input === "string") {
      userInput = input;
    } else if (
      input &&
      typeof input === "object" &&
      "payload" in (input as Record<string, unknown>) &&
      typeof (input as any).payload === "string"
    ) {
      userInput = (input as any).payload as string;
    } else {
      userInput = JSON.stringify(input ?? {});
    }

    const result = await run(this.sdkAgent, userInput);

    return {
      traceId,
      data: {
        agent: this.key,
        finalOutput: result.finalOutput,
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

  delete(key: AgentKey): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

/**
 * Singleton registry instance for app-wide use.
 */
export const agentRegistry = new InMemoryAgentRegistry();

/**
 * Default factory that returns SDK-backed agents via the registry.
 */
export const AgentFactory = {
  create(key: AgentKey): IAgent<unknown, unknown> {
    const existing = agentRegistry.get(key);
    if (existing) return existing;
    const modelAdapter: ModelAdapter = ModelResolver.resolve(key) as ModelAdapter;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const concrete: any = modelAdapter;
    if (typeof concrete.getSdkModel !== "function") {
      throw new Error("Resolved model adapter does not expose getSdkModel()");
    }
    const model: Model = concrete.getSdkModel();
    const sdkAgent = new Agent({ name: `${key} agent`, instructions: `You are the ${key} agent`, model });
    const adapter = new SdkAgentAdapter(key, sdkAgent);
    agentRegistry.register(adapter);
    return adapter;
  },
  refresh(key: AgentKey): IAgent<unknown, unknown> {
    // Remove current entry (if any) and rebuild
    agentRegistry.delete(key);
    const modelAdapter: ModelAdapter = ModelResolver.resolve(key) as ModelAdapter;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const concrete: any = modelAdapter;
    if (typeof concrete.getSdkModel !== "function") {
      throw new Error("Resolved model adapter does not expose getSdkModel()");
    }
    const model: Model = concrete.getSdkModel();
    const sdkAgent = new Agent({ name: `${key} agent`, instructions: `You are the ${key} agent`, model });
    const adapter = new SdkAgentAdapter(key, sdkAgent);
    agentRegistry.register(adapter);
    return adapter;
  },
  clear(): void {
    agentRegistry.clear();
  },
};

AGENT_KEYS.forEach((k) => {
  if (!agentRegistry.get(k)) {
    const modelAdapter: ModelAdapter = ModelResolver.resolve(k) as ModelAdapter;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const concrete: any = modelAdapter;
    if (typeof concrete.getSdkModel !== "function") {
      throw new Error("Resolved model adapter does not expose getSdkModel()");
    }
    const model: Model = concrete.getSdkModel();
    const sdkAgent = new Agent({ name: `${k} agent`, instructions: `You are the ${k} agent`, model });
    agentRegistry.register(new SdkAgentAdapter(k, sdkAgent));
  }
});
