import { z } from "zod";
import { paginationQuerySchema } from "../../shared/http/pagination";

const trigramaSchema = z
  .string()
  .trim()
  .length(3, "trigrama deve ter 3 caracteres")
  .regex(/^[A-Za-z0-9]{3}$/, "trigrama deve ser alfanumerico")
  .transform((value) => value.toUpperCase());

const nullableText = z.string().trim().min(1).optional();

const compensacaoOrganicaSchema = z.number().min(0).max(20).refine((value) => Number.isInteger(value * 100), {
  message: "percentual deve ter no maximo 2 casas decimais",
});

const militarBaseSchema = z.object({
  trigrama: trigramaSchema,
  nomeCompleto: z.string().trim().min(1).max(160),
  nomeGuerra: nullableText,
  cpf: z.string().regex(/^\d{11}$/, "cpf deve ter 11 digitos"),
  saram: z.string().regex(/^\d{1,10}$/, "saram deve ter ate 10 digitos").optional(),
  email: z.string().email().max(160).optional(),
  banco: nullableText,
  agencia: nullableText,
  contaCorrente: nullableText,
  temDependente: z.boolean().default(false),
  tipoHabilitacaoId: z.string().uuid().optional(),
  adicionalCompensacaoOrganicaPercentual: compensacaoOrganicaSchema.default(0),
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: z.number().int().min(1).optional(),
  temAdicionalTempoServico: z.boolean().default(false),
  temAdicionalPromocao: z.boolean().default(false),
  temAdicionalComando: z.boolean().default(false),
});

function validateCompensacaoOrganica(input: {
  adicionalCompensacaoOrganicaPercentual?: number | undefined;
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem?: number | undefined;
}) {
  return (
    input.adicionalCompensacaoOrganicaPercentual === undefined ||
    input.adicionalCompensacaoOrganicaPercentual === 0 ||
    input.adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem !== undefined
  );
}

export const militarCreateSchema = militarBaseSchema.refine(validateCompensacaoOrganica, {
  message: "base da compensacao organica obrigatoria quando percentual for maior que zero",
  path: ["adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem"],
});

export const militarUpdateSchema = militarBaseSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "body deve conter ao menos um campo",
  })
  .refine(validateCompensacaoOrganica, {
    message: "base da compensacao organica obrigatoria quando percentual for maior que zero",
    path: ["adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem"],
  });

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export const trigramaParamsSchema = z.object({
  trigrama: trigramaSchema,
});

const dateTimeSchema = z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "data invalida",
}).transform((value) => new Date(value));

export const militarListQuerySchema = paginationQuerySchema;
export const militarRemuneracaoQuerySchema = z.object({
  data: dateTimeSchema.optional(),
});

export type MilitarCreateBody = z.infer<typeof militarCreateSchema>;
export type MilitarUpdateBody = z.infer<typeof militarUpdateSchema>;
export type MilitarListQuery = z.infer<typeof militarListQuerySchema>;
export type MilitarRemuneracaoQuery = z.infer<typeof militarRemuneracaoQuerySchema>;
