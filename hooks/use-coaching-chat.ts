"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch history on open
  useEffect(() => {
    if (open && goalId) {
      const fetchHistory = async () => {
        setIsHistoryLoading(true);
        try {
          const res = await fetch(`/api/ai/coach?goalId=${goalId}`);
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to fetch history: ${res.status} ${res.statusText} - ${errorText}`);
          }
          const data = await res.json();

          if (data.messages && data.messages.length > 0) {
            setMessages(
              data.messages.map(
                (m: { id: string; role: "user" | "assistant"; content: string; createdAt: string }) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                  createdAt: new Date(m.createdAt),
                })
              )
            );
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
        } finally {
          setIsHistoryLoading(false);
        }
      };

      fetchHistory();
    }
  }, [open, goalId, goalTitle, t]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isHistoryLoading]);

  const handleSendMessage = async () => {
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
        }),
      });

      if (!response.ok) throw new Error(t("errorMessage"));

      const data = await response.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
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
    handleSendMessage,
    scrollRef,
  };
}
