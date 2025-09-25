export interface TopicSummary {
  id: string;
  name: string;
  slug: string;
}

export interface UserGoalSummary {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
  progress: number;
  daysLeft: number | null;
  topicCommunity: TopicSummary | null;
  lastUpdateAt: string;
}
