import type { FastifyReply, FastifyRequest } from "fastify";
import { MilitarService } from "./militar.service";
import {
  idParamsSchema,
  militarCreateSchema,
  militarListQuerySchema,
  militarRemuneracaoQuerySchema,
  militarUpdateSchema,
  trigramaParamsSchema,
} from "./militar.schemas";

export class MilitarController {
  constructor(private readonly service = new MilitarService()) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = militarCreateSchema.parse(request.body);
    const militar = await this.service.create(body);
    return reply.status(201).send(militar);
  };

  list = async (request: FastifyRequest) => {
    const query = militarListQuerySchema.parse(request.query);
    return this.service.list(query);
  };

  findById = async (request: FastifyRequest) => {
    const params = idParamsSchema.parse(request.params);
    return this.service.findById(params.id);
  };

  findByTrigrama = async (request: FastifyRequest) => {
    const params = trigramaParamsSchema.parse(request.params);
    return this.service.findByTrigrama(params.trigrama);
  };

  getRemuneracao = async (request: FastifyRequest) => {
    const params = idParamsSchema.parse(request.params);
    const query = militarRemuneracaoQuerySchema.parse(request.query);
    return this.service.getRemuneracao(params.id, query.data);
  };

  update = async (request: FastifyRequest) => {
    const params = idParamsSchema.parse(request.params);
    const body = militarUpdateSchema.parse(request.body);
    return this.service.update(params.id, body);
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = idParamsSchema.parse(request.params);
    await this.service.delete(params.id);
    return reply.status(204).send();
  };
}
