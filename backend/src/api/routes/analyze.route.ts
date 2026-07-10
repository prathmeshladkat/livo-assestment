import { Router } from "express";
import { uploadAudio, validateAudioDuration } from "../middleware/validateAudio.js";
import { analyzeQueue } from "../../queue/queue.js";
import { hashAudioBuffer } from "../../utils/hash.js";
import { logger } from "../../lib/logger.js";
import type { AnalyzeJobData } from "../../queue/types.js";

export const analyzeRouter = Router();

analyzeRouter.post(
  "/analyze",
  uploadAudio,
  validateAudioDuration,
  async (req, res, next) => {
    try {
      const file = req.file!; // guaranteed present — validateAudioDuration already checked
      const durationSeconds = req.audioDurationSeconds!;

      const audioHash = hashAudioBuffer(file.buffer);

      const jobData: AnalyzeJobData = {
        audioBase64: file.buffer.toString("base64"),
        mimeType: file.mimetype,
        audioHash,
        durationSeconds,
      };

      const job = await analyzeQueue.add("analyze-audio", jobData);

      logger.info({ jobId: job.id, audioHash, durationSeconds }, "Job enqueued");

      // 202 Accepted — the correct status code for "queued, not done yet."
      // Web process returns immediately, never blocks on STT/LLM processing.
      res.status(202).json({
        jobId: job.id,
        status: "queued",
      });
    } catch (err) {
      next(err);
    }
  }
);