"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t bg-gradient-to-r from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold bg-gradient-to-br from-primary via-indigo-500 to-accent bg-clip-text text-transparent">
                GoalShare
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-md leading-relaxed">
              Transforma tus metas en progreso real. Comparte tu avance, mantén la motivación y alcanza tus objetivos con el apoyo de tu comunidad.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} GoalShare. Todos los derechos reservados.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Producto</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link className="hover:text-primary transition-colors" href="#features">Funciones</Link>
              <Link className="hover:text-primary transition-colors" href="#pricing">Precios</Link>
              <Link className="hover:text-primary transition-colors" href="#">Integraciones</Link>
              <Link className="hover:text-primary transition-colors" href="#">API</Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link className="hover:text-primary transition-colors" href="#">Acerca de</Link>
              <Link className="hover:text-primary transition-colors" href="#">Blog</Link>
              <Link className="hover:text-primary transition-colors" href="#">Contacto</Link>
              <Link className="hover:text-primary transition-colors" href="#">Soporte</Link>
            </nav>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <Link className="hover:text-primary transition-colors" href="#">Privacidad</Link>
            <Link className="hover:text-primary transition-colors" href="#">Términos</Link>
            <Link className="hover:text-primary transition-colors" href="#">Cookies</Link>
          </div>
          <div className="flex items-center gap-4">
            <span>Hecho con ❤️ para la comunidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
