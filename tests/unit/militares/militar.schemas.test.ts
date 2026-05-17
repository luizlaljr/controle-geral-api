import { describe, expect, it } from "vitest";
import { militarCreateSchema, militarRemuneracaoQuerySchema } from "../../../src/modules/militares/militar.schemas";

describe("militarCreateSchema", () => {
  it("normaliza trigrama para uppercase e aplica temDependente default false", () => {
    const result = militarCreateSchema.parse({
      trigrama: "abc",
      nomeCompleto: "Joao da Silva",
      cpf: "12345678901",
    });

    expect(result.trigrama).toBe("ABC");
    expect(result.temDependente).toBe(false);
  });

  it("rejeita trigrama diferente de 3 caracteres", () => {
    expect(() =>
      militarCreateSchema.parse({
        trigrama: "AB",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
      }),
    ).toThrow();
  });

  it("rejeita cpf sem 11 digitos", () => {
    expect(() =>
      militarCreateSchema.parse({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "123",
      }),
    ).toThrow();
  });

  it("rejeita saram com mais de 10 digitos", () => {
    expect(() =>
      militarCreateSchema.parse({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
        saram: "12345678901",
      }),
    ).toThrow();
  });

  it("rejeita email invalido", () => {
    expect(() =>
      militarCreateSchema.parse({
        trigrama: "ABC",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
        email: "email-invalido",
      }),
    ).toThrow();
  });

  it("aceita compensacao organica com base", () => {
    const result = militarCreateSchema.parse({
      trigrama: "abc",
      nomeCompleto: "Joao da Silva",
      cpf: "12345678901",
      adicionalCompensacaoOrganicaPercentual: 10,
      adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 7,
    });

    expect(result).toMatchObject({
      adicionalCompensacaoOrganicaPercentual: 10,
      adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: 7,
    });
  });

  it("valida query de remuneracao por data", () => {
    const result = militarRemuneracaoQuerySchema.parse({ data: "2026-02-01" });

    expect(result.data).toBeInstanceOf(Date);
    expect(() => militarRemuneracaoQuerySchema.parse({ data: "data-invalida" })).toThrow();
  });
});
