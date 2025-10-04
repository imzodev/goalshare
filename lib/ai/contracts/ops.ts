/**
 * Operational utilities contracts: rate limiting, caching, tracing.
 */

export interface RateLimiterConsumeOptions {
  points?: number; // default 1
  windowMs?: number; // optional override window
}

export interface RateLimiter {
  consume: (key: string, options?: RateLimiterConsumeOptions) => Promise<boolean>;
}

export interface CacheSetOptions {
  ttlSeconds?: number; // default implementation can ignore
}

export interface Cache<TValue = unknown> {
  get: (key: string) => Promise<TValue | undefined>;
  set: (key: string, value: TValue, options?: CacheSetOptions) => Promise<void>;
  del?: (key: string) => Promise<void>;
}

export interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
}

export interface Tracer {
  startSpan: (name: string, attributes?: Record<string, unknown>) => Promise<TraceSpan> | TraceSpan;
  endSpan: (span: TraceSpan, attributes?: Record<string, unknown>) => Promise<void> | void;
  annotate?: (span: TraceSpan, attributes: Record<string, unknown>) => Promise<void> | void;
}
