import { describe, expect, it } from "vitest";
import {
  adicionalHabilitacaoTabelaSchema,
  adicionalListQuerySchema,
  adicionalPorOrdemTabelaSchema,
  adicionalSimplesTabelaSchema,
} from "../../../src/modules/adicionais/adicional.schemas";

describe("adicional.schemas", () => {
  it("normaliza tabela por ordem", () => {
    const result = adicionalPorOrdemTabelaSchema.parse({
      vigencia_inicio: "2020-01-01 00:00:00-03:00",
      observacao: "Tabela inicial",
      itens: [{ ordem: 1, percentual: 28 }],
    });

    expect(result).toMatchObject({
      vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
      observacao: "Tabela inicial",
    });
  });

  it("normaliza tabela de habilitacao", () => {
    const result = adicionalHabilitacaoTabelaSchema.parse({
      vigencia_inicio: "2020-01-01 00:00:00-03:00",
      itens: [{ codigo: "formacao", nome: "Formacao", percentual: 12 }],
    });

    expect(result.itens[0]).toMatchObject({ codigo: "FORMACAO", percentual: 12 });
  });

  it("normaliza tabela simples e query", () => {
    expect(
      adicionalSimplesTabelaSchema.parse({
        vigencia_inicio: "2020-01-01 00:00:00-03:00",
        percentual: 5,
      }),
    ).toMatchObject({ percentual: 5 });

    expect(adicionalListQuerySchema.parse({ data: "2026-01-01", ordem: "1" })).toMatchObject({
      data: new Date("2026-01-01T00:00:00.000Z"),
      ordem: 1,
    });
  });

  it("recusa duplicidades e percentual invalido", () => {
    expect(() =>
      adicionalPorOrdemTabelaSchema.parse({
        vigencia_inicio: "2020-01-01 00:00:00-03:00",
        itens: [
          { ordem: 1, percentual: 28 },
          { ordem: 1, percentual: 28.123 },
        ],
      }),
    ).toThrow();

    expect(() =>
      adicionalHabilitacaoTabelaSchema.parse({
        vigencia_inicio: "2020-01-01 00:00:00-03:00",
        itens: [
          { codigo: "FORMACAO", nome: "Formacao", percentual: 12 },
          { codigo: "FORMACAO", nome: "Formacao", percentual: 12 },
        ],
      }),
    ).toThrow();
  });
});
