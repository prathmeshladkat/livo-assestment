import { Router } from "express";
import { registry, getQueueDepthMetrics } from "../../lib/metrics";

export const metricsRouter = Router();

metricsRouter.get("/metrics", async (_req, res, next) => {
  try {
    const queueDepth = await getQueueDepthMetrics();

    // Queue depth as ad-hoc gauges, set right before scrape — avoids
    // needing separate Gauge instances updated on every enqueue/dequeue.
    const depthMetrics = Object.entries(queueDepth)
      .map(([state, count]) => `analyze_queue_depth{state="${state}"} ${count}`)
      .join("\n");

    const processMetrics = await registry.register.metrics();

    res.set("Content-Type", registry.register.contentType);
    res.send(`${processMetrics}\n${depthMetrics}\n`);
  } catch (err) {
    next(err);
  }
});