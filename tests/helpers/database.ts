import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { prisma } from "../../src/infra/database/prisma";

export function ensureTestDatabaseUrl() {
  if (!process.env.DATABASE_URL?.includes("controle_geral_api_test")) {
    throw new Error("DATABASE_URL must point to controle_geral_api_test");
  }
}

export function migrateTestDatabase() {
  ensureTestDatabaseUrl();
  const prismaBin = join(process.cwd(), "node_modules", "prisma", "build", "index.js");

  execFileSync(process.execPath, [prismaBin, "migrate", "deploy"], { stdio: "inherit" });
}

export async function cleanDatabase() {
  await prisma.promocao.deleteMany();
  await prisma.militar.deleteMany();
}
