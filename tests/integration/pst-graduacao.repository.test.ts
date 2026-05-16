import { beforeAll, describe, expect, it } from "vitest";
import { PstGraduacaoRepository } from "../../src/modules/pst-graduacoes/pst-graduacao.repository";
import { ensureTestDatabaseUrl, migrateTestDatabase } from "../helpers/database";

describe("PstGraduacaoRepository", () => {
  const repository = new PstGraduacaoRepository();

  beforeAll(() => {
    ensureTestDatabaseUrl();
    migrateTestDatabase();
  });

  it("lista postos e graduacoes populados por migration", async () => {
    const dados = await repository.findMany();

    expect(dados).toHaveLength(20);
    expect(dados[0]).toEqual({
      ordem: 1,
      abreviacao: "Ten Brig Ar",
      nome: "Tenente-Brigadeiro do Ar",
    });
    expect(dados[19]).toEqual({
      ordem: 20,
      abreviacao: "S2",
      nome: "Soldado de Segunda Classe",
    });
  });

  it("busca posto ou graduacao por ordem", async () => {
    await expect(repository.findByOrdem(7)).resolves.toEqual({
      ordem: 7,
      abreviacao: "Cap",
      nome: "Capitão",
    });
    await expect(repository.findByOrdem(99)).resolves.toBeNull();
  });
});
