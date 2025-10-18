"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Users, MessageCircle, Loader2 } from "lucide-react";
import type { CommunitySummary } from "@/types/communities";
import { CommunityCard } from "@/components/communities/community-card";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface CommunitiesGridProps {
  communities: CommunitySummary[];
  onCommunityAction: () => void;
  getCommunityGradient: (communityId: string) => string;
}

export function CommunitiesGrid({ communities, onCommunityAction, getCommunityGradient }: CommunitiesGridProps) {
  const tActions = useTranslations("common.actions");
  const tStates = useTranslations("common.states");
  const tSection = useTranslations("dashboard.communitiesSection");
  const tKinds = useTranslations("communities.kinds.labels");
  const tExplore = useTranslations("communities.explore");
  const tErrors = useTranslations("errors");
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);

  const handleJoinCommunity = async (community: CommunitySummary) => {
    try {
      setJoiningCommunity(community.id);
      const response = await fetch(`/api/communities/${community.id}`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("joinError");

      onCommunityAction(); // Refresh data
      toast.success(`${tExplore("join")} ${community.name}`);
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error(tErrors("generic"));
    } finally {
      setJoiningCommunity(null);
    }
  };

  if (communities.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-white/20 shadow-xl">
        <CardContent className="pt-6">
          <div className="rounded-lg border border-dashed bg-white/50 dark:bg-gray-800/40 px-6 py-16 text-center">
            <Users className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{tStates("noResults")}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{tExplore("pageDescription")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {communities.map((community) => {
        const gradient = getCommunityGradient(community.id);
        const isJoining = joiningCommunity === community.id;
        const kindKey =
          community.kind === "topic" || community.kind === "domain" || community.kind === "cohort"
            ? community.kind
            : "community";

        return (
          <CommunityCard
            key={community.id}
            community={community}
            gradientClass={gradient}
            badges={
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/20 dark:text-blue-300">
                {tKinds(kindKey)}
              </span>
            }
            subtitle={<>{tKinds(kindKey)}</>}
            membersLabel={tSection("members")}
            activeGoalsLabel={tSection("activeGoals")}
            primaryAction={
              community.isMember
                ? {
                    asLink: true,
                    href: `/dashboard/communities/${community.id}`,
                    label: tActions("view"),
                    icon: <ArrowUpRight className="mr-1 h-3 w-3" />,
                    className:
                      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg transition-all hover:shadow-xl",
                  }
                : {
                    label: isJoining ? tStates("loading") : tActions("join"),
                    icon: isJoining ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <MessageCircle className="mr-1 h-3 w-3" />
                    ),
                    disabled: isJoining,
                    onClick: () => handleJoinCommunity(community),
                    className: `bg-gradient-to-r ${gradient} hover:shadow-lg transition-all disabled:opacity-50`,
                  }
            }
          />
        );
      })}
    </div>
  );
}
