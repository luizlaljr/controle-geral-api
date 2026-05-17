import type { FastifyReply, FastifyRequest } from "fastify";
import {
  adicionalHabilitacaoTabelaSchema,
  adicionalListQuerySchema,
  adicionalPorOrdemTabelaSchema,
  adicionalSimplesTabelaSchema,
} from "./adicional.schemas";
import { AdicionalService } from "./adicional.service";

export class AdicionalController {
  constructor(private readonly service = new AdicionalService()) {}

  createAdicionalMilitar = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = adicionalPorOrdemTabelaSchema.parse(request.body);
    return reply.status(201).send(await this.service.createAdicionalMilitar(body));
  };

  listAdicionalMilitar = async (request: FastifyRequest) => {
    const query = adicionalListQuerySchema.parse(request.query);
    return this.service.listAdicionalMilitar(query);
  };

  createDisponibilidadeMilitar = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = adicionalPorOrdemTabelaSchema.parse(request.body);
    return reply.status(201).send(await this.service.createDisponibilidadeMilitar(body));
  };

  listDisponibilidadeMilitar = async (request: FastifyRequest) => {
    const query = adicionalListQuerySchema.parse(request.query);
    return this.service.listDisponibilidadeMilitar(query);
  };

  createHabilitacao = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = adicionalHabilitacaoTabelaSchema.parse(request.body);
    return reply.status(201).send(await this.service.createHabilitacao(body));
  };

  listHabilitacao = async (request: FastifyRequest) => {
    const query = adicionalListQuerySchema.pick({ data: true }).parse(request.query);
    return this.service.listHabilitacao(query);
  };

  createTempoServico = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = adicionalSimplesTabelaSchema.parse(request.body);
    return reply.status(201).send(await this.service.createTempoServico(body));
  };

  listTempoServico = async (request: FastifyRequest) => {
    const query = adicionalListQuerySchema.pick({ data: true }).parse(request.query);
    return this.service.listTempoServico(query);
  };

  createPromocao = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = adicionalSimplesTabelaSchema.parse(request.body);
    return reply.status(201).send(await this.service.createPromocao(body));
  };

  listPromocao = async (request: FastifyRequest) => {
    const query = adicionalListQuerySchema.pick({ data: true }).parse(request.query);
    return this.service.listPromocao(query);
  };

  createComando = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = adicionalSimplesTabelaSchema.parse(request.body);
    return reply.status(201).send(await this.service.createComando(body));
  };

  listComando = async (request: FastifyRequest) => {
    const query = adicionalListQuerySchema.pick({ data: true }).parse(request.query);
    return this.service.listComando(query);
  };
}
