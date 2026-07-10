import type { DeepgramWord } from "./sttService.js";
import type { WordScore } from "../queue/types.js";


const CONFIDENCE_THRESHOLD = 0.75;

export interface ScoringResult {
  overallScore: number; // 0–100
  words: WordScore[];
}

export function scoreTranscription(deepgramWords: DeepgramWord[]): ScoringResult {
  if (deepgramWords.length === 0) {
    return { overallScore: 0, words: [] };
  }

  const words: WordScore[] = deepgramWords.map((w) => ({
    word: w.word,
    startTime: w.start,
    endTime: w.end,
    confidence: w.confidence,
    flagged: w.confidence < CONFIDENCE_THRESHOLD,
  }));

  const avgConfidence =
    words.reduce((sum, w) => sum + w.confidence, 0) / words.length;

  const overallScore = Math.round(avgConfidence * 100);

  return { overallScore, words };
}