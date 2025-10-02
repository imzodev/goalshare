import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-green-200 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">¡Cuenta Creada!</CardTitle>
          <CardDescription className="text-gray-600">Tu cuenta ha sido creada exitosamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Confirma tu correo electrónico</p>
                <p className="text-sm text-blue-700">
                  Te hemos enviado un correo con un enlace de confirmación. Por favor, revisa tu bandeja de entrada y
                  haz clic en el enlace para activar tu cuenta.
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600">
            ¿No recibiste el correo? Revisa tu carpeta de spam o correo no deseado.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Ir al inicio de sesión</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
