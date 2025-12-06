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
import { Agent, run } from "@openai/agents";
import { AI_CONFIG } from "../../../config/ai";
import { PROVIDER_BUILDERS } from "./provider-builders";

/**
 * Minimal NotImplemented payload shape for stub agents.
 */
export interface NotImplementedData {
  status: "NotImplemented";
  agent: AgentKey;
}

/**
 * Concrete minimal data shape returned by the SDK-backed adapter for now.
 */
export type SdkAgentData = {
  agent: AgentKey;
  finalOutput: unknown;
};

/**
 * Simple generator for a trace id when none is provided by context.
 */
function genTraceId(prefix: string = "ai"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Generic stub agent that returns a NotImplemented response.
 */
class SdkAgentAdapter implements IAgent<unknown, AgentOutput<SdkAgentData>> {
  readonly key: AgentKey;
  private readonly sdkAgent: Agent;

  constructor(key: AgentKey, sdkAgent: Agent) {
    this.key = key;
    this.sdkAgent = sdkAgent;
  }

  async execute(input: unknown, ctx?: AgentContext): Promise<AgentOutput<SdkAgentData>> {
    const traceId = ctx?.traceId ?? genTraceId(this.key);

    // Derive a basic input string for the SDK. Later we can map DTOs to prompts.
    let userInput: string;
    if (typeof input === "string") {
      userInput = input;
    } else if (
      input &&
      typeof input === "object" &&
      "payload" in (input as Record<string, unknown>) &&
      typeof (input as Record<string, unknown>).payload === "string"
    ) {
      userInput = (input as Record<string, unknown>).payload as string;
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

  async stream(input: unknown, _ctx?: AgentContext): Promise<{ stream: ReadableStream<any>; completed: Promise<any> }> {
    // Derive a basic input string for the SDK.
    let userInput: string;
    if (typeof input === "string") {
      userInput = input;
    } else if (
      input &&
      typeof input === "object" &&
      "payload" in (input as Record<string, unknown>) &&
      typeof (input as Record<string, unknown>).payload === "string"
    ) {
      userInput = (input as Record<string, unknown>).payload as string;
    } else {
      userInput = JSON.stringify(input ?? {});
    }

    const result = await run(this.sdkAgent, userInput, { stream: true });

    const textStream = result.toTextStream({ compatibleWithNodeStreams: false });

    // Return both the stream and the completed promise
    return {
      stream: textStream as unknown as ReadableStream<string>,
      completed: result.completed,
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
  create(key: AgentKey): IAgent<unknown, AgentOutput<SdkAgentData>> {
    const existing = agentRegistry.get(key);
    if (existing) return existing as IAgent<unknown, AgentOutput<SdkAgentData>>;

    const cfg = AI_CONFIG[key];
    if (!cfg) throw new Error(`No AI config for agent: ${key}`);

    const buildModel = PROVIDER_BUILDERS[cfg.provider];
    if (!buildModel) throw new Error(`Provider builder missing: ${cfg.provider}`);
    const model = buildModel(cfg.model);

    const instructions = cfg.instructions || `You are the ${key} agent.`;
    const sdkAgent = new Agent({ name: `${key} agent`, instructions, model });
    const adapter = new SdkAgentAdapter(key, sdkAgent);
    agentRegistry.register(adapter);
    return adapter;
  },
  refresh(key: AgentKey): IAgent<unknown, AgentOutput<SdkAgentData>> {
    agentRegistry.delete(key);
    return this.create(key);
  },
  clear(): void {
    agentRegistry.clear();
  },
};

AGENT_KEYS.forEach((k) => {
  if (!agentRegistry.get(k)) {
    const cfg = AI_CONFIG[k];
    const buildModel = PROVIDER_BUILDERS[cfg.provider];
    if (!buildModel) return; // skip if provider not wired
    const model = buildModel(cfg.model);
    const instructions = cfg.instructions || `You are the ${k} agent.`;
    const sdkAgent = new Agent({ name: `${k} agent`, instructions, model });
    agentRegistry.register(new SdkAgentAdapter(k, sdkAgent));
  }
});
