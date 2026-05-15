import Fastify from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

async function importFreshPlugins() {
  vi.resetModules();
  const [{ corsPlugin }, { rateLimitPlugin }] = await Promise.all([
    import("../../../src/infra/http/cors.js"),
    import("../../../src/infra/http/rate-limit.js"),
  ]);
  return { corsPlugin, rateLimitPlugin };
}

describe("http plugins", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("recusa wildcard de CORS em producao", async () => {
    process.env.NODE_ENV = "production";
    process.env.CORS_ORIGINS = "*";

    const { corsPlugin } = await importFreshPlugins();
    const app = Fastify();

    await expect(app.register(corsPlugin)).rejects.toThrow("CORS wildcard is not allowed in production");
  });

  it("aceita requisicoes sem origin e bloqueia origin nao permitida", async () => {
    process.env.NODE_ENV = "test";
    process.env.CORS_ORIGINS = "http://permitido.local";

    const { corsPlugin } = await importFreshPlugins();
    const app = Fastify();
    await app.register(corsPlugin);
    app.get("/ok", async () => ({ ok: true }));
    await app.ready();

    const semOrigin = await app.inject({ method: "GET", url: "/ok" });
    const originNegada = await app.inject({
      method: "GET",
      url: "/ok",
      headers: { origin: "http://negado.local" },
    });

    expect(semOrigin.statusCode).toBe(200);
    expect(originNegada.headers["access-control-allow-origin"]).toBeUndefined();
    await app.close();
  });

  it("retorna erro padronizado ao exceder rate limit", async () => {
    process.env.NODE_ENV = "test";
    process.env.RATE_LIMIT_MAX = "1";
    process.env.RATE_LIMIT_WINDOW = "1 minute";

    const { rateLimitPlugin } = await importFreshPlugins();
    const app = Fastify({ genReqId: () => "req-rate-limit" });
    await app.register(rateLimitPlugin);
    app.get("/ok", async () => ({ ok: true }));
    await app.ready();

    await app.inject({ method: "GET", url: "/ok" });
    const response = await app.inject({ method: "GET", url: "/ok" });

    expect(response.statusCode).toBe(429);
    expect(response.json()).toMatchObject({
      erro: {
        codigo: "LIMITE_REQUISICOES_EXCEDIDO",
        mensagem: "Limite de requisicoes excedido",
        detalhes: [],
        requestId: "req-rate-limit",
      },
    });
    await app.close();
  });
});
