import { describe, expect, it } from "vitest";
import { promocaoCreateSchema, promocaoMilitarParamsSchema } from "../../../src/modules/promocoes/promocao.schemas";

describe("promocao.schemas", () => {
  it("valida cadastro de promocao", () => {
    const result = promocaoCreateSchema.parse({
      pst_graduacao_ordem: 7,
      data_promocao: "2026-01-01",
    });

    expect(result.pstGraduacaoOrdem).toBe(7);
    expect(result.dataPromocao).toBeInstanceOf(Date);
  });

  it("rejeita entrada invalida", () => {
    expect(() => promocaoMilitarParamsSchema.parse({ id: "invalido" })).toThrow();
    expect(() =>
      promocaoCreateSchema.parse({
        pst_graduacao_ordem: 0,
        data_promocao: "data-invalida",
      }),
    ).toThrow();
  });
});
