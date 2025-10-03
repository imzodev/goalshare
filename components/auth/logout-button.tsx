"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Error al cerrar sesión", {
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast.success("Sesión cerrada");
      // Elegimos hard navigation para asegurar limpieza total del estado (cookies, cache) y evitar flickering.
      // Mantenerlo simple (máximo 1 acción de navegación) según issue #40.
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="ghost"
      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoading ? "Cerrando sesión..." : "Cerrar Sesión"}
    </Button>
  );
}
