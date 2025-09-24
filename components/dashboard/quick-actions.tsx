"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Share2, Users, Calendar } from "lucide-react"

const actions = [
  {
    title: "Crear Meta",
    description: "Establece una nueva meta personal",
    icon: Plus,
    color: "from-blue-500 to-purple-600",
    action: () => console.log("Crear meta"),
  },
  {
    title: "Compartir Progreso",
    description: "Comparte tu avance con la comunidad",
    icon: Share2,
    color: "from-green-500 to-teal-600",
    action: () => console.log("Compartir progreso"),
  },
  {
    title: "Unirse a Comunidad",
    description: "Encuentra personas con metas similares",
    icon: Users,
    color: "from-purple-500 to-pink-600",
    action: () => console.log("Unirse a comunidad"),
  },
  {
    title: "Programar Recordatorio",
    description: "Configura recordatorios para tus metas",
    icon: Calendar,
    color: "from-orange-500 to-red-600",
    action: () => console.log("Programar recordatorio"),
  },
]

export function QuickActions() {
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className="h-auto p-4 justify-start hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 group"
              onClick={action.action}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
