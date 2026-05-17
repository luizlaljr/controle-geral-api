import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../src/infra/database/prisma";
import { MilitarRepository } from "../../src/modules/militares/militar.repository";
import { PromocaoRepository } from "../../src/modules/promocoes/promocao.repository";
import { cleanDatabase, ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

describe("PromocaoRepository", () => {
  const militarRepository = new MilitarRepository();
  const repository = new PromocaoRepository();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it("cadastra e lista promocoes do militar", async () => {
    const militar = await militarRepository.create({
      trigrama: "abc",
      nomeCompleto: "Militar Promovido",
      cpf: "12345678908",
    });

    const promocao = await repository.create({
      militarId: militar.id,
      pstGraduacaoOrdem: 7,
      dataPromocao: new Date("2026-01-01T03:00:00.000Z"),
    });
    const promocoes = await repository.findByMilitarId(militar.id);

    expect(promocao).toMatchObject({
      militarId: militar.id,
      pstGraduacaoOrdem: 7,
      pstGraduacao: { ordem: 7 },
    });
    expect(promocoes).toHaveLength(1);
    await expect(repository.existsMilitar(militar.id)).resolves.toBe(true);
    await expect(repository.existsMilitar("8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2")).resolves.toBe(false);
    await expect(repository.existsPstGraduacao(7)).resolves.toBe(true);
    await expect(repository.existsPstGraduacao(999)).resolves.toBe(false);

    await prisma.promocao.deleteMany({ where: { militarId: militar.id } });
  });
});
