// ============================================
// ZapFácil Pro - Tipos e Interfaces
// ============================================

export interface Empresa {
  nome: string;
  endereco: string;
  telefone: string;
  logoBase64: string;
  linkBaseMercadoPago: string;
}

export type TipoChavePix = "CPF" | "CNPJ" | "Celular" | "E-mail" | "Aleatória";

export interface ChavePix {
  id: string;
  tipo: TipoChavePix;
  valor: string;
  ativa: boolean;
}

export interface Servico {
  id: string;
  nome: string;
  valor: number;
}

export interface Cliente {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  criadoEm: string;
}

export type FormaPagamento = "PIX" | "DINHEIRO" | "CARTÃO DE CRÉDITO" | "CARTÃO DE DÉBITO";
export type StatusPagamento = "PAGO" | "PENDENTE";

export interface ItemVenda {
  id: string;
  servicoNome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Venda {
  id: string;
  empresa: string;
  endereco: string;
  telefone: string;
  cliente: string;
  docCliente: string;
  itens: ItemVenda[];
  valor: number;
  desconto: number;
  acrescimo: number;
  total: number;
  formaPagamento: FormaPagamento;
  status: StatusPagamento;
  chavePix: string;
  data: string;
  hora: string;
  timestamp: number;
}

export interface DadosBackup {
  versao: string;
  exportadoEm: string;
  empresa: Empresa;
  chavesPix: ChavePix[];
  servicos: Servico[];
  clientes: Cliente[];
  vendas: Venda[];
}

// Estatísticas do Dashboard
export interface EstatisticasDia {
  data: string;
  totalFaturado: number;
  totalVendas: number;
  vendasPagas: number;
  vendasPendentes: number;
}

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "PIX",
  "DINHEIRO",
  "CARTÃO DE CRÉDITO",
  "CARTÃO DE DÉBITO",
];

export const TIPOS_CHAVE_PIX: TipoChavePix[] = [
  "CPF",
  "CNPJ",
  "Celular",
  "E-mail",
  "Aleatória",
];