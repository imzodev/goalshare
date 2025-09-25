"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Target, Calendar, Users, MoreHorizontal } from "lucide-react"
import { CreateGoalSheet } from "./create-goal-sheet"

const goals = [
  {
    id: 1,
    title: "Correr 5K diarios",
    description: "Mantener una rutina de ejercicio constante",
    progress: 75,
    daysLeft: 12,
    category: "Salud",
    color: "from-green-500 to-emerald-600",
    participants: 23,
  },
  {
    id: 2,
    title: "Leer 12 libros este año",
    description: "Desarrollar el hábito de lectura diaria",
    progress: 45,
    daysLeft: 89,
    category: "Educación",
    color: "from-blue-500 to-cyan-600",
    participants: 156,
  },
  {
    id: 3,
    title: "Ahorrar $5,000",
    description: "Meta de ahorro para emergencias",
    progress: 92,
    daysLeft: 3,
    category: "Finanzas",
    color: "from-purple-500 to-pink-600",
    participants: 89,
  },
]

export function GoalsSection() {
  const [open, setOpen] = useState(false)
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Mis Metas
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Ver todas
          </Button>
          <Button size="sm" onClick={() => setOpen(true)}>
            Crear meta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-4 rounded-lg border bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:shadow-md group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {goal.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {goal.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {goal.daysLeft} días restantes
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {goal.participants} participantes
                  </div>
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
                  background: `linear-gradient(to right, transparent 0%, transparent ${goal.progress}%, #e5e7eb ${goal.progress}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
      <CreateGoalSheet open={open} onOpenChange={setOpen} onCreated={() => console.log("goal created")}/>
    </Card>
  )
}
