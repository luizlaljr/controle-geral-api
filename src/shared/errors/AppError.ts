export type AppErrorDetail = {
  campo?: string;
  mensagem: string;
};

export class AppError extends Error {
  public readonly codigo: string;
  public readonly statusCode: number;
  public readonly detalhes: AppErrorDetail[];

  constructor(params: {
    codigo: string;
    mensagem: string;
    statusCode: number;
    detalhes?: AppErrorDetail[];
  }) {
    super(params.mensagem);
    this.name = "AppError";
    this.codigo = params.codigo;
    this.statusCode = params.statusCode;
    this.detalhes = params.detalhes ?? [];
  }
}
