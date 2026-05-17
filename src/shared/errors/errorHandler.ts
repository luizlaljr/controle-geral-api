import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError, type ZodIssue } from "zod";
import { logger } from "../../infra/observability/logger";
import { AppError } from "./AppError";

function requestIdFrom(request: FastifyRequest): string {
  return request.id;
}

function valueAtPath(input: unknown, path: Array<string | number>): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string | number, unknown>)[key];
  }, input);
}

function formatReceived(value: unknown): unknown {
  return value === undefined ? "ausente" : value;
}

function zodExpected(issue: ZodIssue): string {
  const detail = issue as ZodIssue & {
    expected?: string;
    validation?: string;
    options?: unknown[];
  };

  if (issue.code === "invalid_type" && detail.expected) {
    return detail.expected;
  }

  if (issue.code === "invalid_string" && detail.validation) {
    return detail.validation === "regex" ? issue.message : `${detail.validation} valido`;
  }

  if (issue.code === "invalid_enum_value" && detail.options) {
    return `um dos valores: ${detail.options.join(", ")}`;
  }

  return issue.message;
}

function formatZodIssues(error: ZodError, input: unknown) {
  return error.issues.map((issue) => ({
    campo: issue.path.join(".") || "body",
    mensagem: issue.message,
    recebido: formatReceived(valueAtPath(input, issue.path)),
    esperado: zodExpected(issue),
  }));
}

function jsonPointerPath(path: string): Array<string | number> {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      const value = segment.replaceAll("~1", "/").replaceAll("~0", "~");
      const numberValue = Number(value);
      return Number.isInteger(numberValue) && value.trim() !== "" ? numberValue : value;
    });
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
        detalhes: formatZodIssues(error, request.body),
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
          fastifyError.validation?.map((issue) => {
            const path = issue.instancePath ? jsonPointerPath(issue.instancePath) : [];
            const missingProperty =
              "params" in issue && typeof issue.params === "object" && issue.params !== null
                ? (issue.params as { missingProperty?: string }).missingProperty
                : undefined;
            const fieldPath = missingProperty ? [...path, missingProperty] : path;

            return {
              campo: fieldPath.join(".") || issue.schemaPath,
              mensagem: issue.message ?? "Entrada invalida",
              recebido: formatReceived(valueAtPath(request.body, fieldPath)),
              esperado: issue.message ?? "Entrada valida",
            };
          }) ?? [],
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
