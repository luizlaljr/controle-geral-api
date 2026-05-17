import type {
  AdicionalHabilitacao,
  AdicionalHabilitacaoPublic,
  AdicionalPorOrdem,
  AdicionalPorOrdemPublic,
  AdicionalSimples,
  AdicionalSimplesPublic,
} from "./adicional.types";

export function adicionalPorOrdemToPublic(adicional: AdicionalPorOrdem): AdicionalPorOrdemPublic {
  return {
    ...adicional,
    vigenciaInicio: adicional.vigenciaInicio.toISOString(),
    createdAt: adicional.createdAt.toISOString(),
  };
}

export function adicionalHabilitacaoToPublic(adicional: AdicionalHabilitacao): AdicionalHabilitacaoPublic {
  return {
    ...adicional,
    vigenciaInicio: adicional.vigenciaInicio.toISOString(),
    createdAt: adicional.createdAt.toISOString(),
  };
}

export function adicionalSimplesToPublic(adicional: AdicionalSimples): AdicionalSimplesPublic {
  return {
    ...adicional,
    vigenciaInicio: adicional.vigenciaInicio.toISOString(),
    createdAt: adicional.createdAt.toISOString(),
  };
}
