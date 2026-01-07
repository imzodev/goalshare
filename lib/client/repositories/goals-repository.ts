"use client";

import type { UserGoalSummary } from "@/types/goals";
import type { ICacheService } from "../cache/types";
import { CACHE_KEYS, CACHE_CONFIG } from "../cache/types";
import { localStorageService } from "../cache/local-storage-service";
import { getGoals } from "@/api-client/goals";

export class GoalsRepository {
  private cacheService: ICacheService;

  constructor() {
    this.cacheService = localStorageService;
  }

  /**
   * Retrieves goals with a Cache-First strategy.
   * If cached data exists and is valid, returns it.
   * Otherwise, fetches from API and updates cache.
   *
   * @param forceRefresh - If true, bypasses cache and fetches fresh data
   */
  async getGoals(forceRefresh: boolean = false): Promise<UserGoalSummary[]> {
    if (!forceRefresh) {
      const cachedGoals = this.cacheService.get<UserGoalSummary[]>(CACHE_KEYS.USER_GOALS);
      if (cachedGoals) {
        return cachedGoals;
      }
    }

    try {
      const goals = await getGoals();
      this.cacheService.set(CACHE_KEYS.USER_GOALS, goals, CACHE_CONFIG.DEFAULT_TTL);
      return goals;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invalidates the goals cache.
   * Should be called when a goal is created, updated, or deleted.
   */
  invalidateGoalsCache(): void {
    this.cacheService.remove(CACHE_KEYS.USER_GOALS);
  }
}

export const goalsRepository = new GoalsRepository();
