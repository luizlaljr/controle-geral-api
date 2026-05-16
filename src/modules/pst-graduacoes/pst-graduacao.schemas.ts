import { z } from "zod";

export const pstGraduacaoOrdemParamsSchema = z.object({
  ordem: z.coerce.number().int().min(1),
});
