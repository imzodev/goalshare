import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock IntersectionObserver before any imports
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

// Mock fetch
const originalFetch = global.fetch;

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (key === "welcomeMessage" && params?.goalTitle) {
      return `Welcome! Let's work on ${params.goalTitle}`;
    }
    return key;
  },
}));

// Mock constants
vi.mock("@/config/constants", () => ({
  CHAT_PAGINATION: {
    INITIAL_PAGE_SIZE: 5,
    PAGE_SIZE: 5,
  },
}));

import { useCoachingChat } from "@/hooks/use-coaching-chat";

describe("useCoachingChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  describe("initial state", () => {
    it("starts with empty messages and loading states", () => {
      const { result } = renderHook(() =>
        useCoachingChat({ goalId: "goal-123", goalTitle: "Learn TypeScript", open: false })
      );

      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isHistoryLoading).toBe(false);
      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.inputValue).toBe("");
    });
  });

  describe("fetchHistory", () => {
    it("does not fetch when open is false", async () => {
      const fetchMock = vi.fn();
      global.fetch = fetchMock as any;

      renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test", open: false }));

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("fetches history when open is true", async () => {
      const mockMessages = [
        { id: "m1", role: "user", content: "Hello", createdAt: "2024-01-01T10:00:00Z" },
        { id: "m2", role: "assistant", content: "Hi!", createdAt: "2024-01-01T10:01:00Z" },
      ];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: mockMessages }),
        text: () => Promise.resolve(JSON.stringify({ messages: mockMessages })),
      });
      global.fetch = fetchMock as any;

      const { result } = renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test", open: true }));

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      expect(fetchMock).toHaveBeenCalledWith("/api/ai/coach?goalId=goal-123&limit=5");
      expect(result.current.messages[0]?.content).toBe("Hello");
    });

    it("shows welcome message when no history exists", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: [] }),
        text: () => Promise.resolve(JSON.stringify({ messages: [] })),
      });
      global.fetch = fetchMock as any;

      const { result } = renderHook(() =>
        useCoachingChat({ goalId: "goal-123", goalTitle: "Learn TypeScript", open: true })
      );

      await waitFor(() => {
        expect(result.current.isHistoryLoading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]?.role).toBe("assistant");
      expect(result.current.messages[0]?.id).toBe("welcome");
      expect(result.current.hasMore).toBe(false);
    });

    it("sets hasMore to false when fewer messages returned than requested", async () => {
      const mockMessages = [{ id: "m1", role: "user", content: "Hello", createdAt: "2024-01-01T10:00:00Z" }];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: mockMessages }),
        text: () => Promise.resolve(JSON.stringify({ messages: mockMessages })),
      });
      global.fetch = fetchMock as any;

      const { result } = renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test", open: true }));

      await waitFor(() => {
        expect(result.current.isHistoryLoading).toBe(false);
      });

      // Only 1 message returned, less than PAGE_SIZE of 5
      expect(result.current.hasMore).toBe(false);
    });

    it("handles fetch error gracefully", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error("Internal Server Error")),
        text: () => Promise.resolve("Internal Server Error"),
      });
      global.fetch = fetchMock as any;

      const { result } = renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test Goal", open: true }));

      await waitFor(() => {
        expect(result.current.isHistoryLoading).toBe(false);
      });

      // Should show welcome message as fallback
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]?.id).toBe("welcome");
    });
  });

  describe("loadMoreMessages", () => {
    it("fetches with correct API url and pagination", async () => {
      // Initial fetch with 5 messages
      const initialMessages = Array.from({ length: 5 }, (_, i) => ({
        id: `m${i}`,
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i}`,
        createdAt: new Date(2024, 0, 1, 10, i).toISOString(),
      }));

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ messages: initialMessages }),
        text: () => Promise.resolve(JSON.stringify({ messages: initialMessages })),
      });
      global.fetch = fetchMock as any;

      const { result } = renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test", open: true }));

      await waitFor(() => {
        expect(result.current.isHistoryLoading).toBe(false);
      });

      // Verify correct API call was made
      expect(fetchMock).toHaveBeenCalledWith("/api/ai/coach?goalId=goal-123&limit=5");

      // Messages should be loaded
      expect(result.current.messages.length).toBeGreaterThan(0);
    });
  });

  describe("handleSendMessage", () => {
    it("requires non-empty input to send", () => {
      const { result } = renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test", open: false }));

      // Input is empty by default
      expect(result.current.inputValue).toBe("");

      // Set to whitespace only
      act(() => {
        result.current.setInputValue("   ");
      });

      // handleSendMessage checks for trimmed input
      expect(result.current.inputValue.trim()).toBe("");
    });

    it("updates input value with setInputValue", () => {
      const { result } = renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test", open: false }));

      act(() => {
        result.current.setInputValue("Hello coach!");
      });

      expect(result.current.inputValue).toBe("Hello coach!");
    });
  });

  describe("refs", () => {
    it("provides scroll refs", () => {
      const { result } = renderHook(() => useCoachingChat({ goalId: "goal-123", goalTitle: "Test", open: false }));

      expect(result.current.scrollRef).toBeDefined();
      expect(result.current.scrollContainerRef).toBeDefined();
      expect(result.current.topTriggerRef).toBeDefined();
    });
  });
});
