export type PstGraduacaoResumo = {
  ordem: number;
  abreviacao: string;
  nome: string;
};

export type Promocao = {
  id: string;
  militarId: string;
  pstGraduacaoOrdem: number;
  dataPromocao: Date;
  createdAt: Date;
  pstGraduacao: PstGraduacaoResumo;
};

export type PromocaoCreateInput = {
  militarId: string;
  pstGraduacaoOrdem: number;
  dataPromocao: Date;
};

export type PromocaoPublic = Omit<Promocao, "dataPromocao" | "createdAt"> & {
  dataPromocao: string;
  createdAt: string;
};
