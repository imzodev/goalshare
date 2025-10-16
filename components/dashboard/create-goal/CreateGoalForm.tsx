"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toInputDate, addDaysFrom, addMonthsFrom, addYearsFrom } from "@/utils/date-utils";
import {
  generateDescription as aiGenerateDescription,
  generateMilestones as aiGenerateMilestones,
} from "@/api-client/ai";
import type { MilestoneItem } from "@/types/goals";
import { useTranslations } from "next-intl";

// Schema will be created inside component to access translations
const createFormSchema = (t: (key: string, values?: Record<string, number>) => string) =>
  z.object({
    title: z.string().min(3, t("validation.minLength", { min: 3 })),
    description: z.string().min(10, t("validation.minLength", { min: 10 })),
    deadline: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((val) => {
        if (!val || val === "") return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        d.setHours(0, 0, 0, 0);
        return d > today;
      }, t("validation.futureDate")),
    topicCommunityId: z.string().min(1, t("goals.create.communityRequired")),
  });

export type CreateGoalFormValues = {
  title: string;
  description: string;
  deadline?: string;
  topicCommunityId: string;
};

type Community = { id: string; name: string; slug: string };

type Props = {
  defaultValues: CreateGoalFormValues;
  communities: Community[];
  loadingCommunities: boolean;
  onMilestonesReady: (values: CreateGoalFormValues, milestones: MilestoneItem[]) => void | Promise<void>;
  onCancel: () => void;
  onError?: (message: string) => void;
};

export function CreateGoalForm({
  defaultValues,
  communities,
  loadingCommunities,
  onMilestonesReady,
  onCancel,
  onError,
}: Props) {
  const t = useTranslations();
  const tCreate = useTranslations("goals.create");
  const tStates = useTranslations("common.states");

  const [generating, setGenerating] = useState(false);
  const [descLoading, setDescLoading] = useState(false);

  const FormSchema = useMemo(() => createFormSchema(t), [t]);

  const form = useForm<CreateGoalFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const canGenerate = useMemo(() => form.formState.isValid, [form.formState.isValid]);

  // Handlers
  async function handleFormSubmit(values: CreateGoalFormValues) {
    try {
      setGenerating(true);
      const title = values.title;
      const description = values.description;
      const deadline = values.deadline || "";
      const items = await aiGenerateMilestones({
        goalText: `${title}. ${description}`.trim(),
        context: { deadline: deadline || undefined },
      });
      await Promise.resolve(onMilestonesReady({ ...values, deadline }, items));
    } catch (e) {
      onError?.(tStates("networkError"));
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateDescriptionClick() {
    const title = form.getValues("title");
    if (!title || title.trim().length < 3) return;
    try {
      setDescLoading(true);
      const suggestion = await aiGenerateDescription(title);
      if (suggestion) {
        const current = form.getValues("description") || "";
        const next = current && current.trim().length > 0 ? `${current}\n\n${suggestion}` : suggestion;
        form.setValue("description", next, { shouldValidate: true, shouldDirty: true });
      }
    } finally {
      setDescLoading(false);
    }
  }

  function handleCommunityChange(v: string) {
    form.setValue("topicCommunityId", v, { shouldValidate: true });
  }

  function setDeadline1Week() {
    form.setValue("deadline", toInputDate(addDaysFrom(new Date(), 7)), { shouldValidate: true });
  }

  function setDeadline1Month() {
    form.setValue("deadline", toInputDate(addMonthsFrom(new Date(), 1)), { shouldValidate: true });
  }

  function setDeadline6Months() {
    form.setValue("deadline", toInputDate(addMonthsFrom(new Date(), 6)), { shouldValidate: true });
  }

  function setDeadline1Year() {
    form.setValue("deadline", toInputDate(addYearsFrom(new Date(), 1)), { shouldValidate: true });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(handleFormSubmit)}>
      <div className="space-y-2">
        <label htmlFor="goal-title" className="text-sm font-medium">
          {tCreate("title")}
        </label>
        <Input id="goal-title" {...form.register("title")} placeholder={tCreate("titlePlaceholder")} />
        {form.formState.errors.title?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="goal-description" className="text-sm font-medium">
            {tCreate("description")}
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateDescriptionClick}
            disabled={descLoading || !form.getValues("title")}
          >
            {descLoading ? tStates("generating") : tCreate("generateDescription")}
          </Button>
        </div>
        <Textarea
          id="goal-description"
          rows={4}
          {...form.register("description")}
          placeholder={tCreate("descriptionPlaceholder")}
        />
        {form.formState.errors.description?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="goal-deadline" className="text-sm font-medium">
          {tCreate("deadline")}
        </label>
        <Input id="goal-deadline" type="date" {...form.register("deadline")} />
        {form.formState.errors.deadline?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.deadline.message}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={setDeadline1Week}>
            {tCreate("deadline1Week")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={setDeadline1Month}>
            {tCreate("deadline1Month")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={setDeadline6Months}>
            {tCreate("deadline6Months")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={setDeadline1Year}>
            {tCreate("deadline1Year")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="goal-community" className="text-sm font-medium">
          {tCreate("community")}
        </label>
        <Select value={form.watch("topicCommunityId")} onValueChange={handleCommunityChange}>
          <SelectTrigger>
            <SelectValue placeholder={loadingCommunities ? tStates("loading") : tCreate("communityPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {communities.length === 0 && !loadingCommunities ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">{tStates("noResults")}</div>
            ) : (
              communities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{tCreate("communityHint")}</p>
        {form.formState.errors.topicCommunityId?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.topicCommunityId.message}</p>
        )}
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={!canGenerate || generating}>
          {generating ? tStates("generating") : tCreate("submit")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={generating}>
          {tCreate("cancel")}
        </Button>
      </div>
    </form>
  );
}
