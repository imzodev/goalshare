"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MilestoneCard } from "@/components/dashboard/milestone-card";
import type { MilestoneItem } from "@/types/goals";

type Props = {
  milestones: MilestoneItem[];
  expanded: Record<number, boolean>;
  onToggle: (index: number) => void;
  onChangeTitle: (index: number, value: string) => void;
  onChangeDue: (index: number, value: string) => void;
  onChangeDescription: (index: number, value: string) => void;
  onChangeWeight: (index: number, value: number) => void;
};

export function MilestonesList({
  milestones,
  expanded,
  onToggle,
  onChangeTitle,
  onChangeDue,
  onChangeDescription,
  onChangeWeight,
}: Props) {
  return (
    <ScrollArea className="h-full pr-3 pb-28">
      <div className="space-y-3">
        {milestones.map((m, idx) => (
          <MilestoneCard
            key={idx}
            index={idx}
            item={m}
            expanded={!!expanded[idx]}
            onToggle={() => onToggle(idx)}
            onChangeTitle={(val) => onChangeTitle(idx, val)}
            onChangeDue={(val) => onChangeDue(idx, val)}
            onChangeDescription={(val) => onChangeDescription(idx, val)}
            onChangeWeight={(val) => onChangeWeight(idx, val)}
          />
        ))}
        <div className="h-8" />
      </div>
    </ScrollArea>
  );
}
