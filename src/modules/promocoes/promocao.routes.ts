import type { FastifyPluginAsync } from "fastify";
import { PromocaoController } from "./promocao.controller";

const pstGraduacaoResponse = {
  type: "object",
  properties: {
    ordem: { type: "integer", example: 7 },
    abreviacao: { type: "string", example: "Cap" },
    nome: { type: "string", example: "Capitao" },
  },
};

const promocaoResponse = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    militarId: { type: "string", format: "uuid" },
    pstGraduacaoOrdem: { type: "integer", example: 7 },
    dataPromocao: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    pstGraduacao: pstGraduacaoResponse,
  },
};

export const promocaoRoutes: FastifyPluginAsync = async (app) => {
  const controller = new PromocaoController();

  app.get(
    "/militares/:id/promocoes",
    {
      schema: {
        tags: ["Promocoes"],
        summary: "Lista promocoes do militar",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: {
          200: {
            type: "array",
            items: promocaoResponse,
          },
        },
      },
    },
    controller.listByMilitarId,
  );

  app.post(
    "/militares/:id/promocoes",
    {
      schema: {
        tags: ["Promocoes"],
        summary: "Cadastra promocao do militar",
        description: "Registra historico append-only de promocao do militar.",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["pst_graduacao_ordem", "data_promocao"],
          properties: {
            pst_graduacao_ordem: { type: "integer", minimum: 1, example: 7 },
            data_promocao: { type: "string", example: "2026-01-01" },
          },
        },
        response: { 201: promocaoResponse },
      },
    },
    controller.create,
  );
};
