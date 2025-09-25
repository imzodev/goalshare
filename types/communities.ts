import type { Community } from "@/db/schema";

export interface CommunitySummary extends Community {
  memberCount: number;
  isMember: boolean;
  userRole?: "member" | "admin";
}

export interface CommunityWithMembers extends Community {
  members: Array<{
    userId: string;
    username?: string;
    displayName?: string;
    role: "member" | "admin";
    joinedAt: string;
  }>;
}
