import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { tabelaInputToCreateMany, toDomain, toPublic } from "../../../src/modules/soldos/soldo.mapper";

describe("soldo.mapper", () => {
  it("converte soldo Prisma para dominio e publico", () => {
    const vigenciaInicio = new Date("2026-01-01T03:00:00.000Z");

    const domain = toDomain({
      id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
      pstGraduacaoOrdem: 1,
      valor: new Prisma.Decimal("14711.00"),
      vigenciaInicio,
      observacao: "Tabela 2026",
      createdAt: vigenciaInicio,
      pstGraduacao: {
        ordem: 1,
        abreviacao: "Ten Brig Ar",
        nome: "Tenente-Brigadeiro do Ar",
      },
    });

    expect(domain.valor).toBe(14711);
    expect(toPublic(domain)).toMatchObject({
      vigenciaInicio: "2026-01-01T03:00:00.000Z",
    });
  });

  it("converte input de tabela para createMany com observacao nula", () => {
    const [data] = tabelaInputToCreateMany({
      vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
      itens: [{ ordem: 1, valor: 14711 }],
    });

    expect(data).toMatchObject({
      pstGraduacaoOrdem: 1,
      valor: "14711.00",
      observacao: null,
    });
  });
});
