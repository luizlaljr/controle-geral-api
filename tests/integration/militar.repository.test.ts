import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { MilitarRepository } from "../../src/modules/militares/militar.repository";
import { cleanDatabase, ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

describe("MilitarRepository", () => {
  const repository = new MilitarRepository();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it("cria e busca militar por trigrama", async () => {
    await repository.create({
      trigrama: "abc",
      nomeCompleto: "Joao da Silva",
      cpf: "12345678901",
    });

    const militar = await repository.findByTrigrama("ABC");

    expect(militar?.trigrama).toBe("ABC");
    expect(militar?.temDependente).toBe(false);
  });

  it("lista com busca, atualiza, busca por id e remove militar", async () => {
    const created = await repository.create({
      trigrama: "def",
      nomeCompleto: "Maria Operacional",
      nomeGuerra: "Operacional",
      cpf: "12345678902",
      saram: "1234567",
      email: "maria.operacional@example.com",
    });

    const byId = await repository.findById(created.id);
    expect(byId?.id).toBe(created.id);

    const list = await repository.findMany({ page: 1, limit: 10, search: "operacional" });
    expect(list.total).toBe(1);
    expect(list.dados[0]?.trigrama).toBe("DEF");

    const updated = await repository.update(created.id, {
      trigrama: "xyz",
      nomeCompleto: "Maria Atualizada",
      temDependente: true,
    });
    expect(updated).toMatchObject({
      trigrama: "XYZ",
      nomeCompleto: "Maria Atualizada",
      temDependente: true,
    });

    await repository.delete(created.id);

    await expect(repository.findById(created.id)).resolves.toBeNull();
    await expect(repository.findByTrigrama("xyz")).resolves.toBeNull();
  });
});
