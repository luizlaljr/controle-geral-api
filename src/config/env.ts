import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url(),
  CORS_ORIGINS: z.string().min(1),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW: z.string().min(1).default("1 minute"),
  BODY_LIMIT: z.coerce.number().int().positive().default(1048576),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  OTEL_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  GIT_SHA: z.string().min(1).default("local"),
  SERVICE_NAME: z.literal("controle-geral-api").default("controle-geral-api"),
  APP_VERSION: z.string().min(1).default("0.1.0"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
