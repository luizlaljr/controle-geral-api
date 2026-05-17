import { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";
import { toPublic } from "./promocao.mapper";
import { PromocaoRepository } from "./promocao.repository";
import type { PromocaoPublic } from "./promocao.types";

export class PromocaoService {
  constructor(private readonly repository = new PromocaoRepository()) {}

  async create(input: {
    militarId: string;
    pstGraduacaoOrdem: number;
    dataPromocao: Date;
  }): Promise<PromocaoPublic> {
    await this.ensureMilitarExists(input.militarId);
    await this.ensurePstGraduacaoExists(input.pstGraduacaoOrdem);

    try {
      return toPublic(await this.repository.create(input));
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async listByMilitarId(militarId: string): Promise<PromocaoPublic[]> {
    await this.ensureMilitarExists(militarId);
    return (await this.repository.findByMilitarId(militarId)).map(toPublic);
  }

  private async ensureMilitarExists(id: string): Promise<void> {
    if (await this.repository.existsMilitar(id)) {
      return;
    }

    throw new AppError({
      codigo: "MILITAR_NAO_ENCONTRADO",
      mensagem: "Militar nao encontrado",
      statusCode: 404,
    });
  }

  private async ensurePstGraduacaoExists(ordem: number): Promise<void> {
    if (await this.repository.existsPstGraduacao(ordem)) {
      return;
    }

    throw new AppError({
      codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
      mensagem: "Posto ou graduacao nao encontrado",
      statusCode: 404,
    });
  }

  private translatePrismaError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return new AppError({
        codigo: "PROMOCAO_DUPLICADA",
        mensagem: "Ja existe promocao para este militar nesta data",
        statusCode: 409,
      });
    }

    return error instanceof Error ? error : new Error("Erro desconhecido");
  }
}
