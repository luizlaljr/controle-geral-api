import { prisma } from "../../infra/database/prisma";
import { createInputToPrisma, toDomain } from "./promocao.mapper";
import type { Promocao, PromocaoCreateInput } from "./promocao.types";

const includePstGraduacao = {
  pstGraduacao: {
    select: {
      ordem: true,
      abreviacao: true,
      nome: true,
    },
  },
} as const;

export class PromocaoRepository {
  async create(input: PromocaoCreateInput): Promise<Promocao> {
    const promocao = await prisma.promocao.create({
      data: createInputToPrisma(input),
      include: includePstGraduacao,
    });

    return toDomain(promocao);
  }

  async findByMilitarId(militarId: string): Promise<Promocao[]> {
    const promocoes = await prisma.promocao.findMany({
      where: { militarId },
      include: includePstGraduacao,
      orderBy: { dataPromocao: "desc" },
    });

    return promocoes.map(toDomain);
  }

  async existsMilitar(id: string): Promise<boolean> {
    const count = await prisma.militar.count({ where: { id } });
    return count > 0;
  }

  async existsPstGraduacao(ordem: number): Promise<boolean> {
    const count = await prisma.pstGraduacao.count({ where: { ordem } });
    return count > 0;
  }
}
