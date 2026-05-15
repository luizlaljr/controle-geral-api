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
});
