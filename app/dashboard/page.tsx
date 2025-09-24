import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { GoalsSection } from "@/components/dashboard/goals-section";
import { CommunitiesSection } from "@/components/dashboard/communities-section";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { FloatingActionButton } from "@/components/dashboard/floating-action-button";

export default async function DashboardPage() {
  // Server-side auth info
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 p-8 rounded-lg border bg-card">
          <h2 className="text-2xl font-semibold">Acceso Requerido</h2>
          <p className="text-muted-foreground mb-4">Necesitas iniciar sesión para acceder al dashboard.</p>
          <div className="flex gap-3 justify-center">
            <Link 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" 
              href="/sign-in"
            >
              Iniciar sesión
            </Link>
            <Link 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" 
              href="/sign-up"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-20 md:pb-6 min-w-0">
        {/* Header dinámico con gradientes */}
        <DashboardHeader />
        
        {/* Tarjetas de estadísticas */}
        <StatsCards />
        
        {/* Layout principal */}
        <div className="grid gap-6 md:grid-cols-2 min-w-0">
          {/* Acciones rápidas */}
          <div className="min-w-0">
            <QuickActions />
          </div>
          
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
      <FloatingActionButton />
    </>
  );
}
