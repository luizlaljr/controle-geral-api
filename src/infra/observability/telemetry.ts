import { env } from "../../config/env";
import { logger } from "./logger";

export async function startTelemetry(): Promise<void> {
  if (!env.OTEL_ENABLED) {
    logger.debug("telemetry disabled");
    return;
  }

  logger.warn("telemetry enabled but no exporter configured");
}
