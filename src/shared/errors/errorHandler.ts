import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { logger } from "../../infra/observability/logger";
import { AppError } from "./AppError";

function requestIdFrom(request: FastifyRequest): string {
  return request.id;
}

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  const requestId = requestIdFrom(request);

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      erro: {
        codigo: error.codigo,
        mensagem: error.message,
        detalhes: error.detalhes,
        requestId,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      erro: {
        codigo: "ERRO_VALIDACAO",
        mensagem: "Erro de validacao",
        detalhes: error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensagem: issue.message,
        })),
        requestId,
      },
    });
    return;
  }

  const fastifyError = error as FastifyError & { statusCode?: number; code?: string };

  if (fastifyError.code === "FST_ERR_VALIDATION") {
    reply.status(400).send({
      erro: {
        codigo: "ERRO_VALIDACAO",
        mensagem: "Erro de validacao",
        detalhes:
          fastifyError.validation?.map((issue) => ({
            campo: issue.instancePath || issue.schemaPath,
            mensagem: issue.message ?? "Entrada invalida",
          })) ?? [],
        requestId,
      },
    });
    return;
  }

  if (fastifyError.code === "FST_ERR_CTP_INVALID_JSON_BODY") {
    reply.status(400).send({
      erro: {
        codigo: "JSON_INVALIDO",
        mensagem: "JSON invalido",
        detalhes: [],
        requestId,
      },
    });
    return;
  }

  if (fastifyError.statusCode === 413) {
    reply.status(413).send({
      erro: {
        codigo: "PAYLOAD_MUITO_GRANDE",
        mensagem: "Payload muito grande",
        detalhes: [],
        requestId,
      },
    });
    return;
  }

  if (fastifyError.statusCode === 429) {
    reply.status(429).send({
      erro: {
        codigo: "LIMITE_REQUISICOES_EXCEDIDO",
        mensagem: "Limite de requisicoes excedido",
        detalhes: [],
        requestId,
      },
    });
    return;
  }

  logger.error({ err: error, requestId }, "unhandled error");

  reply.status(500).send({
    erro: {
      codigo: "ERRO_INTERNO",
      mensagem: "Erro interno",
      detalhes: [],
      requestId,
    },
  });
}
