"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Users, MessageCircle, TrendingUp, Plus } from "lucide-react"

const communities = [
  {
    id: 1,
    name: "Runners Club",
    description: "Comunidad de corredores apasionados",
    members: 1234,
    activeGoals: 89,
    image: "/api/placeholder/60/60",
    gradient: "from-green-500 to-emerald-600",
    recentActivity: "3 nuevas metas hoy",
  },
  {
    id: 2,
    name: "Book Lovers",
    description: "Lectores que comparten sus avances",
    members: 856,
    activeGoals: 156,
    image: "/api/placeholder/60/60",
    gradient: "from-blue-500 to-cyan-600",
    recentActivity: "12 libros completados esta semana",
  },
  {
    id: 3,
    name: "Fitness Warriors",
    description: "Transformación física y mental",
    members: 2341,
    activeGoals: 234,
    image: "/api/placeholder/60/60",
    gradient: "from-purple-500 to-pink-600",
    recentActivity: "5 nuevos logros desbloqueados",
  },
  {
    id: 4,
    name: "Money Savers",
    description: "Metas financieras y ahorro",
    members: 567,
    activeGoals: 78,
    image: "/api/placeholder/60/60",
    gradient: "from-orange-500 to-red-600",
    recentActivity: "Meta de $10K alcanzada",
  },
  {
    id: 5,
    name: "Skill Builders",
    description: "Desarrollo de habilidades profesionales",
    members: 890,
    activeGoals: 123,
    image: "/api/placeholder/60/60",
    gradient: "from-teal-500 to-blue-600",
    recentActivity: "2 certificaciones completadas",
  },
]

export function CommunitiesSection() {
  return (
    <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Comunidades
        </CardTitle>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Explorar
        </Button>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-4 pb-4 pr-4">
            {communities.map((community) => (
              <Card
                key={community.id}
                className="w-[280px] shrink-0 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-0 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full bg-gradient-to-br ${community.gradient} shadow-lg`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {community.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {community.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="text-sm font-semibold">{community.members.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Miembros</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="text-sm font-semibold">{community.activeGoals}</div>
                      <div className="text-xs text-muted-foreground">Metas activas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <TrendingUp className="h-3 w-3" />
                    <span className="truncate">{community.recentActivity}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className={`w-full bg-gradient-to-r ${community.gradient} hover:shadow-lg transition-all`}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Unirse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
