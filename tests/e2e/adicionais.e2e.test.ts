import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../../src/app";
import { prisma } from "../../src/infra/database/prisma";
import { ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

const vigencia2027 = new Date("2027-01-01T03:00:00.000Z");

describe("Adicionais e2e", () => {
  const appPromise = buildApp();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterEach(async () => {
    await prisma.adicionalMilitar.deleteMany({ where: { vigenciaInicio: vigencia2027 } });
    await prisma.adicionalDisponibilidadeMilitar.deleteMany({ where: { vigenciaInicio: vigencia2027 } });
    await prisma.adicionalHabilitacao.deleteMany({ where: { vigenciaInicio: vigencia2027 } });
    await prisma.adicionalTempoServico.deleteMany({ where: { vigenciaInicio: vigencia2027 } });
    await prisma.adicionalPromocao.deleteMany({ where: { vigenciaInicio: vigencia2027 } });
    await prisma.adicionalComando.deleteMany({ where: { vigenciaInicio: vigencia2027 } });
  });

  afterAll(async () => {
    const app = await appPromise;
    await app.close();
  });

  it("lista adicionais iniciais por data", async () => {
    const app = await appPromise;

    const militar = await app.inject({ method: "GET", url: "/adicionais/militar?data=2020-02-01&ordem=1" });
    const militarSuboficial = await app.inject({
      method: "GET",
      url: "/adicionais/militar?data=2020-02-01&ordem=11",
    });
    const disponibilidade = await app.inject({
      method: "GET",
      url: "/adicionais/disponibilidade-militar?data=2020-02-01&ordem=1",
    });
    const tempoServico = await app.inject({ method: "GET", url: "/adicionais/tempo-servico?data=2020-02-01" });
    const promocao = await app.inject({ method: "GET", url: "/adicionais/promocao?data=2020-02-01" });
    const comando = await app.inject({ method: "GET", url: "/adicionais/comando?data=2020-02-01" });
    const habilitacao = await app.inject({ method: "GET", url: "/adicionais/habilitacao?data=2020-02-01" });

    expect(militar.statusCode).toBe(200);
    expect(militar.json()).toEqual([expect.objectContaining({ pstGraduacaoOrdem: 1, percentual: 28 })]);
    expect(militarSuboficial.statusCode).toBe(200);
    expect(militarSuboficial.json()).toEqual([expect.objectContaining({ pstGraduacaoOrdem: 11, percentual: 16 })]);
    expect(disponibilidade.json()).toEqual([expect.objectContaining({ pstGraduacaoOrdem: 1, percentual: 41 })]);
    expect(tempoServico.json()).toEqual([expect.objectContaining({ percentual: 5 })]);
    expect(promocao.json()).toEqual([expect.objectContaining({ percentual: 5 })]);
    expect(comando.json()).toEqual([expect.objectContaining({ percentual: 10 })]);
    expect(habilitacao.json()).toHaveLength(5);
  });

  it("insere tabelas append-only", async () => {
    const app = await appPromise;

    const militar = await app.inject({
      method: "POST",
      url: "/adicionais/militar/tabela",
      payload: {
        vigencia_inicio: "2027-01-01 00:00:00-03:00",
        itens: Array.from({ length: 20 }, (_, index) => ({ ordem: index + 1, percentual: 30 })),
      },
    });
    const tempoServico = await app.inject({
      method: "POST",
      url: "/adicionais/tempo-servico/tabela",
      payload: {
        vigencia_inicio: "2027-01-01 00:00:00-03:00",
        percentual: 6,
      },
    });
    const disponibilidade = await app.inject({
      method: "POST",
      url: "/adicionais/disponibilidade-militar/tabela",
      payload: {
        vigencia_inicio: "2027-01-01 00:00:00-03:00",
        itens: Array.from({ length: 20 }, (_, index) => ({ ordem: index + 1, percentual: 7 })),
      },
    });
    const habilitacao = await app.inject({
      method: "POST",
      url: "/adicionais/habilitacao/tabela",
      payload: {
        vigencia_inicio: "2027-01-01 00:00:00-03:00",
        itens: [{ codigo: "FORMACAO", nome: "Formacao", percentual: 13 }],
      },
    });
    const promocao = await app.inject({
      method: "POST",
      url: "/adicionais/promocao/tabela",
      payload: {
        vigencia_inicio: "2027-01-01 00:00:00-03:00",
        percentual: 6,
      },
    });
    const comando = await app.inject({
      method: "POST",
      url: "/adicionais/comando/tabela",
      payload: {
        vigencia_inicio: "2027-01-01 00:00:00-03:00",
        percentual: 11,
      },
    });

    expect(militar.statusCode).toBe(201);
    expect(militar.json()[0]).toMatchObject({ pstGraduacaoOrdem: 1, percentual: 30 });
    expect(tempoServico.statusCode).toBe(201);
    expect(tempoServico.json()).toEqual([expect.objectContaining({ percentual: 6 })]);
    expect(disponibilidade.statusCode).toBe(201);
    expect(habilitacao.statusCode).toBe(201);
    expect(promocao.statusCode).toBe(201);
    expect(comando.statusCode).toBe(201);

    await expect(app.inject({ method: "PATCH", url: "/adicionais/militar/tabela", payload: {} })).resolves.toMatchObject({
      statusCode: 404,
    });
    await expect(app.inject({ method: "DELETE", url: "/adicionais/militar/tabela" })).resolves.toMatchObject({
      statusCode: 404,
    });
  });
});
