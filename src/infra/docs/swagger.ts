import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import packageJson from "../../../package.json";

export const swaggerPlugin: FastifyPluginAsync = fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "controle-geral-api",
        description: "API REST para controle geral de militares.",
        version: packageJson.version,
      },
      tags: [
        { name: "Militares", description: "CRUD de militares" },
        { name: "Health", description: "Health check" },
        { name: "Operacao", description: "Endpoints operacionais" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
    staticCSP: true,
  });

});
