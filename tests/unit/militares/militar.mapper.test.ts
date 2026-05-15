import { describe, expect, it } from "vitest";
import { createInputToPrisma, toPublic } from "../../../src/modules/militares/militar.mapper";

describe("militar.mapper", () => {
  it("converte input camelCase para campos Prisma e uppercase", () => {
    expect(
      createInputToPrisma({
        trigrama: "abc",
        nomeCompleto: "Joao da Silva",
        cpf: "12345678901",
        contaCorrente: "123-4",
      }),
    ).toMatchObject({
      trigrama: "ABC",
      nomeCompleto: "Joao da Silva",
      contaCorrente: "123-4",
      temDependente: false,
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
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });
});
