import { z } from "zod";

export const tipoHabilitacaoIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const tipoHabilitacaoCodigoParamsSchema = z.object({
  codigo: z.string().trim().min(1).transform((value) => value.toUpperCase()),
});
