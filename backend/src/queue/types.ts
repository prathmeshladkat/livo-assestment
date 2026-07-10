export interface AnalyzeJobData {
    audioBase64: string,
    mimeType: string;
    audioHash: string,
    durationSeconds: number;
}

export interface WordScore {
    word: string;
    startTime: number;
    endTime: number;
    confidence: number;
    flagged: boolean;
}

export interface AnalyzeJobResult {
  transcript: string;
  overallScore: number;        // 0–100, derived from aggregate word confidence
  words: WordScore[];
  feedback: string;            // Groq-generated human-readable explanation of flagged words
  fromCache: boolean;          // true if this result was served from the content-hash cache
  processedAt: string;         // ISO timestamp
}