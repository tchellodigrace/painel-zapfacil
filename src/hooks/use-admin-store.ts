// ============================================
// ZapFácil Pro - Admin Store (Controle de Sistemas Vendidos)
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

export type StatusSistema = "ATIVO" | "EXPIRADO" | "CANCELADO" | "TRIAL";
export type PlanoSistema = "BASIC" | "PRO" | "PREMIUM";

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
  valorMensal: number;
  observacoes: string;
  criadoEm: string;
}

interface AdminState {
  // Credenciais admin master
  adminCredenciais: { usuario: string; senha: string } | null;
  sistemas: SistemaCliente[];

  // Ações
  configurarAdmin: (usuario: string, senha: string) => void;
  adicionarSistema: (dados: Omit<SistemaCliente, "id" | "criadoEm">) => void;
  editarSistema: (id: string, dados: Partial<SistemaCliente>) => void;
  removerSistema: (id: string) => void;
  alterarStatus: (id: string, status: StatusSistema) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  adminCredenciais: carregar<{ usuario: string; senha: string } | null>("credenciais", null),
  sistemas: carregar<SistemaCliente[]>("sistemas", []),

  configurarAdmin: (usuario, senha) => {
    const cred = { usuario: usuario.trim().toLowerCase(), senha };
    salvar("credenciais", cred);
    set({ adminCredenciais: cred });
  },

  adicionarSistema: (dados) => {
    const sistema: SistemaCliente = {
      ...dados,
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
    salvar("sistemas", novaLista);
    set({ sistemas: novaLista });
  },

  alterarStatus: (id, status) => {
    const novaLista = get().sistemas.map((s) =>
      s.id === id ? { ...s, status } : s
    );
    salvar("sistemas", novaLista);
    set({ sistemas: novaLista });
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

export const STATUS_SISTEMA: { valor: StatusSistema; label: string; cor: string }[] = [
  { valor: "ATIVO", label: "Ativo", cor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { valor: "TRIAL", label: "Trial", cor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { valor: "EXPIRADO", label: "Expirado", cor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
  { valor: "CANCELADO", label: "Cancelado", cor: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
];

export const PLANOS: { valor: PlanoSistema; label: string; cor: string }[] = [
  { valor: "BASIC", label: "Basic", cor: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  { valor: "PRO", label: "Pro", cor: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { valor: "PREMIUM", label: "Premium", cor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
];