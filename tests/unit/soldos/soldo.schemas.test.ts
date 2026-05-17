import { describe, expect, it } from "vitest";
import { soldoListQuerySchema, soldoTabelaSchema } from "../../../src/modules/soldos/soldo.schemas";

describe("soldo.schemas", () => {
  it("normaliza payload de tabela", () => {
    const result = soldoTabelaSchema.parse({
      vigencia_inicio: "2026-01-01 00:00:00-03:00",
      observacao: "Tabela 2026",
      itens: [{ ordem: 1, valor: 14711 }],
    });

    expect(result).toMatchObject({
      vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
      observacao: "Tabela 2026",
    });
  });

  it("recusa data invalida", () => {
    expect(() =>
      soldoTabelaSchema.parse({
        vigencia_inicio: "data-invalida",
        itens: [{ ordem: 1, valor: 14711 }],
      }),
    ).toThrow();
  });

  it("recusa ordem duplicada e valor com mais de duas casas", () => {
    expect(() =>
      soldoTabelaSchema.parse({
        vigencia_inicio: "2026-01-01 00:00:00-03:00",
        itens: [
          { ordem: 1, valor: 14711 },
          { ordem: 1, valor: 14711.123 },
        ],
      }),
    ).toThrow();
  });

  it("normaliza query de listagem", () => {
    const result = soldoListQuerySchema.parse({ data: "2026-02-01", ordem: "1" });

    expect(result).toMatchObject({
      data: new Date("2026-02-01T00:00:00.000Z"),
      ordem: 1,
    });
  });
});
