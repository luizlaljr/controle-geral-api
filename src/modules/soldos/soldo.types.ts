export type SoldoPstGraduacao = {
  ordem: number;
  abreviacao: string;
  nome: string;
};

export type Soldo = {
  id: string;
  pstGraduacaoOrdem: number;
  valor: number;
  vigenciaInicio: Date;
  observacao: string | null;
  createdAt: Date;
  pstGraduacao: SoldoPstGraduacao;
};

export type SoldoPublic = {
  id: string;
  pstGraduacaoOrdem: number;
  valor: number;
  vigenciaInicio: string;
  observacao: string | null;
  createdAt: string;
  pstGraduacao: SoldoPstGraduacao;
};

export type SoldoTabelaItemInput = {
  ordem: number;
  valor: number;
};

export type SoldoTabelaInput = {
  vigenciaInicio: Date;
  observacao?: string | undefined;
  itens: SoldoTabelaItemInput[];
};

export type SoldoSearchParams = {
  data?: Date | undefined;
  ordem?: number | undefined;
};

export type SoldoTabelaResult = {
  total: number;
  dados: SoldoPublic[];
};
