"use client"

import { useState } from "react"
import { Home, Target, Users, Trophy, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navItems = [
  {
    id: "home",
    label: "Inicio",
    icon: Home,
    href: "/dashboard",
    badge: null,
  },
  {
    id: "goals",
    label: "Metas",
    icon: Target,
    href: "/dashboard/goals",
    badge: "3",
  },
  {
    id: "communities",
    label: "Comunidades",
    icon: Users,
    href: "/dashboard/communities",
    badge: "2",
  },
  {
    id: "achievements",
    label: "Logros",
    icon: Trophy,
    href: "/dashboard/achievements",
    badge: null,
  },
  {
    id: "profile",
    label: "Perfil",
    icon: User,
    href: "/dashboard/profile",
    badge: null,
  },
]

export function MobileNav() {
  const [activeItem, setActiveItem] = useState("home")

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-white/20 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 min-w-[60px]",
                activeItem === item.id
                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-gray-800/50"
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
