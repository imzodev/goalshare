"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, Users, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface StatsCardsProps {
  activeGoals?: number;
  averageProgress?: number;
  communitiesCount?: number;
  achievementsCount?: number;
  loading?: boolean;
}

export function StatsCards({
  activeGoals,
  averageProgress,
  communitiesCount = 2,
  achievementsCount = 8,
  loading = false,
}: StatsCardsProps) {
  const t = useTranslations("dashboard.stats");
  const stats = [
    {
      title: t("activeGoals"),
      value: loading ? "..." : String(activeGoals ?? 0),
      change: t("changeActiveWeek", { count: 2 }),
      icon: Target,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: t("avgProgress"),
      value: loading ? "..." : `${averageProgress ?? 0}%`,
      change: t("changeAvgMonth", { percent: 12 }),
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      title: t("communities"),
      value: loading ? "..." : String(communitiesCount),
      change: t("changeCommunitiesActive", { count: communitiesCount }),
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: t("achievements"),
      value: loading ? "..." : String(achievementsCount),
      change: t("changeAchievementsMonth", { count: 3 }),
      icon: Trophy,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.bgGradient} dark:from-gray-900 dark:to-gray-800 hover:shadow-lg transition-all duration-300 hover:scale-105`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div className={`p-3 rounded-full bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>

            {/* Elemento decorativo */}
            <div
              className={`absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
