import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { AdicionalService } from "../../../src/modules/adicionais/adicional.service";
import type {
  AdicionalHabilitacao,
  AdicionalPorOrdem,
  AdicionalSimples,
} from "../../../src/modules/adicionais/adicional.types";
import { AppError } from "../../../src/shared/errors/AppError";

const adicionalPorOrdem: AdicionalPorOrdem = {
  id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
  pstGraduacaoOrdem: 1,
  percentual: 28,
  vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
  observacao: "Tabela inicial",
  createdAt: new Date("2020-01-01T03:00:00.000Z"),
  pstGraduacao: {
    ordem: 1,
    abreviacao: "Ten Brig Ar",
    nome: "Tenente-Brigadeiro do Ar",
  },
};

const adicionalSimples: AdicionalSimples = {
  id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
  percentual: 5,
  vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
  observacao: "Tabela inicial",
  createdAt: new Date("2020-01-01T03:00:00.000Z"),
};

const adicionalHabilitacao: AdicionalHabilitacao = {
  id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f3",
  tipoHabilitacaoId: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f4",
  percentual: 12,
  vigenciaInicio: new Date("2020-01-01T03:00:00.000Z"),
  observacao: "Tabela inicial",
  createdAt: new Date("2020-01-01T03:00:00.000Z"),
  tipoHabilitacao: {
    id: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f4",
    codigo: "FORMACAO",
    nome: "Formacao",
    ativo: true,
  },
};

describe("AdicionalService", () => {
  it("lista e cria adicional militar", async () => {
    const repository = {
      findAdicionalMilitar: vi.fn().mockResolvedValue([adicionalPorOrdem]),
      createAdicionalMilitar: vi.fn().mockResolvedValue([adicionalPorOrdem]),
    };
    const service = new AdicionalService(repository as never);

    await expect(service.listAdicionalMilitar({ data: new Date("2020-01-01T03:00:00.000Z") })).resolves.toEqual([
      expect.objectContaining({ percentual: 28 }),
    ]);
    await expect(
      service.createAdicionalMilitar({
        vigenciaInicio: new Date("2021-01-01T03:00:00.000Z"),
        itens: [{ ordem: 1, percentual: 29 }],
      }),
    ).resolves.toEqual([expect.objectContaining({ percentual: 28 })]);
  });

  it("lista e cria adicionais simples", async () => {
    const repository = {
      findTempoServico: vi.fn().mockResolvedValue([adicionalSimples]),
      createTempoServico: vi.fn().mockResolvedValue([adicionalSimples]),
      findPromocao: vi.fn().mockResolvedValue([adicionalSimples]),
      createPromocao: vi.fn().mockResolvedValue([adicionalSimples]),
      findComando: vi.fn().mockResolvedValue([adicionalSimples]),
      createComando: vi.fn().mockResolvedValue([adicionalSimples]),
    };
    const service = new AdicionalService(repository as never);

    await expect(service.listTempoServico({})).resolves.toHaveLength(1);
    await expect(service.createTempoServico({ vigenciaInicio: new Date(), percentual: 5 })).resolves.toHaveLength(1);
    await expect(service.listPromocao({})).resolves.toHaveLength(1);
    await expect(service.createPromocao({ vigenciaInicio: new Date(), percentual: 5 })).resolves.toHaveLength(1);
    await expect(service.listComando({})).resolves.toHaveLength(1);
    await expect(service.createComando({ vigenciaInicio: new Date(), percentual: 10 })).resolves.toHaveLength(1);
  });

  it("lista e cria disponibilidade e habilitacao", async () => {
    const repository = {
      findDisponibilidadeMilitar: vi.fn().mockResolvedValue([adicionalPorOrdem]),
      createDisponibilidadeMilitar: vi.fn().mockResolvedValue([adicionalPorOrdem]),
      findHabilitacao: vi.fn().mockResolvedValue([adicionalHabilitacao]),
      createHabilitacao: vi.fn().mockResolvedValue([adicionalHabilitacao]),
    };
    const service = new AdicionalService(repository as never);

    await expect(service.listDisponibilidadeMilitar({})).resolves.toHaveLength(1);
    await expect(
      service.createDisponibilidadeMilitar({
        vigenciaInicio: new Date(),
        itens: [{ ordem: 1, percentual: 41 }],
      }),
    ).resolves.toHaveLength(1);
    await expect(service.listHabilitacao({})).resolves.toHaveLength(1);
    await expect(
      service.createHabilitacao({
        vigenciaInicio: new Date(),
        itens: [{ codigo: "FORMACAO", nome: "Formacao", percentual: 12 }],
      }),
    ).resolves.toHaveLength(1);
  });

  it("traduz erros Prisma conhecidos", async () => {
    const service = new AdicionalService({
      createAdicionalMilitar: vi.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint", {
          code: "P2002",
          clientVersion: "test",
        }),
      ),
    } as never);

    await expect(
      service.createAdicionalMilitar({
        vigenciaInicio: new Date(),
        itens: [{ ordem: 1, percentual: 28 }],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("traduz erro de referencia Prisma", async () => {
    const service = new AdicionalService({
      createDisponibilidadeMilitar: vi.fn().mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Foreign key", {
          code: "P2003",
          clientVersion: "test",
        }),
      ),
    } as never);

    await expect(
      service.createDisponibilidadeMilitar({
        vigenciaInicio: new Date(),
        itens: [{ ordem: 99, percentual: 28 }],
      }),
    ).rejects.toMatchObject({ codigo: "REFERENCIA_INVALIDA" });
  });

  it("repassa erros desconhecidos", async () => {
    const error = new Error("falha externa");
    const service = new AdicionalService({
      createComando: vi.fn().mockRejectedValue(error),
    } as never);

    await expect(service.createComando({ vigenciaInicio: new Date(), percentual: 10 })).rejects.toBe(error);
  });

  it("repassa erros desconhecidos de habilitacao e tempo de servico", async () => {
    const error = new Error("falha externa");
    const service = new AdicionalService({
      createHabilitacao: vi.fn().mockRejectedValue(error),
      createTempoServico: vi.fn().mockRejectedValue(error),
    } as never);

    await expect(
      service.createHabilitacao({
        vigenciaInicio: new Date(),
        itens: [{ codigo: "FORMACAO", nome: "Formacao", percentual: 12 }],
      }),
    ).rejects.toBe(error);
    await expect(service.createTempoServico({ vigenciaInicio: new Date(), percentual: 5 })).rejects.toBe(error);
  });

  it("normaliza erro desconhecido nao Error", async () => {
    const service = new AdicionalService({
      createPromocao: vi.fn().mockRejectedValue("falha"),
    } as never);

    await expect(service.createPromocao({ vigenciaInicio: new Date(), percentual: 5 })).rejects.toThrow(
      "Erro desconhecido",
    );
  });
});
