import type { FastifyRequest } from "fastify";
import {
  tipoHabilitacaoCodigoParamsSchema,
  tipoHabilitacaoIdParamsSchema,
} from "./tipo-habilitacao.schemas";
import { TipoHabilitacaoService } from "./tipo-habilitacao.service";

export class TipoHabilitacaoController {
  constructor(private readonly service = new TipoHabilitacaoService()) {}

  list = async () => {
    return this.service.list();
  };

  findById = async (request: FastifyRequest) => {
    const params = tipoHabilitacaoIdParamsSchema.parse(request.params);
    return this.service.findById(params.id);
  };

  findByCodigo = async (request: FastifyRequest) => {
    const params = tipoHabilitacaoCodigoParamsSchema.parse(request.params);
    return this.service.findByCodigo(params.codigo);
  };
}
