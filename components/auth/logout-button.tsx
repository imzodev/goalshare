"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
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
      try {
        router.replace("/");
        router.refresh();
      } finally {
        if (typeof window !== "undefined") {
          window.location.assign("/");
        }
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
