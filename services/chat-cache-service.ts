import { env } from "@/config/env";
import type { CoachingMessage } from "@/db/schema";
import { Redis } from "@upstash/redis";

/**
 * Service for caching coaching chat messages in Redis using Lists.
 * Uses LPUSH to add messages and LRANGE to retrieve them.
 * Key format: chat:messages:${goalId}
 */
export class ChatCacheService {
  private url = env.UPSTASH_REDIS_REST_URL;
  private token = env.UPSTASH_REDIS_REST_TOKEN;
  private enabled = Boolean(this.url && this.token);
  private redis: Redis | null = null;

  // Cache TTL: 24 hours (in seconds)
  private readonly CACHE_TTL = 60 * 60 * 24;

  /**
   * Gets or creates a Redis client instance (lazy initialization)
   */
  private getRedisClient(): Redis | null {
    if (!this.enabled) return null;

    if (!this.redis) {
      this.redis = new Redis({ url: this.url, token: this.token });
    }
    return this.redis;
  }

  /**
   * Generates the Redis key for a goal's chat messages
   */
  private getCacheKey(goalId: string): string {
    return `chat:messages:${goalId}`;
  }

  /**
   * Retrieves messages from cache using LRANGE.
   * Returns messages in chronological order (oldest first).
   *
   * @param goalId - The goal ID
   * @param options - Pagination options
   * @param options.limit - Maximum number of messages to retrieve
   * @param options.offset - Number of messages to skip from the end (for pagination)
   * @returns Array of messages or null if cache miss
   */
  async getMessages(goalId: string, options?: { limit?: number; offset?: number }): Promise<CoachingMessage[] | null> {
    const limit = options?.limit;
    const offset = options?.offset ?? 0;

    console.log(
      `[ChatCacheService] getMessages called for goalId: ${goalId}, enabled: ${this.enabled}, limit: ${limit}, offset: ${offset}`
    );

    const redis = this.getRedisClient();
    if (!redis) {
      console.log(`[ChatCacheService] Cache is disabled. URL: ${!!this.url}, Token: ${!!this.token}`);
      return null;
    }

    try {
      const key = this.getCacheKey(goalId);

      console.log(`[ChatCacheService] Attempting LRANGE on key: ${key}`);

      // LRANGE to get messages with pagination
      // Examples:
      // - Last 5 messages (offset=0, limit=5): LRANGE key -5 -1
      // - Next 5 older messages (offset=5, limit=5): LRANGE key -10 -6
      // - All messages (no limit): LRANGE key 0 -1
      let start: number;
      let end: number;

      if (limit) {
        // With pagination: get messages from -(offset + limit) to -(offset + 1)
        start = -(offset + limit);
        end = offset === 0 ? -1 : -(offset + 1);
      } else {
        // No limit: get all messages
        start = 0;
        end = -1;
      }

      console.log(`[ChatCacheService] LRANGE ${key} ${start} ${end}`);

      const cachedData = await redis.lrange(key, start, end);

      console.log(`[ChatCacheService] LRANGE result: ${cachedData ? cachedData.length : 0} items`);

      if (!cachedData || cachedData.length === 0) {
        console.log(`[ChatCacheService] Cache miss for key: ${key}`);
        return null;
      }

      // Upstash Redis automatically deserializes JSON, so cachedData contains objects
      // We just need to convert the createdAt string back to Date
      const messages = cachedData.map((item: any) => {
        return {
          id: item.id,
          goalId: item.goalId,
          role: item.role,
          content: item.content,
          createdAt: new Date(item.createdAt),
        } as CoachingMessage;
      });

      console.log(`[ChatCacheService] Successfully retrieved ${messages.length} messages from cache`);
      return messages;
    } catch (error) {
      console.error("[ChatCacheService] Error getting messages from cache:", error);
      return null;
    }
  }

  /**
   * Caches messages in Redis using LPUSH.
   * Stores messages in chronological order (oldest first).
   *
   * @param goalId - The goal ID
   * @param messages - Array of messages to cache
   */
  async cacheMessages(goalId: string, messages: CoachingMessage[]): Promise<void> {
    console.log(`[ChatCacheService] cacheMessages called for goalId: ${goalId}, messages count: ${messages.length}`);

    if (messages.length === 0) {
      console.log(`[ChatCacheService] Skipping cache - no messages to cache`);
      return;
    }

    const redis = this.getRedisClient();
    if (!redis) {
      console.log(`[ChatCacheService] Skipping cache - Redis is disabled`);
      return;
    }

    try {
      const key = this.getCacheKey(goalId);

      console.log(`[ChatCacheService] Deleting existing cache for key: ${key}`);
      // Delete existing cache first
      await redis.del(key);

      // Serialize messages to JSON strings
      const serializedMessages = messages.map((msg) =>
        JSON.stringify({
          id: msg.id,
          goalId: msg.goalId,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        })
      );

      console.log(`[ChatCacheService] Pushing ${serializedMessages.length} messages to Redis using LPUSH`);
      // LPUSH adds to the beginning of the list, so we need to push in reverse order
      // to maintain chronological order when reading with LRANGE
      for (let i = serializedMessages.length - 1; i >= 0; i--) {
        await redis.lpush(key, serializedMessages[i]);
      }

      // Set expiration
      await redis.expire(key, this.CACHE_TTL);
      console.log(`[ChatCacheService] Successfully cached ${messages.length} messages with TTL ${this.CACHE_TTL}s`);
    } catch (error) {
      console.error("[ChatCacheService] Error caching messages:", error);
      // Don't throw - cache failures shouldn't break the app
    }
  }

  /**
   * Appends a single message to the cache using RPUSH.
   * This is more efficient than re-caching all messages.
   *
   * @param goalId - The goal ID
   * @param message - The message to append
   */
  async appendMessage(goalId: string, message: CoachingMessage): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) return;

    try {
      const key = this.getCacheKey(goalId);

      // Check if cache exists
      const exists = await redis.exists(key);

      if (exists) {
        // Serialize message
        const serializedMessage = JSON.stringify({
          id: message.id,
          goalId: message.goalId,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        });

        // RPUSH adds to the end of the list (newest message)
        await redis.rpush(key, serializedMessage);

        // Refresh TTL
        await redis.expire(key, this.CACHE_TTL);
      }
      // If cache doesn't exist, don't create it - let the next read populate it
    } catch (error) {
      console.error("[ChatCacheService] Error appending message to cache:", error);
      // Don't throw - cache failures shouldn't break the app
    }
  }

  /**
   * Invalidates (deletes) the cache for a goal.
   *
   * @param goalId - The goal ID
   */
  async invalidateCache(goalId: string): Promise<void> {
    const redis = this.getRedisClient();
    if (!redis) return;

    try {
      const key = this.getCacheKey(goalId);
      await redis.del(key);
    } catch (error) {
      console.error("[ChatCacheService] Error invalidating cache:", error);
      // Don't throw - cache failures shouldn't break the app
    }
  }
}
