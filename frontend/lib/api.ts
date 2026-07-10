const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface WordScore {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
  flagged: boolean;
}

export interface AnalyzeResult {
  transcript: string;
  overallScore: number;
  words: WordScore[];
  feedback: string;
  fromCache: boolean;
  processedAt: string;
}

interface EnqueueResponse {
  jobId: string;
  status: string;
}

type PollResponse =
  | { status: "completed"; result: AnalyzeResult }
  | { status: "failed"; error: string; attemptsMade: number }
  | { status: "waiting" | "active" | "delayed"; progress: number };

export async function submitAudio(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(body.error ?? `Upload failed with status ${res.status}`);
  }

  const data: EnqueueResponse = await res.json();
  return data.jobId;
}

export async function getResult(jobId: string): Promise<PollResponse> {
  const res = await fetch(`${API_URL}/result/${jobId}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch result: ${res.status}`);
  }

  return res.json();
}

/**
 * Polls /result/:jobId every `intervalMs` until the job completes or fails.
 * Calls onProgress with each intermediate poll so the UI can reflect real state.
 */
export async function pollUntilDone(
  jobId: string,
  onProgress: (progress: number) => void,
  intervalMs = 1500,
  timeoutMs = 60000
): Promise<AnalyzeResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const response = await getResult(jobId);

    if (response.status === "completed") {
      if (!response.result) {
    
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    continue;
  }
      return response.result;
    }

    if (response.status === "failed") {
      throw new Error(response.error);
    }

    onProgress(response.progress ?? 0);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Processing timed out. Please try again.");
}