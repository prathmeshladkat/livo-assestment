import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";

export const redisConnection = new Redis(env.REDIS_URL, {
  
  maxRetriesPerRequest: null,

  ...(env.REDIS_URL.startsWith("rediss://") ? { tls: {} } : {}),

  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  logger.info("Redis connected");
});

redisConnection.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});