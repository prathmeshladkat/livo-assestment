import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import { ANALYZE_QUEUE_NAME } from "../queue/queue.js";
import { processAnalyzeJob } from "./processor.js";
import { logger } from "../lib/logger.js";
import { env } from "../config/env.js";

const worker = new Worker(ANALYZE_QUEUE_NAME, processAnalyzeJob, {
  connection: redisConnection,
  concurrency: 2, 
});

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "Job completed successfully");
});

worker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, attemptsMade: job?.attemptsMade, error: err.message },
    "Job failed"
  );
});

worker.on("error", (err) => {

  logger.error({ err }, "Worker encountered an error");
});

// Graceful shutdown — let in-flight jobs finish before the process exits,
// instead of Render killing the process mid-job on deploy/restart
async function shutdown() {
  logger.info("Shutting down worker gracefully...");
  await worker.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

logger.info({ env: env.NODE_ENV, concurrency: 2 }, "Worker started, listening for jobs");