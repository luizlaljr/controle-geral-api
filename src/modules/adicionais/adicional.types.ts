export type PstGraduacaoResumo = {
  ordem: number;
  abreviacao: string;
  nome: string;
};

export type TipoHabilitacaoResumo = {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
};

export type AdicionalPorOrdem = {
  id: string;
  pstGraduacaoOrdem: number;
  percentual: number;
  vigenciaInicio: Date;
  observacao: string | null;
  createdAt: Date;
  pstGraduacao: PstGraduacaoResumo;
};

export type AdicionalHabilitacao = {
  id: string;
  tipoHabilitacaoId: string;
  percentual: number;
  vigenciaInicio: Date;
  observacao: string | null;
  createdAt: Date;
  tipoHabilitacao: TipoHabilitacaoResumo;
};

export type AdicionalSimples = {
  id: string;
  percentual: number;
  vigenciaInicio: Date;
  observacao: string | null;
  createdAt: Date;
};

export type AdicionalPorOrdemPublic = Omit<AdicionalPorOrdem, "vigenciaInicio" | "createdAt"> & {
  vigenciaInicio: string;
  createdAt: string;
};

export type AdicionalHabilitacaoPublic = Omit<AdicionalHabilitacao, "vigenciaInicio" | "createdAt"> & {
  vigenciaInicio: string;
  createdAt: string;
};

export type AdicionalSimplesPublic = Omit<AdicionalSimples, "vigenciaInicio" | "createdAt"> & {
  vigenciaInicio: string;
  createdAt: string;
};

export type AdicionalPorOrdemTabelaInput = {
  vigenciaInicio: Date;
  observacao?: string | undefined;
  itens: Array<{
    ordem: number;
    percentual: number;
  }>;
};

export type AdicionalHabilitacaoTabelaInput = {
  vigenciaInicio: Date;
  observacao?: string | undefined;
  itens: Array<{
    codigo: string;
    nome: string;
    percentual: number;
  }>;
};

export type AdicionalSimplesTabelaInput = {
  vigenciaInicio: Date;
  observacao?: string | undefined;
  percentual: number;
};

export type AdicionalSearchParams = {
  data?: Date | undefined;
  ordem?: number | undefined;
};
