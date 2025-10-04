/**
 * Guardrails contracts for moderation and PII redaction.
 */

export type ModerationVerdict = "allow" | "flag" | "block";

export interface ModerationResult {
  verdict: ModerationVerdict;
  reasons?: string[];
  categories?: string[];
}

export interface Guardrails {
  /** Optional pre-generation moderation */
  preModerate?: (text: string) => Promise<ModerationResult> | ModerationResult;
  /** Optional post-generation moderation */
  postModerate?: (text: string) => Promise<ModerationResult> | ModerationResult;
  /** Optional PII redaction pass */
  redactPII?: (text: string) => Promise<string> | string;
}
