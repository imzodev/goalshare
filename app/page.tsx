import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { CtaAuthLink } from "@/components/cta-auth-link";
import { FeatureCard } from "@/components/feature-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { PricingCard } from "@/components/pricing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5" aria-labelledby="hero-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-primary/20 via-purple-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/15 via-pink-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 pt-20 pb-16 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge className="mb-6 bg-gradient-to-br from-primary/10 via-purple-500/10 to-accent/10 text-primary border-primary/20 hover:bg-gradient-to-br hover:from-primary/20 hover:via-purple-500/20 hover:to-accent/20 transition-all duration-300">
              <Sparkles className="w-3 h-3 mr-1" />
              Nuevo · Presentación de GoalShare
            </Badge>
            
            <h1 id="hero-heading" className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
              Convierte tus metas en
              <span className="bg-gradient-to-br from-primary via-purple-500 to-accent bg-clip-text text-transparent"> progreso real</span>
            </h1>
            
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Define objetivos claros, comparte tu avance y mantén la motivación con tu comunidad.
            </p>
            
            <div className="mt-8 mx-auto max-w-2xl">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Establece metas con hitos y fechas límite
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Publica avances para rendir cuentas
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Recibe apoyo y feedback en cada paso
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <CtaAuthLink size="lg" className="min-w-[200px] transition-all duration-300">
                Comenzar gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </CtaAuthLink>
              <Button variant="outline" size="lg" asChild className="min-w-[200px] backdrop-blur-sm">
                <a href="#features">
                  Ver funciones
                </a>
              </Button>
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground">Sin tarjeta requerida · Configuración en 2 minutos</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Todo lo que necesitas para
              <span className="bg-gradient-to-br from-primary via-blue-500 to-accent bg-clip-text text-transparent"> avanzar</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Define, mide y comparte tu progreso con claridad y mantén la motivación en cada paso.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-20 bg-gradient-to-br from-muted/20 via-accent/5 to-background" aria-labelledby="social-proof-heading">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Testimonios
            </Badge>
            <h2 id="social-proof-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Lo que dice nuestra
              <span className="bg-gradient-to-br from-accent via-pink-500 to-primary bg-clip-text text-transparent"> comunidad</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Historias reales de progreso y motivación de personas que han transformado sus metas en realidad.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative py-20 bg-gradient-to-br from-background via-primary/5 to-muted/20" aria-labelledby="pricing-heading">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Precios
            </Badge>
            <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Planes simples y
              <span className="bg-gradient-to-br from-emerald-500 via-primary to-accent bg-clip-text text-transparent"> claros</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Comienza gratis y descubre el poder de GoalShare. Escala a Pro cuando estés listo para más funciones.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
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
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-primary/15 via-indigo-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/15 via-rose-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Listo para dar el
              <span className="bg-gradient-to-br from-accent via-rose-500 to-primary bg-clip-text text-transparent"> siguiente paso</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Únete a miles de personas que ya están transformando sus metas en progreso real.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <CtaAuthLink size="lg" className="min-w-[200px] transition-all duration-300">
                Comenzar gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </CtaAuthLink>
              <Button variant="outline" size="lg" asChild className="min-w-[200px] backdrop-blur-sm">
                <a href="#features">
                  Ver demo
                </a>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Sin tarjeta requerida
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Configuración en 2 minutos
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                Soporte 24/7
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
