import type { FastifyPluginAsync } from "fastify";
import { PstGraduacaoController } from "./pst-graduacao.controller";

const pstGraduacaoResponse = {
  type: "object",
  properties: {
    ordem: { type: "integer", example: 1 },
    abreviacao: { type: "string", example: "Ten Brig Ar" },
    nome: { type: "string", example: "Tenente-Brigadeiro do Ar" },
  },
};

export const pstGraduacaoRoutes: FastifyPluginAsync = async (app) => {
  const controller = new PstGraduacaoController();

  app.get(
    "/pst-graduacoes",
    {
      schema: {
        tags: ["Postos e graduacoes"],
        summary: "Lista postos e graduacoes",
        description: "Lista de postos e graduacoes populada por migration.",
        response: {
          200: {
            type: "array",
            items: pstGraduacaoResponse,
          },
        },
      },
    },
    controller.list,
  );

  app.get(
    "/pst-graduacoes/:ordem",
    {
      schema: {
        tags: ["Postos e graduacoes"],
        summary: "Busca posto ou graduacao por ordem",
        params: {
          type: "object",
          required: ["ordem"],
          properties: {
            ordem: { type: "integer", minimum: 1 },
          },
        },
        response: { 200: pstGraduacaoResponse },
      },
    },
    controller.findByOrdem,
  );
};
