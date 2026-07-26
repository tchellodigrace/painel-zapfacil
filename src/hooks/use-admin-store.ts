// ============================================
// ZapFácil Pro - Admin Store (Controle de Sistemas Vendidos + Cobranças)
// ============================================
import { create } from "zustand";

const ADMIN_PREFIX = "zapfacil_admin_";

function carregar<T>(chave: string, padrao: T): T {
  if (typeof window === "undefined") return padrao;
  try {
    const item = localStorage.getItem(`${ADMIN_PREFIX}${chave}`);
    return item ? (JSON.parse(item) as T) : padrao;
  } catch {
    return padrao;
  }
}

function salvar(chave: string, valor: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${ADMIN_PREFIX}${chave}`, JSON.stringify(valor));
  } catch (e) {
    console.error("Erro ao salvar:", e);
  }
}

// === Tipos de Sistema ===
export type StatusSistema = "ATIVO" | "EXPIRADO" | "CANCELADO" | "TRIAL";
export type PlanoSistema = "BASIC" | "PRO" | "PREMIUM";
export type TipoLicenca = "ALUGUEL" | "AQUISICAO";

// === Tipos de Cobrança ===
export type TipoCobranca =
  | "MENSALIDADE"
  | "AQUISICAO"
  | "TAXA_INSTALACAO"
  | "TAXA_SUPORTE"
  | "OUTROS";

export type StatusCobranca = "PAGO" | "PENDENTE" | "ATRASADO" | "CANCELADO";

export type FormaPagamentoAdmin =
  | "PIX"
  | "CARTAO"
  | "BOLETO"
  | "TRANSFERENCIA"
  | "DINHEIRO";

// === Interfaces ===
export interface DadosRegistroCliente {
  usuario: string;
  nomeEmpresa: string;
  telefone: string;
  email: string;
  senha: string;
  registradoEm: string;
}

export interface SistemaCliente {
  id: string;
  empresa: string;
  responsavel: string;
  telefone: string;
  email: string;
  cidade: string;
  dataInstalacao: string;
  dataVencimento: string;
  status: StatusSistema;
  plano: PlanoSistema;
  tipoLicenca: TipoLicenca;
  valorMensal: number;
  valorAquisicao: number;
  taxaInstalacao: number;
  observacoes: string;
  criadoEm: string;
  dadosRegistro: DadosRegistroCliente | null;
  // Feature flags Premium
  zapbotAtivo?: boolean;
  disparoAtivo?: boolean;
  funilAtivo?: boolean;
  fluxosAtivo?: boolean;
}

export interface PedidoRecuperacao {
  id: string;
  email: string;
  telefoneSolicitado: string;
  dataPedido: string;
  status: "PENDENTE" | "ENVIADO" | "IGNORADO";
  dataResposta: string | null;
}

export interface Cobranca {
  id: string;
  sistemaId: string;
  sistemaNome: string;
  tipo: TipoCobranca;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  status: StatusCobranca;
  formaPagamento: FormaPagamentoAdmin | null;
  observacoes: string;
  criadoEm: string;
}

// === Migration: adiciona campos novos em sistemas antigos ===
function migrarSistemas(lista: SistemaCliente[]): SistemaCliente[] {
  return lista.map((s) => ({
    ...s,
    tipoLicenca: s.tipoLicenca || "ALUGUEL",
    valorAquisicao: s.valorAquisicao ?? 0,
    taxaInstalacao: s.taxaInstalacao ?? 0,
  }));
}

// === Atualiza cobranças atrasadas ===
function atualizarAtrasados(cobrancas: Cobranca[]): Cobranca[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return cobrancas.map((c) => {
    if (c.status === "PENDENTE") {
      const venc = new Date(c.dataVencimento + "T00:00:00");
      if (venc < hoje) return { ...c, status: "ATRASADO" as StatusCobranca };
    }
    return c;
  });
}

interface AdminState {
  // Credenciais admin master
  adminCredenciais: { usuario: string; senha: string } | null;
  emailRecuperacao: string;
  primeiroAcesso: boolean;
  dadosGestor: { nome: string; email: string; telefone: string } | null;
  sistemas: SistemaCliente[];
  cobrancas: Cobranca[];
  pedidosRecuperacao: PedidoRecuperacao[];

  alterarSenha: (senhaAtual: string, novaSenha: string) => boolean;
  resetarSenhaAdmin: (novaSenha: string) => void;
  configurarEmailRecuperacao: (email: string) => void;
  configurarPrimeiroAcesso: (dados: { usuario: string; senha: string; nome: string; email: string; telefone: string; emailRecuperacao: string }) => void;
  resetarPrimeiroAcesso: () => void;
  recarregarDados: () => void;
  sincronizarDoSupabase: () => Promise<void>;

  // Ações - Sistemas
  configurarAdmin: (usuario: string, senha: string) => void;
  adicionarSistema: (dados: Omit<SistemaCliente, "id" | "criadoEm">) => void;
  editarSistema: (id: string, dados: Partial<SistemaCliente>) => void;
  removerSistema: (id: string) => void;
  alterarStatus: (id: string, status: StatusSistema) => void;
  salvarRegistroCliente: (dados: DadosRegistroCliente) => void;

  // Ações - Cobranças
  adicionarCobranca: (dados: Omit<Cobranca, "id" | "criadoEm">) => void;
  editarCobranca: (id: string, dados: Partial<Cobranca>) => void;
  removerCobranca: (id: string) => void;
  registrarPagamento: (
    id: string,
    dataPagamento: string,
    formaPagamento: FormaPagamentoAdmin
  ) => void;
  cancelarCobranca: (id: string) => void;
  gerarCobrancaMensal: (sistemaId: string) => void;
  gerarCobrancaAquisicao: (sistemaId: string) => void;
  getCobrancasBySistema: (sistemaId: string) => Cobranca[];

  // Ações - Recuperação de senha
  criarPedidoRecuperacao: (email: string, telefone: string) => void;
  resolverPedidoRecuperacao: (id: string, status: "ENVIADO" | "IGNORADO") => void;
  limparPedidosResolvidos: () => void;
}

// Credenciais padrão do gestor
const CREDENCIAIS_PADRAO = { usuario: "admin", senha: "zapfacil123" };

function carregarCredenciais(): { usuario: string; senha: string } {
  if (typeof window === "undefined") return CREDENCIAIS_PADRAO;
  try {
    const item = localStorage.getItem(`${ADMIN_PREFIX}credenciais`);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed && typeof parsed.usuario === "string" && typeof parsed.senha === "string") {
        return parsed;
      }
    }
  } catch { /* ignora erro */ }
  // Se não existe ou é inválido, salva o padrão e retorna
  salvar("credenciais", CREDENCIAIS_PADRAO);
  return CREDENCIAIS_PADRAO;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  adminCredenciais: carregarCredenciais(),
  emailRecuperacao: carregar<string>("email_recuperacao", ""),
  primeiroAcesso: carregar<boolean>("primeiro_acesso", false),
  dadosGestor: carregar<{ nome: string; email: string; telefone: string } | null>("dados_gestor", null),
  sistemas: migrarSistemas(carregar<SistemaCliente[]>("sistemas", [])),
  cobrancas: atualizarAtrasados(carregar<Cobranca[]>("cobrancas", [])),
  pedidosRecuperacao: carregar<PedidoRecuperacao[]>("pedidos_recuperacao", []),

  // === Sistemas ===
  configurarAdmin: (usuario, senha) => {
    const cred = { usuario: usuario.trim().toLowerCase(), senha };
    salvar("credenciais", cred);
    set({ adminCredenciais: cred });
  },

  alterarSenha: (senhaAtual, novaSenha) => {
    const cred = get().adminCredenciais;
    if (!cred) return false;
    if (cred.senha !== senhaAtual) return false;
    const novaCred = { usuario: cred.usuario, senha: novaSenha };
    salvar("credenciais", novaCred);
    set({ adminCredenciais: novaCred });
    return true;
  },

  resetarSenhaAdmin: (novaSenha) => {
    const cred = get().adminCredenciais;
    const usuario = cred?.usuario || CREDENCIAIS_PADRAO.usuario;
    const novaCred = { usuario, senha: novaSenha };
    salvar("credenciais", novaCred);
    set({ adminCredenciais: novaCred });
  },

  configurarEmailRecuperacao: (email) => {
    salvar("email_recuperacao", email.trim().toLowerCase());
    set({ emailRecuperacao: email.trim().toLowerCase() });
  },

  configurarPrimeiroAcesso: (dados) => {
    const cred = { usuario: dados.usuario.trim().toLowerCase(), senha: dados.senha };
    salvar("credenciais", cred);
    salvar("email_recuperacao", dados.emailRecuperacao.trim().toLowerCase());
    salvar("primeiro_acesso", true);
    salvar("dados_gestor", { nome: dados.nome.trim(), email: dados.email.trim().toLowerCase(), telefone: dados.telefone.trim() });
    set({
      adminCredenciais: cred,
      emailRecuperacao: dados.emailRecuperacao.trim().toLowerCase(),
      primeiroAcesso: true,
      dadosGestor: { nome: dados.nome.trim(), email: dados.email.trim().toLowerCase(), telefone: dados.telefone.trim() },
    });
  },

  resetarPrimeiroAcesso: () => {
    salvar("primeiro_acesso", false);
    set({ primeiroAcesso: false });
  },

  adicionarSistema: (dados) => {
    const sistema: SistemaCliente = {
      ...dados,
      tipoLicenca: dados.tipoLicenca || "ALUGUEL",
      valorAquisicao: dados.valorAquisicao ?? 0,
      taxaInstalacao: dados.taxaInstalacao ?? 0,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: new Date().toISOString(),
    };
    const novaLista = [sistema, ...get().sistemas];
    salvar("sistemas", novaLista);
    set({ sistemas: novaLista });
  },

  editarSistema: (id, dados) => {
    const novaLista = get().sistemas.map((s) =>
      s.id === id ? { ...s, ...dados } : s
    );
    salvar("sistemas", novaLista);
    set({ sistemas: novaLista });
  },

  removerSistema: (id) => {
    const novaLista = get().sistemas.filter((s) => s.id !== id);
    const novaCobrancas = get().cobrancas.filter((c) => c.sistemaId !== id);
    salvar("sistemas", novaLista);
    salvar("cobrancas", novaCobrancas);
    set({ sistemas: novaLista, cobrancas: novaCobrancas });
  },

  alterarStatus: (id, status) => {
    const novaLista = get().sistemas.map((s) =>
      s.id === id ? { ...s, status } : s
    );
    salvar("sistemas", novaLista);
    set({ sistemas: novaLista });
  },

  salvarRegistroCliente: (dados) => {
    const sistemas = get().sistemas;
    let atualizado = false;
    const novaLista = sistemas.map((s) => {
      if (
        !s.dadosRegistro &&
        (s.telefone === dados.telefone ||
          s.empresa.toLowerCase() === dados.nomeEmpresa.toLowerCase())
      ) {
        atualizado = true;
        return {
          ...s,
          dadosRegistro: dados,
          responsavel: s.responsavel || dados.usuario,
        };
      }
      return s;
    });
    if (atualizado) {
      salvar("sistemas", novaLista);
      set({ sistemas: novaLista });
    } else {
      const novo: SistemaCliente = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        empresa: dados.nomeEmpresa,
        responsavel: dados.usuario,
        telefone: dados.telefone,
        email: dados.email,
        cidade: "",
        dataInstalacao: new Date().toISOString().split("T")[0],
        dataVencimento: "",
        status: "TRIAL",
        plano: "PRO",
        tipoLicenca: "ALUGUEL",
        valorMensal: 0,
        valorAquisicao: 0,
        taxaInstalacao: 0,
        observacoes: "Registro automatico via link",
        criadoEm: dados.registradoEm,
        dadosRegistro: dados,
      };
      const listaComNovo = [novo, ...get().sistemas];
      salvar("sistemas", listaComNovo);
      set({ sistemas: listaComNovo });
    }
  },

  // === Cobranças ===
  adicionarCobranca: (dados) => {
    const cobranca: Cobranca = {
      ...dados,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      criadoEm: new Date().toISOString(),
    };
    const novaLista = [cobranca, ...get().cobrancas];
    salvar("cobrancas", novaLista);
    set({ cobrancas: novaLista });
  },

  editarCobranca: (id, dados) => {
    const novaLista = get().cobrancas.map((c) =>
      c.id === id ? { ...c, ...dados } : c
    );
    salvar("cobrancas", novaLista);
    set({ cobrancas: novaLista });
  },

  removerCobranca: (id) => {
    const novaLista = get().cobrancas.filter((c) => c.id !== id);
    salvar("cobrancas", novaLista);
    set({ cobrancas: novaLista });
  },

  registrarPagamento: (id, dataPagamento, formaPagamento) => {
    const novaLista = get().cobrancas.map((c) =>
      c.id === id
        ? { ...c, status: "PAGO" as StatusCobranca, dataPagamento, formaPagamento }
        : c
    );
    salvar("cobrancas", novaLista);
    set({ cobrancas: novaLista });
  },

  cancelarCobranca: (id) => {
    const novaLista = get().cobrancas.map((c) =>
      c.id === id
        ? { ...c, status: "CANCELADO" as StatusCobranca }
        : c
    );
    salvar("cobrancas", novaLista);
    set({ cobrancas: novaLista });
  },

  gerarCobrancaMensal: (sistemaId) => {
    const sistema = get().sistemas.find((s) => s.id === sistemaId);
    if (!sistema || sistema.tipoLicenca !== "ALUGUEL") return;

    // Calcula próximo vencimento
    const hoje = new Date();
    const diaVenc = sistema.dataVencimento
      ? parseInt(sistema.dataVencimento.split("-")[2], 10)
      : hoje.getDate();

    let proxVenc = new Date(hoje.getFullYear(), hoje.getMonth(), diaVenc);
    if (proxVenc <= hoje) {
      proxVenc.setMonth(proxVenc.getMonth() + 1);
    }
    const dataVencStr = proxVenc.toISOString().split("T")[0];

    const mesRef = proxVenc.toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    const cobranca: Cobranca = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sistemaId: sistema.id,
      sistemaNome: sistema.empresa,
      tipo: "MENSALIDADE",
      descricao: `Mensalidade - ${mesRef}`,
      valor: sistema.valorMensal,
      dataVencimento: dataVencStr,
      dataPagamento: null,
      status: "PENDENTE",
      formaPagamento: null,
      observacoes: "",
      criadoEm: new Date().toISOString(),
    };

    const novaLista = [cobranca, ...get().cobrancas];
    salvar("cobrancas", novaLista);
    set({ cobrancas: novaLista });
  },

  gerarCobrancaAquisicao: (sistemaId) => {
    const sistema = get().sistemas.find((s) => s.id === sistemaId);
    if (!sistema || sistema.tipoLicenca !== "AQUISICAO") return;

    const hoje = new Date();
    const vencDaqui30 = new Date(hoje);
    vencDaqui30.setDate(vencDaqui30.getDate() + 30);

    const cobranca: Cobranca = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sistemaId: sistema.id,
      sistemaNome: sistema.empresa,
      tipo: "AQUISICAO",
      descricao: "Aquisicao do sistema (licenca definitiva)",
      valor: sistema.valorAquisicao,
      dataVencimento: vencDaqui30.toISOString().split("T")[0],
      dataPagamento: null,
      status: "PENDENTE",
      formaPagamento: null,
      observacoes: "",
      criadoEm: new Date().toISOString(),
    };

    const novaLista = [cobranca, ...get().cobrancas];
    salvar("cobrancas", novaLista);
    set({ cobrancas: novaLista });
  },

  getCobrancasBySistema: (sistemaId) => {
    return get().cobrancas.filter((c) => c.sistemaId === sistemaId);
  },

  // === Recuperação de Senha ===
  criarPedidoRecuperacao: (email, telefone) => {
    const pedido: PedidoRecuperacao = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: email.trim().toLowerCase(),
      telefoneSolicitado: telefone.trim(),
      dataPedido: new Date().toISOString(),
      status: "PENDENTE",
      dataResposta: null,
    };
    const novaLista = [pedido, ...get().pedidosRecuperacao];
    salvar("pedidos_recuperacao", novaLista);
    set({ pedidosRecuperacao: novaLista });
  },

  resolverPedidoRecuperacao: (id, status) => {
    const novaLista = get().pedidosRecuperacao.map((p) =>
      p.id === id
        ? { ...p, status, dataResposta: new Date().toISOString() }
        : p
    );
    salvar("pedidos_recuperacao", novaLista);
    set({ pedidosRecuperacao: novaLista });
  },

  limparPedidosResolvidos: () => {
    const novaLista = get().pedidosRecuperacao.filter(
      (p) => p.status === "PENDENTE"
    );
    salvar("pedidos_recuperacao", novaLista);
    set({ pedidosRecuperacao: novaLista });
  },

  recarregarDados: () => {
    set({
      emailRecuperacao: carregar<string>("email_recuperacao", ""),
      primeiroAcesso: carregar<boolean>("primeiro_acesso", false),
      dadosGestor: carregar<{ nome: string; email: string; telefone: string } | null>("dados_gestor", null),
      sistemas: migrarSistemas(carregar<SistemaCliente[]>("sistemas", [])),
      cobrancas: atualizarAtrasados(carregar<Cobranca[]>("cobrancas", [])),
      pedidosRecuperacao: carregar<PedidoRecuperacao[]>("pedidos_recuperacao", []),
    });
  },

  // === Sincronização Supabase ===
  // Busca sistemas/cobranças do Supabase (fonte centralizada multi-device).
  // Mantém cópia no localStorage para funcionamento offline.
  sincronizarDoSupabase: async () => {
    if (typeof window === "undefined") return;
    try {
      // Buscar sistemas
      const resSistemas = await fetch("/api/sistemas", { cache: "no-store" });
      if (resSistemas.ok) {
        const json = await resSistemas.json();
        if (json.ok && Array.isArray(json.sistemas)) {
          const sistemasMigrados = json.sistemas.map((s: any): SistemaCliente => ({
            id: s.id,
            empresa: s.empresa || "",
            responsavel: s.responsavel || "",
            telefone: s.telefone || "",
            email: s.email || "",
            cidade: s.cidade || "",
            dataInstalacao: s.data_instalacao || "",
            dataVencimento: s.data_vencimento || "",
            status: (s.status as StatusSistema) || "TRIAL",
            plano: (s.plano as PlanoSistema) || "PRO",
            tipoLicenca: (s.tipo_licenca as TipoLicenca) || "ALUGUEL",
            valorMensal: Number(s.valor_mensal) || 0,
            valorAquisicao: Number(s.valor_aquisicao) || 0,
            taxaInstalacao: Number(s.taxa_instalacao) || 0,
            observacoes: s.observacoes || "",
            criadoEm: s.criado_em || new Date().toISOString(),
            dadosRegistro: null,
            zapbotAtivo: !!s.zapbot_ativo,
            disparoAtivo: !!s.disparo_ativo,
            funilAtivo: !!s.funil_ativo,
            fluxosAtivo: !!s.fluxos_ativo,
          }));
          salvar("sistemas", sistemasMigrados);
          set({ sistemas: sistemasMigrados });
        }
      }

      // Buscar cobranças
      const resCob = await fetch("/api/cobrancas", { cache: "no-store" });
      if (resCob.ok) {
        const json = await resCob.json();
        if (json.ok && Array.isArray(json.cobrancas)) {
          const cobrancasMigradas = json.cobrancas.map((c: any): Cobranca => ({
            id: c.id,
            sistemaId: c.sistema_id || "",
            sistemaNome: c.descricao || "",
            tipo: (c.tipo as TipoCobranca) || "MENSALIDADE",
            descricao: c.descricao || "",
            valor: Number(c.valor) || 0,
            dataVencimento: c.vencimento || "",
            dataPagamento: c.pago_em || null,
            status: (c.status as StatusCobranca) || "PENDENTE",
            formaPagamento: (c.forma_pagamento as FormaPagamentoAdmin) || null,
            observacoes: c.observacoes || "",
            criadoEm: c.criado_em || new Date().toISOString(),
          }));
          const atualizadas = atualizarAtrasados(cobrancasMigradas);
          salvar("cobrancas", atualizadas);
          set({ cobrancas: atualizadas });
        }
      }

      // Atualiza feature flags no localStorage (bridge para o painel cliente)
      const sistemasAtuais = get().sistemas;
      sistemasAtuais.forEach((s) => {
        if (s.email) {
          const emailNorm = s.email.trim().toLowerCase();
          if (s.zapbotAtivo) {
            localStorage.setItem(`zapfacil_zapbot_${emailNorm}`, "true");
          }
          if (s.disparoAtivo) {
            localStorage.setItem(`zapfacil_disparo_${emailNorm}`, "true");
          }
          if (s.funilAtivo) {
            localStorage.setItem(`zapfacil_funil_${emailNorm}`, "true");
          }
          if (s.fluxosAtivo) {
            localStorage.setItem(`zapfacil_fluxos_${emailNorm}`, "true");
          }
        }
      });
    } catch (e) {
      console.error("[sincronizarDoSupabase] erro:", e);
    }
  },
}));

// === Sessão admin ===
const ADMIN_SESSION = "zapfacil_admin_session";

export function criarSessaoAdmin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_SESSION, "autenticado");
}

export function verificarSessaoAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_SESSION) === "autenticado";
}

export function destruirSessaoAdmin(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_SESSION);
}

// === Constantes ===
export const STATUS_SISTEMA: {
  valor: StatusSistema;
  label: string;
  cor: string;
}[] = [
  {
    valor: "ATIVO",
    label: "Ativo",
    cor: "bg-primary/10 text-primary",
  },
  {
    valor: "TRIAL",
    label: "Trial",
    cor: "bg-info/15 text-info",
  },
  {
    valor: "EXPIRADO",
    label: "Expirado",
    cor: "bg-red-100 text-red-700",
  },
  {
    valor: "CANCELADO",
    label: "Cancelado",
    cor: "bg-gray-100 text-gray-600",
  },
];

export const PLANOS: { valor: PlanoSistema; label: string; cor: string }[] = [
  {
    valor: "BASIC",
    label: "Basic",
    cor: "bg-gray-100 text-gray-600",
  },
  {
    valor: "PRO",
    label: "Pro",
    cor: "bg-purple-100 text-purple-700",
  },
  {
    valor: "PREMIUM",
    label: "Premium",
    cor: "bg-amber-100 text-amber-700",
  },
];

export const TIPOS_LICENCA: {
  valor: TipoLicenca;
  label: string;
  descricao: string;
  cor: string;
}[] = [
  {
    valor: "ALUGUEL",
    label: "Aluguel",
    descricao: "Mensalidade recorrente",
    cor: "bg-info/15 text-info",
  },
  {
    valor: "AQUISICAO",
    label: "Aquisicao",
    descricao: "Pagamento unico",
    cor: "bg-primary/10 text-primary",
  },
];

export const TIPOS_COBRANCA: { valor: TipoCobranca; label: string }[] = [
  { valor: "MENSALIDADE", label: "Mensalidade" },
  { valor: "AQUISICAO", label: "Aquisicao" },
  { valor: "TAXA_INSTALACAO", label: "Taxa de Instalacao" },
  { valor: "TAXA_SUPORTE", label: "Taxa de Suporte" },
  { valor: "OUTROS", label: "Outros" },
];

export const STATUS_COBRANCA: {
  valor: StatusCobranca;
  label: string;
  cor: string;
}[] = [
  {
    valor: "PAGO",
    label: "Pago",
    cor: "bg-primary/10 text-primary",
  },
  {
    valor: "PENDENTE",
    label: "Pendente",
    cor: "bg-amber-100 text-amber-700",
  },
  {
    valor: "ATRASADO",
    label: "Atrasado",
    cor: "bg-red-100 text-red-700",
  },
  {
    valor: "CANCELADO",
    label: "Cancelado",
    cor: "bg-gray-100 text-gray-500",
  },
];

export const FORMAS_PAGAMENTO_ADMIN: {
  valor: FormaPagamentoAdmin;
  label: string;
}[] = [
  { valor: "PIX", label: "PIX" },
  { valor: "CARTAO", label: "Cartao" },
  { valor: "BOLETO", label: "Boleto" },
  { valor: "TRANSFERENCIA", label: "Transferencia" },
  { valor: "DINHEIRO", label: "Dinheiro" },
];