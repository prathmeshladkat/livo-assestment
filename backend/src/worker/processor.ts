import type { Job } from "bullmq";
import type { AnalyzeJobData, AnalyzeJobResult } from "../queue/types.js";
import { transcribeAudio } from "../services/sttService.js";
import { scoreTranscription } from "../services/scoringService.js";
import { generateFeedback } from "../services/llmService.js";
import {
  getCachedResult,
  setCachedResult,
  getCachedTranscript,
  setCachedTranscript,
} from "../lib/cache.js";
import { logger } from "../lib/logger.js";

export async function processAnalyzeJob(
  job: Job<AnalyzeJobData>
): Promise<AnalyzeJobResult> {
  const { audioBase64, mimeType, audioHash, durationSeconds } = job.data;

  logger.info({ jobId: job.id, audioHash, durationSeconds }, "Processing analyze job");

  const cached = await getCachedResult(audioHash);
  if (cached) {
    return cached;
  }

  // Step 1: Speech-to-text — check transcript cache first, so a retry after
  // a downstream (LLM) failure doesn't redundantly re-pay for Deepgram.
  let transcript: string;
  let deepgramWords: Awaited<ReturnType<typeof transcribeAudio>>["words"];

  const cachedTranscript = await getCachedTranscript(audioHash);
  if (cachedTranscript) {
    transcript = cachedTranscript.transcript;
    deepgramWords = cachedTranscript.words;
  } else {
    const audioBuffer = Buffer.from(audioBase64, "base64");
    const sttResult = await transcribeAudio(audioBuffer, mimeType);
    transcript = sttResult.transcript;
    deepgramWords = sttResult.words;
    await setCachedTranscript(audioHash, { transcript, words: deepgramWords });
  }
  await job.updateProgress(40);

  // Step 2: Scoring (deterministic, no external API call)
  const { overallScore, words } = scoreTranscription(deepgramWords);
  await job.updateProgress(70);

  // Step 3: LLM feedback
  const feedback = await generateFeedback(transcript, words);
  await job.updateProgress(90);

  const result: AnalyzeJobResult = {
    transcript,
    overallScore,
    words,
    feedback,
    fromCache: false,
    processedAt: new Date().toISOString(),
  };

  await setCachedResult(audioHash, result);
  await job.updateProgress(100);

  logger.info({ jobId: job.id, overallScore }, "Job complete");

  return result;
}