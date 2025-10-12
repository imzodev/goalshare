"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CreateGoalSheet } from "@/components/dashboard/create-goal-sheet";

type GoalSheetContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  openSheet: () => void;
  closeSheet: () => void;
};

const GoalSheetContext = createContext<GoalSheetContextValue | null>(null);

export function GoalSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openSheet = useCallback(() => setOpen(true), []);
  const closeSheet = useCallback(() => setOpen(false), []);

  const value = useMemo<GoalSheetContextValue>(
    () => ({ open, setOpen, openSheet, closeSheet }),
    [open, openSheet, closeSheet]
  );

  return (
    <GoalSheetContext.Provider value={value}>
      {children}
      <CreateGoalSheet
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          setOpen(false);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("goal-created"));
          }
        }}
      />
    </GoalSheetContext.Provider>
  );
}

export function useGoalSheet() {
  const ctx = useContext(GoalSheetContext);
  if (!ctx) throw new Error("useGoalSheet must be used within GoalSheetProvider");
  return ctx;
}
