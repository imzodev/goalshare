-- Add goal_type enum
CREATE TYPE "public"."goal_type" AS ENUM('metric', 'milestone', 'checkin', 'manual');

-- Add new columns to goals table
ALTER TABLE "goalshare_goals" ADD COLUMN "goal_type" "goal_type" DEFAULT 'manual' NOT NULL;
ALTER TABLE "goalshare_goals" ADD COLUMN "target_value" numeric;
ALTER TABLE "goalshare_goals" ADD COLUMN "target_unit" text;
ALTER TABLE "goalshare_goals" ADD COLUMN "current_value" numeric DEFAULT '0';
ALTER TABLE "goalshare_goals" ADD COLUMN "current_progress" integer DEFAULT 0;

-- Add index for goal_type
CREATE INDEX IF NOT EXISTS "goals_type_idx" ON "goalshare_goals" USING btree ("goal_type");

-- Add weight column to goal_milestones
ALTER TABLE "goalshare_goal_milestones" ADD COLUMN "weight" integer DEFAULT 0 NOT NULL;

-- Update entry_kind enum to remove old values and add new ones
-- First, update existing entries to use new valid values
UPDATE "goalshare_goal_entries" SET "kind" = 'note' WHERE "kind" = 'progress';
UPDATE "goalshare_goal_entries" SET "kind" = 'note' WHERE "kind" = 'tip';

-- Drop the old enum and create new one
ALTER TABLE "goalshare_goal_entries" ALTER COLUMN "kind" DROP DEFAULT;
DROP TYPE IF EXISTS "public"."entry_kind";
CREATE TYPE "public"."entry_kind" AS ENUM('note', 'checkin', 'milestone_update', 'progress_update', 'metric_update');
ALTER TABLE "goalshare_goal_entries" ALTER COLUMN "kind" TYPE "entry_kind" USING "kind"::text::"entry_kind";
ALTER TABLE "goalshare_goal_entries" ALTER COLUMN "kind" SET NOT NULL;

-- Rename and modify goal_entries columns
ALTER TABLE "goalshare_goal_entries" RENAME COLUMN "progress_value" TO "progress_snapshot";
ALTER TABLE "goalshare_goal_entries" DROP COLUMN IF EXISTS "metric_value";
ALTER TABLE "goalshare_goal_entries" DROP COLUMN IF EXISTS "metric_unit";

-- Set progress_snapshot to NULL for existing entries (they don't have meaningful data)
UPDATE "goalshare_goal_entries" SET "progress_snapshot" = NULL;
