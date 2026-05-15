import { z } from "zod";
import { paginationQuerySchema } from "../../shared/http/pagination";

const trigramaSchema = z
  .string()
  .trim()
  .length(3, "trigrama deve ter 3 caracteres")
  .regex(/^[A-Za-z0-9]{3}$/, "trigrama deve ser alfanumerico")
  .transform((value) => value.toUpperCase());

const nullableText = z.string().trim().min(1).optional();

export const militarCreateSchema = z.object({
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
});

export const militarUpdateSchema = militarCreateSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: "body deve conter ao menos um campo",
});

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export const trigramaParamsSchema = z.object({
  trigrama: trigramaSchema,
});

export const militarListQuerySchema = paginationQuerySchema;

export type MilitarCreateBody = z.infer<typeof militarCreateSchema>;
export type MilitarUpdateBody = z.infer<typeof militarUpdateSchema>;
export type MilitarListQuery = z.infer<typeof militarListQuerySchema>;
