import client from "prom-client";
import { analyzeQueue } from "../queue/queue.js";

// Collects default Node.js process metrics (memory, event loop lag, GC, etc.)
// for free — standard practice, gives baseline health visibility.
client.collectDefaultMetrics();

export const jobDurationHistogram = new client.Histogram({
  name: "analyze_job_duration_seconds",
  help: "Time taken to process an analyze job end-to-end (STT + scoring + LLM)",
  buckets: [1, 2, 5, 10, 15, 20, 30, 45, 60],
});

export const jobOutcomeCounter = new client.Counter({
  name: "analyze_job_outcomes_total",
  help: "Count of completed vs failed analyze jobs",
  labelNames: ["outcome"] as const, // "completed" | "failed"
});

export const externalApiFailureCounter = new client.Counter({
  name: "external_api_failures_total",
  help: "Count of failures calling external APIs (Deepgram, Groq)",
  labelNames: ["provider"] as const, // "deepgram" | "groq"
});

/**
 * Queue depth is a gauge — read live from BullMQ rather than tracked
 * incrementally, since it needs to reflect current state at scrape time.
 */
export async function getQueueDepthMetrics() {
  const counts = await analyzeQueue.getJobCounts("waiting", "active", "delayed", "failed");
  return counts;
}

export { client as registry };