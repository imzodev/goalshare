import { CtaAuthLink } from "@/components/cta-auth-link";

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
    <article className={`relative rounded-lg border p-6 h-full bg-background ${popular ? "ring-2 ring-primary" : ""}`}>
      {popular ? (
        <div className="absolute -top-3 right-4 select-none rounded-full border bg-primary text-primary-foreground px-2 py-0.5 text-xs font-medium shadow">
          Popular
        </div>
      ) : null}
      <header>
        <h3 className="text-lg font-semibold leading-none tracking-tight">{name}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-3xl font-bold">{price}</div>
          {period ? <div className="text-sm text-muted-foreground">{period}</div> : null}
        </div>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </header>
      <ul className="mt-6 space-y-2 text-sm" aria-label={`Características del plan ${name}`}>
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <CtaAuthLink>{ctaLabel}</CtaAuthLink>
      </div>
    </article>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
