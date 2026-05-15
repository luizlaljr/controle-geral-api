import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { MilitarService } from "../../../src/modules/militares/militar.service";
import type { Militar } from "../../../src/modules/militares/militar.types";
import { AppError } from "../../../src/shared/errors/AppError";

const militar: Militar = {
  id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
  trigrama: "ABC",
  nomeCompleto: "Joao da Silva",
  nomeGuerra: null,
  cpf: "12345678901",
  saram: null,
  email: null,
  banco: null,
  agencia: null,
  contaCorrente: null,
  temDependente: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("MilitarService", () => {
  it("retorna erro quando militar nao existe", async () => {
    const service = new MilitarService({
      findById: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(service.findById(militar.id)).rejects.toMatchObject({
      codigo: "MILITAR_NAO_ENCONTRADO",
      statusCode: 404,
    });
  });

  it("retorna erro quando trigrama nao existe", async () => {
    const service = new MilitarService({
      findByTrigrama: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(service.findByTrigrama("ABC")).rejects.toMatchObject({
      codigo: "MILITAR_NAO_ENCONTRADO",
      statusCode: 404,
    });
  });

  it("retorna militar por id e por trigrama", async () => {
    const service = new MilitarService({
      findById: vi.fn().mockResolvedValue(militar),
      findByTrigrama: vi.fn().mockResolvedValue(militar),
    } as never);

    await expect(service.findById(militar.id)).resolves.toMatchObject({ trigrama: "ABC" });
    await expect(service.findByTrigrama("abc")).resolves.toMatchObject({ trigrama: "ABC" });
  });

  it("traduz P2002 para TRIGRAMA_DUPLICADO", async () => {
    const service = new MilitarService({
      create: vi.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint", {
          code: "P2002",
          clientVersion: "test",
        }),
      ),
    } as never);

    await expect(
      service.create({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("pagina resultado no formato esperado", async () => {
    const service = new MilitarService({
      findMany: vi.fn().mockResolvedValue({ dados: [militar], total: 1 }),
    } as never);

    await expect(service.list({ page: 1, limit: 20 })).resolves.toMatchObject({
      dados: [{ trigrama: "ABC" }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it("atualiza e remove militar existente", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(militar),
      update: vi.fn().mockResolvedValue({ ...militar, nomeCompleto: "Joao Atualizado" }),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const service = new MilitarService(repository as never);

    await expect(service.update(militar.id, { nomeCompleto: "Joao Atualizado" })).resolves.toMatchObject({
      nomeCompleto: "Joao Atualizado",
    });
    await expect(service.delete(militar.id)).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(militar.id);
  });

  it("repassa erros desconhecidos do Prisma", async () => {
    const error = new Error("falha externa");
    const service = new MilitarService({
      create: vi.fn().mockRejectedValue(error),
    } as never);

    await expect(
      service.create({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
      }),
    ).rejects.toBe(error);
  });

  it("normaliza erros desconhecidos nao Error", async () => {
    const service = new MilitarService({
      update: vi.fn().mockRejectedValue("falha"),
      findById: vi.fn().mockResolvedValue(militar),
    } as never);

    await expect(service.update(militar.id, { nomeCompleto: "Joao" })).rejects.toThrow("Erro desconhecido");
  });
});
