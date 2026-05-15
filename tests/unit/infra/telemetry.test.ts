import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

async function importFreshTelemetry() {
  vi.resetModules();
  return import("../../../src/infra/observability/telemetry.js");
}

describe("telemetry", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("nao inicializa quando desabilitada", async () => {
    process.env.OTEL_ENABLED = "false";
    const { startTelemetry } = await importFreshTelemetry();

    await expect(startTelemetry()).resolves.toBeUndefined();
  });

  it("avisa quando habilitada sem exporter", async () => {
    process.env.OTEL_ENABLED = "true";
    vi.resetModules();
    const { logger } = await import("../../../src/infra/observability/logger.js");
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => undefined);
    const { startTelemetry } = await import("../../../src/infra/observability/telemetry.js");

    await startTelemetry();

    expect(warnSpy).toHaveBeenCalledWith("telemetry enabled but no exporter configured");
  });
});
