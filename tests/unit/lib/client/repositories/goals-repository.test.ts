import { describe, it, expect, vi, beforeEach } from "vitest";
import { GoalsRepository } from "@/lib/client/repositories/goals-repository";
import * as goalsApi from "@/api-client/goals";
import { CACHE_KEYS, CACHE_CONFIG } from "@/lib/client/cache/types";

// Mock dependencies
vi.mock("@/api-client/goals", () => ({
  getGoals: vi.fn(),
}));

// Mock LocalStorageService instance
const { mockCacheService } = vi.hoisted(() => {
  return {
    mockCacheService: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
  };
});

vi.mock("@/lib/client/cache/local-storage-service", () => ({
  localStorageService: mockCacheService,
}));

describe("GoalsRepository", () => {
  let repository: GoalsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new GoalsRepository();
  });

  it("should return cached goals if available and not force refresh", async () => {
    const mockGoals = [{ id: "1", title: "Cached Goal" }];
    mockCacheService.get.mockReturnValue(mockGoals);

    const result = await repository.getGoals(false);

    expect(mockCacheService.get).toHaveBeenCalledWith(CACHE_KEYS.USER_GOALS);
    expect(result).toBe(mockGoals);
    expect(goalsApi.getGoals).not.toHaveBeenCalled();
  });

  it("should fetch from API if cache is empty", async () => {
    mockCacheService.get.mockReturnValue(null);
    const mockApiGoals = [{ id: "2", title: "API Goal" }];
    (goalsApi.getGoals as any).mockResolvedValue(mockApiGoals);

    const result = await repository.getGoals(false);

    expect(mockCacheService.get).toHaveBeenCalledWith(CACHE_KEYS.USER_GOALS);
    expect(goalsApi.getGoals).toHaveBeenCalled();
    expect(mockCacheService.set).toHaveBeenCalledWith(CACHE_KEYS.USER_GOALS, mockApiGoals, CACHE_CONFIG.DEFAULT_TTL);
    expect(result).toBe(mockApiGoals);
  });

  it("should force refresh from API even if cache exists", async () => {
    const mockCachedGoals = [{ id: "1", title: "Cached Goal" }];
    mockCacheService.get.mockReturnValue(mockCachedGoals);

    const mockApiGoals = [{ id: "2", title: "API Goal (Refreshed)" }];
    (goalsApi.getGoals as any).mockResolvedValue(mockApiGoals);

    const result = await repository.getGoals(true); // forceRefresh = true

    expect(mockCacheService.get).not.toHaveBeenCalled(); // Should skip cache check
    expect(goalsApi.getGoals).toHaveBeenCalled();
    expect(mockCacheService.set).toHaveBeenCalledWith(CACHE_KEYS.USER_GOALS, mockApiGoals, CACHE_CONFIG.DEFAULT_TTL);
    expect(result).toBe(mockApiGoals);
  });

  it("should throw error if API fails and no cache is used (or forced refresh)", async () => {
    (goalsApi.getGoals as any).mockRejectedValue(new Error("API Error"));

    await expect(repository.getGoals(true)).rejects.toThrow("API Error");
  });

  it("should invalidate cache correctly", () => {
    repository.invalidateGoalsCache();
    expect(mockCacheService.remove).toHaveBeenCalledWith(CACHE_KEYS.USER_GOALS);
  });
});
