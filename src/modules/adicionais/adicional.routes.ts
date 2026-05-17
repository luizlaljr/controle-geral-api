import type { FastifyPluginAsync } from "fastify";
import { AdicionalController } from "./adicional.controller";

const adicionalPorOrdemResponse = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    pstGraduacaoOrdem: { type: "integer", example: 1 },
    percentual: { type: "number", example: 28.0 },
    vigenciaInicio: { type: "string", format: "date-time" },
    observacao: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    pstGraduacao: {
      type: "object",
      properties: {
        ordem: { type: "integer" },
        abreviacao: { type: "string" },
        nome: { type: "string" },
      },
    },
  },
};

const adicionalHabilitacaoResponse = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    tipoHabilitacaoId: { type: "string", format: "uuid" },
    percentual: { type: "number", example: 73.0 },
    vigenciaInicio: { type: "string", format: "date-time" },
    observacao: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
    tipoHabilitacao: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid" },
        codigo: { type: "string" },
        nome: { type: "string" },
        ativo: { type: "boolean" },
      },
    },
  },
};

const adicionalSimplesResponse = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    percentual: { type: "number", example: 5.0 },
    vigenciaInicio: { type: "string", format: "date-time" },
    observacao: { type: "string", nullable: true },
    createdAt: { type: "string", format: "date-time" },
  },
};

const tabelaPorOrdemBody = {
  type: "object",
  required: ["vigencia_inicio", "itens"],
  properties: {
    vigencia_inicio: { type: "string", example: "2020-01-01 00:00:00-03:00" },
    observacao: { type: "string" },
    itens: {
      type: "array",
      items: {
        type: "object",
        required: ["ordem", "percentual"],
        properties: {
          ordem: { type: "integer", example: 1 },
          percentual: { type: "number", example: 28.0 },
        },
      },
    },
  },
};

const tabelaSimplesBody = {
  type: "object",
  required: ["vigencia_inicio", "percentual"],
  properties: {
    vigencia_inicio: { type: "string", example: "2020-01-01 00:00:00-03:00" },
    observacao: { type: "string" },
    percentual: { type: "number", example: 5.0 },
  },
};

const listQuery = {
  type: "object",
  properties: {
    data: { type: "string", example: "2026-01-01" },
    ordem: { type: "integer", minimum: 1 },
  },
};

const simpleListQuery = {
  type: "object",
  properties: {
    data: { type: "string", example: "2026-01-01" },
  },
};

export const adicionalRoutes: FastifyPluginAsync = async (app) => {
  const controller = new AdicionalController();

  app.get("/adicionais/militar", { schema: { tags: ["Adicionais"], querystring: listQuery } }, controller.listAdicionalMilitar);
  app.post(
    "/adicionais/militar/tabela",
    { schema: { tags: ["Adicionais"], body: tabelaPorOrdemBody, response: { 201: { type: "array", items: adicionalPorOrdemResponse } } } },
    controller.createAdicionalMilitar,
  );

  app.get(
    "/adicionais/disponibilidade-militar",
    { schema: { tags: ["Adicionais"], querystring: listQuery } },
    controller.listDisponibilidadeMilitar,
  );
  app.post(
    "/adicionais/disponibilidade-militar/tabela",
    { schema: { tags: ["Adicionais"], body: tabelaPorOrdemBody, response: { 201: { type: "array", items: adicionalPorOrdemResponse } } } },
    controller.createDisponibilidadeMilitar,
  );

  app.get("/adicionais/habilitacao", { schema: { tags: ["Adicionais"], querystring: simpleListQuery } }, controller.listHabilitacao);
  app.post(
    "/adicionais/habilitacao/tabela",
    {
      schema: {
        tags: ["Adicionais"],
        body: {
          type: "object",
          required: ["vigencia_inicio", "itens"],
          properties: {
            vigencia_inicio: { type: "string" },
            observacao: { type: "string" },
            itens: {
              type: "array",
              items: {
                type: "object",
                required: ["codigo", "nome", "percentual"],
                properties: {
                  codigo: { type: "string" },
                  nome: { type: "string" },
                  percentual: { type: "number" },
                },
              },
            },
          },
        },
        response: { 201: { type: "array", items: adicionalHabilitacaoResponse } },
      },
    },
    controller.createHabilitacao,
  );

  app.get("/adicionais/tempo-servico", { schema: { tags: ["Adicionais"], querystring: simpleListQuery } }, controller.listTempoServico);
  app.post(
    "/adicionais/tempo-servico/tabela",
    { schema: { tags: ["Adicionais"], body: tabelaSimplesBody, response: { 201: { type: "array", items: adicionalSimplesResponse } } } },
    controller.createTempoServico,
  );

  app.get("/adicionais/promocao", { schema: { tags: ["Adicionais"], querystring: simpleListQuery } }, controller.listPromocao);
  app.post(
    "/adicionais/promocao/tabela",
    { schema: { tags: ["Adicionais"], body: tabelaSimplesBody, response: { 201: { type: "array", items: adicionalSimplesResponse } } } },
    controller.createPromocao,
  );

  app.get("/adicionais/comando", { schema: { tags: ["Adicionais"], querystring: simpleListQuery } }, controller.listComando);
  app.post(
    "/adicionais/comando/tabela",
    { schema: { tags: ["Adicionais"], body: tabelaSimplesBody, response: { 201: { type: "array", items: adicionalSimplesResponse } } } },
    controller.createComando,
  );
};
