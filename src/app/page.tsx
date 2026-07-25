"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sun,
  Moon,
  FileText,
  BarChart3,
  Building2,
  LayoutDashboard,
  CalendarDays,
  Receipt,
  Users,
  LogOut,
  Sparkles,
  Bot,
  Send,
  TrendingUp,
  GitBranch,
} from "lucide-react";
import { EmpresaPanel } from "@/components/erp/empresa-panel";
import { CatalogoServicos } from "@/components/erp/catalogo-servicos";
import { CRMClientes } from "@/components/erp/crm-clientes";
import { LancamentoForm } from "@/components/erp/lancamento-form";
import { AcoesCupom } from "@/components/erp/acoes-cupom";
import { Historico } from "@/components/erp/historico";
import { DashboardGrafico } from "@/components/erp/dashboard-grafico";
import { PainelAgendamento } from "@/components/erp/painel-agendamento";
import { PainelDespesas } from "@/components/erp/painel-despesas";
import { PainelColaboradores } from "@/components/erp/painel-colaboradores";
import { InicializadorLogo } from "@/components/erp/inicializador-logo";
import { TelaLogin, destruirSessao } from "@/components/erp/tela-login";
import { GeradorStories } from "@/components/erp/gerador-stories";
import { ZapBotDisparo } from "@/components/zapbot/disparo-massa";
import { FunilLeads } from "@/components/crm/funil-leads";
import { ZapBotFluxos } from "@/components/zapbot/fluxos-automacao";
import type { Venda } from "@/types";

const SESSION_KEY = "zapfacil_session";

function verificarSessao(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "autenticado";
}

const AUTH_KEY = "zapfacil_auth";

function carregarNomeLogin(): string {
  if (typeof window === "undefined") return "";
  try {
    const item = localStorage.getItem(AUTH_KEY);
    if (!item) return "";
    const cred = JSON.parse(item);
    return cred?.nomeResponsavel || "";
  } catch {
    return "";
  }
}

// === Leitura de feature flags do localStorage (escrito pelo admin) ===
function verificarFlag(chave: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(chave) === "true";
}

export default function ZapFacilPage() {
  const { theme, setTheme } = useTheme();
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("lancamento");
  const [nomeLogin, setNomeLogin] = useState("");

  // Feature flags Premium (via localStorage bridge do admin)
  const [zapbotAtivo, setZapbotAtivo] = useState(false);
  const [disparoAtivo, setDisparoAtivo] = useState(false);
  const [funilAtivo, setFunilAtivo] = useState(false);
  const [fluxosAtivo, setFluxosAtivo] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    setAutenticado(verificarSessao());
    if (verificarSessao()) {
      setNomeLogin(carregarNomeLogin());
    }
    mountedRef.current = true;
  }, []);

  // Polling: verifica flags a cada 2s (admin pode alterar a qualquer momento)
  useEffect(() => {
    if (!autenticado) return;

    const pollFlags = () => {
      setZapbotAtivo(verificarFlag("zapfacil_zapbot_habilitado"));
      setDisparoAtivo(verificarFlag("zapfacil_disparo_habilitado"));
      setFunilAtivo(verificarFlag("zapfacil_funil_habilitado"));
      setFluxosAtivo(verificarFlag("zapfacil_fluxos_habilitado"));
    };

    pollFlags();
    const interval = setInterval(pollFlags, 2000);
    return () => clearInterval(interval);
  }, [autenticado]);

  const handleAutenticado = useCallback(() => {
    setAutenticado(true);
    setNomeLogin(carregarNomeLogin());
  }, []);

  const handleLogout = useCallback(() => {
    destruirSessao();
    setAutenticado(false);
  }, []);

  const handleVendaCriada = useCallback((venda: Venda) => {
    setVendaAtual(venda);
    setAbaAtiva("lancamento");
  }, []);

  const handleReemitir = useCallback((venda: Venda) => {
    setVendaAtual(venda);
    setAbaAtiva("lancamento");
    setTimeout(() => {
      document
        .getElementById("cupom-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Calcula grid-cols dinâmico baseado nas features ativas
  const totalTabs = 4 + (zapbotAtivo ? 1 : 0) + (disparoAtivo ? 1 : 0) + (funilAtivo ? 1 : 0) + (fluxosAtivo ? 1 : 0);
  const gridColsClass = totalTabs <= 4 ? "grid-cols-4" : totalTabs <= 6 ? "grid-cols-4 sm:grid-cols-6" : totalTabs <= 8 ? "grid-cols-4 sm:grid-cols-8" : "grid-cols-5 sm:grid-cols-10 lg:grid-cols-12";

  // Aguardando verificação de sessão
  if (autenticado === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  // Tela de login
  if (!autenticado) {
    return <TelaLogin onAutenticado={handleAutenticado} />;
  }

  // === SISTEMA ERP (autenticado) ===
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <InicializadorLogo />
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-3 sm:px-4 py-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo-empresa.png"
              alt="Logo"
              className="h-9 sm:h-11 w-auto object-contain"
            />
            {nomeLogin && (
              <div className="hidden sm:flex flex-col">
                <span className="text-xs text-gray-400 dark:text-gray-500 leading-tight">Ola,</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight">{nomeLogin}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge
              variant="outline"
              className="text-emerald-700 dark:text-emerald-400 text-[10px] border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950 font-semibold"
            >
              PRO
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {theme === "dark"
                      ? "Modo Claro"
                      : "Modo Escuro"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sair do Sistema</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-6">
        <Tabs
          value={abaAtiva}
          onValueChange={setAbaAtiva}
          className="space-y-4"
        >
          <TabsList className={`grid w-full ${gridColsClass} h-auto p-1 bg-white dark:bg-gray-900 border shadow-sm`}>
            {/* Tabs fixos do ERP */}
            <TabsTrigger
              value="lancamento"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Lancar</span>
              <span className="sm:hidden">Lanc.</span>
            </TabsTrigger>
            <TabsTrigger
              value="cadastros"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Building2 className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Cadastros</span>
              <span className="sm:hidden">Cad.</span>
            </TabsTrigger>
            <TabsTrigger
              value="agenda"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Agenda</span>
              <span className="sm:hidden">Ag.</span>
            </TabsTrigger>
            <TabsTrigger
              value="financeiro"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Receipt className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Financeiro</span>
              <span className="sm:hidden">Fin.</span>
            </TabsTrigger>

            {/* Tabs Premium condicionais */}
            {zapbotAtivo && (
              <TabsTrigger
                value="zapbot"
                className="text-xs py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Bot className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">ZapBot</span>
                <span className="sm:hidden">Bot</span>
              </TabsTrigger>
            )}
            {disparoAtivo && (
              <TabsTrigger
                value="disparo"
                className="text-xs py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Disparo</span>
                <span className="sm:hidden">Disp.</span>
              </TabsTrigger>
            )}
            {funilAtivo && (
              <TabsTrigger
                value="funil"
                className="text-xs py-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white"
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Funil</span>
                <span className="sm:hidden">Fun.</span>
              </TabsTrigger>
            )}
            {fluxosAtivo && (
              <TabsTrigger
                value="fluxos"
                className="text-xs py-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white"
              >
                <GitBranch className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Fluxos</span>
                <span className="sm:hidden">Flx.</span>
              </TabsTrigger>
            )}

            {/* Tabs fixas secundárias (hidden no mobile para caber) */}
            <TabsTrigger
              value="equipe"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white hidden lg:inline-flex"
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              Equipe
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white hidden lg:inline-flex"
            >
              <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white hidden lg:inline-flex"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1" />
              Relatorios
            </TabsTrigger>
            <TabsTrigger
              value="stories"
              className="text-xs py-2 data-[state=active]:bg-pink-600 data-[state=active]:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Stories IA</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Lancamento */}
          <TabsContent value="lancamento" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <LancamentoForm onVendaCriada={handleVendaCriada} />
              <div id="cupom-section">
                <AcoesCupom vendaAtual={vendaAtual} />
              </div>
            </div>
          </TabsContent>

          {/* Tab Cadastros */}
          <TabsContent value="cadastros" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <EmpresaPanel />
              </div>
              <CatalogoServicos />
              <CRMClientes />
            </div>
          </TabsContent>

          {/* Tab Agenda */}
          <TabsContent value="agenda">
            <PainelAgendamento />
          </TabsContent>

          {/* Tab Financeiro (Despesas) */}
          <TabsContent value="financeiro">
            <PainelDespesas />
          </TabsContent>

          {/* Tab ZapBot Premium */}
          {zapbotAtivo && (
            <TabsContent value="zapbot">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">ZapBot</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chatbot automatico para WhatsApp</p>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Configure seu ZapBot na aba &quot;ZapBot&quot; do painel admin ou contate o suporte.
                  </p>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Tab Disparo em Massa Premium */}
          {disparoAtivo && (
            <TabsContent value="disparo">
              <ZapBotDisparo />
            </TabsContent>
          )}

          {/* Tab Funil de Leads Premium */}
          {funilAtivo && (
            <TabsContent value="funil">
              <FunilLeads />
            </TabsContent>
          )}

          {/* Tab Fluxos de Automacao Premium */}
          {fluxosAtivo && (
            <TabsContent value="fluxos">
              <ZapBotFluxos />
            </TabsContent>
          )}

          {/* Tab Equipe */}
          <TabsContent value="equipe">
            <div className="max-w-2xl mx-auto">
              <PainelColaboradores />
            </div>
          </TabsContent>

          {/* Tab Dashboard */}
          <TabsContent value="dashboard">
            <DashboardGrafico />
          </TabsContent>

          {/* Tab Relatorios */}
          <TabsContent value="historico">
            <Historico onReemitir={handleReemitir} />
          </TabsContent>

          {/* Tab Stories IA */}
          <TabsContent value="stories">
            <GeradorStories />
          </TabsContent>

        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-center py-3 text-[10px] text-gray-400 px-4 border-t border-gray-700 mt-auto">
        <p>&copy; 2026 ZapFacil Mobile Ecosystem. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
