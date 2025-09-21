CREATE TYPE "public"."community_kind" AS ENUM('domain', 'topic', 'cohort');--> statement-breakpoint
CREATE TYPE "public"."entry_kind" AS ENUM('progress', 'note', 'tip', 'checkin', 'milestone_update');--> statement-breakpoint
CREATE TYPE "public"."entry_visibility" AS ENUM('private', 'friends', 'public');--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."member_role" AS ENUM('member', 'admin');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'premium');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'incomplete', 'trialing');--> statement-breakpoint
CREATE TABLE "goalshare_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goalshare_communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"kind" "community_kind" NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goalshare_communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "goalshare_community_members" (
	"community_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "community_members_pk" PRIMARY KEY("community_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "goalshare_friendships" (
	"user_id" text NOT NULL,
	"friend_id" text NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_pk" PRIMARY KEY("user_id","friend_id")
);
--> statement-breakpoint
CREATE TABLE "goalshare_goal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"kind" "entry_kind" NOT NULL,
	"content" text,
	"progress_value" integer,
	"metric_value" numeric,
	"metric_unit" text,
	"image_path" text,
	"milestone_id" uuid,
	"visibility" "entry_visibility" DEFAULT 'private' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goalshare_goal_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"target_date" date,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goalshare_goal_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"default_topic_community_id" uuid NOT NULL,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goalshare_goal_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "goalshare_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"template_id" uuid,
	"topic_community_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"deadline" date,
	"status" "goal_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "goalshare_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"image_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goalshare_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text,
	"display_name" text,
	"image_url" text,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "goalshare_profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "goalshare_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"status" "subscription_status" NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_sub_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "goalshare_comments" ADD CONSTRAINT "goalshare_comments_post_id_goalshare_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."goalshare_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_comments" ADD CONSTRAINT "goalshare_comments_author_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_communities" ADD CONSTRAINT "goalshare_communities_parent_id_goalshare_communities_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."goalshare_communities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_community_members" ADD CONSTRAINT "goalshare_community_members_community_id_goalshare_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."goalshare_communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_community_members" ADD CONSTRAINT "goalshare_community_members_user_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_friendships" ADD CONSTRAINT "goalshare_friendships_user_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_friendships" ADD CONSTRAINT "goalshare_friendships_friend_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goal_entries" ADD CONSTRAINT "goalshare_goal_entries_goal_id_goalshare_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goalshare_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goal_entries" ADD CONSTRAINT "goalshare_goal_entries_author_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goal_entries" ADD CONSTRAINT "goalshare_goal_entries_milestone_id_goalshare_goal_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."goalshare_goal_milestones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goal_milestones" ADD CONSTRAINT "goalshare_goal_milestones_goal_id_goalshare_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goalshare_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goal_templates" ADD CONSTRAINT "goalshare_goal_templates_default_topic_community_id_goalshare_communities_id_fk" FOREIGN KEY ("default_topic_community_id") REFERENCES "public"."goalshare_communities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goals" ADD CONSTRAINT "goalshare_goals_owner_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goals" ADD CONSTRAINT "goalshare_goals_template_id_goalshare_goal_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."goalshare_goal_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_goals" ADD CONSTRAINT "goalshare_goals_topic_community_id_goalshare_communities_id_fk" FOREIGN KEY ("topic_community_id") REFERENCES "public"."goalshare_communities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_posts" ADD CONSTRAINT "goalshare_posts_community_id_goalshare_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."goalshare_communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_posts" ADD CONSTRAINT "goalshare_posts_author_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goalshare_subscriptions" ADD CONSTRAINT "goalshare_subscriptions_user_id_goalshare_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."goalshare_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_post_created_idx" ON "goalshare_comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_author_created_idx" ON "goalshare_comments" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "communities_parent_idx" ON "goalshare_communities" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "communities_kind_idx" ON "goalshare_communities" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "community_members_user_idx" ON "goalshare_community_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "friendships_user_idx" ON "goalshare_friendships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "friendships_friend_idx" ON "goalshare_friendships" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX "goal_entries_goal_created_idx" ON "goalshare_goal_entries" USING btree ("goal_id","created_at");--> statement-breakpoint
CREATE INDEX "goal_entries_milestone_created_idx" ON "goalshare_goal_entries" USING btree ("milestone_id","created_at");--> statement-breakpoint
CREATE INDEX "goal_entries_author_created_idx" ON "goalshare_goal_entries" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "goal_milestones_goal_sort_idx" ON "goalshare_goal_milestones" USING btree ("goal_id","sort_order");--> statement-breakpoint
CREATE INDEX "goal_milestones_goal_completed_idx" ON "goalshare_goal_milestones" USING btree ("goal_id","completed_at");--> statement-breakpoint
CREATE INDEX "goal_templates_default_topic_idx" ON "goalshare_goal_templates" USING btree ("default_topic_community_id");--> statement-breakpoint
CREATE INDEX "goals_owner_status_created_idx" ON "goalshare_goals" USING btree ("owner_id","status","created_at");--> statement-breakpoint
CREATE INDEX "goals_topic_created_idx" ON "goalshare_goals" USING btree ("topic_community_id","created_at");--> statement-breakpoint
CREATE INDEX "posts_community_created_idx" ON "goalshare_posts" USING btree ("community_id","created_at");--> statement-breakpoint
CREATE INDEX "posts_author_created_idx" ON "goalshare_posts" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "subscriptions_user_idx" ON "goalshare_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "goalshare_subscriptions" USING btree ("status");