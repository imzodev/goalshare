import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  // Server-side auth info
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 p-8 rounded-lg border bg-card">
          <h2 className="text-2xl font-semibold">Acceso Requerido</h2>
          <p className="text-muted-foreground mb-4">Necesitas iniciar sesión para acceder al dashboard.</p>
          <div className="flex gap-3 justify-center">
            <Link
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              href="/auth/login"
            >
              Iniciar sesión
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              href="/auth/sign-up"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardContent />;
}
