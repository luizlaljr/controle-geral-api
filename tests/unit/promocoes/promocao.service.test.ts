import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { PromocaoService } from "../../../src/modules/promocoes/promocao.service";
import type { Promocao } from "../../../src/modules/promocoes/promocao.types";
import { AppError } from "../../../src/shared/errors/AppError";

const promocao: Promocao = {
  id: "7df063e7-5d9c-4a75-ab80-bb2aa626b8ed",
  militarId: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
  pstGraduacaoOrdem: 7,
  dataPromocao: new Date("2026-01-01T03:00:00.000Z"),
  createdAt: new Date("2026-01-01T03:00:00.000Z"),
  pstGraduacao: {
    ordem: 7,
    abreviacao: "Cap",
    nome: "Capitao",
  },
};

function createRepository() {
  return {
    create: vi.fn().mockResolvedValue(promocao),
    findByMilitarId: vi.fn().mockResolvedValue([promocao]),
    existsMilitar: vi.fn().mockResolvedValue(true),
    existsPstGraduacao: vi.fn().mockResolvedValue(true),
  };
}

describe("PromocaoService", () => {
  it("cadastra e lista promocoes", async () => {
    const repository = createRepository();
    const service = new PromocaoService(repository as never);

    await expect(
      service.create({
        militarId: promocao.militarId,
        pstGraduacaoOrdem: 7,
        dataPromocao: promocao.dataPromocao,
      }),
    ).resolves.toMatchObject({ militarId: promocao.militarId, pstGraduacaoOrdem: 7 });
    await expect(service.listByMilitarId(promocao.militarId)).resolves.toHaveLength(1);
  });

  it("retorna erro quando militar nao existe", async () => {
    const repository = {
      ...createRepository(),
      existsMilitar: vi.fn().mockResolvedValue(false),
    };
    const service = new PromocaoService(repository as never);

    await expect(service.listByMilitarId(promocao.militarId)).rejects.toMatchObject({
      codigo: "MILITAR_NAO_ENCONTRADO",
      statusCode: 404,
    });
  });

  it("retorna erro quando posto ou graduacao nao existe", async () => {
    const repository = {
      ...createRepository(),
      existsPstGraduacao: vi.fn().mockResolvedValue(false),
    };
    const service = new PromocaoService(repository as never);

    await expect(
      service.create({
        militarId: promocao.militarId,
        pstGraduacaoOrdem: 999,
        dataPromocao: promocao.dataPromocao,
      }),
    ).rejects.toMatchObject({
      codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
      statusCode: 404,
    });
  });

  it("traduz duplicidade de promocao", async () => {
    const repository = {
      ...createRepository(),
      create: vi.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint", {
          code: "P2002",
          clientVersion: "test",
        }),
      ),
    };
    const service = new PromocaoService(repository as never);

    await expect(
      service.create({
        militarId: promocao.militarId,
        pstGraduacaoOrdem: 7,
        dataPromocao: promocao.dataPromocao,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("normaliza erros desconhecidos", async () => {
    const repository = {
      ...createRepository(),
      create: vi.fn().mockRejectedValue("falha"),
    };
    const service = new PromocaoService(repository as never);

    await expect(
      service.create({
        militarId: promocao.militarId,
        pstGraduacaoOrdem: 7,
        dataPromocao: promocao.dataPromocao,
      }),
    ).rejects.toThrow("Erro desconhecido");
  });

  it("repassa erros conhecidos", async () => {
    const error = new Error("falha externa");
    const repository = {
      ...createRepository(),
      create: vi.fn().mockRejectedValue(error),
    };
    const service = new PromocaoService(repository as never);

    await expect(
      service.create({
        militarId: promocao.militarId,
        pstGraduacaoOrdem: 7,
        dataPromocao: promocao.dataPromocao,
      }),
    ).rejects.toBe(error);
  });
});
