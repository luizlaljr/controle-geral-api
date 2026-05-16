import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";
import { ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

describe("PstGraduacoes e2e", () => {
  const appPromise = buildApp();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("lista postos e graduacoes sem rotas de mutacao", async () => {
    const app = await appPromise;

    const response = await app.inject({ method: "GET", url: "/pst-graduacoes" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(20);
    expect(response.json()[0]).toMatchObject({
      ordem: 1,
      abreviacao: "Ten Brig Ar",
      nome: "Tenente-Brigadeiro do Ar",
    });

    await expect(app.inject({ method: "POST", url: "/pst-graduacoes", payload: {} })).resolves.toMatchObject({
      statusCode: 404,
    });
    await expect(app.inject({ method: "PATCH", url: "/pst-graduacoes/1", payload: {} })).resolves.toMatchObject({
      statusCode: 404,
    });
    await expect(app.inject({ method: "DELETE", url: "/pst-graduacoes/1" })).resolves.toMatchObject({
      statusCode: 404,
    });
  });

  it("busca posto ou graduacao por ordem", async () => {
    const app = await appPromise;

    const response = await app.inject({ method: "GET", url: "/pst-graduacoes/7" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      ordem: 7,
      abreviacao: "Cap",
      nome: "Capitão",
    });
  });

  it("retorna 404 para ordem inexistente", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "GET",
      url: "/pst-graduacoes/99",
      headers: { "x-request-id": "req-pst" },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      erro: {
        codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
        requestId: "req-pst",
      },
    });
  });
});
