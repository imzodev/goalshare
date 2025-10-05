/**
 * No-op Cache implementation.
 * Satisfies the Cache contract and can be swapped for Redis later.
 */

import type { Cache } from "../../lib/ai/contracts/ops";

class NoopCache implements Cache<any> {
  private store = new Map<string, any>();

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined;
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export const defaultCache: Cache = new NoopCache();
