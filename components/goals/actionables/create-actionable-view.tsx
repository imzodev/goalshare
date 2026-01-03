"use client";

import { useState } from "react";
import { Sparkles, ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { UserGoalSummary } from "@/types/goals";
import { useActionablesApi } from "@/hooks/use-actionables-api";

interface CreateActionableViewProps {
  goals: UserGoalSummary[];
  selectedGoalId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ActionableFormData {
  title: string;
  description: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";
  startDate: string;
  endDate: string;
}

export function CreateActionableView({
  goals,
  selectedGoalId,
  onCancel,
  onSuccess,
}: CreateActionableViewProps) {
  const [count, setCount] = useState("1");
  const [generatedSuggestions, setGeneratedSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<ActionableFormData>({
    title: "",
    description: "",
    frequency: "DAILY",
    startDate: new Date().toISOString().split("T")[0] ?? "",
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0] ?? "",
  });

  const { generateSuggestions, saveSelectedSuggestions } = useActionablesApi(selectedGoalId);

  const handleGenerate = async () => {
    if (!selectedGoalId) return;
    setIsGenerating(true);
    try {
      const suggestions = await generateSuggestions(Number(count));
      if (suggestions) {
        setGeneratedSuggestions(suggestions);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    setFormData({
      ...formData,
      title: suggestion.title || "",
      description: suggestion.description || "",
      // Simple mapping for frequency, could be more robust based on recurrence rule parsing
      frequency: suggestion.recurrence?.includes("WEEKLY")
        ? "WEEKLY"
        : suggestion.recurrence?.includes("MONTHLY")
        ? "MONTHLY"
        : "DAILY",
      startDate: suggestion.startDate || formData.startDate,
      endDate: suggestion.endDate || formData.endDate,
    });
  };

  const handleSave = async () => {
    // Construct the object expected by saveSelectedSuggestions
    // Since saveSelectedSuggestions expects an array and indices, we might need to use a lower level API or adapt.
    // Actually, useActionablesApi has saveSelectedSuggestions which takes the list and indices.
    // But here we want to save a SINGLE actionable from the form data, not necessarily from the suggestions list directly.
    // We should probably use a direct "createActionable" function.
    // However, `useActionablesApi` only exposes `saveSelectedSuggestions` (plural) and `updateActionable`.
    // We can simulate it by passing our form data as a "suggestion" and selecting it.
    
    // Let's create a temporary suggestion object from formData
    const recurrenceRule =
      formData.frequency === "DAILY"
        ? "FREQ=DAILY;INTERVAL=1"
        : formData.frequency === "WEEKLY"
        ? "FREQ=WEEKLY;INTERVAL=1"
        : formData.frequency === "MONTHLY"
        ? "FREQ=MONTHLY;INTERVAL=1"
        : undefined; // ONCE

    const newActionable = {
      title: formData.title,
      description: formData.description,
      recurrence: recurrenceRule,
      startDate: formData.startDate,
      endDate: formData.endDate,
      // Default values for other fields
      startTime: "09:00",
      durationMinutes: 30,
      isPaused: false,
      isArchived: false,
      priority: 3,
    };

    // We can use saveSelectedSuggestions by passing this as a single item list and selecting index 0.
    const success = await saveSelectedSuggestions([newActionable], new Set([0]));
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="flex items-center gap-4 px-6 py-4 border-b shrink-0">
        <Button variant="ghost" size="icon" onClick={onCancel} className="-ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Nuevo Accionable</h2>
          <p className="text-sm text-muted-foreground">
            Define una nueva tarea o hábito para alcanzar tu meta.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
        {/* AI Section */}
        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Generar con IA</span>
          </div>

          <div className="flex gap-2 mb-2 items-center">
            <div className="flex-1 text-sm text-muted-foreground">
              La IA sugerirá título, descripción y frecuencia basada en tu meta.
            </div>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="w-[70px] bg-white dark:bg-background">
                <SelectValue placeholder="Qty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? "..." : (
                <>
                  Generar <Sparkles className="ml-2 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
          
          {/* Generated Suggestions */}
          {generatedSuggestions.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-[10px] px-2 py-0.5">
                  SUGERENCIA DE IA
                </Badge>
              </div>
              
              <div className="grid gap-3">
                {generatedSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white dark:bg-card border rounded-lg p-3 shadow-sm hover:border-purple-200 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-foreground">{suggestion.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{suggestion.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] h-5 font-normal">
                             {suggestion.recurrence?.includes("DAILY") ? "Diario" : "Recurrente"}
                          </Badge>
                          {suggestion.startDate && (
                            <Badge variant="outline" className="text-[10px] h-5 font-normal bg-muted/50">
                              Inicio: {suggestion.startDate}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manual Form Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Escribe un título para tu accionable"
              className="bg-muted/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe los detalles de tu accionable"
              className="bg-muted/30 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Frecuencia</label>
              <Select
                value={formData.frequency}
                onValueChange={(val: any) => setFormData({ ...formData, frequency: val })}
              >
                <SelectTrigger className="bg-muted/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Diario</SelectItem>
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="MONTHLY">Mensual</SelectItem>
                  <SelectItem value="ONCE">Una vez</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Relacionada</label>
              <div className="flex items-center h-10 px-3 py-2 text-sm bg-muted/50 border rounded-md text-muted-foreground">
                {goals.find((g) => g.id === selectedGoalId)?.title}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Inicio</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-muted/30 pl-10"
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Fin</label>
              <div className="relative">
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-muted/30 pl-10"
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-muted/10 shrink-0">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={!formData.title || !selectedGoalId}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Crear Accionable
        </Button>
      </div>
    </div>
  );
}
