import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";
import { cleanDatabase, ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

describe("Militares e2e", () => {
  const appPromise = buildApp();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("cria e lista militares com request id", async () => {
    const app = await appPromise;

    const createResponse = await app.inject({
      method: "POST",
      url: "/militares",
      headers: { "x-request-id": "req-test" },
      payload: {
        trigrama: "abc",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.headers["x-request-id"]).toBe("req-test");
    expect(createResponse.json()).toMatchObject({ trigrama: "ABC" });

    const listResponse = await app.inject({ method: "GET", url: "/militares?page=1&limit=20" });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toMatchObject({
      dados: [{ trigrama: "ABC" }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it("busca, atualiza e remove militar", async () => {
    const app = await appPromise;

    const createResponse = await app.inject({
      method: "POST",
      url: "/militares",
      payload: {
        trigrama: "def",
        nomeCompleto: "Maria da Silva",
        cpf: "12345678902",
        saram: "7654321",
        email: "maria.silva@example.com",
      },
    });

    const created = createResponse.json();

    const byIdResponse = await app.inject({ method: "GET", url: `/militares/${created.id}` });
    expect(byIdResponse.statusCode).toBe(200);
    expect(byIdResponse.json()).toMatchObject({ trigrama: "DEF" });

    const byTrigramaResponse = await app.inject({
      method: "GET",
      url: "/militares/trigrama/def",
    });
    expect(byTrigramaResponse.statusCode).toBe(200);
    expect(byTrigramaResponse.json()).toMatchObject({ email: "maria.silva@example.com" });

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/militares/${created.id}`,
      payload: {
        nomeCompleto: "Maria Silva Atualizada",
        temDependente: true,
      },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      nomeCompleto: "Maria Silva Atualizada",
      temDependente: true,
    });

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/militares/${created.id}`,
    });
    expect(deleteResponse.statusCode).toBe(204);

    const missingResponse = await app.inject({ method: "GET", url: `/militares/${created.id}` });
    expect(missingResponse.statusCode).toBe(404);
    expect(missingResponse.json()).toMatchObject({
      erro: { codigo: "MILITAR_NAO_ENCONTRADO" },
    });
  });

  it("retorna conflito para trigrama duplicado", async () => {
    const app = await appPromise;
    const payload = {
      trigrama: "ghi",
      nomeCompleto: "Pedro da Silva",
      cpf: "12345678903",
    };

    await app.inject({ method: "POST", url: "/militares", payload });
    const duplicateResponse = await app.inject({
      method: "POST",
      url: "/militares",
      payload: { ...payload, cpf: "12345678904" },
    });

    expect(duplicateResponse.statusCode).toBe(409);
    expect(duplicateResponse.json()).toMatchObject({
      erro: { codigo: "TRIGRAMA_DUPLICADO" },
    });
  });

  it("calcula remuneracao do militar por id e data", async () => {
    const app = await appPromise;
    const tipoHabilitacao = await prisma.tipoHabilitacao.findUniqueOrThrow({
      where: { codigo: "FORMACAO" },
    });

    const createResponse = await app.inject({
      method: "POST",
      url: "/militares",
      payload: {
        trigrama: "rem",
        nomeCompleto: "Militar Remunerado",
        cpf: "12345678905",
        tipoHabilitacaoId: tipoHabilitacao.id,
        adicionalCompensacaoOrganicaPercentual: 10,
        adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 11,
        temAdicionalTempoServico: true,
        temAdicionalPromocao: true,
        temAdicionalComando: true,
      },
    });
    const militar = createResponse.json();

    await prisma.promocao.create({
      data: {
        militarId: militar.id,
        pstGraduacaoOrdem: 7,
        dataPromocao: new Date("2026-01-01T03:00:00.000Z"),
      },
    });

    const response = await app.inject({
      method: "GET",
      url: `/militares/${militar.id}/remuneracao?data=2026-02-01`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      militar: { id: militar.id, trigrama: "REM" },
      pstGraduacao: { ordem: 7 },
      soldo: { valor: 9976 },
      adicionais: {
        militar: { percentual: 19, valor: 1895.44 },
        disponibilidadeMilitar: { percentual: 12, valor: 1197.12 },
        habilitacao: { percentual: 12, valor: 1197.12 },
        tempoServico: { percentual: 5, valor: 498.8 },
        promocao: { percentual: 5, valor: 498.8 },
        comando: { percentual: 10, valor: 997.6 },
        compensacaoOrganica: { percentual: 10, valor: 673.7, baseSoldo: 6737 },
      },
      totalBruto: 16934.58,
    });
  });

  it("expoe swagger json", async () => {
    const app = await appPromise;
    const response = await app.inject({ method: "GET", url: "/docs/json" });

    expect(response.statusCode).toBe(200);
    expect(response.json().openapi).toBeDefined();
  });
});
