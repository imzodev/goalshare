"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Clock, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { formatDeadline, formatRelativeTime } from "@/utils/date-utils";
import { getDaysLeftLabel } from "@/utils/goals-ui-utils";
import { GOAL_STATUS_LABELS, GOAL_TYPE_LABELS } from "@/constants/goals";
import type { UserGoalSummary } from "@/types/goals";

const colorPalette = [
  "from-blue-500/50 via-blue-500/20 to-transparent",
  "from-purple-500/50 via-purple-500/20 to-transparent",
  "from-emerald-500/50 via-emerald-500/20 to-transparent",
  "from-amber-500/50 via-amber-500/20 to-transparent",
  "from-pink-500/50 via-pink-500/20 to-transparent",
  "from-rose-500/50 via-rose-500/20 to-transparent",
  "from-cyan-500/50 via-cyan-500/20 to-transparent",
  "from-violet-500/50 via-violet-500/20 to-transparent",
];

interface GoalCardProps {
  goal: UserGoalSummary;
  index: number;
  layout?: "single-column" | "multi-column";
  onEdit?: (goal: UserGoalSummary) => void;
  onDelete?: (goal: UserGoalSummary) => void;
}

export function GoalCard({ goal, index, layout = "multi-column", onEdit, onDelete }: GoalCardProps) {
  const gradient = colorPalette[index % colorPalette.length];
  const statusLabel = GOAL_STATUS_LABELS[goal.status];
  const goalTypeLabel = GOAL_TYPE_LABELS[goal.goalType];
  const deadlineLabel = formatDeadline(goal.deadline);
  const daysLeftLabel = getDaysLeftLabel(goal.status, goal.daysLeft);
  const lastUpdateLabel = formatRelativeTime(goal.lastUpdateAt);

  const renderActions = () => {
    if (!onEdit && !onDelete) return null;

    // Prioridad 1: Si es layout single-column, SIEMPRE mostrar MoreHorizontal
    if (layout === "single-column") {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(goal)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Prioridad 2: Si es multi-column, usar responsive (mobile: dropdown, desktop: botones)
    return (
      <>
        {/* Dropdown para móviles */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(goal)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botones individuales para desktop */}
        <div className="hidden md:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal)}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </>
    );
  };

  return (
    <Card className="group relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
      />

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{goal.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {goalTypeLabel}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {goal.topicCommunity?.name || "Sin categoría"}
              </Badge>
              <Badge
                className={`text-xs capitalize ${
                  goal.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>

          {/* Acciones */}
          {renderActions()}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">{goal.description}</p>

        {/* Información temporal */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{deadlineLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{daysLeftLabel}</span>
          </div>
          {lastUpdateLabel && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{lastUpdateLabel}</span>
            </div>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
