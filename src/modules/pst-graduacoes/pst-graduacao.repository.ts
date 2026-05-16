import { prisma } from "../../infra/database/prisma";
import type { PstGraduacao } from "./pst-graduacao.types";

export class PstGraduacaoRepository {
  async findMany(): Promise<PstGraduacao[]> {
    return prisma.pstGraduacao.findMany({
      orderBy: { ordem: "asc" },
    });
  }

  async findByOrdem(ordem: number): Promise<PstGraduacao | null> {
    return prisma.pstGraduacao.findUnique({
      where: { ordem },
    });
  }
}
