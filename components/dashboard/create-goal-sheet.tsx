"use client";

import { useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MilestoneItem } from "@/types/goals";
import { useMilestoneWeights } from "@/hooks/useMilestoneWeights";
import { useCommunitiesTopics } from "@/hooks/useCommunities";

import { createGoal, createGoalMilestones } from "@/api-client/goals";
import { CreateGoalForm, type CreateGoalFormValues } from "@/components/dashboard/create-goal/CreateGoalForm";
import { CreateGoalPreview } from "@/components/dashboard/create-goal/CreateGoalPreview";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
};

export function CreateGoalSheet({ open, onOpenChange, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [topicCommunityId, setTopicCommunityId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Communities
  const { data: communities, loading: loadingCommunities } = useCommunitiesTopics(open);
  // Milestones (two-step flow)
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  // no explicit generating UI state after RHF split
  const [persisting, setPersisting] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const { weightSum, setWeightWithConstraint, redistributeWeights } = useMilestoneWeights(milestones, setMilestones);

  // Deadline helpers moved to utils/date-utils.ts

  const reset = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setTopicCommunityId("");
    setTemplateId("");
    setError(null);
    setMilestones([]);
    setPersisting(false);
    setStep("form");
  };

  // Handlers from form
  function handleMilestonesReady(values: CreateGoalFormValues, items: MilestoneItem[]) {
    setError(null);
    setTitle(values.title);
    setDescription(values.description);
    setDeadline(values.deadline || "");
    setTopicCommunityId(values.topicCommunityId);
    setMilestones(items);
    setStep("preview");
  }

  function handleCancel() {
    onOpenChange(false);
  }

  function handleError(message: string) {
    setError(message);
  }

  const persistGoalWithMilestones = () => {
    setError(null);
    startTransition(async () => {
      try {
        setPersisting(true);
        // 1) Create goal
        const { id: goalId } = await createGoal({
          title,
          description,
          deadline: deadline || null,
          topicCommunityId,
          templateId: templateId || null,
        });
        // 2) Persist milestones
        await createGoalMilestones(goalId, milestones);
        // éxito total
        onOpenChange(false);
        reset();
        onCreated?.();
      } catch {
        setError("Error de red");
      } finally {
        setPersisting(false);
      }
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Crear nueva meta</SheetTitle>
          <SheetDescription>
            Define un título, una descripción y (opcional) una fecha límite. Después podrás revisar y ajustar los
            milestones sugeridos antes de guardar.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 px-4 space-y-4 flex-1 min-h-0 flex flex-col">
          {step === "form" ? (
            <CreateGoalForm
              defaultValues={{ title, description, deadline, topicCommunityId }}
              communities={communities}
              loadingCommunities={loadingCommunities}
              onMilestonesReady={handleMilestonesReady}
              onCancel={handleCancel}
              onError={handleError}
            />
          ) : (
            <div className="rounded-md border p-3 space-y-2 text-sm">
              <div className="font-medium">Resumen</div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{title || "Sin título"}</Badge>
                {deadline && <Badge variant="outline">{deadline}</Badge>}
                {topicCommunityId && (
                  <Badge variant="default">
                    {communities.find((c) => c.id === topicCommunityId)?.name || "Comunidad"}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" onClick={() => setStep("form")}>
                  Editar datos
                </Button>
              </div>
            </div>
          )}

          {/* Preview step (rediseño) */}
          {step === "preview" && (
            <CreateGoalPreview
              milestones={milestones}
              weightSum={weightSum}
              expanded={expanded}
              onToggle={(idx) => setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }))}
              onChangeTitle={(idx, val) => {
                const copy: MilestoneItem[] = [...milestones];
                copy[idx] = { ...copy[idx], title: val } as MilestoneItem;
                setMilestones(copy);
              }}
              onChangeDue={(idx, val) => {
                const copy: MilestoneItem[] = [...milestones];
                copy[idx] = { ...copy[idx], dueDate: val } as MilestoneItem;
                setMilestones(copy);
              }}
              onChangeDescription={(idx, val) => {
                const copy: MilestoneItem[] = [...milestones];
                copy[idx] = { ...copy[idx], description: val } as MilestoneItem;
                setMilestones(copy);
              }}
              onChangeWeight={(idx, val) => setWeightWithConstraint(idx, val)}
              onRedistribute={redistributeWeights}
              onPersist={persistGoalWithMilestones}
              onBack={() => setStep("form")}
              onCancel={() => onOpenChange(false)}
              persisting={persisting}
              pending={pending}
            />
          )}

          {error && <div className="text-sm text-red-600 dark:text-red-500">{error}</div>}
        </div>
      </SheetContent>
    </Sheet>
  );
}
