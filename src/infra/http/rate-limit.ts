import rateLimit from "@fastify/rate-limit";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { env } from "../../config/env";

export const rateLimitPlugin: FastifyPluginAsync = fp(async (app) => {
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    errorResponseBuilder(request) {
      return {
        statusCode: 429,
        erro: {
          codigo: "LIMITE_REQUISICOES_EXCEDIDO",
          mensagem: "Limite de requisicoes excedido",
          detalhes: [],
          requestId: request.id,
        },
      };
    },
  });
});
