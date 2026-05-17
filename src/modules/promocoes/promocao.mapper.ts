import type { Prisma } from "@prisma/client";
import type { Promocao, PromocaoCreateInput, PromocaoPublic } from "./promocao.types";

type PrismaPromocaoComPstGraduacao = Prisma.PromocaoGetPayload<{
  include: {
    pstGraduacao: {
      select: {
        ordem: true;
        abreviacao: true;
        nome: true;
      };
    };
  };
}>;

export function toDomain(promocao: PrismaPromocaoComPstGraduacao): Promocao {
  return promocao;
}

export function toPublic(promocao: Promocao): PromocaoPublic {
  return {
    ...promocao,
    dataPromocao: promocao.dataPromocao.toISOString(),
    createdAt: promocao.createdAt.toISOString(),
  };
}

export function createInputToPrisma(input: PromocaoCreateInput) {
  return {
    militarId: input.militarId,
    pstGraduacaoOrdem: input.pstGraduacaoOrdem,
    dataPromocao: input.dataPromocao,
  };
}
