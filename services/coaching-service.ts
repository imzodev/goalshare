import { db } from "@/db";
import { goals, coachingMessages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ChatCacheService } from "./chat-cache-service";

type Database = typeof db;

export class CoachingService {
  private chatCache = new ChatCacheService();

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
   * Uses Redis cache for faster retrieval, falls back to database on cache miss.
   *
   * @param userId - User ID
   * @param goalId - Goal ID
   * @param options - Pagination options
   */
  async getHistory(userId: string, goalId: string, options?: { limit?: number; offset?: number }) {
    // Verify ownership first
    const goal = await this.verifyGoalOwnership(userId, goalId);
    if (!goal) {
      throw new Error("Goal not found or access denied");
    }

    // Try to get from cache first
    const cachedMessages = await this.chatCache.getMessages(goalId, options);
    if (cachedMessages) {
      console.log(`[CoachingService] Cache hit for goal ${goalId}`);
      return cachedMessages;
    }

    console.log(`[CoachingService] Cache miss for goal ${goalId}, fetching from database`);

    // Cache miss - fetch ALL messages from database to populate cache
    const allMessages = await this.dbInstance
      .select()
      .from(coachingMessages)
      .where(eq(coachingMessages.goalId, goalId))
      .orderBy(coachingMessages.createdAt);

    // Populate cache with ALL messages for future requests
    if (allMessages.length > 0) {
      console.log(`[CoachingService] Caching ${allMessages.length} messages for goal ${goalId}`);
      await this.chatCache.cacheMessages(goalId, allMessages);
    }

    // Apply pagination to the result
    if (options?.limit !== undefined) {
      const { limit, offset = 0 } = options;
      const start = Math.max(0, allMessages.length - offset - limit);
      const end = allMessages.length - offset;
      return allMessages.slice(start, end);
    }

    return allMessages;
  }

  /**
   * Fetches the recent chat history for AI context (limited count, reverse chronological).
   * Uses Redis cache when available.
   */
  async getHistoryForContext(userId: string, goalId: string, limit: number = 5) {
    // Verify ownership first
    const goal = await this.verifyGoalOwnership(userId, goalId);
    if (!goal) {
      throw new Error("Goal not found or access denied");
    }

    // Try to get from cache first (with limit)
    const cachedMessages = await this.chatCache.getMessages(goalId, { limit });
    if (cachedMessages) {
      console.log(`[CoachingService] Cache hit for context (goal ${goalId})`);
      // Cache returns in chronological order, we need most recent first for slicing
      const recentMessages = cachedMessages.slice(-limit);
      return recentMessages;
    }

    console.log(`[CoachingService] Cache miss for context (goal ${goalId})`);

    // Cache miss - fetch from database
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
   * Saves a new message to the database and appends it to cache.
   */
  async saveMessage(userId: string, goalId: string, role: "user" | "assistant", content: string) {
    // Verify ownership first (double check before write)
    const goal = await this.verifyGoalOwnership(userId, goalId);
    if (!goal) {
      throw new Error("Goal not found or access denied");
    }

    // Save to database and get the inserted message with its ID
    const [insertedMessage] = await this.dbInstance
      .insert(coachingMessages)
      .values({
        goalId,
        role,
        content,
      })
      .returning();

    // Append to cache using RPUSH (adds to end of list)
    if (insertedMessage) {
      await this.chatCache.appendMessage(goalId, insertedMessage);
      console.log(`[CoachingService] Message appended to cache for goal ${goalId}`);
    }
  }
}
