import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================
// Types
// ============================================

export interface RespostaAutomatica {
  id: string;
  gatilho: string;       // palavra-chave que o cliente digita
  resposta: string;      // o que o bot responde
  ativo: boolean;
}

export interface ItemMenu {
  id: string;
  numero: number;        // 1, 2, 3...
  texto: string;         // "Horarios de funcionamento"
  resposta: string;      // o que o bot responde quando escolhe esta opcao
  ativo: boolean;
}

export interface MensagemLog {
  id: string;
  numero: string;
  nome: string;
  tipo: "enviada" | "recebida";
  conteudo: string;
  data: string;
  hora: string;
}

export interface ConfigZapBot {
  // Conexao Evolution API
  apiUrl: string;
  instanceName: string;
  apiKey: string;
  conectado: boolean;

  // Mensagens
  mensagemBoasVindas: string;
  mensagemForaHorario: string;
  ativarBoasVindas: boolean;
  ativarForaHorario: boolean;
  horarioInicio: string;   // "08:00"
  horarioFim: string;     // "18:00"

  // Respostas automaticas
  respostas: RespostaAutomatica[];

  // Menu interativo
  menuAtivo: boolean;
  tituloMenu: string;
  itensMenu: ItemMenu[];

  // Log
  mensagens: MensagemLog[];
}

interface ZapBotStore extends ConfigZapBot {
  // Conexao
  configurarConexao: (apiUrl: string, instanceName: string, apiKey: string) => void;
  setConectado: (status: boolean) => void;

  // Mensagens
  setMensagemBoasVindas: (msg: string) => void;
  setMensagemForaHorario: (msg: string) => void;
  setAtivarBoasVindas: (v: boolean) => void;
  setAtivarForaHorario: (v: boolean) => void;
  setHorarioInicio: (h: string) => void;
  setHorarioFim: (h: string) => void;

  // Respostas
  adicionarResposta: (gatilho: string, resposta: string) => void;
  editarResposta: (id: string, gatilho: string, resposta: string) => void;
  toggleResposta: (id: string) => void;
  removerResposta: (id: string) => void;

  // Menu
  setMenuAtivo: (v: boolean) => void;
  setTituloMenu: (t: string) => void;
  adicionarItemMenu: (texto: string, resposta: string) => void;
  editarItemMenu: (id: string, texto: string, resposta: string) => void;
  toggleItemMenu: (id: string) => void;
  removerItemMenu: (id: string) => void;

  // Log
  adicionarMensagem: (msg: Omit<MensagemLog, "id">) => void;
  limparLog: () => void;

  // Util
  resetar: () => void;
}

const ESTADO_INICIAL: ConfigZapBot = {
  apiUrl: "",
  instanceName: "",
  apiKey: "",
  conectado: false,

  mensagemBoasVindas:
    "Ola! Bem-vindo(a) a *{empresa}*! 👋\n\n" +
    "Como posso ajudar?\n\n" +
    "Digite *menu* para ver nossas opcoes.",
  mensagemForaHorario:
    "Obrigado pelo contato! No momento estamos fora do horario de atendimento.\n\n" +
    "Horario: *{inicio}* as *{fim}*\n" +
    "Retornaremos em breve!",
  ativarBoasVindas: true,
  ativarForaHorario: false,
  horarioInicio: "08:00",
  horarioFim: "18:00",

  respostas: [
    { id: "1", gatilho: "menu", resposta: "Escolha uma opcao:\n1️⃣ Horarios\n2️⃣ Endereco\n3️⃣ Valores\n4️⃣ Falar com atendente", ativo: true },
    { id: "2", gatilho: "horario", resposta: "Nosso horario de funcionamento:\n📅 Segunda a Sexta: 08h as 18h\n📅 Sabado: 08h as 12h", ativo: true },
    { id: "3", gatilho: "endereco", resposta: "Nosso endereco:\n📍 Rua Exemplo, 123 - Centro\nCidade - UF\nCEP: 00000-000", ativo: true },
    { id: "4", gatilho: "preco", resposta: "Temos varios servicos disponiveis! Para saber os valores detalhados, entre em contato com nosso atendimento.", ativo: true },
    { id: "5", gatilho: "obrigado", resposta: "Por nada! Estamos sempre a disposicao. Ate logo! 😊", ativo: true },
  ],

  menuAtivo: true,
  tituloMenu: "Menu de Atendimento",
  itensMenu: [
    { id: "m1", numero: 1, texto: "Horarios de funcionamento", resposta: "Nosso horario:\n📅 Seg a Sex: 08h as 18h\n📅 Sabado: 08h as 12h", ativo: true },
    { id: "m2", numero: 2, texto: "Endereco e localizacao", resposta: "Nosso endereco:\n📍 Rua Exemplo, 123 - Centro", ativo: true },
    { id: "m3", numero: 3, texto: "Tabela de precos", resposta: "Para ver nossos precos, acesse: link.com/precos", ativo: true },
    { id: "m4", numero: 4, texto: "Falar com atendente", resposta: "Vou chamar um atendente para voce! Aguarde um momento. 🙏", ativo: true },
  ],

  mensagens: [],
};

export const useZapBotStore = create<ZapBotStore>()(
  persist(
    (set, get) => ({
      ...ESTADO_INICIAL,

      configurarConexao: (apiUrl, instanceName, apiKey) =>
        set({ apiUrl, instanceName, apiKey }),
      setConectado: (status) => set({ conectado: status }),

      setMensagemBoasVindas: (msg) => set({ mensagemBoasVindas: msg }),
      setMensagemForaHorario: (msg) => set({ mensagemForaHorario: msg }),
      setAtivarBoasVindas: (v) => set({ ativarBoasVindas: v }),
      setAtivarForaHorario: (v) => set({ ativarForaHorario: v }),
      setHorarioInicio: (h) => set({ horarioInicio: h }),
      setHorarioFim: (h) => set({ horarioFim: h }),

      adicionarResposta: (gatilho, resposta) =>
        set((s) => ({
          respostas: [
            ...s.respostas,
            {
              id: `${Date.now()}`,
              gatilho: gatilho.toLowerCase().trim(),
              resposta: resposta.trim(),
              ativo: true,
            },
          ],
        })),

      editarResposta: (id, gatilho, resposta) =>
        set((s) => ({
          respostas: s.respostas.map((r) =>
            r.id === id
              ? { ...r, gatilho: gatilho.toLowerCase().trim(), resposta: resposta.trim() }
              : r
          ),
        })),

      toggleResposta: (id) =>
        set((s) => ({
          respostas: s.respostas.map((r) =>
            r.id === id ? { ...r, ativo: !r.ativo } : r
          ),
        })),

      removerResposta: (id) =>
        set((s) => ({
          respostas: s.respostas.filter((r) => r.id !== id),
        })),

      setMenuAtivo: (v) => set({ menuAtivo: v }),
      setTituloMenu: (t) => set({ tituloMenu: t }),

      adicionarItemMenu: (texto, resposta) =>
        set((s) => {
          const maxNum = s.itensMenu.reduce((max, i) => Math.max(max, i.numero), 0);
          return {
            itensMenu: [
              ...s.itensMenu,
              {
                id: `${Date.now()}`,
                numero: maxNum + 1,
                texto: texto.trim(),
                resposta: resposta.trim(),
                ativo: true,
              },
            ],
          };
        }),

      editarItemMenu: (id, texto, resposta) =>
        set((s) => ({
          itensMenu: s.itensMenu.map((i) =>
            i.id === id
              ? { ...i, texto: texto.trim(), resposta: resposta.trim() }
              : i
          ),
        })),

      toggleItemMenu: (id) =>
        set((s) => ({
          itensMenu: s.itensMenu.map((i) =>
            i.id === id ? { ...i, ativo: !i.ativo } : i
          ),
        })),

      removerItemMenu: (id) => {
        const state = get();
        const filtered = state.itensMenu.filter((i) => i.id !== id);
        const renumerados = filtered.map((i, idx) => ({ ...i, numero: idx + 1 }));
        set({ itensMenu: renumerados });
      },

      adicionarMensagem: (msg) =>
        set((s) => ({
          mensagens: [
            { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
            ...s.mensagens,
          ].slice(0, 200),
        })),

      limparLog: () => set({ mensagens: [] }),

      resetar: () => set(ESTADO_INICIAL),
    }),
    {
      name: "zapfacil_zapbot",
    }
  )
);