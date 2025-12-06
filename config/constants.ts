// Constantes cross-app
export const FREE_GOAL_LIMIT = 5;

export const COMMUNITY_KINDS = {
  DOMAIN: "domain",
  TOPIC: "topic",
  COHORT: "cohort",
} as const;

export const GOAL_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
} as const;

export const ROUTES = {
  AUTH_LOGIN: "/auth/login",
  DASHBOARD: "/dashboard",
} as const;

export const CHAT_PAGINATION = {
  INITIAL_PAGE_SIZE: 5,
  PAGE_SIZE: 5,
} as const;
