"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useGoals } from "@/hooks/use-goals";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { UserGoalSummary } from "@/types/goals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDeadline } from "@/utils/date-utils";
import { getDaysLeftLabel } from "@/utils/goals-ui-utils";

export default function CalendarPage() {
  const t = useTranslations("calendar");
  const { goals, loading, fetchGoals } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState<UserGoalSummary | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const events = useMemo(() => {
    return goals.map((goal) => ({
      title: goal.title,
      start: goal.deadline ? new Date(goal.deadline) : new Date(goal.createdAt),
      allDay: true,
      extendedProps: {
        ...goal,
      },
    }));
  }, [goals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("pageTitle")}
            </h1>
            <p className="text-muted-foreground">{t("pageDescription")}</p>
          </div>
        </div>
      </div>

      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
        <CardContent className="p-4">
          {loading ? (
            <Skeleton className="w-full h-[800px]" />
          ) : (
            <div className="calendar-container">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                height="auto"
                locale="es"
                buttonText={{
                  today: "Hoy",
                  month: "Mes",
                  week: "Semana",
                  day: "Día",
                }}
                eventClick={(info) => {
                  const goal = info.event.extendedProps as UserGoalSummary;
                  setSelectedGoal(goal);
                  setDetailDialogOpen(true);
                }}
              />
            </div>
          )}

          <Dialog
            open={detailDialogOpen && !!selectedGoal}
            onOpenChange={(open) => {
              setDetailDialogOpen(open);
              if (!open) {
                setSelectedGoal(null);
              }
            }}
          >
            <DialogContent className="max-w-3xl sm:max-w-2xl md:max-w-3xl">
              {selectedGoal && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex flex-col items-start gap-2 text-xl md:text-2xl">
                      <span className="truncate">{selectedGoal.title}</span>
                      <Badge
                        variant={selectedGoal.status === "completed" ? "default" : "outline"}
                        className={
                          selectedGoal.status === "completed"
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "border-amber-500/60 text-amber-600 dark:text-amber-300"
                        }
                      >
                        {selectedGoal.status === "completed" ? "Completada" : "En progreso"}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-base md:text-lg text-muted-foreground/90">
                      {selectedGoal.description || "Sin descripción"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-6 space-y-5">
                    <div className="space-y-1">
                      <p className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wide">
                        Fecha límite
                      </p>
                      <p className="text-sm md:text-base">
                        {selectedGoal.deadline
                          ? `${formatDeadline(selectedGoal.deadline)} · ${getDaysLeftLabel(selectedGoal.status, selectedGoal.daysLeft)}`
                          : "Sin fecha límite"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm md:text-base font-medium text-muted-foreground">
                        <span>Progreso</span>
                        <span>{Math.round(selectedGoal.progress)}%</span>
                      </div>
                      <Progress value={selectedGoal.progress} className="h-2" />
                    </div>

                    {selectedGoal.topicCommunity && (
                      <div className="space-y-1">
                        <p className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wide">
                          Comunidad
                        </p>
                        <p className="text-sm md:text-base font-medium">{selectedGoal.topicCommunity.name}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
