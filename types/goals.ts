export type GoalType = "metric" | "milestone" | "checkin" | "manual";

export interface TopicSummary {
  id: string;
  name: string;
  slug: string;
}

export interface MilestoneItem {
  title: string;
  description?: string;
  dueDate?: string;
  weight: number;
}

export interface CreateGoalPayload {
  title: string;
  description: string;
  deadline?: string | null;
  topicCommunityId: string;
  templateId?: string | null;
}

export interface UserGoalSummary {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  goalType: GoalType;
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
  progress: number;
  daysLeft: number | null;
  topicCommunity: TopicSummary | null;
  lastUpdateAt: string;
  // For "metric" and "checkin" types
  targetValue?: number | null;
  targetUnit?: string | null;
  currentValue?: number | null;
  // For "manual" type
  currentProgress?: number | null;
}
