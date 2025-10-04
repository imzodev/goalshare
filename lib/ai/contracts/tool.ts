/**
 * Tools contracts for agent function-calling.
 * No runtime dependencies; Zod types are imported as type-only.
 */

import type { ZodTypeAny } from "zod";
import type { IAgent } from "./agent";

/**
 * A strongly-typed tool definition backed by Zod schema for parameters.
 */
export interface ToolDefinition<TParams = unknown, TResult = unknown> {
  name: string;
  description?: string;
  /** Matches SDK naming: `parameters` is the Zod schema for the tool input */
  parameters?: ZodTypeAny; // Optional at contract level
  execute: (params: TParams) => Promise<TResult> | TResult;
}

/**
 * A binder to attach a tool into an agent runtime (e.g., model function-calling).
 * Implementations can adapt to the concrete model SDK later.
 */
export interface ToolBinder {
  readonly name: string;
  bind: () => unknown; // returns adapter-specific callable handle
}

/**
 * Definition for creating a handoff tool that transfers control to another agent.
 * Mirrors SDK concepts (e.g., new Handoff({ agent, ... })).
 */
export interface HandoffDefinition<TInput = unknown> {
  agent: IAgent<any, any>;
  toolNameOverride?: string;
  toolDescriptionOverride?: string;
  onHandoff?: (context: unknown, input: TInput) => Promise<void> | void;
}
