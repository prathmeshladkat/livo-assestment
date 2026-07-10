import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { analyzeRouter } from "./routes/analyze.route.js";
import { resultRouter } from "./routes/result.route.js";
import { metricsRouter } from "./routes/metrics.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    // Open for now during dev/assessment — tighten to the actual Vercel
    // frontend origin once that's deployed, rather than leaving this wildcard
    // in a "production-ready" claim in the architecture doc.
    origin: "https://livo-assestment.vercel.app",
  })
);

// Note: no express.json() body parser needed globally — /analyze uses
// multipart/form-data (handled by multer inside its own route), and no
// other route currently expects a JSON body.

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(analyzeRouter);
app.use(resultRouter);
app.use(metricsRouter);

// Must be registered last — Express only routes errors here because it's
// the final middleware with 4 arguments.
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "API server started");
});