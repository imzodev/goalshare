"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageCircle, Loader2, TrendingUp } from "lucide-react"
import type { CommunitySummary } from "@/types/communities"

interface CommunitiesGridProps {
  communities: CommunitySummary[]
  onCommunityAction: () => void
  getCommunityGradient: (communityId: string) => string
}

export function CommunitiesGrid({ communities, onCommunityAction, getCommunityGradient }: CommunitiesGridProps) {
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null)

  const handleJoinCommunity = async (community: CommunitySummary) => {
    try {
      setJoiningCommunity(community.id)
      const response = await fetch(`/api/communities/${community.id}`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Error al unirte a la comunidad')

      onCommunityAction() // Refresh data
    } catch (error) {
      console.error('Error joining community:', error)
    } finally {
      setJoiningCommunity(null)
    }
  }

  if (communities.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
        <CardContent className="pt-6">
          <div className="rounded-lg border border-dashed bg-white/50 dark:bg-gray-800/40 px-6 py-16 text-center">
            <Users className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay comunidades disponibles</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Aún no hay comunidades disponibles. ¡Sé el primero en crear una cuando esta funcionalidad esté disponible!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {communities.map((community) => {
        const gradient = getCommunityGradient(community.id)
        const isJoining = joiningCommunity === community.id

        return (
          <Card
            key={community.id}
            className="group relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                    {community.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300">
                      {community.kind === 'topic' ? 'Tema' :
                       community.kind === 'domain' ? 'Dominio' :
                       community.kind === 'cohort' ? 'Cohorte' : 'Comunidad'}
                    </span>
                  </div>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg" style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {community.description || "Sin descripción disponible"}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="text-sm font-semibold">{community.memberCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Miembros</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="text-sm font-semibold">-</div>
                  <div className="text-xs text-muted-foreground">Metas activas</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>Comunidad {community.kind}</span>
              </div>

              <Button
                size="sm"
                disabled={isJoining || community.isMember}
                onClick={() => handleJoinCommunity(community)}
                className={`w-full bg-gradient-to-r ${gradient} hover:shadow-lg transition-all disabled:opacity-50`}
              >
                {isJoining ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <MessageCircle className="h-3 w-3 mr-1" />
                )}
                {isJoining ? 'Uniéndose...' : community.isMember ? 'Ya miembro' : 'Unirse'}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
