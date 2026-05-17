import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";
import { ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

const payload2027 = {
  vigencia_inicio: "2027-01-01 00:00:00-03:00",
  observacao: "Tabela de soldo vigente a partir de 01/01/2027",
  itens: Array.from({ length: 20 }, (_, index) => ({
    ordem: index + 1,
    valor: 15000 - index,
  })),
};

describe("Soldos e2e", () => {
  const appPromise = buildApp();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterEach(async () => {
    await prisma.soldo.deleteMany({ where: { vigenciaInicio: new Date("2027-01-01T03:00:00.000Z") } });
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("lista soldos vigentes populados por migration", async () => {
    const app = await appPromise;

    const response = await app.inject({ method: "GET", url: "/soldos?data=2026-02-01" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(20);
    expect(response.json()[0]).toMatchObject({
      pstGraduacaoOrdem: 1,
      valor: 14711,
      pstGraduacao: { abreviacao: "Ten Brig Ar" },
    });
  });

  it("insere tabela de soldos por vigencia", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "POST",
      url: "/soldos/tabela",
      payload: payload2027,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().total).toBe(20);
    expect(response.json().dados[0]).toMatchObject({ pstGraduacaoOrdem: 1, valor: 15000 });

    const vigente = await app.inject({ method: "GET", url: "/soldos?data=2027-02-01&ordem=1" });
    expect(vigente.statusCode).toBe(200);
    expect(vigente.json()).toHaveLength(1);
    expect(vigente.json()[0]).toMatchObject({ valor: 15000 });
  });

  it("busca soldo por id e nao expoe rotas de update/delete", async () => {
    const app = await appPromise;
    const listResponse = await app.inject({ method: "GET", url: "/soldos?data=2026-02-01&ordem=1" });
    const [soldo] = listResponse.json();

    const byIdResponse = await app.inject({ method: "GET", url: `/soldos/${soldo.id}` });
    expect(byIdResponse.statusCode).toBe(200);
    expect(byIdResponse.json()).toMatchObject({ id: soldo.id, pstGraduacaoOrdem: 1 });

    await expect(app.inject({ method: "PATCH", url: `/soldos/${soldo.id}`, payload: {} })).resolves.toMatchObject({
      statusCode: 404,
    });
    await expect(app.inject({ method: "DELETE", url: `/soldos/${soldo.id}` })).resolves.toMatchObject({
      statusCode: 404,
    });
  });

  it("retorna erro quando ordem nao existe no payload", async () => {
    const app = await appPromise;

    const response = await app.inject({
      method: "POST",
      url: "/soldos/tabela",
      headers: { "x-request-id": "req-soldo" },
      payload: {
        ...payload2027,
        itens: [{ ordem: 99, valor: 1000 }],
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      erro: {
        codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
        requestId: "req-soldo",
      },
    });
  });
});
