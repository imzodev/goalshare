"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useTranslations } from "next-intl";
import { CHAT_PAGINATION } from "@/config/constants";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface UseCoachingChatProps {
  goalId: string;
  goalTitle: string;
  open: boolean;
}

export function useCoachingChat({ goalId, goalTitle, open }: UseCoachingChatProps) {
  const t = useTranslations("coaching");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  /* eslint-disable react-hooks/exhaustive-deps */
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topTriggerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);

  // Helper to get the actual scrollable viewport inside ScrollArea
  const getScrollViewport = useCallback(() => {
    if (!scrollContainerRef.current) return null;
    // Radix ScrollArea uses a viewport element with data-slot="scroll-area-viewport"
    return scrollContainerRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement | null;
  }, []);

  // TODO: Revisar rendimiento del codigo para ver si hay manera de optimizarlo
  // Restore scroll position when older messages are loaded
  useLayoutEffect(() => {
    if (shouldRestoreScrollRef.current) {
      const viewport = getScrollViewport();
      if (viewport) {
        const newScrollHeight = viewport.scrollHeight;
        const diff = newScrollHeight - prevScrollHeightRef.current;

        if (diff > 0) {
          // Restore scroll position: add the height difference to where the user was
          // This keeps their view at the same relative position
          viewport.scrollTop = prevScrollTopRef.current + diff;
        }
      }
      shouldRestoreScrollRef.current = false;
    }
  }, [messages, getScrollViewport]);

  // Fetch initial history on open
  useEffect(() => {
    if (open && goalId) {
      const fetchHistory = async () => {
        setIsHistoryLoading(true);
        setOffset(0);
        setHasMore(true);

        try {
          const res = await fetch(`/api/ai/coach?goalId=${goalId}&limit=${CHAT_PAGINATION.INITIAL_PAGE_SIZE}`);

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to fetch history: ${res.status} ${res.statusText} - ${errorText}`);
          }

          const data = await res.json();

          if (data.messages && data.messages.length > 0) {
            const mappedMessages = data.messages.map(
              (m: { id: string; role: "user" | "assistant"; content: string; createdAt: string }) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                createdAt: new Date(m.createdAt),
              })
            );

            setMessages(mappedMessages);
            setOffset(data.messages.length);

            // If we got fewer messages than requested, there are no more
            if (data.messages.length < CHAT_PAGINATION.INITIAL_PAGE_SIZE) {
              setHasMore(false);
            }
          } else {
            // Only show welcome message if no history exists
            setMessages([
              {
                id: "welcome",
                role: "assistant",
                content: t("welcomeMessage", { goalTitle }),
                createdAt: new Date(),
              },
            ]);
            setHasMore(false);
          }
        } catch (error) {
          console.error("Error fetching history:", error);
          // Fallback to welcome message on error
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: t("welcomeMessage", { goalTitle }),
              createdAt: new Date(),
            },
          ]);
          setHasMore(false);
        } finally {
          setIsHistoryLoading(false);
        }
      };

      fetchHistory();
    }
  }, [open, goalId, goalTitle, t]);

  // Load more messages (infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore || isHistoryLoading) return;

    setIsLoadingMore(true);

    try {
      // Save current scroll state from the actual viewport
      const viewport = getScrollViewport();
      if (viewport) {
        prevScrollHeightRef.current = viewport.scrollHeight;
        prevScrollTopRef.current = viewport.scrollTop;
      }

      const res = await fetch(`/api/ai/coach?goalId=${goalId}&limit=${CHAT_PAGINATION.PAGE_SIZE}&offset=${offset}`);

      if (!res.ok) {
        throw new Error("Failed to load more messages");
      }

      const data = await res.json();

      if (data.messages && data.messages.length > 0) {
        const olderMessages = data.messages.map(
          (m: { id: string; role: "user" | "assistant"; content: string; createdAt: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: new Date(m.createdAt),
          })
        );

        // Signal that we need to restore scroll after render
        shouldRestoreScrollRef.current = true;

        // Prepend older messages
        setMessages((prev) => [...olderMessages, ...prev]);
        setOffset((prev) => prev + data.messages.length);

        // If we got fewer messages than requested, there are no more
        if (data.messages.length < CHAT_PAGINATION.PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [goalId, offset, hasMore, isLoadingMore, isHistoryLoading, getScrollViewport]);

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    if (!open || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Don't trigger if we're in the process of restoring scroll position
        // or if already loading
        if (shouldRestoreScrollRef.current || isLoadingMore) return;

        if (entries[0]?.isIntersecting && hasMore && !isHistoryLoading) {
          loadMoreMessages();
        }
      },
      {
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    if (topTriggerRef.current) {
      observer.observe(topTriggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [open, hasMore, isLoadingMore, isHistoryLoading, loadMoreMessages]);

  // Scroll to bottom on new messages (but not when loading more)
  const lastMessageId = messages[messages.length - 1]?.id;
  useEffect(() => {
    if (scrollRef.current && !isLoadingMore) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lastMessageId, isHistoryLoading]);

  const handleSendMessage = async (useStreaming: boolean = true) => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId,
          message: userMsg.content,
          stream: useStreaming,
        }),
      });

      if (!response.ok) throw new Error(t("errorMessage"));

      if (useStreaming && response.body) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";

        // Create a placeholder message for the assistant
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: Message = {
          id: aiMsgId,
          role: "assistant",
          content: "",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;

            // Update the message content
            setMessages((prev) =>
              prev.map((msg) => (msg.id === aiMsgId ? { ...msg, content: accumulatedContent } : msg))
            );
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError);
          throw streamError;
        }
      } else {
        // Handle non-streaming response
        const data = await response.json();

        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Coaching error:", error);
      // Optionally show error message in chat
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isHistoryLoading,
    isLoadingMore,
    hasMore,
    handleSendMessage,
    scrollRef,
    scrollContainerRef,
    topTriggerRef,
  };
}
