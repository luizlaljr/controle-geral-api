import type { Militar as PrismaMilitar } from "@prisma/client";
import type { Militar, MilitarCreateInput, MilitarPublic, MilitarUpdateInput } from "./militar.types";

export function toDomain(militar: PrismaMilitar): Militar {
  return militar;
}

export function toPublic(militar: Militar): MilitarPublic {
  return {
    ...militar,
    createdAt: militar.createdAt.toISOString(),
    updatedAt: militar.updatedAt.toISOString(),
  };
}

export function createInputToPrisma(input: MilitarCreateInput) {
  return {
    trigrama: input.trigrama.toUpperCase(),
    nomeCompleto: input.nomeCompleto,
    cpf: input.cpf,
    temDependente: input.temDependente ?? false,
    ...(input.nomeGuerra !== undefined ? { nomeGuerra: input.nomeGuerra } : {}),
    ...(input.saram !== undefined ? { saram: input.saram } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.banco !== undefined ? { banco: input.banco } : {}),
    ...(input.agencia !== undefined ? { agencia: input.agencia } : {}),
    ...(input.contaCorrente !== undefined ? { contaCorrente: input.contaCorrente } : {}),
  };
}

export function updateInputToPrisma(input: MilitarUpdateInput) {
  return {
    ...(input.trigrama ? { trigrama: input.trigrama.toUpperCase() } : {}),
    ...(input.nomeCompleto !== undefined ? { nomeCompleto: input.nomeCompleto } : {}),
    ...(input.nomeGuerra !== undefined ? { nomeGuerra: input.nomeGuerra } : {}),
    ...(input.cpf !== undefined ? { cpf: input.cpf } : {}),
    ...(input.saram !== undefined ? { saram: input.saram } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.banco !== undefined ? { banco: input.banco } : {}),
    ...(input.agencia !== undefined ? { agencia: input.agencia } : {}),
    ...(input.contaCorrente !== undefined ? { contaCorrente: input.contaCorrente } : {}),
    ...(input.temDependente !== undefined ? { temDependente: input.temDependente } : {}),
  };
}
