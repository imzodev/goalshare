import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Redis before importing ChatCacheService
const mockLrange = vi.fn();
const mockLpush = vi.fn();
const mockRpush = vi.fn();
const mockDel = vi.fn();
const mockExpire = vi.fn();
const mockExists = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    lrange: mockLrange,
    lpush: mockLpush,
    rpush: mockRpush,
    del: mockDel,
    expire: mockExpire,
    exists: mockExists,
  })),
}));

// Mock environment variables
vi.mock("@/config/env", () => ({
  env: {
    UPSTASH_REDIS_REST_URL: "https://mock-redis.upstash.io",
    UPSTASH_REDIS_REST_TOKEN: "mock-token",
  },
}));

import { ChatCacheService } from "@/services/chat-cache-service";

describe("ChatCacheService", () => {
  let service: ChatCacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChatCacheService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getMessages", () => {
    it("returns null when cache is empty", async () => {
      mockLrange.mockResolvedValueOnce([]);

      const result = await service.getMessages("goal-123");

      expect(result).toBeNull();
      expect(mockLrange).toHaveBeenCalledWith("chat:messages:goal-123", 0, -1);
    });

    it("returns messages from cache in chronological order", async () => {
      const cachedMessages = [
        { id: "m1", goalId: "goal-123", role: "user", content: "Hello", createdAt: "2024-01-01T10:00:00Z" },
        { id: "m2", goalId: "goal-123", role: "assistant", content: "Hi!", createdAt: "2024-01-01T10:01:00Z" },
      ];
      mockLrange.mockResolvedValueOnce(cachedMessages);

      const result = await service.getMessages("goal-123");

      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);
      expect(result?.[0]?.id).toBe("m1");
      expect(result?.[0]?.createdAt).toBeInstanceOf(Date);
      expect(result?.[1]?.id).toBe("m2");
    });

    it("uses pagination parameters for LRANGE", async () => {
      mockLrange.mockResolvedValueOnce([]);

      await service.getMessages("goal-123", { limit: 5, offset: 0 });

      // Last 5 messages: LRANGE key -5 -1
      expect(mockLrange).toHaveBeenCalledWith("chat:messages:goal-123", -5, -1);
    });

    it("uses offset for pagination", async () => {
      mockLrange.mockResolvedValueOnce([]);

      await service.getMessages("goal-123", { limit: 5, offset: 5 });

      // Next 5 older: LRANGE key -10 -6
      expect(mockLrange).toHaveBeenCalledWith("chat:messages:goal-123", -10, -6);
    });

    it("handles Redis errors gracefully", async () => {
      mockLrange.mockRejectedValueOnce(new Error("Redis connection failed"));

      const result = await service.getMessages("goal-123");

      expect(result).toBeNull();
    });
  });

  describe("cacheMessages", () => {
    it("does nothing when messages array is empty", async () => {
      await service.cacheMessages("goal-123", []);

      expect(mockDel).not.toHaveBeenCalled();
      expect(mockLpush).not.toHaveBeenCalled();
    });

    it("deletes existing cache and pushes messages with LPUSH", async () => {
      const messages = [
        {
          id: "m1",
          goalId: "goal-123",
          role: "user" as const,
          content: "Hello",
          createdAt: new Date("2024-01-01T10:00:00Z"),
        },
        {
          id: "m2",
          goalId: "goal-123",
          role: "assistant" as const,
          content: "Hi!",
          createdAt: new Date("2024-01-01T10:01:00Z"),
        },
      ];

      await service.cacheMessages("goal-123", messages);

      expect(mockDel).toHaveBeenCalledWith("chat:messages:goal-123");
      // Messages pushed in reverse order for LPUSH to maintain chronological order
      expect(mockLpush).toHaveBeenCalledTimes(2);
      expect(mockExpire).toHaveBeenCalledWith("chat:messages:goal-123", 86400);
    });

    it("sets TTL of 24 hours", async () => {
      const messages = [
        { id: "m1", goalId: "goal-123", role: "user" as const, content: "Hello", createdAt: new Date() },
      ];

      await service.cacheMessages("goal-123", messages);

      expect(mockExpire).toHaveBeenCalledWith("chat:messages:goal-123", 86400);
    });

    it("handles Redis errors gracefully", async () => {
      mockDel.mockRejectedValueOnce(new Error("Redis error"));
      const messages = [
        { id: "m1", goalId: "goal-123", role: "user" as const, content: "Hello", createdAt: new Date() },
      ];

      // Should not throw
      await expect(service.cacheMessages("goal-123", messages)).resolves.toBeUndefined();
    });
  });

  describe("appendMessage", () => {
    it("appends message with RPUSH when cache exists", async () => {
      mockExists.mockResolvedValueOnce(1);

      const message = {
        id: "m3",
        goalId: "goal-123",
        role: "user" as const,
        content: "New message",
        createdAt: new Date("2024-01-01T10:02:00Z"),
      };

      await service.appendMessage("goal-123", message);

      expect(mockExists).toHaveBeenCalledWith("chat:messages:goal-123");
      expect(mockRpush).toHaveBeenCalled();
      expect(mockExpire).toHaveBeenCalledWith("chat:messages:goal-123", 86400);
    });

    it("does not append when cache does not exist", async () => {
      mockExists.mockResolvedValueOnce(0);

      const message = {
        id: "m3",
        goalId: "goal-123",
        role: "user" as const,
        content: "New message",
        createdAt: new Date(),
      };

      await service.appendMessage("goal-123", message);

      expect(mockExists).toHaveBeenCalled();
      expect(mockRpush).not.toHaveBeenCalled();
    });

    it("handles Redis errors gracefully", async () => {
      mockExists.mockRejectedValueOnce(new Error("Redis error"));

      const message = {
        id: "m3",
        goalId: "goal-123",
        role: "user" as const,
        content: "New message",
        createdAt: new Date(),
      };

      // Should not throw
      await expect(service.appendMessage("goal-123", message)).resolves.toBeUndefined();
    });
  });

  describe("invalidateCache", () => {
    it("deletes the cache key", async () => {
      await service.invalidateCache("goal-123");

      expect(mockDel).toHaveBeenCalledWith("chat:messages:goal-123");
    });

    it("handles Redis errors gracefully", async () => {
      mockDel.mockRejectedValueOnce(new Error("Redis error"));

      // Should not throw
      await expect(service.invalidateCache("goal-123")).resolves.toBeUndefined();
    });
  });
});

describe("ChatCacheService - disabled", () => {
  it("returns null when Redis is not configured", async () => {
    // Reset module to test with disabled Redis
    vi.doMock("@/config/env", () => ({
      env: {
        UPSTASH_REDIS_REST_URL: undefined,
        UPSTASH_REDIS_REST_TOKEN: undefined,
      },
    }));

    // Re-import with new mock
    const { ChatCacheService: DisabledService } = await import("@/services/chat-cache-service");
    const disabledService = new DisabledService();

    const result = await disabledService.getMessages("goal-123");
    expect(result).toBeNull();
  });
});
