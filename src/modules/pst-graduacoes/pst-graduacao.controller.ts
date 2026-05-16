import type { FastifyRequest } from "fastify";
import { pstGraduacaoOrdemParamsSchema } from "./pst-graduacao.schemas";
import { PstGraduacaoService } from "./pst-graduacao.service";

export class PstGraduacaoController {
  constructor(private readonly service = new PstGraduacaoService()) {}

  list = async () => {
    return this.service.list();
  };

  findByOrdem = async (request: FastifyRequest) => {
    const params = pstGraduacaoOrdemParamsSchema.parse(request.params);
    return this.service.findByOrdem(params.ordem);
  };
}
