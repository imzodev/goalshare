"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, Clock } from "lucide-react";

function resolveGreetingByHour(hour: number) {
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

interface DashboardHeaderProps {
  activeGoals?: number;
  averageProgress?: number;
  daysRemaining?: number;
  loading?: boolean;
}

export function DashboardHeader({
  activeGoals,
  averageProgress,
  daysRemaining,
  loading = false,
}: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("Hola");

  useEffect(() => {
    const currentHour = new Date().getHours();
    setGreeting(resolveGreetingByHour(currentHour));
  }, []);

  const userName = "Irving"; // En una app real, esto vendría del contexto de usuario

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

      {/* Elementos decorativos flotantes */}
      <div className="absolute top-4 right-4 animate-pulse">
        <Sparkles className="h-6 w-6 text-yellow-300" />
      </div>
      <div className="absolute bottom-4 left-4 animate-bounce">
        <div className="h-3 w-3 rounded-full bg-white/30" />
      </div>
      <div className="absolute top-1/2 right-1/4 animate-pulse delay-1000">
        <div className="h-2 w-2 rounded-full bg-white/20" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Saludo y información principal */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                {greeting}, {userName}! 👋
              </h1>
            </div>
            <p className="text-blue-100 text-sm md:text-base">
              Tienes un progreso excelente. ¡Sigue así para alcanzar tus metas!
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% esta semana
              </Badge>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
              <Target className="h-5 w-5 mx-auto mb-1 text-blue-200" />
              <div className="text-lg font-bold">{loading ? "..." : (activeGoals ?? "0")}</div>
              <div className="text-xs text-blue-200">Metas activas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-200" />
              <div className="text-lg font-bold">{loading ? "..." : `${averageProgress ?? 0}%`}</div>
              <div className="text-xs text-green-200">Progreso</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20 col-span-2 md:col-span-1">
              <Clock className="h-5 w-5 mx-auto mb-1 text-orange-200" />
              <div className="text-lg font-bold">{loading ? "..." : (daysRemaining ?? "–")}</div>
              <div className="text-xs text-orange-200">Días restantes</div>
            </div>
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-100">Progreso general del mes</span>
            <span className="font-medium">{loading ? "..." : `${averageProgress ?? 0}%`}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${averageProgress ?? 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
