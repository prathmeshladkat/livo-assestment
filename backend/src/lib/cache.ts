import { redisConnection } from "../config/redis.js";
import { logger } from "./logger.js";
import type { AnalyzeJobResult } from "../queue/types.js";
import type { DeepgramWord } from "../services/sttService.js";

const RESULT_CACHE_TTL_SECONDS = 60 * 60 * 24; // 24h
const RESULT_CACHE_PREFIX = "analysis-cache:";

const TRANSCRIPT_CACHE_TTL_SECONDS = 60 * 60; // 1h — only needs to survive retries, not long-term reuse
const TRANSCRIPT_CACHE_PREFIX = "transcript-cache:";

export interface CachedTranscript {
  transcript: string;
  words: DeepgramWord[];
}

// ---- Full result cache (unchanged) ----

export async function getCachedResult(audioHash: string): Promise<AnalyzeJobResult | null> {
  const raw = await redisConnection.get(RESULT_CACHE_PREFIX + audioHash);
  if (!raw) return null;

  logger.info({ audioHash }, "Cache hit — skipping STT/LLM calls");
  const result = JSON.parse(raw) as AnalyzeJobResult;
  return { ...result, fromCache: true };
}

export async function setCachedResult(audioHash: string, result: AnalyzeJobResult): Promise<void> {
  await redisConnection.set(
    RESULT_CACHE_PREFIX + audioHash,
    JSON.stringify(result),
    "EX",
    RESULT_CACHE_TTL_SECONDS
  );
}

// ---- Transcript-only cache (new — prevents redundant Deepgram calls on retry) ----

export async function getCachedTranscript(audioHash: string): Promise<CachedTranscript | null> {
  const raw = await redisConnection.get(TRANSCRIPT_CACHE_PREFIX + audioHash);
  if (!raw) return null;

  logger.info({ audioHash }, "Transcript cache hit — skipping Deepgram call on retry");
  return JSON.parse(raw) as CachedTranscript;
}

export async function setCachedTranscript(
  audioHash: string,
  data: CachedTranscript
): Promise<void> {
  await redisConnection.set(
    TRANSCRIPT_CACHE_PREFIX + audioHash,
    JSON.stringify(data),
    "EX",
    TRANSCRIPT_CACHE_TTL_SECONDS
  );
}