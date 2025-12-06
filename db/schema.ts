// Esquema relacional base para GoalShare con Drizzle ORM (a definir)
// Aquí definiremos tablas: users (ref a auth), goals, groups, memberships, friendships,
// posts, comments, subscriptions, etc. Por ahora lo dejamos vacío, sin migraciones.
import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  pgEnum,
  pgTable,
  text,
  uuid,
  integer,
  date,
  timestamp,
  unique,
  uniqueIndex,
  index,
  numeric,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";

// Enums
export const communityKindEnum = pgEnum("community_kind", ["domain", "topic", "cohort"]);
export const goalStatusEnum = pgEnum("goal_status", ["pending", "completed"]);
export const goalTypeEnum = pgEnum("goal_type", ["metric", "milestone", "checkin", "manual"]);
export const memberRoleEnum = pgEnum("member_role", ["member", "admin"]);
export const friendshipStatusEnum = pgEnum("friendship_status", ["pending", "accepted", "blocked"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "trialing",
]);
export const entryKindEnum = pgEnum("entry_kind", [
  "note",
  "checkin",
  "milestone_update",
  "progress_update",
  "metric_update",
]);
export const entryVisibilityEnum = pgEnum("entry_visibility", ["private", "friends", "public"]);

// Utilidades comunes
// Nota: evitamos helpers que introduzcan tipos implícitos para mejorar la DX con TS.

// subscription plans & permissions
export const subscriptionPlans = pgTable(
  "goalshare_subscription_plans",
  {
    id: text("id").primaryKey(),
    displayName: text("display_name").notNull(),
    description: text("description"),
    stripePriceId: text("stripe_price_id"),
    billingPeriod: text("billing_period"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("subscription_plans_stripe_price_unique")
      .on(t.stripePriceId)
      .where(sql`${t.stripePriceId} is not null`),
  ]
);

export const planPermissions = pgTable(
  "goalshare_plan_permissions",
  {
    planId: text("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "cascade" }),
    permissionKey: text("permission_key").notNull(),
    boolValue: boolean("bool_value"),
    intValue: integer("int_value"),
    textValue: text("text_value"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => sql`now()`)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.planId, t.permissionKey], name: "plan_permissions_pk" })]
);

// profiles
export const profiles = pgTable(
  "goalshare_profiles",
  {
    userId: text("user_id").primaryKey(), // Clerk user id
    username: text("username").unique(),
    displayName: text("display_name"),
    imageUrl: text("image_url"),
    planId: text("plan_id")
      .notNull()
      .default("free")
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  () => []
);

// communities (jerárquica)
export const communities = pgTable(
  "goalshare_communities",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    parentId: uuid("parent_id").references((): AnyPgColumn => communities.id, { onDelete: "set null" }),
    kind: communityKindEnum("kind").notNull(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("communities_parent_idx").on(t.parentId), index("communities_kind_idx").on(t.kind)]
);

// community_members
export const communityMembers = pgTable(
  "goalshare_community_members",
  {
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    role: memberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.communityId, t.userId], name: "community_members_pk" }),
    index("community_members_user_idx").on(t.userId),
  ]
);

// goal_templates
export const goalTemplates = pgTable(
  "goalshare_goal_templates",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    defaultTopicCommunityId: uuid("default_topic_community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "restrict" }),
    tags: text("tags").array(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("goal_templates_default_topic_idx").on(t.defaultTopicCommunityId)]
);

// goals
export const goals = pgTable(
  "goalshare_goals",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    templateId: uuid("template_id").references(() => goalTemplates.id, { onDelete: "set null" }),
    topicCommunityId: uuid("topic_community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    deadline: date("deadline"),
    status: goalStatusEnum("status").notNull().default("pending"),
    goalType: goalTypeEnum("goal_type").notNull().default("manual"),
    // For "metric" and "checkin" types
    targetValue: numeric("target_value"),
    targetUnit: text("target_unit"),
    currentValue: numeric("current_value").default("0"),
    // For "manual" type
    currentProgress: integer("current_progress").default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [
    index("goals_owner_status_created_idx").on(t.ownerId, t.status, t.createdAt),
    index("goals_topic_created_idx").on(t.topicCommunityId, t.createdAt),
    // Index on goalType for future filtering features (e.g., "Show only metric goals", analytics by type)
    // While not currently used in queries, it's maintained for:
    // 1. Future UI filters by goal type
    // 2. Analytics and reporting queries
    // 3. Admin dashboards showing goal type distribution
    // Low overhead due to enum type (4 values) and relatively small table size
    index("goals_type_idx").on(t.goalType),
  ]
);

// goal_milestones
export const goalMilestones = pgTable(
  "goalshare_goal_milestones",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    weight: integer("weight").notNull().default(0), // Percentage weight (0-100)
    targetDate: date("target_date"),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("goal_milestones_goal_sort_idx").on(t.goalId, t.sortOrder),
    index("goal_milestones_goal_completed_idx").on(t.goalId, t.completedAt),
  ]
);

// goal_entries
export const goalEntries = pgTable(
  "goalshare_goal_entries",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    kind: entryKindEnum("kind").notNull(),
    content: text("content"),
    imagePath: text("image_path"),
    milestoneId: uuid("milestone_id").references(() => goalMilestones.id, { onDelete: "set null" }),
    progressSnapshot: integer("progress_snapshot"), // Snapshot of progress at time of entry (for history)
    visibility: entryVisibilityEnum("visibility").notNull().default("private"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("goal_entries_goal_created_idx").on(t.goalId, t.createdAt),
    index("goal_entries_milestone_created_idx").on(t.milestoneId, t.createdAt),
    index("goal_entries_author_created_idx").on(t.authorId, t.createdAt),
  ]
);

// posts
export const posts = pgTable(
  "goalshare_posts",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    body: text("body").notNull(),
    imagePath: text("image_path"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("posts_community_created_idx").on(t.communityId, t.createdAt),
    index("posts_author_created_idx").on(t.authorId, t.createdAt),
  ]
);

// comments
export const comments = pgTable(
  "goalshare_comments",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("comments_post_created_idx").on(t.postId, t.createdAt),
    index("comments_author_created_idx").on(t.authorId, t.createdAt),
  ]
);

// friendships
export const friendships = pgTable(
  "goalshare_friendships",
  {
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    friendId: text("friend_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    // Nota: el unique simétrico LEAST/GREATEST es más complejo en Drizzle. Por ahora, unique directo.
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.friendId], name: "friendships_pk" }),
    index("friendships_user_idx").on(t.userId),
    index("friendships_friend_idx").on(t.friendId),
  ]
);

// subscriptions
export const subscriptions = pgTable(
  "goalshare_subscriptions",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    unique("subscriptions_stripe_sub_id_unique").on(t.stripeSubscriptionId),
    index("subscriptions_user_idx").on(t.userId),
    index("subscriptions_status_idx").on(t.status),
    uniqueIndex("subscriptions_user_active_unique")
      .on(t.userId)
      .where(sql`${t.status} in ('active', 'trialing', 'incomplete')`),
  ]
);

// coaching_messages
export const coachingMessages = pgTable(
  "goalshare_coaching_messages",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant'
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("coaching_messages_goal_created_idx").on(t.goalId, t.createdAt)]
);

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type PlanPermission = typeof planPermissions.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Community = typeof communities.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type GoalEntry = typeof goalEntries.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Friendship = typeof friendships.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type CoachingMessage = typeof coachingMessages.$inferSelect;
