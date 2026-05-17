import type { Prisma } from "@prisma/client";
import { prisma } from "../../infra/database/prisma";
import type {
  AdicionalHabilitacao,
  AdicionalHabilitacaoTabelaInput,
  AdicionalPorOrdem,
  AdicionalPorOrdemTabelaInput,
  AdicionalSearchParams,
  AdicionalSimples,
  AdicionalSimplesTabelaInput,
} from "./adicional.types";

const includePstGraduacao = {
  pstGraduacao: {
    select: {
      ordem: true,
      abreviacao: true,
      nome: true,
    },
  },
} as const;

const includeTipoHabilitacao = {
  tipoHabilitacao: {
    select: {
      id: true,
      codigo: true,
      nome: true,
      ativo: true,
    },
  },
} as const;

type AdicionalPorOrdemPrisma = {
  id: string;
  pstGraduacaoOrdem: number;
  percentual: Prisma.Decimal;
  vigenciaInicio: Date;
  observacao: string | null;
  createdAt: Date;
  pstGraduacao: {
    ordem: number;
    abreviacao: string;
    nome: string;
  };
};

type AdicionalHabilitacaoPrisma = {
  id: string;
  tipoHabilitacaoId: string;
  percentual: Prisma.Decimal;
  vigenciaInicio: Date;
  observacao: string | null;
  createdAt: Date;
  tipoHabilitacao: {
    id: string;
    codigo: string;
    nome: string;
    ativo: boolean;
  };
};

type AdicionalSimplesPrisma = {
  id: string;
  percentual: Prisma.Decimal;
  vigenciaInicio: Date;
  observacao: string | null;
  createdAt: Date;
};

export class AdicionalRepository {
  async findAdicionalMilitar(params: AdicionalSearchParams): Promise<AdicionalPorOrdem[]> {
    const dados = await prisma.adicionalMilitar.findMany({
      where: this.buildPorOrdemWhere(params),
      include: includePstGraduacao,
      orderBy: [{ pstGraduacaoOrdem: "asc" }, { vigenciaInicio: "desc" }],
    });

    return this.filterLatestPorOrdem(dados.map((item) => this.toAdicionalPorOrdem(item)), params);
  }

  async createAdicionalMilitar(input: AdicionalPorOrdemTabelaInput): Promise<AdicionalPorOrdem[]> {
    await prisma.adicionalMilitar.createMany({
      data: input.itens.map((item) => ({
        pstGraduacaoOrdem: item.ordem,
        percentual: item.percentual.toFixed(2),
        vigenciaInicio: input.vigenciaInicio,
        observacao: input.observacao ?? null,
      })),
    });

    return this.findAdicionalMilitar({ data: input.vigenciaInicio });
  }

  async findDisponibilidadeMilitar(params: AdicionalSearchParams): Promise<AdicionalPorOrdem[]> {
    const dados = await prisma.adicionalDisponibilidadeMilitar.findMany({
      where: this.buildPorOrdemWhere(params),
      include: includePstGraduacao,
      orderBy: [{ pstGraduacaoOrdem: "asc" }, { vigenciaInicio: "desc" }],
    });

    return this.filterLatestPorOrdem(dados.map((item) => this.toAdicionalPorOrdem(item)), params);
  }

  async createDisponibilidadeMilitar(input: AdicionalPorOrdemTabelaInput): Promise<AdicionalPorOrdem[]> {
    await prisma.adicionalDisponibilidadeMilitar.createMany({
      data: input.itens.map((item) => ({
        pstGraduacaoOrdem: item.ordem,
        percentual: item.percentual.toFixed(2),
        vigenciaInicio: input.vigenciaInicio,
        observacao: input.observacao ?? null,
      })),
    });

    return this.findDisponibilidadeMilitar({ data: input.vigenciaInicio });
  }

  async findHabilitacao(params: { data?: Date | undefined }): Promise<AdicionalHabilitacao[]> {
    const dados = await prisma.adicionalHabilitacao.findMany({
      where: params.data ? { vigenciaInicio: { lte: params.data } } : {},
      include: includeTipoHabilitacao,
      orderBy: [{ tipoHabilitacaoId: "asc" }, { vigenciaInicio: "desc" }],
    });

    return this.filterLatestHabilitacao(dados.map((item) => this.toAdicionalHabilitacao(item)), params);
  }

  async createHabilitacao(input: AdicionalHabilitacaoTabelaInput): Promise<AdicionalHabilitacao[]> {
    await prisma.$transaction(async (tx) => {
      for (const item of input.itens) {
        const tipoHabilitacao = await tx.tipoHabilitacao.upsert({
          where: { codigo: item.codigo },
          create: { codigo: item.codigo, nome: item.nome },
          update: { nome: item.nome, ativo: true },
        });

        await tx.adicionalHabilitacao.create({
          data: {
            tipoHabilitacaoId: tipoHabilitacao.id,
            percentual: item.percentual.toFixed(2),
            vigenciaInicio: input.vigenciaInicio,
            observacao: input.observacao ?? null,
          },
        });
      }
    });

    return this.findHabilitacao({ data: input.vigenciaInicio });
  }

  async findTempoServico(params: { data?: Date | undefined }): Promise<AdicionalSimples[]> {
    const dados = await prisma.adicionalTempoServico.findMany({
      where: this.buildSimplesWhere(params),
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.filterLatestSimples(dados.map((item) => this.toAdicionalSimples(item)), params);
  }

  async createTempoServico(input: AdicionalSimplesTabelaInput): Promise<AdicionalSimples[]> {
    await prisma.adicionalTempoServico.create({
      data: this.toSimplesCreateInput(input),
    });

    return this.findTempoServico({ data: input.vigenciaInicio });
  }

  async findPromocao(params: { data?: Date | undefined }): Promise<AdicionalSimples[]> {
    const dados = await prisma.adicionalPromocao.findMany({
      where: this.buildSimplesWhere(params),
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.filterLatestSimples(dados.map((item) => this.toAdicionalSimples(item)), params);
  }

  async createPromocao(input: AdicionalSimplesTabelaInput): Promise<AdicionalSimples[]> {
    await prisma.adicionalPromocao.create({
      data: this.toSimplesCreateInput(input),
    });

    return this.findPromocao({ data: input.vigenciaInicio });
  }

  async findComando(params: { data?: Date | undefined }): Promise<AdicionalSimples[]> {
    const dados = await prisma.adicionalComando.findMany({
      where: this.buildSimplesWhere(params),
      orderBy: { vigenciaInicio: "desc" },
    });

    return this.filterLatestSimples(dados.map((item) => this.toAdicionalSimples(item)), params);
  }

  async createComando(input: AdicionalSimplesTabelaInput): Promise<AdicionalSimples[]> {
    await prisma.adicionalComando.create({
      data: this.toSimplesCreateInput(input),
    });

    return this.findComando({ data: input.vigenciaInicio });
  }

  private buildPorOrdemWhere(params: AdicionalSearchParams) {
    return {
      ...(params.ordem ? { pstGraduacaoOrdem: params.ordem } : {}),
      ...(params.data ? { vigenciaInicio: { lte: params.data } } : {}),
    };
  }

  private buildSimplesWhere(params: { data?: Date | undefined }) {
    return params.data ? { vigenciaInicio: { lte: params.data } } : {};
  }

  private filterLatestPorOrdem(dados: AdicionalPorOrdem[], params: AdicionalSearchParams): AdicionalPorOrdem[] {
    if (!params.data) {
      return dados;
    }

    const latest = new Map<number, AdicionalPorOrdem>();

    for (const item of dados) {
      if (!latest.has(item.pstGraduacaoOrdem)) {
        latest.set(item.pstGraduacaoOrdem, item);
      }
    }

    return Array.from(latest.values());
  }

  private filterLatestHabilitacao(
    dados: AdicionalHabilitacao[],
    params: { data?: Date | undefined },
  ): AdicionalHabilitacao[] {
    if (!params.data) {
      return dados;
    }

    const latest = new Map<string, AdicionalHabilitacao>();

    for (const item of dados) {
      if (!latest.has(item.tipoHabilitacaoId)) {
        latest.set(item.tipoHabilitacaoId, item);
      }
    }

    return Array.from(latest.values());
  }

  private filterLatestSimples(dados: AdicionalSimples[], params: { data?: Date | undefined }): AdicionalSimples[] {
    return params.data ? dados.slice(0, 1) : dados;
  }

  private toAdicionalPorOrdem(adicional: AdicionalPorOrdemPrisma): AdicionalPorOrdem {
    return {
      ...adicional,
      percentual: adicional.percentual.toNumber(),
    };
  }

  private toAdicionalHabilitacao(adicional: AdicionalHabilitacaoPrisma): AdicionalHabilitacao {
    return {
      ...adicional,
      percentual: adicional.percentual.toNumber(),
    };
  }

  private toAdicionalSimples(adicional: AdicionalSimplesPrisma): AdicionalSimples {
    return {
      ...adicional,
      percentual: adicional.percentual.toNumber(),
    };
  }

  private toSimplesCreateInput(input: AdicionalSimplesTabelaInput) {
    return {
      percentual: input.percentual.toFixed(2),
      vigenciaInicio: input.vigenciaInicio,
      observacao: input.observacao ?? null,
    };
  }
}
