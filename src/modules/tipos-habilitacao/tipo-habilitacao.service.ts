import { AppError } from "../../shared/errors/AppError";
import { TipoHabilitacaoRepository } from "./tipo-habilitacao.repository";
import type { TipoHabilitacao } from "./tipo-habilitacao.types";

export class TipoHabilitacaoService {
  constructor(private readonly repository = new TipoHabilitacaoRepository()) {}

  async list(): Promise<TipoHabilitacao[]> {
    return this.repository.findMany();
  }

  async findById(id: string): Promise<TipoHabilitacao> {
    const tipoHabilitacao = await this.repository.findById(id);

    if (!tipoHabilitacao) {
      throw this.notFound();
    }

    return tipoHabilitacao;
  }

  async findByCodigo(codigo: string): Promise<TipoHabilitacao> {
    const tipoHabilitacao = await this.repository.findByCodigo(codigo);

    if (!tipoHabilitacao) {
      throw this.notFound();
    }

    return tipoHabilitacao;
  }

  private notFound(): AppError {
    return new AppError({
      codigo: "TIPO_HABILITACAO_NAO_ENCONTRADO",
      mensagem: "Tipo de habilitacao nao encontrado",
      statusCode: 404,
    });
  }
}
