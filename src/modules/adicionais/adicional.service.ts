import { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";
import {
  adicionalHabilitacaoToPublic,
  adicionalPorOrdemToPublic,
  adicionalSimplesToPublic,
} from "./adicional.mapper";
import { AdicionalRepository } from "./adicional.repository";
import type {
  AdicionalHabilitacaoPublic,
  AdicionalHabilitacaoTabelaInput,
  AdicionalPorOrdemPublic,
  AdicionalPorOrdemTabelaInput,
  AdicionalSearchParams,
  AdicionalSimplesPublic,
  AdicionalSimplesTabelaInput,
} from "./adicional.types";

export class AdicionalService {
  constructor(private readonly repository = new AdicionalRepository()) {}

  async listAdicionalMilitar(params: AdicionalSearchParams): Promise<AdicionalPorOrdemPublic[]> {
    return (await this.repository.findAdicionalMilitar(params)).map(adicionalPorOrdemToPublic);
  }

  async createAdicionalMilitar(input: AdicionalPorOrdemTabelaInput): Promise<AdicionalPorOrdemPublic[]> {
    try {
      return (await this.repository.createAdicionalMilitar(input)).map(adicionalPorOrdemToPublic);
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async listDisponibilidadeMilitar(params: AdicionalSearchParams): Promise<AdicionalPorOrdemPublic[]> {
    return (await this.repository.findDisponibilidadeMilitar(params)).map(adicionalPorOrdemToPublic);
  }

  async createDisponibilidadeMilitar(input: AdicionalPorOrdemTabelaInput): Promise<AdicionalPorOrdemPublic[]> {
    try {
      return (await this.repository.createDisponibilidadeMilitar(input)).map(adicionalPorOrdemToPublic);
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async listHabilitacao(params: { data?: Date | undefined }): Promise<AdicionalHabilitacaoPublic[]> {
    return (await this.repository.findHabilitacao(params)).map(adicionalHabilitacaoToPublic);
  }

  async createHabilitacao(input: AdicionalHabilitacaoTabelaInput): Promise<AdicionalHabilitacaoPublic[]> {
    try {
      return (await this.repository.createHabilitacao(input)).map(adicionalHabilitacaoToPublic);
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async listTempoServico(params: { data?: Date | undefined }): Promise<AdicionalSimplesPublic[]> {
    return (await this.repository.findTempoServico(params)).map(adicionalSimplesToPublic);
  }

  async createTempoServico(input: AdicionalSimplesTabelaInput): Promise<AdicionalSimplesPublic[]> {
    try {
      return (await this.repository.createTempoServico(input)).map(adicionalSimplesToPublic);
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async listPromocao(params: { data?: Date | undefined }): Promise<AdicionalSimplesPublic[]> {
    return (await this.repository.findPromocao(params)).map(adicionalSimplesToPublic);
  }

  async createPromocao(input: AdicionalSimplesTabelaInput): Promise<AdicionalSimplesPublic[]> {
    try {
      return (await this.repository.createPromocao(input)).map(adicionalSimplesToPublic);
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  async listComando(params: { data?: Date | undefined }): Promise<AdicionalSimplesPublic[]> {
    return (await this.repository.findComando(params)).map(adicionalSimplesToPublic);
  }

  async createComando(input: AdicionalSimplesTabelaInput): Promise<AdicionalSimplesPublic[]> {
    try {
      return (await this.repository.createComando(input)).map(adicionalSimplesToPublic);
    } catch (error) {
      throw this.translatePrismaError(error);
    }
  }

  private translatePrismaError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return new AppError({
        codigo: "ADICIONAL_DUPLICADO",
        mensagem: "Ja existe adicional para esta vigencia",
        statusCode: 409,
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return new AppError({
        codigo: "REFERENCIA_INVALIDA",
        mensagem: "Referencia invalida",
        statusCode: 404,
      });
    }

    return error instanceof Error ? error : new Error("Erro desconhecido");
  }
}
