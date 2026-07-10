import { DeepgramClient } from "@deepgram/sdk";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const deepgram = new DeepgramClient({ apiKey: env.DEEPGRAM_API_KEY });

export interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export interface TranscriptionResult {
  transcript: string;
  words: DeepgramWord[];
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string
): Promise<TranscriptionResult> {
  logger.info({ mimeType, sizeBytes: audioBuffer.length }, "Sending audio to Deepgram");

  const response = await deepgram.listen.v1.media.transcribeFile(audioBuffer, {
    model: "nova-3",
    smart_format: true,
    punctuate: true,
    language: "en",
  });

  if (!("results" in response)) {
    
    throw new Error("Deepgram returned an async-accepted response instead of a sync result");
  }

  const channel = response.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];

  if (!alternative || !alternative.transcript) {
    throw new Error("Deepgram returned no transcript — audio may be silent or unintelligible");
  }

  const rawWords = alternative.words ?? [];
    const words: DeepgramWord[] = rawWords
      .filter(
        (w): w is Required<typeof w> =>
          w.word !== undefined &&
          w.start !== undefined &&
          w.end !== undefined &&
          w.confidence !== undefined
      )
      .map((w) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence,
      }));
  
    if (words.length < rawWords.length) {
      logger.warn(
        { dropped: rawWords.length - words.length, total: rawWords.length },
        "Some Deepgram word entries were missing required fields and were dropped"
      );
    }

  logger.info({ wordCount: words.length }, "Transcription complete");

  return {
    transcript: alternative.transcript,
    words,
  };
}