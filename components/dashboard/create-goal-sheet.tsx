"use client";

import { useEffect, useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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
  const [communities, setCommunities] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setTopicCommunityId("");
    setTemplateId("");
    setError(null);
  };

  useEffect(() => {
    if (!open) return;
    setLoadingCommunities(true);
    fetch("/api/communities/topics", { method: "GET" })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setCommunities(data.communities ?? []);
        } else {
          console.warn("No se pudieron cargar comunidades", data?.error);
          setCommunities([]);
        }
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoadingCommunities(false));
  }, [open]);

  const handleSubmit = () => {
    setError(null);
    if (!title || title.length < 3) {
      setError("El título debe tener al menos 3 caracteres");
      return;
    }
    if (!description || description.length < 10) {
      setError("La descripción debe tener al menos 10 caracteres");
      return;
    }
    if (!topicCommunityId) {
      setError("Debes seleccionar una comunidad (topic)");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            deadline: deadline || null,
            topicCommunityId,
            templateId: templateId || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data?.error?.message || data?.error || "No se pudo crear la meta";
          setError(typeof msg === "string" ? msg : "No se pudo crear la meta");
          return;
        }

        // éxito
        onOpenChange(false);
        reset();
        onCreated?.();
      } catch (e) {
        setError("Error de red");
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
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Crear nueva meta</SheetTitle>
          <SheetDescription>
            Define un título, una descripción y (opcional) una fecha límite. Por ahora, debes indicar el UUID de la
            comunidad (topic) a la que pertenece la meta.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="goal-title" className="text-sm font-medium">
              Título
            </label>
            <Input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Correr 5K diarios"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goal-description" className="text-sm font-medium">
              Descripción
            </label>
            <Textarea
              id="goal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu meta y cómo la medirás"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="goal-deadline" className="text-sm font-medium">
                Fecha límite (opcional)
              </label>
              <Input id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label htmlFor="goal-template" className="text-sm font-medium">
                Template ID (opcional)
              </label>
              <Input
                id="goal-template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="UUID de plantilla (si aplica)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="goal-community" className="text-sm font-medium">
              Comunidad (topic)
            </label>
            <Select value={topicCommunityId} onValueChange={setTopicCommunityId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingCommunities ? "Cargando comunidades..." : "Selecciona una comunidad"}
                />
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
          </div>

          {error && <div className="text-sm text-red-600 dark:text-red-500">{error}</div>}

          <div className="pt-2 flex items-center gap-2">
            <Button onClick={handleSubmit} disabled={pending}>
              {pending ? "Creando..." : "Crear meta"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
