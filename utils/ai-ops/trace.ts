/**
 * No-op Tracer implementation.
 * Satisfies the Tracer contract and can be swapped for OpenTelemetry later.
 */

import type { Tracer, TraceSpan } from "../../lib/ai/contracts/ops";

class NoopTracer implements Tracer {
  startSpan(name: string, attributes?: Record<string, unknown>): TraceSpan {
    return { id: `${name}-${Date.now()}`, name, startTime: Date.now(), ...attributes } as TraceSpan;
  }
  endSpan(_span: TraceSpan): void {
    // no-op
  }
  annotate(_span: TraceSpan, _attributes: Record<string, unknown>): void {
    // no-op
  }
}

export const defaultTracer: Tracer = new NoopTracer();
