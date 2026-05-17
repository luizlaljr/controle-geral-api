export type Militar = {
  id: string;
  trigrama: string;
  nomeCompleto: string;
  nomeGuerra: string | null;
  cpf: string;
  saram: string | null;
  email: string | null;
  banco: string | null;
  agencia: string | null;
  contaCorrente: string | null;
  temDependente: boolean;
  tipoHabilitacaoId: string | null;
  adicionalCompensacaoOrganicaPercentual: number;
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem: number | null;
  temAdicionalTempoServico: boolean;
  temAdicionalPromocao: boolean;
  temAdicionalComando: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MilitarCreateInput = {
  trigrama: string;
  nomeCompleto: string;
  nomeGuerra?: string | undefined;
  cpf: string;
  saram?: string | undefined;
  email?: string | undefined;
  banco?: string | undefined;
  agencia?: string | undefined;
  contaCorrente?: string | undefined;
  temDependente?: boolean | undefined;
  tipoHabilitacaoId?: string | undefined;
  adicionalCompensacaoOrganicaPercentual?: number | undefined;
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem?: number | undefined;
  temAdicionalTempoServico?: boolean | undefined;
  temAdicionalPromocao?: boolean | undefined;
  temAdicionalComando?: boolean | undefined;
};

export type MilitarUpdateInput = {
  trigrama?: string | undefined;
  nomeCompleto?: string | undefined;
  nomeGuerra?: string | undefined;
  cpf?: string | undefined;
  saram?: string | undefined;
  email?: string | undefined;
  banco?: string | undefined;
  agencia?: string | undefined;
  contaCorrente?: string | undefined;
  temDependente?: boolean | undefined;
  tipoHabilitacaoId?: string | undefined;
  adicionalCompensacaoOrganicaPercentual?: number | undefined;
  adicionalCompensacaoOrganicaPstGraduacaoBaseOrdem?: number | undefined;
  temAdicionalTempoServico?: boolean | undefined;
  temAdicionalPromocao?: boolean | undefined;
  temAdicionalComando?: boolean | undefined;
};

export type MilitarPublic = Omit<Militar, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type RemuneracaoPstGraduacao = {
  ordem: number;
  abreviacao: string;
  nome: string;
};

export type RemuneracaoPromocaoVigente = {
  id: string;
  militarId: string;
  pstGraduacaoOrdem: number;
  dataPromocao: Date;
  pstGraduacao: RemuneracaoPstGraduacao;
};

export type RemuneracaoSoldoVigente = {
  valor: number;
  vigenciaInicio: Date;
  pstGraduacao: RemuneracaoPstGraduacao;
};

export type RemuneracaoAdicionalVigente = {
  percentual: number;
  vigenciaInicio: Date;
};

export type RemuneracaoAdicionalCalculado = {
  percentual: number;
  valor: number;
  vigenciaInicio: string;
};

export type RemuneracaoCompensacaoOrganica = RemuneracaoAdicionalCalculado & {
  baseSoldo: number;
  basePstGraduacao: RemuneracaoPstGraduacao;
};

export type RemuneracaoMilitar = {
  militar: Pick<MilitarPublic, "id" | "trigrama" | "nomeCompleto" | "nomeGuerra">;
  data: string;
  pstGraduacao: RemuneracaoPstGraduacao;
  soldo: {
    valor: number;
    vigenciaInicio: string;
  };
  adicionais: {
    militar: RemuneracaoAdicionalCalculado;
    disponibilidadeMilitar: RemuneracaoAdicionalCalculado;
    habilitacao: RemuneracaoAdicionalCalculado | null;
    tempoServico: RemuneracaoAdicionalCalculado | null;
    promocao: RemuneracaoAdicionalCalculado | null;
    comando: RemuneracaoAdicionalCalculado | null;
    compensacaoOrganica: RemuneracaoCompensacaoOrganica | null;
  };
  totalBruto: number;
};
