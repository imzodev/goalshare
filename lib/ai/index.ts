/**
 * Public AI API Barrel (lightweight)
 *
 * Exposes only the stable/public surface for consumers. Avoid re-exporting config/env
 * internals to prevent import cycles. Keep this file minimal and focused.
 */

// Contracts (public types)
export type { AgentKey, IAgent, AgentContext, AgentOutput } from "./contracts/agent";
export type { ModelConfig, ModelAdapter, ProviderFactory, ProviderKey } from "./contracts/model";
export type { ToolDefinition, ToolBinder, HandoffDefinition } from "./contracts/tool";
export type { Guardrails, ModerationResult, ModerationVerdict } from "./contracts/guardrails";

// DTOs (Zod schemas) for API routes and agents
export {
  MilestonesRequestSchema,
  MilestonesResponseSchema,
  MilestoneItemSchema,
  SmartRequestSchema,
  AdviceRequestSchema,
  PlanRequestSchema,
  ModerateRequestSchema,
} from "./contracts/dto";

// Registry & Factory
export { AgentFactory, agentRegistry } from "./registry";

// Model resolution handled via AI_CONFIG + provider builders in AgentFactory
