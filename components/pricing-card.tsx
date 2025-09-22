import { CtaAuthLink } from "@/components/cta-auth-link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

type PricingCardProps = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel: string;
  popular?: boolean;
};

export function PricingCard({ name, price, period = "/mes", description, features, ctaLabel, popular }: PricingCardProps) {
  return (
    <Card className={`relative h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group ${
      popular ? "ring-2 ring-primary shadow-lg scale-105" : ""
    }`}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-br from-primary via-violet-500 to-accent text-primary-foreground shadow-lg">
          Popular
        </Badge>
      )}
      <CardHeader className="text-center pb-4">
        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">{name}</h3>
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <div className="text-4xl font-bold">
            {price}
          </div>
          {period && <div className="text-muted-foreground font-medium">{period}</div>}
        </div>
        {description && (
          <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        <ul className="space-y-3 flex-1" aria-label={`Características del plan ${name}`}>
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-muted-foreground leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 pt-4 border-t">
          <CtaAuthLink size="lg" className="w-full">
            {ctaLabel}
          </CtaAuthLink>
        </div>
      </CardContent>
    </Card>
  );
}

