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

const FormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
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
    }, "La fecha debe ser futura"),
  topicCommunityId: z.string().min(1, "Debes seleccionar una comunidad (topic)"),
});

export type CreateGoalFormValues = z.infer<typeof FormSchema>;

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
  const [generating, setGenerating] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
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
      onError?.("Error de red");
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
          Título
        </label>
        <Input id="goal-title" {...form.register("title")} placeholder="Ej: Correr 5K diarios" />
        {form.formState.errors.title?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="goal-description" className="text-sm font-medium">
            Descripción
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateDescriptionClick}
            disabled={descLoading || !form.getValues("title")}
          >
            {descLoading ? "Generando..." : "Generar descripción"}
          </Button>
        </div>
        <Textarea
          id="goal-description"
          rows={4}
          {...form.register("description")}
          placeholder="Describe tu meta y cómo la medirás"
        />
        {form.formState.errors.description?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="goal-deadline" className="text-sm font-medium">
          Fecha límite (opcional)
        </label>
        <Input id="goal-deadline" type="date" {...form.register("deadline")} />
        {form.formState.errors.deadline?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.deadline.message}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={setDeadline1Week}>
            1 semana
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={setDeadline1Month}>
            1 mes
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={setDeadline6Months}>
            6 meses
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={setDeadline1Year}>
            1 año
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="goal-community" className="text-sm font-medium">
          Comunidad (topic)
        </label>
        <Select value={form.watch("topicCommunityId")} onValueChange={handleCommunityChange}>
          <SelectTrigger>
            <SelectValue placeholder={loadingCommunities ? "Cargando comunidades..." : "Selecciona una comunidad"} />
          </SelectTrigger>
          <SelectContent>
            {communities.length === 0 && !loadingCommunities ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No hay comunidades disponibles</div>
            ) : (
              communities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Elige la comunidad temática a la que pertenece tu meta.</p>
        {form.formState.errors.topicCommunityId?.message && (
          <p className="text-xs text-red-600 dark:text-red-500">{form.formState.errors.topicCommunityId.message}</p>
        )}
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={!canGenerate || generating}>
          {generating ? "Generando..." : "Siguiente: Generar milestones"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={generating}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
