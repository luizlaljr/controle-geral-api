import type { Prisma } from "@prisma/client";
import { prisma } from "../../infra/database/prisma";
import { tabelaInputToCreateMany, toDomain } from "./soldo.mapper";
import type { Soldo, SoldoSearchParams, SoldoTabelaInput } from "./soldo.types";

const includePstGraduacao = {
  pstGraduacao: {
    select: {
      ordem: true,
      abreviacao: true,
      nome: true,
    },
  },
};

export class SoldoRepository {
  async findMany(params: SoldoSearchParams): Promise<Soldo[]> {
    const where = this.buildWhere(params);

    const soldos = await prisma.soldo.findMany({
      where,
      include: includePstGraduacao,
      orderBy: [{ pstGraduacaoOrdem: "asc" }, { vigenciaInicio: "desc" }],
    });

    const dados = soldos.map(toDomain);
    return params.data ? this.latestByOrdem(dados) : dados;
  }

  async findById(id: string): Promise<Soldo | null> {
    const soldo = await prisma.soldo.findUnique({
      where: { id },
      include: includePstGraduacao,
    });

    return soldo ? toDomain(soldo) : null;
  }

  async findExistingOrdens(ordens: number[]): Promise<number[]> {
    const pstGraduacoes = await prisma.pstGraduacao.findMany({
      where: { ordem: { in: ordens } },
      select: { ordem: true },
    });

    return pstGraduacoes.map((pstGraduacao) => pstGraduacao.ordem);
  }

  async createTabela(input: SoldoTabelaInput): Promise<Soldo[]> {
    const ordens = input.itens.map((item) => item.ordem);

    return prisma.$transaction(async (tx) => {
      await tx.soldo.createMany({
        data: tabelaInputToCreateMany(input),
      });

      const soldos = await tx.soldo.findMany({
        where: {
          pstGraduacaoOrdem: { in: ordens },
          vigenciaInicio: input.vigenciaInicio,
        },
        include: includePstGraduacao,
        orderBy: { pstGraduacaoOrdem: "asc" },
      });

      return soldos.map(toDomain);
    });
  }

  private buildWhere(params: SoldoSearchParams): Prisma.SoldoWhereInput {
    const where: Prisma.SoldoWhereInput = {};

    if (params.ordem) {
      where.pstGraduacaoOrdem = params.ordem;
    }

    if (params.data) {
      where.vigenciaInicio = { lte: params.data };
    }

    return where;
  }

  private latestByOrdem(soldos: Soldo[]): Soldo[] {
    const latest = new Map<number, Soldo>();

    for (const soldo of soldos) {
      if (!latest.has(soldo.pstGraduacaoOrdem)) {
        latest.set(soldo.pstGraduacaoOrdem, soldo);
      }
    }

    return Array.from(latest.values());
  }
}
