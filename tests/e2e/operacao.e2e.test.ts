import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";

describe("Operacao e2e", () => {
  const appPromise = buildApp();

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("retorna health", async () => {
    const app = await appPromise;
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ ok: true, servico: "controle-geral-api" });
  });

  it("retorna ready e version", async () => {
    const app = await appPromise;
    const readyResponse = await app.inject({ method: "GET", url: "/ready" });
    const versionResponse = await app.inject({ method: "GET", url: "/version" });

    expect(readyResponse.statusCode).toBe(200);
    expect(readyResponse.json()).toMatchObject({ ok: true, servico: "controle-geral-api" });
    expect(versionResponse.statusCode).toBe(200);
    expect(versionResponse.json()).toMatchObject({
      servico: "controle-geral-api",
      ambiente: "test",
      commit: "test",
    });
  });

  it("padroniza erros de validacao com requestId", async () => {
    const app = await appPromise;
    const response = await app.inject({
      method: "POST",
      url: "/militares",
      headers: { "x-request-id": "req-validacao" },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      erro: { codigo: "ERRO_VALIDACAO", requestId: "req-validacao" },
    });
  });
});
