import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { logger } from "../../lib/logger.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Multer's own errors (file too large, etc.) have a distinct shape worth
  // catching separately so the message is actually useful to the client.
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "Audio file is too large." });
      return;
    }
    res.status(400).json({ error: `Upload error: ${err.message}` });
    return;
  }

  if (err instanceof Error) {
    logger.error({ err: err.message, stack: err.stack }, "Unhandled request error");
    res.status(500).json({ error: "Something went wrong processing your request." });
    return;
  }

  logger.error({ err }, "Unhandled request error (non-Error thrown)");
  res.status(500).json({ error: "An unexpected error occurred." });
}