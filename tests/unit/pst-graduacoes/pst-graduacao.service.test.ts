import { describe, expect, it, vi } from "vitest";
import { PstGraduacaoService } from "../../../src/modules/pst-graduacoes/pst-graduacao.service";
import type { PstGraduacao } from "../../../src/modules/pst-graduacoes/pst-graduacao.types";
import { AppError } from "../../../src/shared/errors/AppError";

const pstGraduacao: PstGraduacao = {
  ordem: 1,
  abreviacao: "Ten Brig Ar",
  nome: "Tenente-Brigadeiro do Ar",
};

describe("PstGraduacaoService", () => {
  it("lista postos e graduacoes", async () => {
    const service = new PstGraduacaoService({
      findMany: vi.fn().mockResolvedValue([pstGraduacao]),
    } as never);

    await expect(service.list()).resolves.toEqual([pstGraduacao]);
  });

  it("busca posto ou graduacao por ordem", async () => {
    const service = new PstGraduacaoService({
      findByOrdem: vi.fn().mockResolvedValue(pstGraduacao),
    } as never);

    await expect(service.findByOrdem(1)).resolves.toEqual(pstGraduacao);
  });

  it("retorna erro quando posto ou graduacao nao existe", async () => {
    const service = new PstGraduacaoService({
      findByOrdem: vi.fn().mockResolvedValue(null),
    } as never);

    await expect(service.findByOrdem(99)).rejects.toBeInstanceOf(AppError);
    await expect(service.findByOrdem(99)).rejects.toMatchObject({
      codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
      statusCode: 404,
    });
  });
});
