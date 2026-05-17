import type { FastifyPluginAsync } from "fastify";
import { TipoHabilitacaoController } from "./tipo-habilitacao.controller";

const tipoHabilitacaoResponse = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    codigo: { type: "string", example: "FORMACAO" },
    nome: { type: "string", example: "Formacao" },
  },
};

export const tipoHabilitacaoRoutes: FastifyPluginAsync = async (app) => {
  const controller = new TipoHabilitacaoController();

  app.get(
    "/tipos-habilitacao",
    {
      schema: {
        tags: ["Tipos de habilitacao"],
        summary: "Lista tipos de habilitacao",
        description: "Lista de tipos de habilitacao populada por migration.",
        response: {
          200: {
            type: "array",
            items: tipoHabilitacaoResponse,
          },
        },
      },
    },
    controller.list,
  );

  app.get(
    "/tipos-habilitacao/codigo/:codigo",
    {
      schema: {
        tags: ["Tipos de habilitacao"],
        summary: "Busca tipo de habilitacao por codigo",
        params: {
          type: "object",
          required: ["codigo"],
          properties: { codigo: { type: "string" } },
        },
        response: { 200: tipoHabilitacaoResponse },
      },
    },
    controller.findByCodigo,
  );

  app.get(
    "/tipos-habilitacao/:id",
    {
      schema: {
        tags: ["Tipos de habilitacao"],
        summary: "Busca tipo de habilitacao por id",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 200: tipoHabilitacaoResponse },
      },
    },
    controller.findById,
  );
};
