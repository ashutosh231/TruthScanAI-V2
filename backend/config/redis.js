import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

let redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("FATAL ERROR: REDIS_URL environment variable is missing.");
}

// Automatically ensure TLS encryption for Upstash Redis endpoints
if (redisUrl && redisUrl.includes("upstash.io") && redisUrl.startsWith("redis://")) {
  redisUrl = redisUrl.replace("redis://", "rediss://");
}

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ compatibility
  enableReadyCheck: false,
  lazyConnect: false,
  keepAlive: 10000,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 3000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("[Redis] Connected to Redis instance successfully.");
});

redis.on("error", (error) => {
  console.error(`[Redis] Connection warning: ${error.message}`);
});

export default redis;
