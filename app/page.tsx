import { SiteFooter } from "@/components/site-footer";
import { CtaAuthLink } from "@/components/cta-auth-link";
import { FeatureCard } from "@/components/feature-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { PricingCard } from "@/components/pricing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const t = await getTranslations("landing");
  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5"
        aria-labelledby="hero-heading"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-primary/20 via-purple-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/15 via-pink-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 pt-20 pb-16 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge className="mb-6 bg-gradient-to-br from-primary/10 via-purple-500/10 to-accent/10 text-primary border-primary/20 hover:bg-gradient-to-br hover:from-primary/20 hover:via-purple-500/20 hover:to-accent/20 transition-all duration-300">
              <Sparkles className="w-3 h-3 mr-1" />
              {t("hero.badge")}
            </Badge>

            <h1
              id="hero-heading"
              className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent leading-tight"
            >
              {t("hero.title")}
              <span className="bg-gradient-to-br from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                {" "}
                {t("hero.titleHighlight")}
              </span>
            </h1>

            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("hero.subtitle")}</p>

            <div className="mt-8 mx-auto max-w-2xl">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {t("hero.feature1")}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  {t("hero.feature2")}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  {t("hero.feature3")}
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <CtaAuthLink size="lg" className="min-w-[200px] transition-all duration-300">
                {t("hero.ctaPrimary")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </CtaAuthLink>
              <Button variant="outline" size="lg" asChild className="min-w-[200px] backdrop-blur-sm">
                <a href="#features">{t("hero.ctaSecondary")}</a>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {t("hero.noCard")} · {t("hero.quickSetup")}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-20 bg-gradient-to-br from-background via-muted/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {t("features.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("features.title")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("features.subtitle")}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <FeatureCard
              icon={
                <span role="img" aria-label="objetivos">
                  🎯
                </span>
              }
              title={t("features.goalsTitle")}
              description={t("features.goalsDescription")}
            />
            <FeatureCard
              icon={
                <span role="img" aria-label="seguimiento">
                  📊
                </span>
              }
              title={t("features.trackingTitle")}
              description={t("features.trackingDescription")}
            />
            <FeatureCard
              icon={
                <span role="img" aria-label="compartir">
                  🤝
                </span>
              }
              title={t("features.shareTitle")}
              description={t("features.shareDescription")}
            />
            <FeatureCard
              icon={
                <span role="img" aria-label="privacidad">
                  🔒
                </span>
              }
              title={t("features.privacyTitle")}
              description={t("features.privacyDescription")}
            />
            <FeatureCard
              icon={
                <span role="img" aria-label="notificaciones">
                  🔔
                </span>
              }
              title={t("features.remindersTitle")}
              description={t("features.remindersDescription")}
            />
            <FeatureCard
              icon={
                <span role="img" aria-label="integraciones">
                  🧩
                </span>
              }
              title={t("features.integrationsTitle")}
              description={t("features.integrationsDescription")}
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section
        className="relative py-20 bg-gradient-to-br from-muted/20 via-accent/5 to-background"
        aria-labelledby="social-proof-heading"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {t("testimonials.badge")}
            </Badge>
            <h2 id="social-proof-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t("testimonials.title")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("testimonials.subtitle")}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <TestimonialCard
              quote={t("testimonials.testimonial1Quote")}
              author={t("testimonials.testimonial1Author")}
              jobTitle={t("testimonials.testimonial1Role")}
            />
            <TestimonialCard
              quote={t("testimonials.testimonial2Quote")}
              author={t("testimonials.testimonial2Author")}
              jobTitle={t("testimonials.testimonial2Role")}
            />
            <TestimonialCard
              quote={t("testimonials.testimonial3Quote")}
              author={t("testimonials.testimonial3Author")}
              jobTitle={t("testimonials.testimonial3Role")}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="relative py-20 bg-gradient-to-br from-background via-primary/5 to-muted/20"
        aria-labelledby="pricing-heading"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Badge variant="outline" className="mb-4">
              {t("pricing.badge")}
            </Badge>
            <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t("pricing.title")}
              <span className="bg-gradient-to-br from-emerald-500 via-primary to-accent bg-clip-text text-transparent">
                {" "}
                {t("pricing.titleHighlight")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("pricing.subtitle")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <PricingCard
              name={t("pricing.freeName")}
              price={t("pricing.freePrice")}
              period={t("pricing.freePeriod")}
              description={t("pricing.freeDescription")}
              features={[t("pricing.freeFeature1"), t("pricing.freeFeature2"), t("pricing.freeFeature3")]}
              ctaLabel={t("pricing.freeCta")}
            />
            <PricingCard
              name={t("pricing.proName")}
              price={t("pricing.proPrice")}
              period={t("pricing.proPeriod")}
              description={t("pricing.proDescription")}
              features={[t("pricing.proFeature1"), t("pricing.proFeature2"), t("pricing.proFeature3")]}
              ctaLabel={t("pricing.proCta")}
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
              {t("finalCta.title")}
              <span className="bg-gradient-to-br from-accent via-rose-500 to-primary bg-clip-text text-transparent">
                {" "}
                {t("finalCta.titleHighlight")}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{t("finalCta.subtitle")}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <CtaAuthLink size="lg" className="min-w-[200px] transition-all duration-300">
                {t("finalCta.ctaPrimary")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </CtaAuthLink>
              <Button variant="outline" size="lg" asChild className="min-w-[200px] backdrop-blur-sm">
                <a href="#features">{t("finalCta.ctaSecondary")}</a>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {t("finalCta.feature1")}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {t("finalCta.feature2")}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                {t("finalCta.feature3")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
