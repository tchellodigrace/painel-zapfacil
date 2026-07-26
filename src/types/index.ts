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
  colaboradorId: string;
  colaboradorNome: string;
  data: string;
  hora: string;
  timestamp: number;
}

// === AGENDAMENTO ===
export type StatusAgendamento = "AGENDADO" | "CONFIRMADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

export interface Agendamento {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  servicoNome: string;
  colaboradorId: string;
  colaboradorNome: string;
  data: string;
  hora: string;
  duracaoMinutos: number;
  valor: number;
  status: StatusAgendamento;
  observacoes: string;
  criadoEm: string;
  timestamp: number;
}

// === DESPESAS ===
export type CategoriaDespesa =
  | "MATERIAL"
  | "ALUGUEL"
  | "ENERGIA"
  | "INTERNET"
  | "MARKETING"
  | "TRANSPORTE"
  | "IMPOSTOS"
  | "SOFTWARE"
  | "MANUTENCAO"
  | "OUTROS";

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  data: string;
  recorrente: boolean;
  observacoes: string;
  timestamp: number;
}

// === COLABORADORES ===
export interface Colaborador {
  id: string;
  nome: string;
  telefone: string;
  especialidade: string;
  comissaoPercentual: number;
  ativo: boolean;
  criadoEm: string;
}

export interface DadosBackup {
  versao: string;
  exportadoEm: string;
  empresa: Empresa;
  chavesPix: ChavePix[];
  servicos: Servico[];
  clientes: Cliente[];
  vendas: Venda[];
  agendamentos: Agendamento[];
  despesas: Despesa[];
  colaboradores: Colaborador[];
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

export const CATEGORIAS_DESPESA: { valor: CategoriaDespesa; label: string }[] = [
  { valor: "MATERIAL", label: "Material" },
  { valor: "ALUGUEL", label: "Aluguel" },
  { valor: "ENERGIA", label: "Energia" },
  { valor: "INTERNET", label: "Internet" },
  { valor: "MARKETING", label: "Marketing" },
  { valor: "TRANSPORTE", label: "Transporte" },
  { valor: "IMPOSTOS", label: "Impostos" },
  { valor: "SOFTWARE", label: "Software" },
  { valor: "MANUTENCAO", label: "Manutenção" },
  { valor: "OUTROS", label: "Outros" },
];

export const STATUS_AGENDAMENTO: { valor: StatusAgendamento; label: string; cor: string }[] = [
  { valor: "AGENDADO", label: "Agendado", cor: "bg-info/15 text-info dark:bg-info/25 dark:text-info/80" },
  { valor: "CONFIRMADO", label: "Confirmado", cor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { valor: "EM_ANDAMENTO", label: "Em Andamento", cor: "bg-warning/15 text-warning dark:bg-warning/25 dark:text-warning/80" },
  { valor: "CONCLUIDO", label: "Concluído", cor: "bg-success/15 text-success dark:bg-success/25 dark:text-success/80" },
  { valor: "CANCELADO", label: "Cancelado", cor: "bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-destructive/80" },
];