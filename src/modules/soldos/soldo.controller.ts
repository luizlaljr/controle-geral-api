import type { FastifyReply, FastifyRequest } from "fastify";
import { soldoIdParamsSchema, soldoListQuerySchema, soldoTabelaSchema } from "./soldo.schemas";
import { SoldoService } from "./soldo.service";

export class SoldoController {
  constructor(private readonly service = new SoldoService()) {}

  createTabela = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = soldoTabelaSchema.parse(request.body);
    const result = await this.service.createTabela(body);
    return reply.status(201).send(result);
  };

  list = async (request: FastifyRequest) => {
    const query = soldoListQuerySchema.parse(request.query);
    return this.service.list(query);
  };

  findById = async (request: FastifyRequest) => {
    const params = soldoIdParamsSchema.parse(request.params);
    return this.service.findById(params.id);
  };
}
