import type { FastifyPluginAsync } from "fastify";
import { MilitarController } from "./militar.controller";

const militarProperties = {
  id: { type: "string", format: "uuid" },
  trigrama: { type: "string", example: "ABC" },
  nomeCompleto: { type: "string", example: "Joao da Silva" },
  nomeGuerra: { type: "string", nullable: true, example: "SILVA" },
  cpf: { type: "string", example: "12345678901" },
  saram: { type: "string", nullable: true, example: "1234567" },
  email: { type: "string", nullable: true, example: "joao.silva@example.com" },
  banco: { type: "string", nullable: true, example: "Banco do Brasil" },
  agencia: { type: "string", nullable: true, example: "0001" },
  contaCorrente: { type: "string", nullable: true, example: "12345-6" },
  temDependente: { type: "boolean", example: false },
  tipoHabilitacaoId: { type: "string", format: "uuid", nullable: true },
  adicionalCompensacaoOrganicaPercentual: { type: "number", example: 0 },
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: { type: "integer", nullable: true },
  temAdicionalTempoServico: { type: "boolean", example: false },
  temAdicionalPromocao: { type: "boolean", example: false },
  temAdicionalComando: { type: "boolean", example: false },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const militarResponse = {
  type: "object",
  properties: militarProperties,
};

const remuneracaoAdicionalResponse = {
  type: "object",
  properties: {
    percentual: { type: "number", example: 19 },
    valor: { type: "number", example: 1895.44 },
    vigenciaInicio: { type: "string", format: "date-time" },
  },
};

const remuneracaoPstGraduacaoResponse = {
  type: "object",
  properties: {
    ordem: { type: "integer", example: 7 },
    abreviacao: { type: "string", example: "Cap" },
    nome: { type: "string", example: "Capitao" },
  },
};

const remuneracaoResponse = {
  type: "object",
  properties: {
    militar: {
      type: "object",
      properties: {
        id: militarProperties.id,
        trigrama: militarProperties.trigrama,
        nomeCompleto: militarProperties.nomeCompleto,
        nomeGuerra: militarProperties.nomeGuerra,
      },
    },
    data: { type: "string", format: "date-time" },
    pstGraduacao: remuneracaoPstGraduacaoResponse,
    soldo: {
      type: "object",
      properties: {
        valor: { type: "number", example: 9976 },
        vigenciaInicio: { type: "string", format: "date-time" },
      },
    },
    adicionais: {
      type: "object",
      properties: {
        militar: remuneracaoAdicionalResponse,
        disponibilidadeMilitar: remuneracaoAdicionalResponse,
        habilitacao: { ...remuneracaoAdicionalResponse, nullable: true },
        tempoServico: { ...remuneracaoAdicionalResponse, nullable: true },
        promocao: { ...remuneracaoAdicionalResponse, nullable: true },
        comando: { ...remuneracaoAdicionalResponse, nullable: true },
        compensacaoOrganica: {
          type: "object",
          nullable: true,
          properties: {
            ...remuneracaoAdicionalResponse.properties,
            baseSoldo: { type: "number", example: 6737 },
            basePstGraduacao: remuneracaoPstGraduacaoResponse,
          },
        },
      },
    },
    totalBruto: { type: "number", example: 16934.58 },
  },
};

const militarBody = {
  type: "object",
  required: ["trigrama", "nomeCompleto", "cpf"],
  properties: {
    trigrama: militarProperties.trigrama,
    nomeCompleto: militarProperties.nomeCompleto,
    nomeGuerra: militarProperties.nomeGuerra,
    cpf: militarProperties.cpf,
    saram: militarProperties.saram,
    email: militarProperties.email,
    banco: militarProperties.banco,
    agencia: militarProperties.agencia,
    contaCorrente: militarProperties.contaCorrente,
    temDependente: militarProperties.temDependente,
    tipoHabilitacaoId: militarProperties.tipoHabilitacaoId,
    adicionalCompensacaoOrganicaPercentual: militarProperties.adicionalCompensacaoOrganicaPercentual,
    adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem:
      militarProperties.adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem,
    temAdicionalTempoServico: militarProperties.temAdicionalTempoServico,
    temAdicionalPromocao: militarProperties.temAdicionalPromocao,
    temAdicionalComando: militarProperties.temAdicionalComando,
  },
  example: {
    trigrama: "abc",
    nomeCompleto: "Joao da Silva",
    nomeGuerra: "SILVA",
    cpf: "12345678901",
    saram: "1234567",
    email: "joao.silva@example.com",
    temDependente: false,
  },
};

export const militarRoutes: FastifyPluginAsync = async (app) => {
  const controller = new MilitarController();

  app.post(
    "/militares",
    {
      schema: {
        tags: ["Militares"],
        summary: "Cria militar",
        description: "Cria um militar com trigrama unico.",
        body: militarBody,
        response: { 201: militarResponse },
      },
    },
    controller.create,
  );

  app.get(
    "/militares",
    {
      schema: {
        tags: ["Militares"],
        summary: "Lista militares",
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            search: { type: "string" },
          },
        },
      },
    },
    controller.list,
  );

  app.get(
    "/militares/:id",
    {
      schema: {
        tags: ["Militares"],
        summary: "Busca militar por id",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 200: militarResponse },
      },
    },
    controller.findById,
  );

  app.get(
    "/militares/:id/remuneracao",
    {
      schema: {
        tags: ["Militares"],
        summary: "Calcula remuneracao do militar",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        querystring: {
          type: "object",
          properties: {
            data: { type: "string", example: "2026-02-01" },
          },
        },
        response: { 200: remuneracaoResponse },
      },
    },
    controller.getRemuneracao,
  );

  app.get(
    "/militares/trigrama/:trigrama",
    {
      schema: {
        tags: ["Militares"],
        summary: "Busca militar por trigrama",
        params: {
          type: "object",
          required: ["trigrama"],
          properties: { trigrama: { type: "string", minLength: 3, maxLength: 3 } },
        },
        response: { 200: militarResponse },
      },
    },
    controller.findByTrigrama,
  );

  app.patch(
    "/militares/:id",
    {
      schema: {
        tags: ["Militares"],
        summary: "Atualiza militar",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        body: {
          ...militarBody,
          required: [],
          example: {
            nomeCompleto: "Joao Silva Atualizado",
            temDependente: true,
          },
        },
        response: { 200: militarResponse },
      },
    },
    controller.update,
  );

  app.delete(
    "/militares/:id",
    {
      schema: {
        tags: ["Militares"],
        summary: "Remove militar",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "string", format: "uuid" } },
        },
        response: { 204: { type: "null" } },
      },
    },
    controller.delete,
  );
};
