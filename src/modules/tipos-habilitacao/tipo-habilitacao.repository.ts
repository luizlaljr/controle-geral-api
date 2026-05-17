import { prisma } from "../../infra/database/prisma";
import type { TipoHabilitacao } from "./tipo-habilitacao.types";

export class TipoHabilitacaoRepository {
  async findMany(): Promise<TipoHabilitacao[]> {
    return prisma.tipoHabilitacao.findMany({
      orderBy: { nome: "asc" },
    });
  }

  async findById(id: string): Promise<TipoHabilitacao | null> {
    return prisma.tipoHabilitacao.findUnique({
      where: { id },
    });
  }

  async findByCodigo(codigo: string): Promise<TipoHabilitacao | null> {
    return prisma.tipoHabilitacao.findUnique({
      where: { codigo: codigo.toUpperCase() },
    });
  }
}
