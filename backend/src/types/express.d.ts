declare global {
  namespace Express {
    interface Request {
      audioDurationSeconds?: number;
    }
  }
}

export {};