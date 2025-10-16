"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Target, Clock } from "lucide-react";
import { useTranslations } from "next-intl";

// TODO: Analizar como podriamos reenderizar el greeting al mismo tiempo que todo el component, sin esperar al objeto de traduccion de useTranslations
function resolveGreetingByHour(hour: number, t: (key: string) => string) {
  if (hour < 12) return t("morning");
  if (hour < 18) return t("afternoon");
  return t("evening");
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
  const t = useTranslations("dashboard.header");
  const [greeting, setGreeting] = useState(t("greeting"));

  useEffect(() => {
    const currentHour = new Date().getHours();
    setGreeting(resolveGreetingByHour(currentHour, t));
  }, [t]);

  const userName = "Irving"; // En una app real, esto vendría del contexto de usuario

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200/40 bg-white/70 p-6 text-slate-800 shadow-xl backdrop-blur-xl ring-1 ring-blue-400/15 dark:border-white/20 dark:bg-white/5 dark:text-white dark:ring-blue-400/20">
      {/* Overlay de gradiente sutil en tonos primarios */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/15 via-blue-400/10 to-sky-300/15 dark:from-blue-600/20 dark:via-blue-500/10 dark:to-sky-400/20" />
      {/* Patrón de fondo decorativo */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.07%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Saludo y información principal */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold">
                {greeting}, {userName}! 👋
              </h1>
            </div>
            <p className="text-slate-600 text-sm md:text-base dark:text-blue-100">{t("encouragement")}</p>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="border-blue-600/30 bg-blue-600/10 text-blue-800 backdrop-blur-sm dark:border-white/30 dark:bg-white/15 dark:text-white"
              >
                <TrendingUp className="mr-1 h-3 w-3 text-blue-700 dark:text-white" />
                {t("weekProgress")}
              </Badge>
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            <div className="rounded-xl border border-blue-200/40 bg-white/60 p-3 text-center shadow-sm backdrop-blur-lg transition-colors hover:border-blue-300/50 dark:border-blue-200/20 dark:bg-white/10">
              <Target className="mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-200" />
              <div className="text-lg font-bold">{loading ? "..." : (activeGoals ?? "0")}</div>
              <div className="text-xs text-slate-600 dark:text-blue-200">{t("activeGoals")}</div>
            </div>
            <div className="rounded-xl border border-blue-200/40 bg-white/60 p-3 text-center shadow-sm backdrop-blur-lg transition-colors hover:border-blue-300/50 dark:border-blue-200/20 dark:bg-white/10">
              <TrendingUp className="mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-200" />
              <div className="text-lg font-bold">{loading ? "..." : `${averageProgress ?? 0}%`}</div>
              <div className="text-xs text-slate-600 dark:text-blue-200">{t("avgProgress")}</div>
            </div>
            <div className="col-span-2 rounded-xl border border-blue-200/40 bg-white/60 p-3 text-center shadow-sm backdrop-blur-lg transition-colors hover:border-blue-300/50 dark:border-blue-200/20 dark:bg-white/10 md:col-span-1">
              <Clock className="mx-auto mb-1 h-5 w-5 text-blue-600 dark:text-blue-200" />
              <div className="text-lg font-bold">{loading ? "..." : (daysRemaining ?? "–")}</div>
              <div className="text-xs text-slate-600 dark:text-blue-200">{t("daysLeft")}</div>
            </div>
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-blue-100">{t("monthProgress")}</span>
            <span className="font-medium">{loading ? "..." : `${averageProgress ?? 0}%`}</span>
          </div>
          <div className="w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-2 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-700 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(59,130,246,0.35)] dark:from-sky-400 dark:to-blue-600"
              style={{ width: `${averageProgress ?? 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
