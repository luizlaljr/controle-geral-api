import Fastify from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("operacao.routes", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("retorna ready 503 quando banco falha", async () => {
    vi.doMock("../../../src/infra/database/prisma.js", () => ({
      prisma: {
        $queryRaw: vi.fn().mockRejectedValue(new Error("banco indisponivel")),
      },
    }));

    const { operacaoRoutes } = await import("../../../src/modules/operacao/operacao.routes.js");
    const app = Fastify();
    await app.register(operacaoRoutes);
    await app.ready();

    const response = await app.inject({ method: "GET", url: "/ready" });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({
      ok: false,
      servico: "controle-geral-api",
    });

    await app.close();
  });
});
