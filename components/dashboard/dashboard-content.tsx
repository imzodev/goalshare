"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { GoalsSection } from "@/components/dashboard/goals-section";
import { CommunitiesSection } from "@/components/dashboard/communities-section";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { FloatingActionButton } from "@/components/dashboard/floating-action-button";
import { useGoalsSummary } from "@/hooks/use-goals-summary";

export function DashboardContent() {
  const { data: summary, loading } = useGoalsSummary();

  return (
    <>
      <div className="space-y-6 pb-20 md:pb-6 min-w-0">
        {/* Header dinámico con gradientes */}
        <DashboardHeader activeGoals={summary?.pending} averageProgress={67} daysRemaining={12} loading={loading} />

        {/* Tarjetas de estadísticas */}
        <StatsCards activeGoals={summary?.pending} averageProgress={67} loading={loading} />

        {/* Layout principal */}
        <div className="grid gap-6 md:grid-cols-2 min-w-0">
          {/* Sección de metas */}
          <div className="min-w-0">
            <GoalsSection />
          </div>
        </div>

        {/* Sección de comunidades */}
        <div className="min-w-0">
          <CommunitiesSection />
        </div>
      </div>

      {/* Navegación móvil */}
      <MobileNav />

      {/* FAB flotante */}
      <div className="md:hidden">
        <FloatingActionButton />
      </div>
    </>
  );
}
