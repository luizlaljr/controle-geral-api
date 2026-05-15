import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";
import { errorHandler } from "../../../src/shared/errors/errorHandler";
import { AppError } from "../../../src/shared/errors/AppError";
import { logger } from "../../../src/infra/observability/logger";

function makeReply() {
  const reply = {
    status: vi.fn(),
    send: vi.fn(),
  };
  reply.status.mockReturnValue(reply);
  return reply;
}

const request = { id: "req-unit" };

describe("errorHandler", () => {
  it("serializa AppError", () => {
    const reply = makeReply();

    errorHandler(
      new AppError({
        codigo: "ERRO_TESTE",
        mensagem: "Erro teste",
        statusCode: 418,
        detalhes: [{ campo: "x", mensagem: "invalido" }],
      }),
      request as never,
      reply as never,
    );

    expect(reply.status).toHaveBeenCalledWith(418);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "ERRO_TESTE",
        mensagem: "Erro teste",
        detalhes: [{ campo: "x", mensagem: "invalido" }],
        requestId: "req-unit",
      },
    });
  });

  it("serializa ZodError", () => {
    const reply = makeReply();
    const error = new ZodError([{ code: "custom", path: ["campo"], message: "campo invalido" }]);

    errorHandler(error, request as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "ERRO_VALIDACAO",
        mensagem: "Erro de validacao",
        detalhes: [{ campo: "campo", mensagem: "campo invalido" }],
        requestId: "req-unit",
      },
    });
  });

  it("serializa erro de validacao do Fastify com fallback", () => {
    const reply = makeReply();
    const error = {
      code: "FST_ERR_VALIDATION",
      validation: [{ schemaPath: "#/required" }],
    };

    errorHandler(error as never, request as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "ERRO_VALIDACAO",
        mensagem: "Erro de validacao",
        detalhes: [{ campo: "#/required", mensagem: "Entrada invalida" }],
        requestId: "req-unit",
      },
    });
  });

  it("serializa validacao Fastify sem detalhes", () => {
    const reply = makeReply();

    errorHandler({ code: "FST_ERR_VALIDATION" } as never, request as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "ERRO_VALIDACAO",
        mensagem: "Erro de validacao",
        detalhes: [],
        requestId: "req-unit",
      },
    });
  });

  it("serializa JSON invalido", () => {
    const reply = makeReply();

    errorHandler({ code: "FST_ERR_CTP_INVALID_JSON_BODY" } as never, request as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      erro: { codigo: "JSON_INVALIDO", mensagem: "JSON invalido", detalhes: [], requestId: "req-unit" },
    });
  });

  it("serializa payload grande", () => {
    const reply = makeReply();

    errorHandler({ statusCode: 413 } as never, request as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(413);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "PAYLOAD_MUITO_GRANDE",
        mensagem: "Payload muito grande",
        detalhes: [],
        requestId: "req-unit",
      },
    });
  });

  it("serializa rate limit", () => {
    const reply = makeReply();

    errorHandler({ statusCode: 429 } as never, request as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(429);
    expect(reply.send).toHaveBeenCalledWith({
      erro: {
        codigo: "LIMITE_REQUISICOES_EXCEDIDO",
        mensagem: "Limite de requisicoes excedido",
        detalhes: [],
        requestId: "req-unit",
      },
    });
  });

  it("serializa erro inesperado", () => {
    const reply = makeReply();
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => undefined);

    errorHandler(new Error("falha"), request as never, reply as never);

    expect(errorSpy).toHaveBeenCalledWith(expect.objectContaining({ requestId: "req-unit" }), "unhandled error");
    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      erro: { codigo: "ERRO_INTERNO", mensagem: "Erro interno", detalhes: [], requestId: "req-unit" },
    });
  });
});
