import pino from "pino";
import { env } from "../../config/env";

export const redactionPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers.set-cookie",
  "authorization",
  "cookie",
  "cpf",
  "email",
  "banco",
  "agencia",
  "contaCorrente",
  "set-cookie",
  "DATABASE_URL",
  "DIRECT_DATABASE_URL",
];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: redactionPaths,
    censor: "[REDACTED]",
  },
});
