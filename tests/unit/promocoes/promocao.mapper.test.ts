import { describe, expect, it } from "vitest";
import { createInputToPrisma, toDomain, toPublic } from "../../../src/modules/promocoes/promocao.mapper";

describe("promocao.mapper", () => {
  it("converte promocao Prisma para dominio, publico e create input", () => {
    const dataPromocao = new Date("2026-01-01T03:00:00.000Z");
    const createdAt = new Date("2026-01-02T03:00:00.000Z");
    const prismaPromocao = {
      id: "7df063e7-5d9c-4a75-ab80-bb2aa626b8ed",
      militarId: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
      pstGraduacaoOrdem: 7,
      dataPromocao,
      createdAt,
      pstGraduacao: {
        ordem: 7,
        abreviacao: "Cap",
        nome: "Capitao",
      },
    };

    const domain = toDomain(prismaPromocao);
    const publicPromocao = toPublic(domain);
    const createInput = createInputToPrisma({
      militarId: prismaPromocao.militarId,
      pstGraduacaoOrdem: 7,
      dataPromocao,
    });

    expect(publicPromocao).toMatchObject({
      id: prismaPromocao.id,
      dataPromocao: dataPromocao.toISOString(),
      createdAt: createdAt.toISOString(),
    });
    expect(createInput).toEqual({
      militarId: prismaPromocao.militarId,
      pstGraduacaoOrdem: 7,
      dataPromocao,
    });
  });
});
