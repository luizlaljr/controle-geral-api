import { z } from "zod";

const dateTimeSchema = z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "data invalida",
}).transform((value) => new Date(value));

const percentualSchema = z.number().min(0).refine((value) => Number.isInteger(value * 100), {
  message: "percentual deve ter no maximo 2 casas decimais",
});

export const adicionalPorOrdemTabelaSchema = z.object({
  vigencia_inicio: dateTimeSchema,
  observacao: z.string().trim().min(1).max(200).optional(),
  itens: z
    .array(
      z.object({
        ordem: z.number().int().min(1),
        percentual: percentualSchema,
      }),
    )
    .min(1)
    .refine((itens) => new Set(itens.map((item) => item.ordem)).size === itens.length, {
      message: "ordem duplicada nos itens",
    }),
}).transform((input) => ({
  vigenciaInicio: input.vigencia_inicio,
  observacao: input.observacao,
  itens: input.itens,
}));

export const adicionalHabilitacaoTabelaSchema = z.object({
  vigencia_inicio: dateTimeSchema,
  observacao: z.string().trim().min(1).max(200).optional(),
  itens: z
    .array(
      z.object({
        codigo: z.string().trim().min(1).max(80).transform((value) => value.toUpperCase()),
        nome: z.string().trim().min(1).max(120),
        percentual: percentualSchema,
      }),
    )
    .min(1)
    .refine((itens) => new Set(itens.map((item) => item.codigo)).size === itens.length, {
      message: "codigo duplicado nos itens",
    }),
}).transform((input) => ({
  vigenciaInicio: input.vigencia_inicio,
  observacao: input.observacao,
  itens: input.itens,
}));

export const adicionalSimplesTabelaSchema = z.object({
  vigencia_inicio: dateTimeSchema,
  observacao: z.string().trim().min(1).max(200).optional(),
  percentual: percentualSchema,
}).transform((input) => ({
  vigenciaInicio: input.vigencia_inicio,
  observacao: input.observacao,
  percentual: input.percentual,
}));

export const adicionalListQuerySchema = z.object({
  data: dateTimeSchema.optional(),
  ordem: z.coerce.number().int().min(1).optional(),
});
