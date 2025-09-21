import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { CtaAuthLink } from "@/components/cta-auth-link";
import { FeatureCard } from "@/components/feature-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { PricingCard } from "@/components/pricing-card";

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
          <FeatureCard
            icon={<span role="img" aria-label="objetivos">🎯</span>}
            title="Metas e hitos"
            description="Define objetivos claros, divide en hitos y pon fechas para mantener el ritmo."
          />
          <FeatureCard
            icon={<span role="img" aria-label="seguimiento">📊</span>}
            title="Seguimiento simple"
            description="Actualiza tu progreso y visualiza avances con claridad."
          />
          <FeatureCard
            icon={<span role="img" aria-label="compartir">🤝</span>}
            title="Comparte y colabora"
            description="Invita a tu comunidad para recibir apoyo y mantenerte responsable."
          />
          <FeatureCard
            icon={<span role="img" aria-label="privacidad">🔒</span>}
            title="Privado o público"
            description="Controla la visibilidad de tus objetivos según tu preferencia."
          />
          <FeatureCard
            icon={<span role="img" aria-label="notificaciones">🔔</span>}
            title="Recordatorios"
            description="Mantén el foco con recordatorios y resúmenes de actividad."
          />
          <FeatureCard
            icon={<span role="img" aria-label="integraciones">🧩</span>}
            title="Integraciones"
            description="Conecta con herramientas clave (próximamente)."
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-12" aria-labelledby="social-proof-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="social-proof-heading" className="text-2xl font-semibold">Lo que dice nuestra comunidad</h2>
          <p className="mt-2 text-muted-foreground">Historias reales de progreso y motivación.</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <TestimonialCard
            quote="Con GoalShare por fin mantengo mis metas visibles. El simple hecho de compartir avances me mantiene constante."
            author="María P."
            role="Creadora de contenido"
          />
          <TestimonialCard
            quote="Nuestro equipo alinea objetivos y ve el progreso en una sola vista. Mucho menos fricción en las dailies."
            author="Equipo Acme"
            role="Startup de producto"
          />
          <TestimonialCard
            quote="Me encanta la simplicidad. Crear objetivos, registrar avances y pedir feedback es muy natural."
            author="Jorge R."
            role="Indie hacker"
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-16" aria-labelledby="pricing-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="pricing-heading" className="text-2xl font-semibold">Planes simples y claros</h2>
          <p className="mt-2 text-muted-foreground">Empieza gratis y mejora cuando lo necesites.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            period="/mes"
            description="Ideal para comenzar y validar tu flujo."
            features={[
              "Metas ilimitadas",
              "Actualizaciones de progreso",
              "Compartir con enlace público",
            ]}
            ctaLabel="Crear cuenta"
          />
          <PricingCard
            name="Pro"
            price="$9"
            period="/mes"
            description="Colaboración avanzada y métricas."
            features={[
              "Todo en Free",
              "Colaboradores con permisos",
              "Historial y recordatorios avanzados",
            ]}
            ctaLabel="Probar Pro"
            popular
          />
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
