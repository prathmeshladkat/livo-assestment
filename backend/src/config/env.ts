import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),

  REDIS_URL: z.string().url().refine(
    (val) => val.startsWith("rediss://") || val.startsWith("redis://"),
    { message: "REDIS_URL must start with redis:// or rediss://" }
  ),

  DEEPGRAM_API_KEY: z.string().min(1, "DEEPGRAM_API_KEY is required"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),

  MAX_AUDIO_DURATION_SECONDS: z.coerce.number().default(45),
  MIN_AUDIO_DURATION_SECONDS: z.coerce.number().default(30),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(15),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;