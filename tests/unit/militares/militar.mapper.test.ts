import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createInputToPrisma, toDomain, toPublic, updateInputToPrisma } from "../../../src/modules/militares/militar.mapper";

const militarBase = {
  tipoHabilitacaoId: null,
  adicionalCompensacaoOrganicaPercentual: 0,
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: null,
  temAdicionalTempoServico: false,
  temAdicionalPromocao: false,
  temAdicionalComando: false,
};

describe("militar.mapper", () => {
  it("converte input camelCase para campos Prisma e uppercase", () => {
    expect(
      createInputToPrisma({
        trigrama: "abc",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
        nomeGuerra: "Silva",
        saram: "1234567",
        email: "joao.silva@example.com",
        banco: "Banco",
        agencia: "0001",
        contaCorrente: "123-4",
        temDependente: true,
        tipoHabilitacaoId: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
        adicionalCompensacaoOrganicaPercentual: 10,
      adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 7,
      temAdicionalTempoServico: true,
      temAdicionalPromocao: true,
      temAdicionalComando: true,
    }),
    ).toMatchObject({
      trigrama: "ABC",
      nomeCompleto: "Joao da Silva",
      nomeGuerra: "Silva",
      saram: "1234567",
      email: "joao.silva@example.com",
      banco: "Banco",
      agencia: "0001",
      contaCorrente: "123-4",
      temDependente: true,
      tipoHabilitacaoId: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
      adicionalCompensacaoOrganicaPercentual: "10.00",
      adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 7,
      temAdicionalTempoServico: true,
      temAdicionalPromocao: true,
      temAdicionalComando: true,
    });
  });

  it("aplica defaults e omite opcionais ausentes no create", () => {
    const result = createInputToPrisma({
      trigrama: "abc",
      nomeCompleto: "Joao da Silva",
      cpf: "12345678901",
    });

    expect(result).toStrictEqual({
      trigrama: "ABC",
      nomeCompleto: "Joao da Silva",
      cpf: "12345678901",
      temDependente: false,
      adicionalCompensacaoOrganicaPercentual: "0.00",
      temAdicionalTempoServico: false,
      temAdicionalPromocao: false,
      temAdicionalComando: false,
    });
  });

  it("converte update parcial sem enviar undefined", () => {
    expect(updateInputToPrisma({})).toStrictEqual({});
    expect(
      updateInputToPrisma({
        trigrama: "xyz",
        nomeCompleto: "Joao Atualizado",
        nomeGuerra: "Atual",
        cpf: "12345678902",
        saram: "7654321",
        email: "atual@example.com",
        banco: "Banco 2",
        agencia: "0002",
        contaCorrente: "987-6",
        temDependente: false,
        tipoHabilitacaoId: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
        adicionalCompensacaoOrganicaPercentual: 12.5,
        adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 4,
        temAdicionalTempoServico: true,
        temAdicionalPromocao: true,
        temAdicionalComando: true,
      }),
    ).toStrictEqual({
      trigrama: "XYZ",
      nomeCompleto: "Joao Atualizado",
      nomeGuerra: "Atual",
      cpf: "12345678902",
      saram: "7654321",
      email: "atual@example.com",
      banco: "Banco 2",
      agencia: "0002",
      contaCorrente: "987-6",
      temDependente: false,
      tipoHabilitacaoId: "8d0b9f3d-c4fb-4af0-94d9-dc54957ee1f2",
      adicionalCompensacaoOrganicaPercentual: "12.50",
      adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 4,
      temAdicionalTempoServico: true,
      temAdicionalPromocao: true,
      temAdicionalComando: true,
    });
  });

  it("serializa datas para resposta publica", () => {
    const result = toPublic({
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
      ...militarBase,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("mantem objeto de dominio sem alteracao", () => {
    const militar = {
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
      adicionalCompensacaoOrganicaPercentual: new Prisma.Decimal("0.00"),
      adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: null,
      temAdicionalTempoServico: false,
      temAdicionalPromocao: false,
      temAdicionalComando: false,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    expect(toDomain(militar)).toMatchObject({
      adicionalCompensacaoOrganicaPercentual: 0,
      trigrama: "ABC",
    });
  });
});
