"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export interface ActionableCompletionDialogData {
  actionableId: string;
  title: string;
  occurrenceStart: string;
  timezone?: string | null;
  completed: boolean;
  completionNotes?: string | null;
}

interface ActionableCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ActionableCompletionDialogData | null;
  onChanged?: () => void;
}

export function ActionableCompletionDialog({ open, onOpenChange, data, onChanged }: ActionableCompletionDialogProps) {
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  const initialNotes = useMemo(() => data?.completionNotes ?? "", [data?.completionNotes]);

  // Reset notes when opening for a new occurrence
  useEffect(() => {
    if (open) setNotes(initialNotes);
  }, [open, initialNotes]);

  const canSubmit = Boolean(data) && !saving;

  const handleMarkCompleted = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/actionables/${data.actionableId}/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occurrenceStart: data.occurrenceStart, notes: notes || null }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "No se pudo marcar como completado");
      }
      onOpenChange(false);
      onChanged?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleUncomplete = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/actionables/${data.actionableId}/completions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occurrenceStart: data.occurrenceStart }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "No se pudo desmarcar");
      }
      onOpenChange(false);
      onChanged?.();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span className="truncate">{data?.title ?? "Accionable"}</span>
            {data?.completed ? (
              <Badge className="bg-emerald-500">Completado</Badge>
            ) : (
              <Badge variant="outline">Pendiente</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {data?.occurrenceStart ? new Date(data.occurrenceStart).toLocaleString() : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Notas</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Cómo te fue?" />
          </div>

          <div className="flex items-center justify-end gap-2">
            {data?.completed ? (
              <Button type="button" variant="outline" onClick={handleUncomplete} disabled={!canSubmit}>
                Marcar como pendiente
              </Button>
            ) : (
              <Button type="button" onClick={handleMarkCompleted} disabled={!canSubmit}>
                Marcar como completado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
