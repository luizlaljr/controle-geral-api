import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { SoldoService } from "../../../src/modules/soldos/soldo.service";
import type { Soldo } from "../../../src/modules/soldos/soldo.types";
import { AppError } from "../../../src/shared/errors/AppError";

const soldo: Soldo = {
  id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
  pstGraduacaoOrdem: 1,
  valor: 14711,
  vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
  observacao: "Tabela de soldo vigente a partir de 01/01/2026",
  createdAt: new Date("2026-01-01T03:00:00.000Z"),
  pstGraduacao: {
    ordem: 1,
    abreviacao: "Ten Brig Ar",
    nome: "Tenente-Brigadeiro do Ar",
  },
};

describe("SoldoService", () => {
  it("lista soldos", async () => {
    const service = new SoldoService({
      findMany: vi.fn().mockResolvedValue([soldo]),
    } as never);

    await expect(service.list({ data: new Date("2026-02-01T00:00:00.000Z") })).resolves.toEqual([
      expect.objectContaining({ pstGraduacaoOrdem: 1, valor: 14711 }),
    ]);
  });

  it("busca soldo por id", async () => {
    const service = new SoldoService({
      findById: vi.fn().mockResolvedValue(soldo),
    } as never);

    await expect(service.findById(soldo.id)).resolves.toMatchObject({ id: soldo.id });
  });

  it("retorna erro quando soldo nao existe", async () => {
    const service = new SoldoService({
      findById: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(service.findById(soldo.id)).rejects.toMatchObject({
      codigo: "SOLDO_NAO_ENCONTRADO",
      statusCode: 404,
    });
  });

  it("insere tabela de soldos", async () => {
    const service = new SoldoService({
      findExistingOrdens: vi.fn().mockResolvedValue([1]),
      createTabela: vi.fn().mockResolvedValue([soldo]),
    } as never);

    await expect(
      service.createTabela({
        vigenciaInicio: new Date("2027-01-01T03:00:00.000Z"),
        observacao: "Tabela 2027",
        itens: [{ ordem: 1, valor: 15000 }],
      }),
    ).resolves.toMatchObject({ total: 1, dados: [{ valor: 14711 }] });
  });

  it("retorna erro quando ordem nao existe", async () => {
    const service = new SoldoService({
      findExistingOrdens: vi.fn().mockResolvedValue([]),
    } as never);

    await expect(
      service.createTabela({
        vigenciaInicio: new Date("2027-01-01T03:00:00.000Z"),
        itens: [{ ordem: 99, valor: 15000 }],
      }),
    ).rejects.toMatchObject({
      codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
      statusCode: 404,
    });
  });

  it("traduz P2002 para SOLDO_DUPLICADO", async () => {
    const service = new SoldoService({
      findExistingOrdens: vi.fn().mockResolvedValue([1]),
      createTabela: vi.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint", {
          code: "P2002",
          clientVersion: "test",
        }),
      ),
    } as never);

    await expect(
      service.createTabela({
        vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
        itens: [{ ordem: 1, valor: 14711 }],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("repassa erros desconhecidos do Prisma", async () => {
    const error = new Error("falha externa");
    const service = new SoldoService({
      findExistingOrdens: vi.fn().mockResolvedValue([1]),
      createTabela: vi.fn().mockRejectedValue(error),
    } as never);

    await expect(
      service.createTabela({
        vigenciaInicio: new Date("2027-01-01T03:00:00.000Z"),
        itens: [{ ordem: 1, valor: 15000 }],
      }),
    ).rejects.toBe(error);
  });

  it("normaliza erros desconhecidos nao Error", async () => {
    const service = new SoldoService({
      findExistingOrdens: vi.fn().mockResolvedValue([1]),
      createTabela: vi.fn().mockRejectedValue("falha"),
    } as never);

    await expect(
      service.createTabela({
        vigenciaInicio: new Date("2027-01-01T03:00:00.000Z"),
        itens: [{ ordem: 1, valor: 15000 }],
      }),
    ).rejects.toThrow("Erro desconhecido");
  });
});
