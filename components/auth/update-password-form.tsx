"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      toast.error("Error al actualizar la contraseña", {
        description: error.message,
      });
      setIsLoading(false);
    } else {
      toast.success("¡Contraseña actualizada!");
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card className="w-full max-w-md border-purple-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-center text-3xl font-bold text-transparent">
          Nueva Contraseña
        </CardTitle>
        <CardDescription className="text-center text-gray-600">Ingresa tu nueva contraseña</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar Contraseña"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
