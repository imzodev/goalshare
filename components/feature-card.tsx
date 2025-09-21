import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type FeatureCardProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl group-hover:bg-primary/20 transition-colors duration-300" aria-hidden>
              {icon}
            </div>
          ) : (
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors duration-300" aria-hidden />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors duration-300">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
