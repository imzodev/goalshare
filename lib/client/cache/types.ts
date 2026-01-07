export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  version: string;
}

export interface ICacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl?: number): void;
  remove(key: string): void;
  clear(): void;
}

export const CACHE_KEYS = {
  USER_GOALS: "goalshare:user_goals",
  USER_GOALS_SUMMARY: "goalshare:user_goals_summary",
} as const;

export const CACHE_CONFIG = {
  VERSION: "1.0.0",
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
} as const;
