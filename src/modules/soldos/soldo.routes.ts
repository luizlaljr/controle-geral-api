import type { FastifyPluginAsync } from "fastify";
import { SoldoController } from "./soldo.controller";

const pstGraduacaoResponse = {
  type: "object",
  properties: {
    ordem: { type: "integer", example: 1 },
    abreviacao: { type: "string", example: "Ten Brig Ar" },
    nome: { type: "string", example: "Tenente-Brigadeiro do Ar" },
  },
};

const soldoResponse = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    pstGraduacaoOrdem: { type: "integer", example: 1 },
    valor: { type: "number", example: 14711.0 },
    vigenciaInicio: { type: "string", format: "date-time" },
    observacao: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    pstGraduacao: pstGraduacaoResponse,
  },
};

export const soldoRoutes: FastifyPluginAsync = async (app) => {
  const controller = new SoldoController();

  app.post(
    "/soldos/tabela",
    {
      schema: {
        tags: ["Soldos"],
        summary: "Insere tabela de soldos",
        description: "Insere uma tabela completa de soldos por vigencia.",
        body: {
          type: "object",
          required: ["vigencia_inicio", "itens"],
          properties: {
            vigencia_inicio: { type: "string", example: "2026-01-01 00:00:00-03:00" },
            observacao: { type: "string", example: "Tabela de soldo vigente a partir de 01/01/2026" },
            itens: {
              type: "array",
              items: {
                type: "object",
                required: ["ordem", "valor"],
                properties: {
                  ordem: { type: "integer", example: 1 },
                  valor: { type: "number", example: 14711.0 },
                },
              },
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              total: { type: "integer", example: 20 },
              dados: { type: "array", items: soldoResponse },
            },
          },
        },
      },
    },
    controller.createTabela,
  );

  app.get(
    "/soldos",
    {
      schema: {
        tags: ["Soldos"],
        summary: "Lista soldos",
        querystring: {
          type: "object",
          properties: {
            data: { type: "string", example: "2026-01-01" },
            ordem: { type: "integer", minimum: 1 },
          },
        },
        response: {
          200: {
            type: "array",
            items: soldoResponse,
          },
        },
      },
    },
    controller.list,
  );

  app.get(
    "/soldos/:id",
    {
      schema: {
        tags: ["Soldos"],
        summary: "Busca soldo por id",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 200: soldoResponse },
      },
    },
    controller.findById,
  );
};
