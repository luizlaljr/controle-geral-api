import { z } from "zod";

const dateTimeSchema = z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "data invalida",
}).transform((value) => new Date(value));

const moneySchema = z.number().positive().refine((value) => Number.isInteger(value * 100), {
  message: "valor deve ter no maximo 2 casas decimais",
});

export const soldoTabelaSchema = z.object({
  vigencia_inicio: dateTimeSchema,
  observacao: z.string().trim().min(1).max(200).optional(),
  itens: z
    .array(
      z.object({
        ordem: z.number().int().min(1),
        valor: moneySchema,
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

export const soldoListQuerySchema = z.object({
  data: dateTimeSchema.optional(),
  ordem: z.coerce.number().int().min(1).optional(),
});

export const soldoIdParamsSchema = z.object({
  id: z.string().uuid(),
});
