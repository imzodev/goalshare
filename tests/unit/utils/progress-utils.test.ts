import { describe, it, expect } from 'vitest';
import { clampProgress, calculateGoalProgress } from '@/utils/progress-utils';
import type { Goal, GoalMilestone } from '@/db/schema';

describe('clampProgress', () => {
  it('should return 0 for null', () => {
    expect(clampProgress(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(clampProgress(undefined)).toBe(0);
  });

  it('should return 0 for non-numeric values', () => {
    expect(clampProgress('abc')).toBe(0);
    expect(clampProgress(NaN)).toBe(0);
    expect(clampProgress(Infinity)).toBe(0);
    expect(clampProgress(-Infinity)).toBe(0);
  });

  it('should clamp negative values to 0', () => {
    expect(clampProgress(-10)).toBe(0);
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(-100)).toBe(0);
  });

  it('should clamp values over 100 to 100', () => {
    expect(clampProgress(150)).toBe(100);
    expect(clampProgress(101)).toBe(100);
    expect(clampProgress(1000)).toBe(100);
  });

  it('should round decimal values', () => {
    expect(clampProgress(45.7)).toBe(46);
    expect(clampProgress(45.3)).toBe(45);
    expect(clampProgress(45.5)).toBe(46);
    expect(clampProgress(99.9)).toBe(100);
  });

  it('should return valid values unchanged (after rounding)', () => {
    expect(clampProgress(0)).toBe(0);
    expect(clampProgress(50)).toBe(50);
    expect(clampProgress(100)).toBe(100);
    expect(clampProgress(25)).toBe(25);
    expect(clampProgress(75)).toBe(75);
  });
});

describe('calculateGoalProgress', () => {
  describe('metric type', () => {
    it('should calculate progress correctly', () => {
      const goal = {
        id: 'test-1',
        goalType: 'metric',
        targetValue: '10',
        currentValue: '5',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(50);
    });

    it('should return 0 when target is 0', () => {
      const goal = {
        id: 'test-2',
        goalType: 'metric',
        targetValue: '0',
        currentValue: '5',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(0);
    });

    it('should return 0 when target is negative', () => {
      const goal = {
        id: 'test-3',
        goalType: 'metric',
        targetValue: '-10',
        currentValue: '5',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(0);
    });

    it('should handle null values', () => {
      const goal = {
        id: 'test-4',
        goalType: 'metric',
        targetValue: null,
        currentValue: null,
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(0);
    });

    it('should clamp progress over 100%', () => {
      const goal = {
        id: 'test-5',
        goalType: 'metric',
        targetValue: '10',
        currentValue: '15',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(100);
    });

    it('should handle decimal values', () => {
      const goal = {
        id: 'test-6',
        goalType: 'metric',
        targetValue: '100',
        currentValue: '33.33',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(33);
    });

    it('should return 0 when current is negative', () => {
      const goal = {
        id: 'test-7',
        goalType: 'metric',
        targetValue: '10',
        currentValue: '-5',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(0);
    });
  });

  describe('checkin type', () => {
    it('should calculate progress correctly', () => {
      const goal = {
        id: 'test-8',
        goalType: 'checkin',
        targetValue: '30',
        currentValue: '18',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(60);
    });

    it('should handle completion', () => {
      const goal = {
        id: 'test-9',
        goalType: 'checkin',
        targetValue: '30',
        currentValue: '30',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(100);
    });

    it('should work with large numbers', () => {
      const goal = {
        id: 'test-10',
        goalType: 'checkin',
        targetValue: '365',
        currentValue: '182.5',
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(50);
    });
  });

  describe('milestone type', () => {
    it('should return 0 when no milestones', () => {
      const goal = {
        id: 'test-11',
        goalType: 'milestone',
      } as Goal;

      expect(calculateGoalProgress(goal, [])).toBe(0);
    });

    it('should calculate progress from completed milestones', () => {
      const goal = {
        id: 'test-12',
        goalType: 'milestone',
      } as Goal;

      const milestones = [
        { id: 'm1', goalId: 'test-12', weight: 25, completedAt: new Date(), title: 'M1', sortOrder: 0, createdAt: new Date() },
        { id: 'm2', goalId: 'test-12', weight: 25, completedAt: new Date(), title: 'M2', sortOrder: 1, createdAt: new Date() },
        { id: 'm3', goalId: 'test-12', weight: 25, completedAt: null, title: 'M3', sortOrder: 2, createdAt: new Date() },
        { id: 'm4', goalId: 'test-12', weight: 25, completedAt: null, title: 'M4', sortOrder: 3, createdAt: new Date() },
      ] as GoalMilestone[];

      expect(calculateGoalProgress(goal, milestones)).toBe(50);
    });

    it('should handle milestones with 0 weight', () => {
      const goal = {
        id: 'test-13',
        goalType: 'milestone',
      } as Goal;

      const milestones = [
        { id: 'm1', goalId: 'test-13', weight: 0, completedAt: new Date(), title: 'M1', sortOrder: 0, createdAt: new Date() },
      ] as GoalMilestone[];

      expect(calculateGoalProgress(goal, milestones)).toBe(0);
    });

    it('should clamp total weight to 100', () => {
      const goal = {
        id: 'test-14',
        goalType: 'milestone',
      } as Goal;

      const milestones = [
        { id: 'm1', goalId: 'test-14', weight: 60, completedAt: new Date(), title: 'M1', sortOrder: 0, createdAt: new Date() },
        { id: 'm2', goalId: 'test-14', weight: 60, completedAt: new Date(), title: 'M2', sortOrder: 1, createdAt: new Date() },
      ] as GoalMilestone[];

      expect(calculateGoalProgress(goal, milestones)).toBe(100);
    });

    it('should handle uneven weight distribution', () => {
      const goal = {
        id: 'test-15',
        goalType: 'milestone',
      } as Goal;

      const milestones = [
        { id: 'm1', goalId: 'test-15', weight: 40, completedAt: new Date(), title: 'M1', sortOrder: 0, createdAt: new Date() },
        { id: 'm2', goalId: 'test-15', weight: 30, completedAt: null, title: 'M2', sortOrder: 1, createdAt: new Date() },
        { id: 'm3', goalId: 'test-15', weight: 30, completedAt: null, title: 'M3', sortOrder: 2, createdAt: new Date() },
      ] as GoalMilestone[];

      expect(calculateGoalProgress(goal, milestones)).toBe(40);
    });

    it('should handle all milestones completed', () => {
      const goal = {
        id: 'test-16',
        goalType: 'milestone',
      } as Goal;

      const milestones = [
        { id: 'm1', goalId: 'test-16', weight: 50, completedAt: new Date(), title: 'M1', sortOrder: 0, createdAt: new Date() },
        { id: 'm2', goalId: 'test-16', weight: 50, completedAt: new Date(), title: 'M2', sortOrder: 1, createdAt: new Date() },
      ] as GoalMilestone[];

      expect(calculateGoalProgress(goal, milestones)).toBe(100);
    });
  });

  describe('manual type', () => {
    it('should return currentProgress', () => {
      const goal = {
        id: 'test-17',
        goalType: 'manual',
        currentProgress: 35,
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(35);
    });

    it('should handle null currentProgress', () => {
      const goal = {
        id: 'test-18',
        goalType: 'manual',
        currentProgress: null,
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(0);
    });

    it('should clamp invalid values', () => {
      const goal1 = {
        id: 'test-19',
        goalType: 'manual',
        currentProgress: -10,
      } as Goal;
      expect(calculateGoalProgress(goal1)).toBe(0);

      const goal2 = {
        id: 'test-20',
        goalType: 'manual',
        currentProgress: 150,
      } as Goal;
      expect(calculateGoalProgress(goal2)).toBe(100);
    });

    it('should handle edge values', () => {
      const goal1 = {
        id: 'test-21',
        goalType: 'manual',
        currentProgress: 0,
      } as Goal;
      expect(calculateGoalProgress(goal1)).toBe(0);

      const goal2 = {
        id: 'test-22',
        goalType: 'manual',
        currentProgress: 100,
      } as Goal;
      expect(calculateGoalProgress(goal2)).toBe(100);
    });
  });

  describe('default case', () => {
    it('should return 0 for unknown goal type', () => {
      const goal = {
        id: 'test-23',
        goalType: 'unknown' as any,
      } as Goal;

      expect(calculateGoalProgress(goal)).toBe(0);
    });
  });
});
