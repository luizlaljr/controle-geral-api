import { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";
import { paginate } from "../../shared/http/pagination";
import { toPublic } from "./militar.mapper";
import { MilitarRepository, type MilitarSearchParams } from "./militar.repository";
import type { MilitarCreateInput, MilitarPublic, MilitarUpdateInput } from "./militar.types";

export class MilitarService {
  constructor(private readonly repository = new MilitarRepository()) {}

  async create(input: MilitarCreateInput): Promise<MilitarPublic> {
    try {
      return toPublic(await this.repository.create(input));
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async list(params: MilitarSearchParams) {
    const result = await this.repository.findMany(params);
    return paginate(result.dados.map(toPublic), params.page, params.limit, result.total);
  }

  async findById(id: string): Promise<MilitarPublic> {
    const militar = await this.repository.findById(id);

    if (!militar) {
      throw new AppError({
        codigo: "MILITAR_NAO_ENCONTRADO",
        mensagem: "Militar nao encontrado",
        statusCode: 404,
      });
    }

    return toPublic(militar);
  }

  async findByTrigrama(trigrama: string): Promise<MilitarPublic> {
    const militar = await this.repository.findByTrigrama(trigrama);

    if (!militar) {
      throw new AppError({
        codigo: "MILITAR_NAO_ENCONTRADO",
        mensagem: "Militar nao encontrado",
        statusCode: 404,
      });
    }

    return toPublic(militar);
  }

  async update(id: string, input: MilitarUpdateInput): Promise<MilitarPublic> {
    await this.findById(id);

    try {
      return toPublic(await this.repository.update(id, input));
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }

  private translatePrismaError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return new AppError({
        codigo: "TRIGRAMA_DUPLICADO",
        mensagem: "Trigrama duplicado",
        statusCode: 409,
      });
    }

    return error instanceof Error ? error : new Error("Erro desconhecido");
  }
}
