import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/infra/database/prisma";
import { AdicionalRepository } from "../../src/modules/adicionais/adicional.repository";
import { ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

const vigencia2027 = new Date("2027-01-01T03:00:00.000Z");

describe("AdicionalRepository", () => {
  const repository = new AdicionalRepository();

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

  it("lista cargas iniciais por data", async () => {
    await expect(repository.findAdicionalMilitar({ data: new Date("2020-02-01T03:00:00.000Z") })).resolves.toHaveLength(
      20,
    );
    await expect(repository.findDisponibilidadeMilitar({ data: new Date("2020-02-01T03:00:00.000Z") })).resolves.toHaveLength(
      20,
    );
    await expect(repository.findHabilitacao({ data: new Date("2020-02-01T03:00:00.000Z") })).resolves.toHaveLength(5);
    await expect(repository.findTempoServico({ data: new Date("2020-02-01T03:00:00.000Z") })).resolves.toHaveLength(1);
  });

  it("insere novas tabelas append-only e busca vigente", async () => {
    await repository.createAdicionalMilitar({
      vigenciaInicio: vigencia2027,
      itens: Array.from({ length: 20 }, (_, index) => ({ ordem: index + 1, percentual: 30 })),
    });

    const vigente = await repository.findAdicionalMilitar({ data: vigencia2027, ordem: 1 });
    expect(vigente).toHaveLength(1);
    expect(vigente[0]?.percentual).toBe(30);

    await expect(
      repository.createTempoServico({
        vigenciaInicio: vigencia2027,
        percentual: 6,
      }),
    ).resolves.toEqual([expect.objectContaining({ percentual: 6 })]);
  });

  it("insere disponibilidade, habilitacao, promocao e comando", async () => {
    await expect(
      repository.createDisponibilidadeMilitar({
        vigenciaInicio: vigencia2027,
        itens: Array.from({ length: 20 }, (_, index) => ({ ordem: index + 1, percentual: 7 })),
      }),
    ).resolves.toHaveLength(20);

    const habilitacoes = await repository.createHabilitacao({
      vigenciaInicio: vigencia2027,
      itens: [{ codigo: "FORMACAO", nome: "Formacao", percentual: 13 }],
    });
    expect(habilitacoes).toEqual(expect.arrayContaining([expect.objectContaining({ percentual: 13 })]));

    await expect(repository.createPromocao({ vigenciaInicio: vigencia2027, percentual: 6 })).resolves.toEqual([
      expect.objectContaining({ percentual: 6 }),
    ]);
    await expect(repository.createComando({ vigenciaInicio: vigencia2027, percentual: 11 })).resolves.toEqual([
      expect.objectContaining({ percentual: 11 }),
    ]);

    await expect(repository.findAdicionalMilitar({})).resolves.toHaveLength(20);
    await expect(repository.findHabilitacao({})).resolves.toHaveLength(6);
    await expect(repository.findComando({})).resolves.toHaveLength(2);
  });
});
