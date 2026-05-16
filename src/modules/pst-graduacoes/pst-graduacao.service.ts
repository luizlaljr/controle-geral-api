import { AppError } from "../../shared/errors/AppError";
import { PstGraduacaoRepository } from "./pst-graduacao.repository";
import type { PstGraduacao } from "./pst-graduacao.types";

export class PstGraduacaoService {
  constructor(private readonly repository = new PstGraduacaoRepository()) {}

  async list(): Promise<PstGraduacao[]> {
    return this.repository.findMany();
  }

  async findByOrdem(ordem: number): Promise<PstGraduacao> {
    const pstGraduacao = await this.repository.findByOrdem(ordem);

    if (!pstGraduacao) {
      throw new AppError({
        codigo: "PST_GRADUACAO_NAO_ENCONTRADA",
        mensagem: "Posto ou graduacao nao encontrado",
        statusCode: 404,
      });
    }

    return pstGraduacao;
  }
}
