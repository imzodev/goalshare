"use client";

import type { UserGoalSummary } from "@/types/goals";

/**
 * Cache key prefix for goals
 */
const CACHE_KEY_PREFIX = "goals:user:";

/**
 * Cache TTL: 5 minutes (in milliseconds)
 * Goals don't change as frequently as chat messages,
 * so a moderate TTL provides good balance between freshness and performance
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedGoals {
  goals: UserGoalSummary[];
  timestamp: number;
}

/**
 * Service for caching user goals in localStorage.
 * Provides a simple cache layer to reduce API calls and improve perceived performance.
 */
export class GoalsCacheService {
  private enabled: boolean;

  constructor() {
    // Only enable in browser environment
    this.enabled = typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  /**
   * Generates the localStorage key for a user's goals
   */
  private getCacheKey(userId: string): string {
    return `${CACHE_KEY_PREFIX}${userId}`;
  }

  /**
   * Checks if cached data is still valid (within TTL)
   */
  private isValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL_MS;
  }

  /**
   * Retrieves goals from cache.
   * Returns null if cache miss or expired.
   *
   * @param userId - The user ID
   * @returns Array of goals or null if cache miss/expired
   */
  getGoals(userId: string): UserGoalSummary[] | null {
    if (!this.enabled) {
      return null;
    }

    try {
      const key = this.getCacheKey(userId);
      const cached = localStorage.getItem(key);

      if (!cached) {
        console.log(`[GoalsCacheService] Cache miss for user: ${userId}`);
        return null;
      }

      const parsed: CachedGoals = JSON.parse(cached);

      if (!this.isValid(parsed.timestamp)) {
        console.log(`[GoalsCacheService] Cache expired for user: ${userId}`);
        this.invalidateCache(userId);
        return null;
      }

      console.log(`[GoalsCacheService] Cache hit for user: ${userId}, ${parsed.goals.length} goals`);
      return parsed.goals;
    } catch (error) {
      console.error("[GoalsCacheService] Error getting goals from cache:", error);
      return null;
    }
  }

  /**
   * Caches goals in localStorage.
   *
   * @param userId - The user ID
   * @param goals - Array of goals to cache
   */
  cacheGoals(userId: string, goals: UserGoalSummary[]): void {
    if (!this.enabled) {
      return;
    }

    try {
      const key = this.getCacheKey(userId);
      const data: CachedGoals = {
        goals,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[GoalsCacheService] Cached ${goals.length} goals for user: ${userId}`);
    } catch (error) {
      console.error("[GoalsCacheService] Error caching goals:", error);
      // Don't throw - cache failures shouldn't break the app
    }
  }

  /**
   * Invalidates (deletes) the cache for a user.
   *
   * @param userId - The user ID
   */
  invalidateCache(userId: string): void {
    if (!this.enabled) {
      return;
    }

    try {
      const key = this.getCacheKey(userId);
      localStorage.removeItem(key);
      console.log(`[GoalsCacheService] Cache invalidated for user: ${userId}`);
    } catch (error) {
      console.error("[GoalsCacheService] Error invalidating cache:", error);
    }
  }

  /**
   * Clears all goals cache entries.
   * Useful for logout scenarios.
   */
  clearAllCache(): void {
    if (!this.enabled) {
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log(`[GoalsCacheService] Cleared ${keysToRemove.length} cache entries`);
    } catch (error) {
      console.error("[GoalsCacheService] Error clearing cache:", error);
    }
  }
}

// Singleton instance for use across the app
export const goalsCacheService = new GoalsCacheService();
