import React from "react";

type FeatureCardProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="rounded-lg border p-6 h-full">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="text-2xl" aria-hidden>
            {icon}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20" aria-hidden />
        )}
        <div>
          <h3 className="font-medium leading-none">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </article>
  );
}
