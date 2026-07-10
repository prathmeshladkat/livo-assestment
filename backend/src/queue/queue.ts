import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const ANALYZE_QUEUE_NAME = "analyze-audio";

export const analyzeQueue = new Queue(ANALYZE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, then 10s, then 20s between retries
    },
    removeOnComplete: {
      age: 3600, // keep completed job data for 1hr (for polling), then auto-clean
      count: 1000,
    },
    removeOnFail: false, // keep failed jobs visible — this IS your dead-letter queue
  },
});