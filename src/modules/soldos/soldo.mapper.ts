import type { Prisma, Soldo as PrismaSoldo } from "@prisma/client";
import type { Soldo, SoldoPublic, SoldoTabelaInput } from "./soldo.types";

type PrismaSoldoComPstGraduacao = PrismaSoldo & {
  pstGraduacao: {
    ordem: number;
    abreviacao: string;
    nome: string;
  };
};

export function toDomain(soldo: PrismaSoldoComPstGraduacao): Soldo {
  return {
    id: soldo.id,
    pstGraduacaoOrdem: soldo.pstGraduacaoOrdem,
    valor: soldo.valor.toNumber(),
    vigenciaInicio: soldo.vigenciaInicio,
    observacao: soldo.observacao,
    createdAt: soldo.createdAt,
    pstGraduacao: soldo.pstGraduacao,
  };
}

export function toPublic(soldo: Soldo): SoldoPublic {
  return {
    ...soldo,
    vigenciaInicio: soldo.vigenciaInicio.toISOString(),
    createdAt: soldo.createdAt.toISOString(),
  };
}

export function tabelaInputToCreateMany(input: SoldoTabelaInput): Prisma.SoldoCreateManyInput[] {
  return input.itens.map((item) => ({
    pstGraduacaoOrdem: item.ordem,
    valor: item.valor.toFixed(2),
    vigenciaInicio: input.vigenciaInicio,
    observacao: input.observacao ?? null,
  }));
}
