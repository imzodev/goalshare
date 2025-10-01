import type { Goal, GoalMilestone } from "@/db/schema";
import { logger } from "@/utils/logger";

/**
 * Clamps a given value between 0 and 100.
 * If the value is not a finite number, returns 0.
 * @param value - The value to clamp.
 * @returns The clamped value.
 */
export function clampProgress(value: unknown): number {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.min(Math.max(Math.round(numeric), 0), 100);
}

/**
 * Calculates the progress of a goal based on its type.
 * @param goal - The goal to calculate progress for.
 * @param milestones - The milestones associated with the goal (for milestone type).
 * @returns The progress percentage (0-100).
 */
export function calculateGoalProgress(
  goal: Goal,
  milestones: GoalMilestone[] = []
): number {
  switch (goal.goalType) {
    case "metric":
    case "checkin": {
      const target = Number(goal.targetValue ?? 0);
      const current = Number(goal.currentValue ?? 0);
      
      if (target <= 0) {
        logger.warn(`[calculateGoalProgress] Goal ${goal.id} has invalid targetValue: ${target}`);
        return 0;
      }
      
      if (current < 0) {
        logger.warn(`[calculateGoalProgress] Goal ${goal.id} has negative currentValue: ${current}`);
        return 0;
      }
      
      return clampProgress((current / target) * 100);
    }

    case "milestone": {
      if (milestones.length === 0) return 0;
      
      // Validar pesos individuales
      const invalidWeights = milestones.filter(m => {
        const weight = m.weight || 0;
        return weight < 0 || weight > 100;
      });
      
      if (invalidWeights.length > 0) {
        logger.warn(
          `[calculateGoalProgress] Goal ${goal.id} has ${invalidWeights.length} milestones with invalid weights`,
          invalidWeights.map(m => ({ id: m.id, weight: m.weight }))
        );
      }
      
      // Calcular peso total
      const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 0), 0);
      
      if (totalWeight > 100) {
        logger.warn(
          `[calculateGoalProgress] Goal ${goal.id} has milestones with total weight > 100: ${totalWeight}`
        );
      }
      
      if (totalWeight < 100 && milestones.length > 0) {
        logger.warn(
          `[calculateGoalProgress] Goal ${goal.id} has milestones with total weight < 100: ${totalWeight}`
        );
      }
      
      // Calcular progreso con pesos clampeados
      const completedWeight = milestones
        .filter((m) => m.completedAt !== null)
        .reduce((sum, m) => sum + Math.min(Math.max(m.weight || 0, 0), 100), 0);
      
      return clampProgress(completedWeight);
    }

    case "manual": {
      return clampProgress(goal.currentProgress ?? 0);
    }

    default:
      return 0;
  }
}
