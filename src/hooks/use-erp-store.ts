// ============================================
// ZapFácil Pro - Store (Zustand + localStorage)
// ============================================
import { create } from "zustand";
import type {
  Empresa,
  ChavePix,
  Servico,
  Cliente,
  Venda,
  DadosBackup,
} from "@/types";

const STORAGE_PREFIX = "zapfacil_";

function carregar<T>(chave: string, padrao: T): T {
  if (typeof window === "undefined") return padrao;
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${chave}`);
    return item ? (JSON.parse(item) as T) : padrao;
  } catch {
    return padrao;
  }
}

function salvar(chave: string, valor: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${chave}`, JSON.stringify(valor));
  } catch (e) {
    console.error("Erro ao salvar no localStorage:", e);
  }
}

interface ERPState {
  // --- Dados ---
  empresa: Empresa;
  chavesPix: ChavePix[];
  servicos: Servico[];
  clientes: Cliente[];
  vendas: Venda[];

  // --- Ações Empresa ---
  atualizarEmpresa: (dados: Partial<Empresa>) => void;
  salvarLogo: (base64: string) => void;
  removerLogo: () => void;

  // --- Ações Chave Pix ---
  adicionarChavePix: (tipo: string, valor: string) => boolean;
  definirChavePixAtiva: (id: string) => void;
  removerChavePix: (id: string) => void;

  // --- Ações Serviços ---
  adicionarServico: (nome: string, valor: number) => void;
  editarServico: (id: string, nome: string, valor: number) => void;
  removerServico: (id: string) => void;

  // --- Ações Clientes ---
  adicionarCliente: (nome: string, documento: string, telefone: string, email: string) => void;
  editarCliente: (id: string, nome: string, documento: string, telefone: string, email: string) => void;
  removerCliente: (id: string) => void;

  // --- Ações Vendas ---
  adicionarVenda: (venda: Venda) => void;
  removerVenda: (id: string) => void;

  // --- Ações Backup ---
  exportarBackup: () => string;
  importarBackup: (json: string) => boolean;
  obterChavePixAtiva: () => ChavePix | undefined;
}

export const useERPStore = create<ERPState>((set, get) => ({
  empresa: carregar<Empresa>("empresa", {
    nome: "",
    endereco: "",
    telefone: "",
    logoBase64: "",
    linkBaseMercadoPago: "",
  }),
  chavesPix: carregar<ChavePix[]>("chavesPix", []),
  servicos: carregar<Servico[]>("servicos", []),
  clientes: carregar<Cliente[]>("clientes", []),
  vendas: carregar<Venda[]>("vendas", []),

  // --- Empresa ---
  atualizarEmpresa: (dados) => {
    const nova = { ...get().empresa, ...dados };
    salvar("empresa", nova);
    set({ empresa: nova });
  },
  salvarLogo: (base64) => {
    const nova = { ...get().empresa, logoBase64: base64 };
    salvar("empresa", nova);
    set({ empresa: nova });
  },
  removerLogo: () => {
    const nova = { ...get().empresa, logoBase64: "" };
    salvar("empresa", nova);
    set({ empresa: nova });
  },

  // --- Chave Pix ---
  adicionarChavePix: (tipo, valor) => {
    if (!valor.trim()) return false;
    const chave: ChavePix = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tipo: tipo as ChavePix["tipo"],
      valor: valor.trim(),
      ativa: get().chavesPix.length === 0,
    };
    const novaLista = [...get().chavesPix, chave];
    salvar("chavesPix", novaLista);
    set({ chavesPix: novaLista });
    return true;
  },
  definirChavePixAtiva: (id) => {
    const novaLista = get().chavesPix.map((c) => ({
      ...c,
      ativa: c.id === id,
    }));
    salvar("chavesPix", novaLista);
    set({ chavesPix: novaLista });
  },
  removerChavePix: (id) => {
    const novaLista = get().chavesPix.filter((c) => c.id !== id);
    if (novaLista.length && !novaLista.some((c) => c.ativa)) {
      novaLista[0].ativa = true;
    }
    salvar("chavesPix", novaLista);
    set({ chavesPix: novaLista });
  },

  // --- Serviços ---
  adicionarServico: (nome, valor) => {
    const servico: Servico = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: nome.trim(),
      valor,
    };
    const novaLista = [...get().servicos, servico];
    salvar("servicos", novaLista);
    set({ servicos: novaLista });
  },
  editarServico: (id, nome, valor) => {
    const novaLista = get().servicos.map((s) =>
      s.id === id ? { ...s, nome: nome.trim(), valor } : s
    );
    salvar("servicos", novaLista);
    set({ servicos: novaLista });
  },
  removerServico: (id) => {
    const novaLista = get().servicos.filter((s) => s.id !== id);
    salvar("servicos", novaLista);
    set({ servicos: novaLista });
  },

  // --- Clientes ---
  adicionarCliente: (nome, documento, telefone, email) => {
    const cliente: Cliente = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nome: nome.trim(),
      documento: documento.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      criadoEm: new Date().toISOString(),
    };
    const novaLista = [...get().clientes, cliente];
    salvar("clientes", novaLista);
    set({ clientes: novaLista });
  },
  editarCliente: (id, nome, documento, telefone, email) => {
    const novaLista = get().clientes.map((c) =>
      c.id === id
        ? { ...c, nome: nome.trim(), documento: documento.trim(), telefone: telefone.trim(), email: email.trim() }
        : c
    );
    salvar("clientes", novaLista);
    set({ clientes: novaLista });
  },
  removerCliente: (id) => {
    const novaLista = get().clientes.filter((c) => c.id !== id);
    salvar("clientes", novaLista);
    set({ clientes: novaLista });
  },

  // --- Vendas ---
  adicionarVenda: (venda) => {
    const novaLista = [venda, ...get().vendas];
    salvar("vendas", novaLista);
    set({ vendas: novaLista });
  },
  removerVenda: (id) => {
    const novaLista = get().vendas.filter((v) => v.id !== id);
    salvar("vendas", novaLista);
    set({ vendas: novaLista });
  },

  // --- Backup ---
  exportarBackup: () => {
    const state = get();
    const dados: DadosBackup = {
      versao: "11.0",
      exportadoEm: new Date().toISOString(),
      empresa: state.empresa,
      chavesPix: state.chavesPix,
      servicos: state.servicos,
      clientes: state.clientes,
      vendas: state.vendas,
    };
    return JSON.stringify(dados, null, 2);
  },
  importarBackup: (json) => {
    try {
      const dados = JSON.parse(json) as DadosBackup;
      if (!dados.versao) return false;
      salvar("empresa", dados.empresa);
      salvar("chavesPix", dados.chavesPix || []);
      salvar("servicos", dados.servicos || []);
      salvar("clientes", dados.clientes || []);
      salvar("vendas", dados.vendas || []);
      set({
        empresa: dados.empresa,
        chavesPix: dados.chavesPix || [],
        servicos: dados.servicos || [],
        clientes: dados.clientes || [],
        vendas: dados.vendas || [],
      });
      return true;
    } catch {
      return false;
    }
  },
  obterChavePixAtiva: () => {
    return get().chavesPix.find((c) => c.ativa);
  },
}));