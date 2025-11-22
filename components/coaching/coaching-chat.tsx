"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoachingChat } from "@/hooks/use-coaching-chat";
import { MessageContent } from "./message-content";

interface CoachingChatProps {
  goalId: string;
  goalTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoachingChat({ goalId, goalTitle, open, onOpenChange }: CoachingChatProps) {
  const t = useTranslations("coaching");

  const { messages, inputValue, setInputValue, isLoading, isHistoryLoading, handleSendMessage, scrollRef } =
    useCoachingChat({ goalId, goalTitle, open });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0 overflow-hidden">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {t("title")}
          </SheetTitle>
          <SheetDescription>
            {t("descriptionPrefix")} <strong>{goalTitle}</strong>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 w-full max-w-full" type="always">
          <div className="space-y-4 p-3 w-full">
            {isHistoryLoading ? (
              <div className="space-y-6 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative w-full">
                    <Skeleton
                      className={cn(
                        "absolute bg-purple-100 -top-2 z-10 h-6 w-6 rounded-full border-2 border-background",
                        i % 2 === 0 ? "-right-1" : "-left-1"
                      )}
                    />
                    <Skeleton
                      className={cn(
                        "bg-purple-100 w-full rounded-2xl h-20",
                        i % 2 === 0 ? "rounded-tr-none" : "rounded-tl-none"
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="relative w-full group">
                  <div
                    className={cn(
                      "absolute -top-2 z-10 h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 border-background",
                      msg.role === "user" ? "-right-1 bg-blue-500 text-white" : "-left-1 bg-purple-100 text-purple-600"
                    )}
                  >
                    {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>

                  <div
                    className={cn(
                      "w-full rounded-2xl px-4 py-3 text-sm shadow-sm overflow-hidden",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    ) : (
                      <MessageContent content={msg.content} />
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 mr-auto max-w-[80%]">
                <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t mt-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder={t("inputPlaceholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
