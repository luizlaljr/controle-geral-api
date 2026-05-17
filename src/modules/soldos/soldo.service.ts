import { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";
import { toPublic } from "./soldo.mapper";
import { SoldoRepository } from "./soldo.repository";
import type { SoldoPublic, SoldoSearchParams, SoldoTabelaInput, SoldoTabelaResult } from "./soldo.types";

export class SoldoService {
  constructor(private readonly repository = new SoldoRepository()) {}

  async list(params: SoldoSearchParams): Promise<SoldoPublic[]> {
    const soldos = await this.repository.findMany(params);
    return soldos.map(toPublic);
  }

  async findById(id: string): Promise<SoldoPublic> {
    const soldo = await this.repository.findById(id);

    if (!soldo) {
      throw new AppError({
        codigo: "SOLDO_NAO_ENCONTRADO",
        mensagem: "Soldo nao encontrado",
        statusCode: 404,
      });
    }

    return toPublic(soldo);
  }

  async createTabela(input: SoldoTabelaInput): Promise<SoldoTabelaResult> {
    await this.ensureOrdensExist(input.itens.map((item) => item.ordem));

    try {
      const soldos = await this.repository.createTabela(input);
      return {
        total: soldos.length,
        dados: soldos.map(toPublic),
      };
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  private async ensureOrdensExist(ordens: number[]): Promise<void> {
    const existing = new Set(await this.repository.findExistingOrdens(ordens));
    const missing = ordens.filter((ordem) => !existing.has(ordem));

    if (missing.length > 0) {
      throw new AppError({
        codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
        mensagem: "Posto ou graduacao nao encontrado",
        statusCode: 404,
        detalhes: missing.map((ordem) => ({
          campo: "itens.ordem",
          mensagem: `Ordem ${ordem} nao encontrada`,
        })),
      });
    }
  }

  private translatePrismaError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return new AppError({
        codigo: "SOLDO_DUPLICADO",
        mensagem: "Ja existe soldo para esta ordem e vigencia",
        statusCode: 409,
      });
    }

    return error instanceof Error ? error : new Error("Erro desconhecido");
  }
}
