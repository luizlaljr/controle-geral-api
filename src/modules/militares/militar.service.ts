import { Prisma } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";
import { paginate } from "../../shared/http/pagination";
import { toPublic } from "./militar.mapper";
import { MilitarRepository, type MilitarSearchParams } from "./militar.repository";
import type {
  MilitarCreateInput,
  MilitarPublic,
  MilitarUpdateInput,
  RemuneracaoAdicionalCalculado,
  RemuneracaoAdicionalVigente,
  RemuneracaoMilitar,
} from "./militar.types";

export class MilitarService {
  constructor(private readonly repository = new MilitarRepository()) {}

  async create(input: MilitarCreateInput): Promise<MilitarPublic> {
    this.validateCompensacaoOrganica(input);

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

  async getRemuneracao(id: string, data = new Date()): Promise<RemuneracaoMilitar> {
    const militar = await this.findById(id);
    const promocao = await this.repository.findPromocaoVigente(id, data);

    if (!promocao) {
      throw new AppError({
        codigo: "PROMOCAO_VIGENTE_NAO_ENCONTRADA",
        mensagem: "Promocao vigente nao encontrada para o militar",
        statusCode: 404,
      });
    }

    const soldo = await this.repository.findSoldoVigente(promocao.pstGraduacaoOrdem, data);

    if (!soldo) {
      throw new AppError({
        codigo: "SOLDO_VIGENTE_NAO_ENCONTRADO",
        mensagem: "Soldo vigente nao encontrado para a graduacao do militar",
        statusCode: 404,
      });
    }

    const [
      adicionalMilitar,
      disponibilidadeMilitar,
      adicionalHabilitacao,
      adicionalTempoServico,
      adicionalPromocao,
      adicionalComando,
      compensacaoOrganicaSoldo,
    ] = await Promise.all([
      this.repository.findAdicionalMilitarVigente(promocao.pstGraduacaoOrdem, data),
      this.repository.findDisponibilidadeMilitarVigente(promocao.pstGraduacaoOrdem, data),
      militar.tipoHabilitacaoId ? this.repository.findHabilitacaoVigente(militar.tipoHabilitacaoId, data) : null,
      militar.temAdicionalTempoServico ? this.repository.findTempoServicoVigente(data) : null,
      militar.temAdicionalPromocao ? this.repository.findAdicionalPromocaoVigente(data) : null,
      militar.temAdicionalComando ? this.repository.findComandoVigente(data) : null,
      militar.adicionalCompensacaoOrganicaPercentual > 0 &&
      militar.adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem !== null
        ? this.repository.findSoldoVigente(militar.adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem, data)
        : null,
    ]);

    const adicionais = {
      militar: this.requiredAdicional(adicionalMilitar, soldo.valor, "ADICIONAL_MILITAR_VIGENTE_NAO_ENCONTRADO"),
      disponibilidadeMilitar: this.requiredAdicional(
        disponibilidadeMilitar,
        soldo.valor,
        "ADICIONAL_DISPONIBILIDADE_VIGENTE_NAO_ENCONTRADO",
      ),
      habilitacao: this.optionalAdicional(adicionalHabilitacao, soldo.valor),
      tempoServico: this.optionalAdicional(adicionalTempoServico, soldo.valor),
      promocao: this.optionalAdicional(adicionalPromocao, soldo.valor),
      comando: this.optionalAdicional(adicionalComando, soldo.valor),
      compensacaoOrganica: compensacaoOrganicaSoldo
        ? {
            percentual: militar.adicionalCompensacaoOrganicaPercentual,
            valor: this.calculatePercentual(
              compensacaoOrganicaSoldo.valor,
              militar.adicionalCompensacaoOrganicaPercentual,
            ),
            vigenciaInicio: compensacaoOrganicaSoldo.vigenciaInicio.toISOString(),
            baseSoldo: compensacaoOrganicaSoldo.valor,
            basePstGraduacao: compensacaoOrganicaSoldo.pstGraduacao,
          }
        : null,
    };

    const totalAdicionais = Object.values(adicionais).reduce((total, adicional) => total + (adicional?.valor ?? 0), 0);

    return {
      militar: {
        id: militar.id,
        trigrama: militar.trigrama,
        nomeCompleto: militar.nomeCompleto,
        nomeGuerra: militar.nomeGuerra,
      },
      data: data.toISOString(),
      pstGraduacao: promocao.pstGraduacao,
      soldo: {
        valor: soldo.valor,
        vigenciaInicio: soldo.vigenciaInicio.toISOString(),
      },
      adicionais,
      totalBruto: this.roundMoney(soldo.valor + totalAdicionais),
    };
  }

  async update(id: string, input: MilitarUpdateInput): Promise<MilitarPublic> {
    const current = await this.findById(id);
    this.validateCompensacaoOrganica({
      adicionalCompensacaoOrganicaPercentual:
        input.adicionalCompensacaoOrganicaPercentual ?? current.adicionalCompensacaoOrganicaPercentual,
      adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem:
        input.adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem ??
        current.adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem ??
        undefined,
    });

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

  private validateCompensacaoOrganica(input: {
    adicionalCompensacaoOrganicaPercentual?: number | undefined;
    adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem?: number | undefined;
  }): void {
    const percentual = input.adicionalCompensacaoOrganicaPercentual ?? 0;

    if (percentual > 0 && input.adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem === undefined) {
      throw new AppError({
        codigo: "COMPENSACAO_ORGANICA_INVALIDA",
        mensagem: "Base da compensacao organica obrigatoria quando percentual for maior que zero",
        statusCode: 400,
      });
    }
  }

  private requiredAdicional(
    adicional: RemuneracaoAdicionalVigente | null,
    base: number,
    codigo: string,
  ): RemuneracaoAdicionalCalculado {
    if (!adicional) {
      throw new AppError({
        codigo,
        mensagem: "Adicional vigente nao encontrado para a graduacao do militar",
        statusCode: 404,
      });
    }

    return this.optionalAdicional(adicional, base) as RemuneracaoAdicionalCalculado;
  }

  private optionalAdicional(
    adicional: RemuneracaoAdicionalVigente | null,
    base: number,
  ): RemuneracaoAdicionalCalculado | null {
    return adicional
      ? {
          percentual: adicional.percentual,
          valor: this.calculatePercentual(base, adicional.percentual),
          vigenciaInicio: adicional.vigenciaInicio.toISOString(),
        }
      : null;
  }

  private calculatePercentual(base: number, percentual: number): number {
    return this.roundMoney((base * percentual) / 100);
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
