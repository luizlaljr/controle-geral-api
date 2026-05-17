import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { MilitarService } from "../../../src/modules/militares/militar.service";
import type { Militar } from "../../../src/modules/militares/militar.types";
import { AppError } from "../../../src/shared/errors/AppError";

const militar: Militar = {
  id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
  trigrama: "ABC",
  nomeCompleto: "Joao da Silva",
  nomeGuerra: null,
  cpf: "12345678901",
  saram: null,
  email: null,
  banco: null,
  agencia: null,
  contaCorrente: null,
  temDependente: false,
  tipoHabilitacaoId: null,
  adicionalCompensacaoOrganicaPercentual: 0,
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: null,
  temAdicionalTempoServico: false,
  temAdicionalPromocao: false,
  temAdicionalComando: false,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const militarComAdicionais: Militar = {
  ...militar,
  tipoHabilitacaoId: "8fd9d75a-6935-4bde-ad80-358ba623b8c8",
  adicionalCompensacaoOrganicaPercentual: 10,
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 11,
  temAdicionalTempoServico: true,
  temAdicionalPromocao: true,
  temAdicionalComando: true,
};

const dataReferencia = new Date("2026-02-01T03:00:00.000Z");

const pstGraduacao = {
  ordem: 7,
  abreviacao: "Cap",
  nome: "Capitao",
};

function createRemuneracaoRepository() {
  return {
    findById: vi.fn().mockResolvedValue(militarComAdicionais),
    findPromocaoVigente: vi.fn().mockResolvedValue({
      id: "5c470df4-90c0-4c17-8d86-bc1a31921601",
      militarId: militar.id,
      pstGraduacaoOrdem: 7,
      dataPromocao: new Date("2026-01-01T03:00:00.000Z"),
      pstGraduacao,
    }),
    findSoldoVigente: vi.fn().mockImplementation((ordem: number) =>
      Promise.resolve(
        ordem === 11
          ? {
              valor: 6737,
              vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
              pstGraduacao: { ordem: 11, abreviacao: "SO", nome: "Suboficial" },
            }
          : {
              valor: 9976,
              vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
              pstGraduacao,
            },
      ),
    ),
    findAdicionalMilitarVigente: vi.fn().mockResolvedValue({
      percentual: 19,
      vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
    }),
    findDisponibilidadeMilitarVigente: vi.fn().mockResolvedValue({
      percentual: 12,
      vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
    }),
    findHabilitacaoVigente: vi.fn().mockResolvedValue({
      percentual: 12,
      vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
    }),
    findTempoServicoVigente: vi.fn().mockResolvedValue({
      percentual: 5,
      vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
    }),
    findAdicionalPromocaoVigente: vi.fn().mockResolvedValue({
      percentual: 5,
      vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
    }),
    findComandoVigente: vi.fn().mockResolvedValue({
      percentual: 10,
      vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
    }),
  };
}

describe("MilitarService", () => {
  it("retorna erro quando militar nao existe", async () => {
    const service = new MilitarService({
      findById: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(service.findById(militar.id)).rejects.toMatchObject({
      codigo: "MILITAR_NAO_ENCONTRADO",
      statusCode: 404,
    });
  });

  it("retorna erro quando trigrama nao existe", async () => {
    const service = new MilitarService({
      findByTrigrama: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(service.findByTrigrama("ABC")).rejects.toMatchObject({
      codigo: "MILITAR_NAO_ENCONTRADO",
      statusCode: 404,
    });
  });

  it("retorna militar por id e por trigrama", async () => {
    const service = new MilitarService({
      findById: vi.fn().mockResolvedValue(militar),
      findByTrigrama: vi.fn().mockResolvedValue(militar),
    } as never);

    await expect(service.findById(militar.id)).resolves.toMatchObject({ trigrama: "ABC" });
    await expect(service.findByTrigrama("abc")).resolves.toMatchObject({ trigrama: "ABC" });
  });

  it("traduz P2002 para TRIGRAMA_DUPLICADO", async () => {
    const service = new MilitarService({
      create: vi.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint", {
          code: "P2002",
          clientVersion: "test",
        }),
      ),
    } as never);

    await expect(
      service.create({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("pagina resultado no formato esperado", async () => {
    const service = new MilitarService({
      findMany: vi.fn().mockResolvedValue({ dados: [militar], total: 1 }),
    } as never);

    await expect(service.list({ page: 1, limit: 20 })).resolves.toMatchObject({
      dados: [{ trigrama: "ABC" }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  });

  it("atualiza e remove militar existente", async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(militar),
      update: vi.fn().mockResolvedValue({ ...militar, nomeCompleto: "Joao Atualizado" }),
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const service = new MilitarService(repository as never);

    await expect(service.update(militar.id, { nomeCompleto: "Joao Atualizado" })).resolves.toMatchObject({
      nomeCompleto: "Joao Atualizado",
    });
    await expect(service.delete(militar.id)).resolves.toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(militar.id);
  });

  it("repassa erros desconhecidos do Prisma", async () => {
    const error = new Error("falha externa");
    const service = new MilitarService({
      create: vi.fn().mockRejectedValue(error),
    } as never);

    await expect(
      service.create({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
      }),
    ).rejects.toBe(error);
  });

  it("normaliza erros desconhecidos nao Error", async () => {
    const service = new MilitarService({
      update: vi.fn().mockRejectedValue("falha"),
      findById: vi.fn().mockResolvedValue(militar),
    } as never);

    await expect(service.update(militar.id, { nomeCompleto: "Joao" })).rejects.toThrow("Erro desconhecido");
  });

  it("recusa compensacao organica sem base", async () => {
    const service = new MilitarService({
      create: vi.fn(),
    } as never);

    await expect(
      service.create({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
        adicionalCompensacaoOrganicaPercentual: 10,
      }),
    ).rejects.toMatchObject({
      codigo: "COMPENSACAO_ORGANICA_INVALIDA",
      statusCode: 400,
    });
  });

  it("calcula remuneracao vigente por data", async () => {
    const service = new MilitarService(createRemuneracaoRepository() as never);

    await expect(service.getRemuneracao(militar.id, dataReferencia)).resolves.toMatchObject({
      militar: { id: militar.id, trigrama: "ABC" },
      pstGraduacao,
      soldo: { valor: 9976 },
      adicionais: {
        militar: { percentual: 19, valor: 1895.44 },
        disponibilidadeMilitar: { percentual: 12, valor: 1197.12 },
        habilitacao: { percentual: 12, valor: 1197.12 },
        tempoServico: { percentual: 5, valor: 498.8 },
        promocao: { percentual: 5, valor: 498.8 },
        comando: { percentual: 10, valor: 997.6 },
        compensacaoOrganica: { percentual: 10, valor: 673.7, baseSoldo: 6737 },
      },
      totalBruto: 16934.58,
    });
  });

  it("calcula remuneracao sem adicionais opcionais", async () => {
    const repository = {
      ...createRemuneracaoRepository(),
      findById: vi.fn().mockResolvedValue(militar),
      findSoldoVigente: vi.fn().mockResolvedValue({
        valor: 9976,
        vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
        pstGraduacao,
      }),
    };
    const service = new MilitarService(repository as never);

    const result = await service.getRemuneracao(militar.id, dataReferencia);

    expect(result.adicionais).toMatchObject({
      habilitacao: null,
      tempoServico: null,
      promocao: null,
      comando: null,
      compensacaoOrganica: null,
    });
    expect(repository.findHabilitacaoVigente).not.toHaveBeenCalled();
    expect(repository.findTempoServicoVigente).not.toHaveBeenCalled();
  });

  it("retorna erro quando nao encontra dados vigentes da remuneracao", async () => {
    const serviceSemPromocao = new MilitarService({
      ...createRemuneracaoRepository(),
      findPromocaoVigente: vi.fn().mockResolvedValue(null),
    } as never);
    await expect(serviceSemPromocao.getRemuneracao(militar.id, dataReferencia)).rejects.toMatchObject({
      codigo: "PROMOCAO_VIGENTE_NAO_ENCONTRADA",
      statusCode: 404,
    });

    const serviceSemSoldo = new MilitarService({
      ...createRemuneracaoRepository(),
      findSoldoVigente: vi.fn().mockResolvedValue(null),
    } as never);
    await expect(serviceSemSoldo.getRemuneracao(militar.id, dataReferencia)).rejects.toMatchObject({
      codigo: "SOLDO_VIGENTE_NAO_ENCONTRADO",
      statusCode: 404,
    });

    const serviceSemAdicional = new MilitarService({
      ...createRemuneracaoRepository(),
      findSoldoVigente: vi.fn().mockResolvedValue({
        valor: 9976,
        vigenciaInicio: new Date("2026-01-01T03:00:00.000Z"),
        pstGraduacao,
      }),
      findAdicionalMilitarVigente: vi.fn().mockResolvedValue(null),
    } as never);
    await expect(serviceSemAdicional.getRemuneracao(militar.id, dataReferencia)).rejects.toMatchObject({
      codigo: "ADICIONAL_MILITAR_VIGENTE_NAO_ENCONTRADO",
      statusCode: 404,
    });
  });
});
