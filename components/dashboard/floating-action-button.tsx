"use client"

import { useState } from "react"
import { Plus, Target, Users, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const fabActions = [
  {
    id: "goal",
    label: "Nueva Meta",
    icon: Target,
    color: "from-blue-500 to-purple-600",
    action: () => console.log("Crear nueva meta"),
  },
  {
    id: "community",
    label: "Crear Comunidad",
    icon: Users,
    color: "from-green-500 to-teal-600",
    action: () => console.log("Crear comunidad"),
  },
  {
    id: "event",
    label: "Programar Evento",
    icon: Calendar,
    color: "from-orange-500 to-red-600",
    action: () => console.log("Programar evento"),
  },
]

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleFab = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      {/* Acciones secundarias */}
      <div className={cn(
        "flex flex-col gap-3 mb-3 transition-all duration-300 transform origin-bottom",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
      )}>
        {fabActions.map((action, index) => (
          <div
            key={action.id}
            className={cn(
              "flex items-center gap-3 transition-all duration-300 transform",
              isOpen 
                ? "translate-y-0 opacity-100" 
                : "translate-y-4 opacity-0"
            )}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="bg-white dark:bg-gray-800 text-sm font-medium px-3 py-1 rounded-full shadow-lg border whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="sm"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110",
                `bg-gradient-to-br ${action.color} hover:${action.color}`
              )}
              onClick={() => {
                action.action()
                setIsOpen(false)
              }}
            >
              <action.icon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Botón principal */}
      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110",
          "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
          isOpen && "rotate-45"
        )}
        onClick={toggleFab}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>

      {/* Overlay para cerrar cuando se hace clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
