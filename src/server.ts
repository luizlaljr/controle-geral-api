import { env } from "./config/env";
import { prisma } from "./infra/database/prisma";
import { logger } from "./infra/observability/logger";
import { startTelemetry } from "./infra/observability/telemetry";
import { buildApp } from "./app";

async function main() {
  await startTelemetry();

  const app = await buildApp();

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info({ signal }, "shutdown started");

    try {
      await app.close();
      await prisma.$disconnect();
      logger.info({ signal }, "shutdown finished");
      process.exit(0);
    } catch (error) {
      logger.error({ err: error, signal }, "shutdown failed");
      process.exit(1);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  await app.listen({ host: "0.0.0.0", port: env.PORT });
}

main().catch((error) => {
  logger.error({ err: error }, "boot failed");
  process.exit(1);
});
