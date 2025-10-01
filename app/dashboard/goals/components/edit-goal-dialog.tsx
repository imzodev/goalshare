"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import type { UserGoalSummary } from "@/types/goals";

type Props = {
  goal: UserGoalSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated?: () => void;
};

export function EditGoalDialog({ goal, open, onOpenChange, onGoalUpdated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [topicCommunityId, setTopicCommunityId] = useState("");
  const [status, setStatus] = useState<"pending" | "completed">("pending");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [communities, setCommunities] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  // Cargar datos del goal cuando se abre el diálogo
  useEffect(() => {
    if (goal && open) {
      setTitle(goal.title);
      setDescription(goal.description);
      setDeadline(goal.deadline || "");
      setTopicCommunityId(goal.topicCommunity?.id || "");
      setStatus(goal.status);
      setError(null);
    }
  }, [goal, open]);

  // Cargar comunidades disponibles
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

    if (!goal) return;

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
        const res = await fetch(`/api/goals/${goal.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            deadline: deadline || null,
            topicCommunityId,
            status,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data?.error?.message || data?.error || "No se pudo actualizar la meta";
          setError(typeof msg === "string" ? msg : "No se pudo actualizar la meta");
          return;
        }

        // éxito
        onOpenChange(false);
        onGoalUpdated?.();
      } catch (e) {
        setError("Error de red");
      }
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setError(null);
  };

  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              ✏️
            </div>
            Editar Meta
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu meta. Los cambios se guardarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Aprender React"
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu meta en detalle..."
              rows={3}
              disabled={pending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha límite (opcional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={pending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value: "pending" | "completed") => setStatus(value)}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">Comunidad</Label>
            <Select
              value={topicCommunityId}
              onValueChange={setTopicCommunityId}
              disabled={pending || loadingCommunities}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCommunities ? "Cargando..." : "Selecciona una comunidad"} />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
