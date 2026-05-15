import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";

const logByEnv = {
  development: ["warn", "error"],
  test: ["error"],
  production: ["error"],
} as const;

export const prisma = new PrismaClient({
  log: [...logByEnv[env.NODE_ENV]],
});
