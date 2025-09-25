"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Calendar, Clock, RefreshCw, Loader2, MoreHorizontal, AlertCircle } from "lucide-react"
import type { UserGoalSummary } from "@/types/goals"
import { CreateGoalSheet } from "./create-goal-sheet"

const colorPalette = [
  "from-blue-500/50 via-blue-500/20 to-transparent",
  "from-purple-500/50 via-purple-500/20 to-transparent",
  "from-emerald-500/50 via-emerald-500/20 to-transparent",
  "from-amber-500/50 via-amber-500/20 to-transparent",
  "from-pink-500/50 via-pink-500/20 to-transparent",
]

const statusLabels: Record<UserGoalSummary["status"], string> = {
  pending: "En progreso",
  completed: "Completada",
}

export function GoalsSection() {
  const [open, setOpen] = useState(false)
  const [goals, setGoals] = useState<UserGoalSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async ({ silent = false } = {}) => {
    console.log("[GoalsSection] fetchGoals:start", { silent })
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch("/api/goals", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })

     
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudieron cargar las metas")
      }

      const nextGoals = Array.isArray(data?.goals) ? data.goals : []
      setGoals(nextGoals)
    } catch (err) {
      console.error("[GoalsSection]", err)
      setError(err instanceof Error ? err.message : "No se pudieron cargar las metas")
      setGoals([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const handleGoalCreated = useCallback(() => {
    fetchGoals({ silent: true })
  }, [fetchGoals])

  const handleRefresh = () => fetchGoals({ silent: true })

  const showSkeleton = loading && !refreshing

  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Mis Metas
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            Crear meta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSkeleton && <GoalsSkeleton />}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">No pudimos cargar tus metas</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && goals.length === 0 && (
          <div className="rounded-lg border border-dashed bg-white/50 dark:bg-gray-800/40 px-6 py-10 text-center">
            <Target className="mx-auto h-10 w-10 text-blue-500" />
            <h3 className="mt-4 text-base font-semibold">Aún no tienes metas activas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea tu primera meta para comenzar a compartir tu progreso con la comunidad.
            </p>
            <Button className="mt-4" onClick={() => setOpen(true)}>
              Crear mi primera meta
            </Button>
          </div>
        )}

        {!loading && !error && goals.length > 0 && (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const gradient = colorPalette[index % colorPalette.length]
              const statusLabel = statusLabels[goal.status]
              const deadlineLabel = formatDeadline(goal.deadline)
              const daysLeftLabel = getDaysLeftLabel(goal.status, goal.daysLeft)
              const lastUpdateLabel = formatRelativeTime(goal.lastUpdateAt)

              return (
                <div
                  key={goal.id}
                  className="relative overflow-hidden rounded-lg border bg-white/50 dark:bg-gray-800/50 transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:shadow-md group"
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className="relative p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base">{goal.title}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {goal.topicCommunity?.name || "Sin categoría"}
                          </Badge>
                          <Badge className="text-xs capitalize">
                            {statusLabel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 sm:line-clamp-none">
                          {goal.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {deadlineLabel}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {daysLeftLabel}
                          </div>
                          {lastUpdateLabel && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {lastUpdateLabel}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress
                        value={goal.progress}
                        className="h-2"
                        style={{
                          background: `linear-gradient(to right, transparent 0%, transparent ${goal.progress}%, #e5e7eb ${goal.progress}%, #e5e7eb 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
      <CreateGoalSheet open={open} onOpenChange={setOpen} onCreated={handleGoalCreated} />
    </Card>
  )
}

function GoalsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border bg-white/40 dark:bg-gray-800/40 px-4 py-4 animate-pulse"
        >
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="mt-2 h-3 w-2/3 rounded bg-muted/70" />
          <div className="mt-4 h-2 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) {
    return "Sin fecha límite"
  }

  const [year, month, day] = deadline.split("-").map((value) => Number.parseInt(value, 10))
  if (!year || !month || !day) {
    return "Sin fecha límite"
  }

  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) {
    return "Sin fecha límite"
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getDaysLeftLabel(status: UserGoalSummary["status"], daysLeft: number | null): string {
  if (status === "completed") {
    return "Meta completada"
  }

  if (daysLeft === null) {
    return "Sin fecha límite"
  }

  if (daysLeft <= 0) {
    return "Finaliza hoy"
  }

  if (daysLeft === 1) {
    return "1 día restante"
  }

  return `${daysLeft} días restantes`
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60_000) {
    return "Actualizado hace instantes"
  }

  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 60) {
    return `Actualizado hace ${minutes} min`
  }

  const hours = Math.round(minutes / 60)
  if (hours < 24) {
    return `Actualizado hace ${hours} h`
  }

  const days = Math.round(hours / 24)
  if (days < 30) {
    return `Actualizado hace ${days} d`
  }

  const months = Math.round(days / 30)
  if (months < 12) {
    return `Actualizado hace ${months} m`
  }

  const years = Math.round(months / 12)
  return `Actualizado hace ${years} a`
}
