"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MilestoneItem } from "@/types/goals";
import { MilestonesList } from "./MilestonesList";

type Props = {
  milestones: MilestoneItem[];
  weightSum: number;
  expanded: Record<number, boolean>;
  onToggle: (index: number) => void;
  onChangeTitle: (index: number, value: string) => void;
  onChangeDue: (index: number, value: string) => void;
  onChangeDescription: (index: number, value: string) => void;
  onChangeWeight: (index: number, value: number) => void;
  onRedistribute: () => void;
  onPersist: () => void;
  onBack: () => void;
  onCancel: () => void;
  persisting: boolean;
  pending: boolean;
};

export function CreateGoalPreview({
  milestones,
  weightSum,
  expanded,
  onToggle,
  onChangeTitle,
  onChangeDue,
  onChangeDescription,
  onChangeWeight,
  onRedistribute,
  onPersist,
  onBack,
  onCancel,
  persisting,
  pending,
}: Props) {
  return (
    <div className="space-y-4 flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium">Milestones propuestos</span>
            <span className={weightSum === 100 ? "text-green-600" : "text-red-600"}>Suma de pesos: {weightSum}%</span>
          </div>
          <Progress value={Math.max(0, Math.min(100, weightSum))} />
        </div>
        <Button variant="outline" onClick={onRedistribute} className="shrink-0">
          Redistribuir pesos
        </Button>
      </div>

      <MilestonesList
        milestones={milestones}
        expanded={expanded}
        onToggle={onToggle}
        onChangeTitle={onChangeTitle}
        onChangeDue={onChangeDue}
        onChangeDescription={onChangeDescription}
        onChangeWeight={onChangeWeight}
      />

      <div className="sticky bottom-0 pt-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onPersist} disabled={persisting || pending || weightSum !== 100}>
            {persisting
              ? "Guardando..."
              : weightSum !== 100
                ? "Ajusta los pesos a 100%"
                : "Crear meta y guardar milestones"}
          </Button>
          <Button variant="outline" onClick={onBack} disabled={persisting || pending}>
            Volver
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={persisting || pending}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
