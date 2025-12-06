import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to ensure mocks are available before module loading
const hoisted = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockOrderBy: vi.fn(),
  mockLimit: vi.fn(),
  mockOffset: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockReturning: vi.fn(),
  mockGetMessages: vi.fn(),
  mockCacheMessages: vi.fn(),
  mockAppendMessage: vi.fn(),
  mockInvalidateCache: vi.fn(),
}));

// Mock ChatCacheService
vi.mock("@/services/chat-cache-service", () => ({
  ChatCacheService: vi.fn().mockImplementation(() => ({
    getMessages: hoisted.mockGetMessages,
    cacheMessages: hoisted.mockCacheMessages,
    appendMessage: hoisted.mockAppendMessage,
    invalidateCache: hoisted.mockInvalidateCache,
  })),
}));

// Mock the database module
vi.mock("@/db", () => ({
  db: {
    select: hoisted.mockSelect,
    insert: hoisted.mockInsert,
  },
}));

vi.mock("@/db/schema", () => ({
  goals: { id: "id", ownerId: "ownerId" },
  coachingMessages: { goalId: "goalId", createdAt: "createdAt" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a, b) => ({ type: "eq", a, b })),
  and: vi.fn((...args) => ({ type: "and", args })),
  desc: vi.fn((col) => ({ type: "desc", col })),
}));

import { CoachingService } from "@/services/coaching-service";

describe("CoachingService", () => {
  let service: CoachingService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup chain mocks
    hoisted.mockSelect.mockReturnValue({ from: hoisted.mockFrom });
    hoisted.mockFrom.mockReturnValue({ where: hoisted.mockWhere });
    hoisted.mockWhere.mockReturnValue({ limit: hoisted.mockLimit, orderBy: hoisted.mockOrderBy });
    hoisted.mockLimit.mockReturnValue({ offset: hoisted.mockOffset });
    hoisted.mockOffset.mockReturnValue([]);
    hoisted.mockOrderBy.mockReturnValue({ limit: hoisted.mockLimit });

    hoisted.mockInsert.mockReturnValue({ values: hoisted.mockValues });
    hoisted.mockValues.mockReturnValue({ returning: hoisted.mockReturning });
    hoisted.mockReturning.mockResolvedValue([]);

    service = new CoachingService();
  });

  describe("verifyGoalOwnership", () => {
    it("returns goal when user owns it", async () => {
      const mockGoal = { id: "goal-123", ownerId: "user-1", title: "Test Goal" };
      hoisted.mockLimit.mockReturnValueOnce([mockGoal]);

      const result = await service.verifyGoalOwnership("user-1", "goal-123");

      expect(result).toEqual(mockGoal);
    });

    it("returns null when goal not found", async () => {
      hoisted.mockLimit.mockReturnValueOnce([]);

      const result = await service.verifyGoalOwnership("user-1", "goal-123");

      expect(result).toBeNull();
    });
  });

  describe("getHistory", () => {
    beforeEach(() => {
      // Mock verifyGoalOwnership to return a valid goal
      hoisted.mockLimit.mockReturnValueOnce([{ id: "goal-123", ownerId: "user-1" }]);
    });

    it("throws error when goal not found", async () => {
      hoisted.mockLimit.mockReset();
      hoisted.mockLimit.mockReturnValueOnce([]);

      await expect(service.getHistory("user-1", "goal-123")).rejects.toThrow("Goal not found or access denied");
    });

    it("returns cached messages on cache hit", async () => {
      const cachedMessages = [
        { id: "m1", role: "user", content: "Hello", createdAt: new Date() },
        { id: "m2", role: "assistant", content: "Hi!", createdAt: new Date() },
      ];
      hoisted.mockGetMessages.mockResolvedValueOnce(cachedMessages);

      const result = await service.getHistory("user-1", "goal-123");

      expect(result).toEqual(cachedMessages);
      expect(hoisted.mockGetMessages).toHaveBeenCalledWith("goal-123", undefined);
    });

    it("fetches from database and caches on cache miss", async () => {
      hoisted.mockGetMessages.mockResolvedValueOnce(null);

      const dbMessages = [
        { id: "m1", role: "user", content: "Hello", createdAt: new Date("2024-01-01T10:00:00Z") },
        { id: "m2", role: "assistant", content: "Hi!", createdAt: new Date("2024-01-01T10:01:00Z") },
      ];
      hoisted.mockOrderBy.mockReturnValueOnce(dbMessages);

      const result = await service.getHistory("user-1", "goal-123");

      expect(hoisted.mockCacheMessages).toHaveBeenCalledWith("goal-123", expect.any(Array));
      expect(result).toBeDefined();
    });

    it("passes pagination options to cache", async () => {
      hoisted.mockGetMessages.mockResolvedValueOnce(null);
      hoisted.mockOrderBy.mockReturnValueOnce([]);

      await service.getHistory("user-1", "goal-123", { limit: 5, offset: 10 });

      expect(hoisted.mockGetMessages).toHaveBeenCalledWith("goal-123", { limit: 5, offset: 10 });
    });
  });

  describe("getHistoryForContext", () => {
    beforeEach(() => {
      hoisted.mockLimit.mockReturnValueOnce([{ id: "goal-123", ownerId: "user-1" }]);
    });

    it("returns cached messages with limit", async () => {
      const cachedMessages = [{ id: "m1", role: "user", content: "Hello", createdAt: new Date() }];
      hoisted.mockGetMessages.mockResolvedValueOnce(cachedMessages);

      const result = await service.getHistoryForContext("user-1", "goal-123", 5);

      expect(result).toEqual(cachedMessages);
      expect(hoisted.mockGetMessages).toHaveBeenCalledWith("goal-123", { limit: 5 });
    });

    it("defaults limit to 5", async () => {
      hoisted.mockGetMessages.mockResolvedValueOnce([]);

      await service.getHistoryForContext("user-1", "goal-123");

      expect(hoisted.mockGetMessages).toHaveBeenCalledWith("goal-123", { limit: 5 });
    });
  });

  describe("saveMessage", () => {
    beforeEach(() => {
      hoisted.mockLimit.mockReturnValueOnce([{ id: "goal-123", ownerId: "user-1" }]);
    });

    it("throws error when goal not found", async () => {
      hoisted.mockLimit.mockReset();
      hoisted.mockLimit.mockReturnValueOnce([]);

      await expect(service.saveMessage("user-1", "goal-123", "user", "Hello")).rejects.toThrow(
        "Goal not found or access denied"
      );
    });

    it("inserts message to database and appends to cache", async () => {
      const insertedMessage = {
        id: "new-msg-id",
        goalId: "goal-123",
        role: "user",
        content: "Hello",
        createdAt: new Date(),
      };
      hoisted.mockReturning.mockResolvedValueOnce([insertedMessage]);

      await service.saveMessage("user-1", "goal-123", "user", "Hello");

      expect(hoisted.mockInsert).toHaveBeenCalled();
      expect(hoisted.mockValues).toHaveBeenCalledWith({
        goalId: "goal-123",
        role: "user",
        content: "Hello",
      });
      expect(hoisted.mockAppendMessage).toHaveBeenCalledWith("goal-123", insertedMessage);
    });

    it("uses .returning() to get inserted message with ID", async () => {
      const insertedMessage = {
        id: "generated-uuid",
        goalId: "goal-123",
        role: "assistant",
        content: "Response",
        createdAt: new Date(),
      };
      hoisted.mockReturning.mockResolvedValueOnce([insertedMessage]);

      await service.saveMessage("user-1", "goal-123", "assistant", "Response");

      expect(hoisted.mockReturning).toHaveBeenCalled();
      expect(hoisted.mockAppendMessage).toHaveBeenCalledWith("goal-123", insertedMessage);
    });

    it("does not append to cache if insert returns nothing", async () => {
      hoisted.mockReturning.mockResolvedValueOnce([]);

      await service.saveMessage("user-1", "goal-123", "user", "Hello");

      expect(hoisted.mockAppendMessage).not.toHaveBeenCalled();
    });
  });
});
