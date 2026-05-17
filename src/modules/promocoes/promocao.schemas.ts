import { z } from "zod";

const dateTimeSchema = z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "data invalida",
}).transform((value) => new Date(value));

export const promocaoMilitarParamsSchema = z.object({
  id: z.string().uuid(),
});

export const promocaoCreateSchema = z.object({
  pst_graduacao_ordem: z.number().int().min(1),
  data_promocao: dateTimeSchema,
}).transform((input) => ({
  pstGraduacaoOrdem: input.pst_graduacao_ordem,
  dataPromocao: input.data_promocao,
}));

export type PromocaoCreateBody = z.infer<typeof promocaoCreateSchema>;
