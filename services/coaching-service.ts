import { db } from "@/db";
import { goals, coachingMessages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type Database = typeof db;

export class CoachingService {
  constructor(private readonly dbInstance: Database = db) {}

  /**
   * Verifies if a goal belongs to a user and returns the goal details.
   */
  async verifyGoalOwnership(userId: string, goalId: string) {
    const [goal] = await this.dbInstance
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.ownerId, userId)))
      .limit(1);

    return goal || null;
  }

  /**
   * Fetches the chat history for a specific goal.
   */
  async getHistory(userId: string, goalId: string) {
    // Verify ownership first
    const goal = await this.verifyGoalOwnership(userId, goalId);
    if (!goal) {
      throw new Error("Goal not found or access denied");
    }

    const messages = await this.dbInstance
      .select()
      .from(coachingMessages)
      .where(eq(coachingMessages.goalId, goalId))
      .orderBy(coachingMessages.createdAt);

    return messages;
  }

  /**
   * Fetches the recent chat history for AI context (limited count, reverse chronological).
   */
  async getHistoryForContext(userId: string, goalId: string, limit: number = 10) {
    // Verify ownership first
    const goal = await this.verifyGoalOwnership(userId, goalId);
    if (!goal) {
      throw new Error("Goal not found or access denied");
    }

    const history = await this.dbInstance
      .select()
      .from(coachingMessages)
      .where(eq(coachingMessages.goalId, goalId))
      .orderBy(desc(coachingMessages.createdAt))
      .limit(limit);

    // Reverse to chronological order for the AI
    return history.reverse();
  }

  /**
   * Saves a new message to the database.
   */
  async saveMessage(userId: string, goalId: string, role: "user" | "assistant", content: string) {
    // Verify ownership first (double check before write)
    const goal = await this.verifyGoalOwnership(userId, goalId);
    if (!goal) {
      throw new Error("Goal not found or access denied");
    }

    await this.dbInstance.insert(coachingMessages).values({
      goalId,
      role,
      content,
    });
  }
}
