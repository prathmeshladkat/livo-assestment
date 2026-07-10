import Groq from "groq-sdk";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import type { WordScore } from "../queue/types.js";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

export async function generateFeedback(
  transcript: string,
  words: WordScore[]
): Promise<string> {
  const flaggedWords = words.filter((w) => w.flagged);

  if (flaggedWords.length === 0) {
    return "Great job! No words were flagged as unclear or mispronounced.";
  }

  const flaggedList = flaggedWords
    .map((w) => `"${w.word}" (confidence: ${(w.confidence * 100).toFixed(0)}%)`)
    .join(", ");

  const prompt = `You are a pronunciation coach reviewing a transcript of spoken English.

Full transcript: "${transcript}"

The following words had low speech-recognition confidence, which likely indicates unclear or mispronounced speech: ${flaggedList}

Write a short, encouraging 2-4 sentence piece of feedback for the speaker. Mention the specific flagged words and give a brief, practical tip for each (or group similar ones together). Do not mention "confidence scores" or any technical/AI terminology — write as a human coach would speak to a student. Keep it concise.`;

  logger.info({ flaggedCount: flaggedWords.length }, "Requesting feedback from Groq");

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 300,
  });

  const feedback = completion.choices[0]?.message?.content;

  if (!feedback) {
    logger.warn("Groq returned empty feedback — falling back to generic message");
    return `A few words could use more practice: ${flaggedList}.`;
  }

  return feedback.trim();
}