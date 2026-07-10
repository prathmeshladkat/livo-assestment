import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { parseBuffer } from "music-metadata";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";

// Memory storage — audio never touches disk, stays consistent with the
// "no persistence" DPDP argument even during the request lifecycle itself.
const storage = multer.memoryStorage();

export const uploadAudio = multer({
  storage,
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
  const baseMimeType = file.mimetype.split(";")[0].trim();
  const allowedMimeTypes = [
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/mp4",
    "audio/m4a",
    "audio/webm",
    "audio/ogg",
  ];
  if (!allowedMimeTypes.includes(baseMimeType)) {
    cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    return;
  }
  cb(null, true);
},
}).single("audio");

/**
 * Server-side duration check — the actual enforcement point.
 * Never trust a client-reported duration; this reads real audio metadata
 * from the uploaded bytes themselves.
 */
export async function validateAudioDuration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "No audio file provided. Field name must be 'audio'." });
    return;
  }

  const baseMimeType = req.file.mimetype.split(";")[0].trim();

try {
  const metadata = await parseBuffer(req.file.buffer, {
    mimeType: baseMimeType,
    size: req.file.buffer.length,
    path: req.file.originalname, // extension as an extra hint
  },
{ duration: true } );
    const duration = metadata.format.duration;

    if (duration === undefined) {
      res.status(400).json({ error: "Could not determine audio duration from file." });
      return;
    }

    if (duration < env.MIN_AUDIO_DURATION_SECONDS || duration > env.MAX_AUDIO_DURATION_SECONDS) {
      res.status(400).json({
        error: `Audio must be between ${env.MIN_AUDIO_DURATION_SECONDS} and ${env.MAX_AUDIO_DURATION_SECONDS} seconds. Received: ${duration.toFixed(1)}s.`,
      });
      return;
    }

    // Stash validated duration on the request for the route handler to use
    // downstream (goes into the job payload, avoids re-parsing).
    req.audioDurationSeconds = duration;
    next();
  } catch (err) {
    logger.warn({ err }, "Failed to parse audio metadata");
    res.status(400).json({ error: "Could not read audio file. It may be corrupted or an unsupported format." });
  }
}