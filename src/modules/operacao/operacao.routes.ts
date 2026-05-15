import type { FastifyPluginAsync } from "fastify";
import packageJson from "../../../package.json";
import { env } from "../../config/env";
import { prisma } from "../../infra/database/prisma";

export const operacaoRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        response: {
          200: {
            type: "object",
            properties: {
              ok: { type: "boolean" },
              servico: { type: "string" },
              timestamp: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      ok: true,
      servico: "controle-geral-api",
      timestamp: new Date().toISOString(),
    }),
  );

  app.get(
    "/ready",
    {
      schema: {
        tags: ["Operacao"],
        summary: "Readiness check",
      },
    },
    async (_request, reply) => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return {
          ok: true,
          servico: "controle-geral-api",
          timestamp: new Date().toISOString(),
        };
      } catch {
        return reply.status(503).send({
          ok: false,
          servico: "controle-geral-api",
          timestamp: new Date().toISOString(),
        });
      }
    },
  );

  app.get(
    "/version",
    {
      schema: {
        tags: ["Operacao"],
        summary: "Service version",
      },
    },
    async () => ({
      servico: "controle-geral-api",
      versao: packageJson.version,
      ambiente: env.NODE_ENV,
      commit: env.GIT_SHA,
      timestamp: new Date().toISOString(),
    }),
  );
};
