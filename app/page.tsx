import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { CtaAuthLink } from "@/components/cta-auth-link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-3xl">
          <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold tracking-tight">
            Organiza, comparte y logra tus objetivos
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            GoalShare te ayuda a convertir metas en progreso medible y visible para tu comunidad.
          </p>
          <ul
            className="mt-6 grid gap-2 text-left mx-auto max-w-xl list-disc list-inside text-sm text-muted-foreground"
            aria-label="Beneficios clave"
          >
            <li>Define objetivos claros con hitos y fechas.</li>
            <li>Comparte avances para mantenerte responsable.</li>
            <li>Recibe apoyo y feedback de tu círculo.</li>
          </ul>
          <div className="mt-8 flex items-center justify-center gap-3">
            <CtaAuthLink>Empezar ahora</CtaAuthLink>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition"
            >
              Ver funciones
            </a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Sin tarjeta requerida</p>
        </div>
        <div className="mt-12 grid place-items-center">
          <Image src="/next.svg" alt="Ilustración de la app" width={220} height={48} className="opacity-60 dark:invert" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold">Lo esencial para avanzar</h2>
          <p className="mt-2 text-muted-foreground">Funcionalidades clave para definir, medir y compartir.</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <h3 className="font-medium">Feature {i}</h3>
              <p className="mt-2 text-sm text-muted-foreground">Descripción breve de la funcionalidad {i}.</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold">Confiado por creadores y equipos</h2>
          <p className="mt-2 text-muted-foreground">Testimonios/Logos de ejemplo</p>
        </div>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 opacity-70">
          {["next.svg","vercel.svg","globe.svg","file.svg","next.svg","vercel.svg"].map((src, idx) => (
            <div key={idx} className="flex items-center justify-center p-4 rounded border">
              <Image src={`/${src}`} alt="logo" width={72} height={24} className="dark:invert" />
            </div>
          ))}
        </div>
      </section>

      {/* Pricing (teaser) */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold">Comienza gratis</h2>
          <p className="mt-2 text-muted-foreground">Planes simples. Actualiza cuando lo necesites.</p>
        </div>
        <div className="mt-8 grid max-w-3xl mx-auto">
          <div className="rounded-lg border p-6 text-center">
            <div className="text-3xl font-bold">Free</div>
            <p className="mt-2 text-sm text-muted-foreground">Todo lo que necesitas para iniciar</p>
            <div className="mt-6">
              <CtaAuthLink>Crear cuenta</CtaAuthLink>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold">¿Listo para compartir tus objetivos?</h2>
        <p className="mt-2 text-muted-foreground">Únete hoy y mantén tu progreso visible.</p>
        <div className="mt-6 flex justify-center">
          <CtaAuthLink>Empezar ahora</CtaAuthLink>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
