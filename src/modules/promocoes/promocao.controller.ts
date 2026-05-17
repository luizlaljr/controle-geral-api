import type { FastifyReply, FastifyRequest } from "fastify";
import { promocaoCreateSchema, promocaoMilitarParamsSchema } from "./promocao.schemas";
import { PromocaoService } from "./promocao.service";

export class PromocaoController {
  constructor(private readonly service = new PromocaoService()) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = promocaoMilitarParamsSchema.parse(request.params);
    const body = promocaoCreateSchema.parse(request.body);

    const promocao = await this.service.create({
      militarId: params.id,
      ...body,
    });

    return reply.status(201).send(promocao);
  };

  listByMilitarId = async (request: FastifyRequest) => {
    const params = promocaoMilitarParamsSchema.parse(request.params);
    return this.service.listByMilitarId(params.id);
  };
}
