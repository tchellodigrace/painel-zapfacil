import { create } from "zustand";
import { persist } from "zustand/middleware";

// =============================================
// Types
// =============================================

export interface SubMenuItem {
  id: string;
  numero: string;
  titulo: string;
  resposta: string;
  ativo: boolean;
}

export interface MenuItem {
  id: string;
  numero: string;
  titulo: string;
  resposta: string;
  submenu: SubMenuItem[];
  ativo: boolean;
}

export interface MensagemLog {
  id: string;
  numero: string;
  nome: string;
  texto: string;
  tipo: "enviada" | "recebida" | "automatica";
  data: string;
  instancia: string;
}

export interface Instancia {
  id: string;
  nome: string;
  status: "conectada" | "desconectada" | "conectando" | "erro";
  telefone: string;
  ultimaAtividade: string;
}

export interface ConfigEvolution {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
}

type StatusConexao = "desconectado" | "conectando" | "conectado" | "erro";

// =============================================
// Store
// =============================================

interface ZapBotProState {
  // Conexao
  configEvolution: ConfigEvolution;
  conectado: boolean;
  qrCodeBase64: string | null;
  statusConexao: StatusConexao;

  // Chatbot
  chatbotAtivo: boolean;
  mensagemBoasVindas: string;
  mensagemPadrao: string;
  menuItems: MenuItem[];

  // Mensagens
  mensagensLog: MensagemLog[];

  // Estatisticas (mock)
  totalEnviadas: number;
  totalRecebidas: number;
  totalAutomaticas: number;

  // Acoes
  setConfigEvolution: (config: Partial<ConfigEvolution>) => void;
  setQrCode: (qr: string | null) => void;
  setStatusConexao: (status: StatusConexao) => void;
  setChatbotAtivo: (ativo: boolean) => void;
  setMensagemBoasVindas: (msg: string) => void;
  setMensagemPadrao: (msg: string) => void;
  addMenuItem: (item: Omit<MenuItem, "id" | "submenu">) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  removeMenuItem: (id: string) => void;
  addSubmenuItem: (menuId: string, item: Omit<SubMenuItem, "id">) => void;
  updateSubmenuItem: (menuId: string, subId: string, updates: Partial<SubMenuItem>) => void;
  removeSubmenuItem: (menuId: string, subId: string) => void;
  addMensagemLog: (msg: Omit<MensagemLog, "id">) => void;
  limparMensagens: () => void;
  incrementarStats: (tipo: "enviada" | "recebida" | "automatica") => void;
  conectar: () => Promise<void>;
  desconectar: () => void;
}

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useZapBotProStore = create<ZapBotProState>()(
  persist(
    (set, get) => ({
      // Conexao
      configEvolution: {
        apiUrl: "http://localhost:8080",
        apiKey: "",
        instanceName: "zapbot-pro",
      },
      conectado: false,
      qrCodeBase64: null,
      statusConexao: "desconectado" as StatusConexao,

      // Chatbot
      chatbotAtivo: false,
      mensagemBoasVindas:
        "Ola! Bem-vindo(a) a *{empresa}*!\n\nComo posso ajudar? Escolha uma opcao abaixo:\n\n{menu}",
      mensagemPadrao:
        "Desculpe, nao entendi sua mensagem. Por favor, escolha uma das opcoes do menu ou digite *sair* para encerrar.",

      menuItems: [
        {
          id: gerarId(),
          numero: "1",
          titulo: "Horario de funcionamento",
          resposta:
            "Nosso horario de funcionamento:\n\nSeg a Sex: 08:00 - 18:00\nSabado: 08:00 - 12:00\nDomingo: Fechado",
          submenu: [],
          ativo: true,
        },
        {
          id: gerarId(),
          numero: "2",
          titulo: "Fazer agendamento",
          resposta:
            "Para agendar, por favor envie:\n\n*Nome completo:*\n*Servico desejado:*\n*Data preferida:*\n*Horario preferido:*\n\nRetornaremos em breve com a confirmacao!",
          submenu: [],
          ativo: true,
        },
        {
          id: gerarId(),
          numero: "3",
          titulo: "Valores e servicos",
          resposta:
            "Confira nossos servicos:\n\n1. Corte - R$ 30,00\n2. Barba - R$ 20,00\n3. Corte + Barba - R$ 45,00\n4. Sobrancelha - R$ 10,00\n5. Pigmentacao - R$ 50,00\n\nDigite o numero do servico para mais detalhes.",
          submenu: [
            {
              id: gerarId(),
              numero: "3.1",
              titulo: "Detalhes - Corte",
              resposta:
                "*Corte Masculino* - R$ 30,00\n\nInclui lavagem, corte personalizado e finalizacao.\nDuracao aproximada: 30 minutos.",
              ativo: true,
            },
            {
              id: gerarId(),
              numero: "3.2",
              titulo: "Detalhes - Barba",
              resposta:
                "*Barba Completa* - R$ 20,00\n\nInclui toalha quente, alinhamento e finalizacao.\nDuracao aproximada: 20 minutos.",
              ativo: true,
            },
          ],
          ativo: true,
        },
        {
          id: gerarId(),
          numero: "4",
          titulo: "Falar com atendente",
          resposta:
            "Ok! Um atendente sera chamado.\n\nAguarde um momento, por favor...",
          submenu: [],
          ativo: true,
        },
      ],

      // Mensagens
      mensagensLog: [],

      // Stats
      totalEnviadas: 0,
      totalRecebidas: 0,
      totalAutomaticas: 0,

      // Acoes
      setConfigEvolution: (config) =>
        set((state) => ({
          configEvolution: { ...state.configEvolution, ...config },
        })),

      setQrCode: (qr) => set({ qrCodeBase64: qr }),

      setStatusConexao: (status) =>
        set({
          statusConexao: status,
          conectado: status === "conectado",
        }),

      setChatbotAtivo: (ativo) => set({ chatbotAtivo: ativo }),

      setMensagemBoasVindas: (msg) => set({ mensagemBoasVindas: msg }),

      setMensagemPadrao: (msg) => set({ mensagemPadrao: msg }),

      addMenuItem: (item) =>
        set((state) => ({
          menuItems: [...state.menuItems, { ...item, id: gerarId(), submenu: [] }],
        })),

      updateMenuItem: (id, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      removeMenuItem: (id) =>
        set((state) => ({
          menuItems: state.menuItems.filter((m) => m.id !== id),
        })),

      addSubmenuItem: (menuId, item) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) =>
            m.id === menuId
              ? { ...m, submenu: [...m.submenu, { ...item, id: gerarId() }] }
              : m
          ),
        })),

      updateSubmenuItem: (menuId, subId, updates) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) =>
            m.id === menuId
              ? {
                  ...m,
                  submenu: m.submenu.map((s) =>
                    s.id === subId ? { ...s, ...updates } : s
                  ),
                }
              : m
          ),
        })),

      removeSubmenuItem: (menuId, subId) =>
        set((state) => ({
          menuItems: state.menuItems.map((m) =>
            m.id === menuId
              ? { ...m, submenu: m.submenu.filter((s) => s.id !== subId) }
              : m
          ),
        })),

      addMensagemLog: (msg) =>
        set((state) => ({
          mensagensLog: [
            { ...msg, id: gerarId() },
            ...state.mensagensLog,
          ].slice(0, 200),
        })),

      limparMensagens: () => set({ mensagensLog: [] }),

      incrementarStats: (tipo) =>
        set((state) => ({
          totalEnviadas:
            tipo === "enviada" || tipo === "automatica"
              ? state.totalEnviadas + 1
              : state.totalEnviadas,
          totalRecebidas:
            tipo === "recebida"
              ? state.totalRecebidas + 1
              : state.totalRecebidas,
          totalAutomaticas:
            tipo === "automatica"
              ? state.totalAutomaticas + 1
              : state.totalAutomaticas,
        })),

      conectar: async () => {
        const { configEvolution } = get();
        set({ statusConexao: "conectando", qrCodeBase64: null });

        try {
          const res = await fetch("/api/zapbot/conectar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(configEvolution),
          });

          if (!res.ok) throw new Error("Erro ao conectar");

          const data = await res.json();

          if (data.qrCode) {
            set({ qrCodeBase64: data.qrCode, statusConexao: "conectando" });
          } else if (data.connected) {
            set({
              statusConexao: "conectado",
              conectado: true,
              qrCodeBase64: null,
            });
          }
        } catch {
          // Modo demonstracao: simula conexao apos 3s
          await new Promise((resolve) => setTimeout(resolve, 3000));
          set({
            statusConexao: "conectado",
            conectado: true,
            qrCodeBase64: null,
          });
        }
      },

      desconectar: () => {
        set({
          statusConexao: "desconectado",
          conectado: false,
          qrCodeBase64: null,
        });
      },
    }),
    {
      name: "zapbot-pro-storage",
      partialize: (state) => ({
        configEvolution: state.configEvolution,
        chatbotAtivo: state.chatbotAtivo,
        mensagemBoasVindas: state.mensagemBoasVindas,
        mensagemPadrao: state.mensagemPadrao,
        menuItems: state.menuItems,
        totalEnviadas: state.totalEnviadas,
        totalRecebidas: state.totalRecebidas,
        totalAutomaticas: state.totalAutomaticas,
      }),
    }
  )
);