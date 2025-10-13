/**
 * AI Agents contracts
 * Parent Issue: #42, Sub-issue: #43
 *
 * This module defines the core types and interfaces for GoalShare AI agents.
 * It intentionally contains no business logic nor SDK usage.
 */

// Keep imports type-only to avoid runtime deps and circular refs
import type { ToolBinder } from "./tool";
import type { Guardrails } from "./guardrails";
import type { RateLimiter, Cache, Tracer } from "./ops";

/**
 * Single source of truth for supported agent keys.
 * Adding a new agent should require editing ONLY this array.
 */
export const AGENT_KEYS = ["planner", "smart", "coach", "scheduler", "moderator", "autocomplete"] as const;

export type AgentKey = (typeof AGENT_KEYS)[number];

/**
 * Minimal execution context shared with all agents.
 * Implementations will inject concrete no-op or real instances later.
 */
export interface AgentContext {
  traceId?: string;
  userId?: string;
  locale?: string;
  rateLimiter?: RateLimiter;
  cache?: Cache;
  tracer?: Tracer;
  guardrails?: Guardrails;
  tools?: ToolBinder[];
  // Allow additional context extensions without breaking type safety
  meta?: Record<string, unknown>;
}

/**
 * Generic input payload for agent execution. Concrete DTOs will be validated
 * at the route layer before reaching the agent.
 */
export interface AgentInput<T = unknown> {
  payload: T;
  context?: AgentContext;
}

/**
 * Generic output envelope returned by agents.
 */
export interface AgentOutput<T = unknown> {
  traceId: string;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Base interface every agent must implement.
 */
export interface IAgent<TIn = unknown, TOut = unknown> {
  readonly key: AgentKey;
  /**
   * Executes the agent with validated input. Implementations should be pure and side‑effect free
   * except for calling the configured model/tools; persistence is handled elsewhere.
   */
  execute(input: TIn, ctx?: AgentContext): Promise<TOut>;
  /**
   * Expose this agent as a callable tool for other agents.
   * Mirrors SDK capability like `agent.asTool()`.
   */
  asTool?: () => Promise<ToolBinder> | ToolBinder;
  /**
   * Create a specialized handoff tool that transfers control to this agent.
   * Mirrors patterns like `agent.handoffTool(name)` in SDK examples.
   */
  handoffTool?: (toolNameOverride?: string, toolDescriptionOverride?: string) => ToolBinder;
}

/**
 * Factory signature to obtain an agent instance by key.
 */
export type AgentFactory = (key: AgentKey) => IAgent<unknown, unknown>;

/**
 * Simple in-memory registry interface to register and resolve agents.
 */
export interface AgentRegistry {
  register(agent: IAgent<unknown, unknown>): void;
  get<TIn = unknown, TOut = unknown>(key: AgentKey): IAgent<TIn, TOut> | undefined;
  list(): AgentKey[];
}

/**
 * Utility type alias for common agent shape mappings.
 */
export type AgentMap = Partial<Record<AgentKey, IAgent<unknown, unknown>>>;
