import { Router } from "express";
import { analyzeQueue } from "../../queue/queue.js";
import type { AnalyzeJobResult } from "../../queue/types.js";

export const resultRouter = Router();

resultRouter.get("/result/:jobId", async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await analyzeQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({ error: "Job not found. It may have expired or the ID is invalid." });
      return;
    }

    const state = await job.getState();

    switch (state) {
      case "completed": {
        const result = job.returnvalue as AnalyzeJobResult;
        res.status(200).json({ status: "completed", result });
        return;
      }

      case "failed": {
        res.status(200).json({
          status: "failed",
          error: job.failedReason ?? "Processing failed after all retry attempts.",
          attemptsMade: job.attemptsMade,
        });
        return;
      }

      case "active":
      case "waiting":
      case "delayed": {
        res.status(200).json({
          status: state,
          progress: job.progress ?? 0,
        });
        return;
      }

      default: {
        // paused, waiting-children, unknown — surface honestly rather than guessing
        res.status(200).json({ status: state });
        return;
      }
    }
  } catch (err) {
    next(err);
  }
});