"use client";

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="text-center sm:text-left">© {new Date().getFullYear()} GoalShare. Todos los derechos reservados.</p>
        <nav className="flex items-center gap-4">
          <Link className="hover:underline" href="#">Privacidad</Link>
          <Link className="hover:underline" href="#">Términos</Link>
          <Link className="hover:underline" href="#">Contacto</Link>
        </nav>
      </div>
    </footer>
  );
}
