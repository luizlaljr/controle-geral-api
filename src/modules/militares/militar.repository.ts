import type { Prisma } from "@prisma/client";
import { prisma } from "../../infra/database/prisma";
import { createInputToPrisma, toDomain, updateInputToPrisma } from "./militar.mapper";
import type {
  Militar,
  MilitarCreateInput,
  MilitarUpdateInput,
  RemuneracaoAdicionalVigente,
  RemuneracaoPromocaoVigente,
  RemuneracaoSoldoVigente,
} from "./militar.types";

export type MilitarSearchParams = {
  page: number;
  limit: number;
  search?: string | undefined;
};

export class MilitarRepository {
  async create(input: MilitarCreateInput): Promise<Militar> {
    const militar = await prisma.militar.create({
      data: createInputToPrisma(input),
    });

    return toDomain(militar);
  }

  async findMany(params: MilitarSearchParams): Promise<{ dados: Militar[]; total: number }> {
    const where = this.buildSearchWhere(params.search);

    const [dados, total] = await prisma.$transaction([
      prisma.militar.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.militar.count({ where }),
    ]);

    return {
      dados: dados.map(toDomain),
      total,
    };
  }

  async findById(id: string): Promise<Militar | null> {
    const militar = await prisma.militar.findUnique({ where: { id } });
    return militar ? toDomain(militar) : null;
  }

  async findByTrigrama(trigrama: string): Promise<Militar | null> {
    const militar = await prisma.militar.findUnique({ where: { trigrama: trigrama.toUpperCase() } });
    return militar ? toDomain(militar) : null;
  }

  async update(id: string, input: MilitarUpdateInput): Promise<Militar> {
    const militar = await prisma.militar.update({
      where: { id },
      data: updateInputToPrisma(input),
    });

    return toDomain(militar);
  }

  async delete(id: string): Promise<void> {
    await prisma.militar.delete({ where: { id } });
  }

  async findPromocaoVigente(militarId: string, data: Date): Promise<RemuneracaoPromocaoVigente | null> {
    return prisma.promocao.findFirst({
      where: {
        militarId,
        dataPromocao: { lte: data },
      },
      include: {
        pstGraduacao: {
          select: {
            ordem: true,
            abreviacao: true,
            nome: true,
          },
        },
      },
      orderBy: { dataPromocao: "desc" },
    });
  }

  async findSoldoVigente(pstGraduacaoOrdem: number, data: Date): Promise<RemuneracaoSoldoVigente | null> {
    const soldo = await prisma.soldo.findFirst({
      where: {
        pstGraduacaoOrdem,
        vigenciaInicio: { lte: data },
      },
      include: {
        pstGraduacao: {
          select: {
            ordem: true,
            abreviacao: true,
            nome: true,
          },
        },
      },
      orderBy: { vigenciaInicio: "desc" },
    });

    return soldo
      ? {
          valor: soldo.valor.toNumber(),
          vigenciaInicio: soldo.vigenciaInicio,
          pstGraduacao: soldo.pstGraduacao,
        }
      : null;
  }

  async findAdicionalMilitarVigente(
    pstGraduacaoOrdem: number,
    data: Date,
  ): Promise<RemuneracaoAdicionalVigente | null> {
    const adicional = await prisma.adicionalMilitar.findFirst({
      where: {
        pstGraduacaoOrdem,
        vigenciaInicio: { lte: data },
      },
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.toAdicionalVigente(adicional);
  }

  async findDisponibilidadeMilitarVigente(
    pstGraduacaoOrdem: number,
    data: Date,
  ): Promise<RemuneracaoAdicionalVigente | null> {
    const adicional = await prisma.adicionalDisponibilidadeMilitar.findFirst({
      where: {
        pstGraduacaoOrdem,
        vigenciaInicio: { lte: data },
      },
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.toAdicionalVigente(adicional);
  }

  async findHabilitacaoVigente(
    tipoHabilitacaoId: string,
    data: Date,
  ): Promise<RemuneracaoAdicionalVigente | null> {
    const adicional = await prisma.adicionalHabilitacao.findFirst({
      where: {
        tipoHabilitacaoId,
        vigenciaInicio: { lte: data },
      },
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.toAdicionalVigente(adicional);
  }

  async findTempoServicoVigente(data: Date): Promise<RemuneracaoAdicionalVigente | null> {
    const adicional = await prisma.adicionalTempoServico.findFirst({
      where: { vigenciaInicio: { lte: data } },
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.toAdicionalVigente(adicional);
  }

  async findAdicionalPromocaoVigente(data: Date): Promise<RemuneracaoAdicionalVigente | null> {
    const adicional = await prisma.adicionalPromocao.findFirst({
      where: { vigenciaInicio: { lte: data } },
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.toAdicionalVigente(adicional);
  }

  async findComandoVigente(data: Date): Promise<RemuneracaoAdicionalVigente | null> {
    const adicional = await prisma.adicionalComando.findFirst({
      where: { vigenciaInicio: { lte: data } },
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.toAdicionalVigente(adicional);
  }

  private buildSearchWhere(search?: string): Prisma.MilitarWhereInput {
    if (!search) {
      return {};
    }

    return {
      OR: [
        { trigrama: { contains: search, mode: "insensitive" } },
        { nomeCompleto: { contains: search, mode: "insensitive" } },
        { nomeGuerra: { contains: search, mode: "insensitive" } },
        { cpf: { contains: search } },
        { saram: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  private toAdicionalVigente(
    adicional: { percentual: Prisma.Decimal; vigenciaInicio: Date } | null,
  ): RemuneracaoAdicionalVigente | null {
    return adicional
      ? {
          percentual: adicional.percentual.toNumber(),
          vigenciaInicio: adicional.vigenciaInicio,
        }
      : null;
  }
}
