import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/infra/database/prisma";
import { SoldoRepository } from "../../src/modules/soldos/soldo.repository";
import { ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

const tabela2027 = {
  vigenciaInicio: new Date("2027-01-01T03:00:00.000Z"),
  observacao: "Tabela de soldo vigente a partir de 01/01/2027",
  itens: Array.from({ length: 20 }, (_, index) => ({
    ordem: index + 1,
    valor: 15000 - index,
  })),
};

describe("SoldoRepository", () => {
  const repository = new SoldoRepository();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterEach(async () => {
    await prisma.soldo.deleteMany({ where: { vigenciaInicio: tabela2027.vigenciaInicio } });
  });

  it("lista soldos vigentes por data", async () => {
    const soldos = await repository.findMany({ data: new Date("2026-02-01T03:00:00.000Z") });

    expect(soldos).toHaveLength(20);
    expect(soldos[0]).toMatchObject({
      pstGraduacaoOrdem: 1,
      valor: 14711,
      pstGraduacao: { abreviacao: "Ten Brig Ar" },
    });
  });

  it("insere nova tabela append-only e busca vigente pela data", async () => {
    const created = await repository.createTabela(tabela2027);

    expect(created).toHaveLength(20);
    expect(created[0]).toMatchObject({ pstGraduacaoOrdem: 1, valor: 15000 });

    const soldos2026 = await repository.findMany({ data: new Date("2026-12-31T03:00:00.000Z") });
    expect(soldos2026).toHaveLength(20);

    const soldos2027 = await repository.findMany({ data: new Date("2027-01-01T03:00:00.000Z") });
    expect(soldos2027).toHaveLength(20);
    expect(soldos2027[0]?.valor).toBe(15000);
  });

  it("busca soldo por id", async () => {
    const [soldo] = await repository.findMany({ ordem: 1 });

    expect(soldo).toBeDefined();
    await expect(repository.findById(soldo!.id)).resolves.toMatchObject({
      id: soldo!.id,
      pstGraduacaoOrdem: 1,
    });
  });

  it("retorna nulo quando soldo nao existe", async () => {
    await expect(repository.findById("8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2")).resolves.toBeNull();
  });
});
