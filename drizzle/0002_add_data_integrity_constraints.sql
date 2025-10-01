-- Migration: Add data integrity constraints
-- Created: 2025-10-01
-- Purpose: Add CHECK constraints to enforce data integrity at database level

-- Constraint 1: Metric/Checkin goals must have target_value > 0
ALTER TABLE "goalshare_goals" 
  ADD CONSTRAINT "check_metric_has_target" 
  CHECK (
    (goal_type NOT IN ('metric', 'checkin')) OR 
    (target_value IS NOT NULL AND target_value > 0)
  );

-- Constraint 2: Metric/Checkin goals must have target_unit
ALTER TABLE "goalshare_goals"
  ADD CONSTRAINT "check_metric_has_unit"
  CHECK (
    (goal_type NOT IN ('metric', 'checkin')) OR
    (target_unit IS NOT NULL AND target_unit != '')
  );

-- Constraint 3: Milestone weights must be in range 0-100
ALTER TABLE "goalshare_goal_milestones"
  ADD CONSTRAINT "check_weight_range"
  CHECK (weight >= 0 AND weight <= 100);

-- Constraint 4: Current progress must be in range 0-100
ALTER TABLE "goalshare_goals"
  ADD CONSTRAINT "check_current_progress_range"
  CHECK (
    current_progress IS NULL OR 
    (current_progress >= 0 AND current_progress <= 100)
  );

-- Constraint 5: Current value must be non-negative
ALTER TABLE "goalshare_goals"
  ADD CONSTRAINT "check_current_value_positive"
  CHECK (
    current_value IS NULL OR 
    current_value >= 0
  );

-- Constraint 6: Manual goals should not have target values
ALTER TABLE "goalshare_goals"
  ADD CONSTRAINT "check_manual_no_target"
  CHECK (
    goal_type != 'manual' OR 
    (target_value IS NULL AND target_unit IS NULL AND current_value IS NULL)
  );

-- Constraint 7: Milestone goals should not have progress fields
ALTER TABLE "goalshare_goals"
  ADD CONSTRAINT "check_milestone_no_progress"
  CHECK (
    goal_type != 'milestone' OR 
    (current_progress IS NULL AND target_value IS NULL)
  );
