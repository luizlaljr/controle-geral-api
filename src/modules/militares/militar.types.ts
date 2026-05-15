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
};

export type MilitarPublic = Omit<Militar, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};
