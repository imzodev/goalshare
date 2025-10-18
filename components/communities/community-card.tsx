"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp } from "lucide-react";
import type { CommunitySummary } from "@/types/communities";

interface ActionButton {
  asLink?: boolean;
  href?: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

interface CommunityCardProps {
  community: CommunitySummary;
  gradientClass: string;
  badges?: ReactNode;
  subtitle?: ReactNode;
  primaryAction: ActionButton;
  secondaryAction?: ActionButton;
  compact?: boolean;
  rootClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  activeGoalsCount?: number | null;
  membersLabel?: string;
  activeGoalsLabel?: string;
}

export function CommunityCard({
  community,
  gradientClass,
  badges,
  subtitle,
  primaryAction,
  secondaryAction,
  compact = false,
  rootClassName,
  contentClassName,
  titleClassName,
  descriptionClassName,
  activeGoalsCount = null,
  membersLabel = "Miembros",
  activeGoalsLabel = "Metas activas",
}: CommunityCardProps) {
  return (
    <Card
      className={`group relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] gap-0 ${rootClassName ?? ""}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity`}
      />

      <CardHeader className={`relative gap-0 ${compact ? "pb-2" : "pb-3"}`}>
        {compact ? (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`}>
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0 w-0">
              <CardTitle
                className={`${compact ? "text-sm" : "text-lg"} font-semibold ${titleClassName ?? ""} truncate`}
              >
                {community.name}
              </CardTitle>
              <p className={`text-xs text-muted-foreground ${descriptionClassName ?? ""} truncate`}>
                {community.description || "Sin descripción"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle
                className={`${compact ? "text-sm" : "text-lg"} font-semibold mb-2 line-clamp-2 ${titleClassName ?? ""}`}
              >
                {community.name}
              </CardTitle>
              <div className={`flex flex-wrap gap-2 ${compact ? "mb-2" : "mb-3"}`}>{badges}</div>
            </div>

            <div
              className={`flex shrink-0 items-center justify-center bg-gradient-to-br shadow-lg rounded-xl ${compact ? "h-10 w-10" : "h-12 w-12"}`}
              style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
            >
              <Users className={`${compact ? "h-5 w-5" : "h-6 w-6"} text-white`} />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className={`relative ${compact ? "space-y-3" : "space-y-4"} ${contentClassName ?? ""}`}>
        {!compact && (
          <p
            className={`${compact ? "text-xs truncate" : "text-sm line-clamp-3"} text-muted-foreground ${descriptionClassName ?? ""}`}
          >
            {community.description || "Sin descripción disponible"}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-sm font-semibold">{community.memberCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{membersLabel}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
            <div className="text-sm font-semibold">{activeGoalsCount ?? "-"}</div>
            <div className="text-xs text-muted-foreground">{activeGoalsLabel}</div>
          </div>
        </div>

        <div className={`flex items-center gap-2 text-xs text-muted-foreground ${compact ? "mb-1" : ""}`}>
          <TrendingUp className={`${compact ? "h-3 w-3" : "h-3 w-3"}`} />
          <span>{subtitle}</span>
        </div>

        <div className={secondaryAction ? "flex items-center gap-2" : "block"}>
          {primaryAction.asLink ? (
            <Button
              asChild
              size="sm"
              className={
                secondaryAction ? `flex-1 ${primaryAction.className ?? ""}` : `w-full ${primaryAction.className ?? ""}`
              }
              disabled={primaryAction.disabled}
            >
              <Link href={primaryAction.href ?? "#"}>
                {primaryAction.icon}
                <span className={primaryAction.icon ? "ml-1" : undefined}>{primaryAction.label}</span>
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              className={
                secondaryAction ? `flex-1 ${primaryAction.className ?? ""}` : `w-full ${primaryAction.className ?? ""}`
              }
              disabled={primaryAction.disabled}
              onClick={primaryAction.onClick}
            >
              {primaryAction.icon}
              <span className={primaryAction.icon ? "ml-1" : undefined}>{primaryAction.label}</span>
            </Button>
          )}

          {secondaryAction &&
            (secondaryAction.asLink ? (
              <Button
                asChild
                size="sm"
                className={`flex-1 ${secondaryAction.className ?? ""}`}
                disabled={secondaryAction.disabled}
              >
                <Link href={secondaryAction.href ?? "#"}>
                  {secondaryAction.icon}
                  <span className={secondaryAction.icon ? "ml-1" : undefined}>{secondaryAction.label}</span>
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                className={`flex-1 ${secondaryAction.className ?? ""}`}
                disabled={secondaryAction.disabled}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.icon}
                <span className={secondaryAction.icon ? "ml-1" : undefined}>{secondaryAction.label}</span>
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
