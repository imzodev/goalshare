import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { CtaAuthLink } from "@/components/cta-auth-link";
import { FeatureCard } from "@/components/feature-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { PricingCard } from "@/components/pricing-card";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">
            Nuevo
            <span className="hidden sm:inline">· Presentación de GoalShare</span>
          </span>
          <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold tracking-tight">
            Convierte tus metas en progreso real
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Define objetivos claros, comparte tu avance y mantén la motivación con tu comunidad.
          </p>
          <div className="mt-6 mx-auto max-w-xl rounded-lg bg-secondary/70 text-secondary-foreground">
            <ul
              className="grid gap-2 text-left list-disc list-inside text-sm/6 px-4 py-3"
              aria-label="Beneficios clave"
            >
              <li>Establece metas con hitos y fechas límite.</li>
              <li>Publica avances para rendir cuentas.</li>
              <li>Recibe apoyo y feedback en cada paso.</li>
            </ul>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3">
            <CtaAuthLink>Comenzar gratis</CtaAuthLink>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground px-4 py-2 text-sm font-medium hover:opacity-95 transition shadow-sm"
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
          <h2 className="text-2xl font-semibold">Todo lo que necesitas para avanzar</h2>
          <p className="mt-2 text-muted-foreground">Define, mide y comparte tu progreso con claridad.</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<span role="img" aria-label="objetivos">🎯</span>}
            title="Metas e hitos"
            description="Crea objetivos concretos, divídelos en hitos e impulsa tu ritmo con deadlines."
          />
          <FeatureCard
            icon={<span role="img" aria-label="seguimiento">📊</span>}
            title="Seguimiento claro"
            description="Registra avances y visualiza tu progreso para no perder el foco."
          />
          <FeatureCard
            icon={<span role="img" aria-label="compartir">🤝</span>}
            title="Comparte y colabora"
            description="Invita a tu comunidad para recibir apoyo y mantener la constancia."
          />
          <FeatureCard
            icon={<span role="img" aria-label="privacidad">🔒</span>}
            title="Privacidad flexible"
            description="Elige quién puede ver tus objetivos: privado, por enlace o público."
          />
          <FeatureCard
            icon={<span role="img" aria-label="notificaciones">🔔</span>}
            title="Recordatorios inteligentes"
            description="Recibe recordatorios y resúmenes para mantenerte en movimiento."
          />
          <FeatureCard
            icon={<span role="img" aria-label="integraciones">🧩</span>}
            title="Integraciones (próximamente)"
            description="Conecta con tus herramientas favoritas para centralizar tu progreso."
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
          <p className="mt-2 text-muted-foreground">Comienza gratis. Escala a Pro cuando lo necesites.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <PricingCard
            name="Free"
            price="$0"
            period="/mes"
            description="Todo lo esencial para empezar y validar tu flujo."
            features={[
              "Metas ilimitadas",
              "Actualizaciones de progreso",
              "Compartir por enlace público",
            ]}
            ctaLabel="Crear cuenta gratis"
          />
          <PricingCard
            name="Pro"
            price="$9"
            period="/mes"
            description="Colaboración avanzada, métricas y automatizaciones."
            features={[
              "Todo en Free",
              "Colaboradores con permisos",
              "Historial y recordatorios avanzados",
            ]}
            ctaLabel="Mejorar a Pro"
            popular
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold">Listo para dar el siguiente paso</h2>
        <p className="mt-2 text-muted-foreground">Crea tu cuenta y empieza a avanzar hoy.</p>
        <div className="mt-6 flex justify-center">
          <CtaAuthLink>Comenzar gratis</CtaAuthLink>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
