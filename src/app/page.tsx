"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Bot,
  Send,
  TrendingUp,
  GitBranch,
  Mail,
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

// === Carrega email do cliente logado ===
function carregarEmailLogin(): string {
  if (typeof window === "undefined") return "";
  try {
    const item = localStorage.getItem(AUTH_KEY);
    if (!item) return "";
    const cred = JSON.parse(item);
    return cred?.email || "";
  } catch {
    return "";
  }
}

export default function ZapFacilPage() {
  const { theme, setTheme } = useTheme();
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("lancamento");
  const [nomeLogin, setNomeLogin] = useState("");
  const [emailLogin, setEmailLogin] = useState("");
  const [mostrarCredenciais, setMostrarCredenciais] = useState(false);

  // Feature flags Premium (buscadas do Supabase)
  const [zapbotAtivo, setZapbotAtivo] = useState(false);
  const [disparoAtivo, setDisparoAtivo] = useState(false);
  const [funilAtivo, setFunilAtivo] = useState(false);
  const [fluxosAtivo, setFluxosAtivo] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    setAutenticado(verificarSessao());
    if (verificarSessao()) {
      setNomeLogin(carregarNomeLogin());
      setEmailLogin(carregarEmailLogin());
    }
    mountedRef.current = true;
  }, []);

  // Buscar feature flags do Supabase (multi-device)
  // Polling a cada 15s — admin pode alterar a qualquer momento
  useEffect(() => {
    if (!autenticado) return;

    const email = carregarEmailLogin();
    if (!email) return;

    const buscarFlags = async () => {
      try {
        const res = await fetch(
          `/api/cliente/sistema?email=${encodeURIComponent(email)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.sistema) {
          setZapbotAtivo(!!data.sistema.zapbotAtivo);
          setDisparoAtivo(!!data.sistema.disparoAtivo);
          setFunilAtivo(!!data.sistema.funilAtivo);
          setFluxosAtivo(!!data.sistema.fluxosAtivo);
        }
      } catch (e) {
        console.error("[buscarFlags] erro:", e);
      }
    };

    buscarFlags();
    const interval = setInterval(buscarFlags, 15000);
    return () => clearInterval(interval);
  }, [autenticado]);

  const handleAutenticado = useCallback(() => {
    setAutenticado(true);
    setNomeLogin(carregarNomeLogin());
    setEmailLogin(carregarEmailLogin());
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/30" />
          <div className="h-4 w-32 bg-muted dark:bg-gray-800 rounded" />
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
    <div className="min-h-screen flex flex-col bg-background">
      <InicializadorLogo />
      {/* Header com glass effect e sombra sticky (identico ao painel admin) */}
      <header className="glass border-b border-border sticky top-0 z-50 shadow-sticky">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <img
              src="/logo-cliente.png"
              alt="Logo"
              width={400}
              height={100}
              className="h-[50px] w-[200px] sm:h-[60px] sm:w-[240px] md:h-[70px] md:w-[280px] lg:h-[80px] lg:w-[320px] xl:h-[100px] xl:w-[400px] object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Dados do cliente logado - estilo admin (card clicavel) */}
            <button
              type="button"
              onClick={() => setMostrarCredenciais(!mostrarCredenciais)}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg px-3 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {(nomeLogin || "C").charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {nomeLogin || "Cliente"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
                  {mostrarCredenciais ? (
                    <span className="font-mono text-muted-foreground">
                      {emailLogin || "—"}
                    </span>
                  ) : (
                    <><Mail className="h-2.5 w-2.5 shrink-0" />{emailLogin || "—"}</>
                  )}
                </p>
              </div>
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground shrink-0"
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 shrink-0" />
                    ) : (
                      <Moon className="h-4 w-4 shrink-0" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair do Sistema</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* Abas de navegacao - pill bar (identica ao painel admin) */}
        <div className={`grid ${gridColsClass} bg-card rounded-xl p-1 border border-border shadow-card`}>
          <button
            onClick={() => setAbaAtiva("lancamento")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "lancamento"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Lancar</span>
          </button>
          <button
            onClick={() => setAbaAtiva("cadastros")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "cadastros"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Cadastros</span>
          </button>
          <button
            onClick={() => setAbaAtiva("agenda")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "agenda"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Agenda</span>
          </button>
          <button
            onClick={() => setAbaAtiva("financeiro")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "financeiro"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Receipt className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Financeiro</span>
          </button>

          {/* Tabs Premium condicionais */}
          {zapbotAtivo && (
            <button
              onClick={() => setAbaAtiva("zapbot")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                abaAtiva === "zapbot"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Bot className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">ZapBot</span>
            </button>
          )}
          {disparoAtivo && (
            <button
              onClick={() => setAbaAtiva("disparo")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                abaAtiva === "disparo"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Send className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Disparo</span>
            </button>
          )}
          {funilAtivo && (
            <button
              onClick={() => setAbaAtiva("funil")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                abaAtiva === "funil"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Funil</span>
            </button>
          )}
          {fluxosAtivo && (
            <button
              onClick={() => setAbaAtiva("fluxos")}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                abaAtiva === "fluxos"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <GitBranch className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Fluxos</span>
            </button>
          )}

          {/* Tabs fixas secundarias (hidden no mobile para caber) */}
          <button
            onClick={() => setAbaAtiva("equipe")}
            className={`hidden lg:flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "equipe"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Equipe</span>
          </button>
          <button
            onClick={() => setAbaAtiva("dashboard")}
            className={`hidden lg:flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "dashboard"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Dashboard</span>
          </button>
          <button
            onClick={() => setAbaAtiva("historico")}
            className={`hidden lg:flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "historico"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Relatorios</span>
          </button>
        </div>

        {/* Conteudo da aba ativa */}
        <div className="space-y-4">
          {abaAtiva === "lancamento" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <LancamentoForm onVendaCriada={handleVendaCriada} />
              <div id="cupom-section">
                <AcoesCupom vendaAtual={vendaAtual} />
              </div>
            </div>
          )}

          {abaAtiva === "cadastros" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <EmpresaPanel />
              </div>
              <CatalogoServicos />
              <CRMClientes />
            </div>
          )}

          {abaAtiva === "agenda" && <PainelAgendamento />}

          {abaAtiva === "financeiro" && <PainelDespesas />}

          {abaAtiva === "zapbot" && zapbotAtivo && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">ZapBot</h2>
                  <p className="text-xs text-muted-foreground">Chatbot automatico para WhatsApp</p>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Configure seu ZapBot na aba &quot;ZapBot&quot; do painel admin ou contate o suporte.
                </p>
              </div>
            </div>
          )}

          {abaAtiva === "disparo" && disparoAtivo && <ZapBotDisparo />}

          {abaAtiva === "funil" && funilAtivo && <FunilLeads />}

          {abaAtiva === "fluxos" && fluxosAtivo && <ZapBotFluxos />}

          {abaAtiva === "equipe" && (
            <div className="max-w-2xl mx-auto">
              <PainelColaboradores />
            </div>
          )}

          {abaAtiva === "dashboard" && <DashboardGrafico />}

          {abaAtiva === "historico" && <Historico onReemitir={handleReemitir} />}
        </div>
      </main>

      {/* Footer - tokens semanticos */}
      <footer className="bg-card border-t border-border text-center py-3 text-[10px] text-muted-foreground px-4 mt-auto">
        <p>&copy; 2026 ZapFacil Mobile Ecosystem. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
