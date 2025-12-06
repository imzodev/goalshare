/**
 * Performance Benchmark Script for Chat History Loading
 *
 * This script tests the performance of loading existing chat histories
 * to help determine the optimal caching strategy.
 *
 * Usage: bun run scripts/benchmark-chat-performance.ts <goalId>
 */

import { db } from "@/db";
import { coachingMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

interface BenchmarkResult {
  messageCount: number;
  dbQueryTime: number;
  dataSize: number;
  averageMessageSize: number;
  transferTimeEstimate: number;
}

async function benchmarkQuery(goalId: string): Promise<BenchmarkResult> {
  // Measure DB query time - direct query without service layer
  const startTime = performance.now();
  const messages = await db
    .select()
    .from(coachingMessages)
    .where(eq(coachingMessages.goalId, goalId))
    .orderBy(coachingMessages.createdAt);
  const endTime = performance.now();

  const dbQueryTime = endTime - startTime;

  // Calculate data size
  const dataSize = JSON.stringify(messages).length;
  const averageMessageSize = messages.length > 0 ? dataSize / messages.length : 0;

  // Estimate transfer time for a 10 Mbps connection
  const transferTimeEstimate = ((dataSize / 1024 / 1024) * 1000) / 10;

  return {
    messageCount: messages.length,
    dbQueryTime,
    dataSize,
    averageMessageSize,
    transferTimeEstimate,
  };
}

async function runBenchmark(goalId: string) {
  console.log("🚀 Starting Chat Performance Benchmark\n");
  console.log("=".repeat(80));
  console.log(`Goal ID: ${goalId}`);
  console.log("=".repeat(80));

  // First, check how many messages exist
  const messageCount = await db.select().from(coachingMessages).where(eq(coachingMessages.goalId, goalId));

  console.log(`\n📊 Found ${messageCount.length} messages in conversation\n`);

  if (messageCount.length === 0) {
    console.log("⚠️  No messages found. Please provide a goalId with existing messages.");
    return;
  }

  // Run benchmark multiple times for accuracy
  const runs = 5;
  const results: BenchmarkResult[] = [];

  console.log(`Running ${runs} benchmark iterations...\n`);

  for (let i = 0; i < runs; i++) {
    const result = await benchmarkQuery(goalId);
    results.push(result);
    console.log(`  Run ${i + 1}: ${result.dbQueryTime.toFixed(2)}ms`);
  }

  // Calculate averages
  const avgResult: BenchmarkResult = {
    messageCount: results[0].messageCount,
    dbQueryTime: results.reduce((sum, r) => sum + r.dbQueryTime, 0) / runs,
    dataSize: results[0].dataSize,
    averageMessageSize: results[0].averageMessageSize,
    transferTimeEstimate: results[0].transferTimeEstimate,
  };

  // Print detailed results
  console.log("\n" + "=".repeat(80));
  console.log("📈 BENCHMARK RESULTS");
  console.log("=".repeat(80));
  console.log("\n");

  console.log(`Messages in conversation: ${avgResult.messageCount}`);
  console.log(`Average DB query time: ${avgResult.dbQueryTime.toFixed(2)}ms`);
  console.log(`Data size: ${(avgResult.dataSize / 1024).toFixed(2)} KB`);
  console.log(`Average message size: ${avgResult.averageMessageSize.toFixed(0)} bytes`);
  console.log(`Estimated transfer time (10 Mbps): ${avgResult.transferTimeEstimate.toFixed(2)}ms`);
  console.log(`Total estimated time: ${(avgResult.dbQueryTime + avgResult.transferTimeEstimate).toFixed(2)}ms`);

  // Analysis and recommendations
  console.log("\n" + "=".repeat(80));
  console.log("💡 ANALYSIS & RECOMMENDATIONS");
  console.log("=".repeat(80));
  console.log("\n");

  const totalTime = avgResult.dbQueryTime + avgResult.transferTimeEstimate;

  console.log(`Current performance:`);
  console.log(`  - DB query: ${avgResult.dbQueryTime.toFixed(2)}ms`);
  console.log(`  - Network transfer: ${avgResult.transferTimeEstimate.toFixed(2)}ms`);
  console.log(`  - Total: ${totalTime.toFixed(2)}ms\n`);

  // Recommendations based on actual performance
  if (totalTime < 100) {
    console.log("✅ PAGINATION + CLIENT CACHE (Recommended)");
    console.log("   - Current performance is excellent!");
    console.log("   - Use React Query/TanStack Query with 5-10 min cache");
    console.log("   - Load last 30-50 messages initially");
    console.log("   - Implement infinite scroll for older messages");
    console.log("   - Cost: $0 (no infrastructure needed)");
    console.log("   - Complexity: Low");
    console.log("\n   Redis is NOT needed for this conversation size.\n");
  } else if (totalTime < 300) {
    console.log("⚠️  CONSIDER OPTIMIZATION");
    console.log("   - Performance is acceptable but could be better");
    console.log("\n   Option 1: CLIENT-SIDE CACHE (Recommended)");
    console.log("   - Use React Query with 10-15 min cache");
    console.log("   - Pagination (load 50 messages at a time)");
    console.log("   - Cost: $0");
    console.log("   - Complexity: Low");
    console.log("\n   Option 2: REDIS CACHE");
    console.log("   - Would reduce query time to ~1-5ms");
    console.log("   - TTL: 1 hour");
    console.log("   - Cost: ~$10-30/month (Upstash free tier available)");
    console.log("   - Complexity: Medium\n");
  } else if (totalTime < 1000) {
    console.log("🔶 REDIS CACHE RECOMMENDED");
    console.log("   - Current performance is slow for good UX");
    console.log("   - Redis would reduce query time by 10-100x");
    console.log("   - Implementation:");
    console.log("     • Cache full conversation with goalId as key");
    console.log("     • TTL: 1 hour");
    console.log("     • Invalidate on new message");
    console.log("   - Cost: ~$10-30/month (Upstash free tier available)");
    console.log("   - Complexity: Medium");
    console.log("\n   ALSO implement:");
    console.log("   - Client-side cache (React Query)");
    console.log("   - Pagination for very long conversations\n");
  } else {
    console.log("🔴 REDIS CACHE REQUIRED");
    console.log("   - Current performance is too slow!");
    console.log("   - Redis is NECESSARY for acceptable UX");
    console.log("   - Implementation:");
    console.log("     • Cache full conversation with goalId as key");
    console.log("     • TTL: 1 hour");
    console.log("     • Invalidate on new message");
    console.log("   - Cost: ~$10-30/month");
    console.log("   - Complexity: Medium");
    console.log("\n   MUST ALSO implement:");
    console.log("   - Pagination (max 100 messages per request)");
    console.log("   - Client-side cache (React Query)");
    console.log("   - Consider archiving old messages\n");
  }

  console.log("=".repeat(80));
  console.log("✨ Benchmark Complete!");
  console.log("=".repeat(80));
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error("Usage: bun run scripts/benchmark-chat-performance.ts <goalId>");
  console.error("\nExample: bun run scripts/benchmark-chat-performance.ts 3001eec3-dadc-4914-aefc-5a9f6131960b");
  process.exit(1);
}

const goalId = args[0];

// Run benchmark
runBenchmark(goalId)
  .then(() => {
    console.log("\n✓ Benchmark completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Benchmark failed:", error);
    process.exit(1);
  });
