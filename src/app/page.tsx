"use client";

import { useState, useCallback, useEffect } from "react";
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
  Bot,
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
import { PainelZapBot } from "@/components/erp/painel-zapbot";
import { InicializadorLogo } from "@/components/erp/inicializador-logo";
import { TelaLogin, destruirSessao } from "@/components/erp/tela-login";
import type { Venda } from "@/types";

const SESSION_KEY = "zapfacil_session";

function verificarSessao(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "autenticado";
}

export default function ZapFacilPage() {
  const { theme, setTheme } = useTheme();
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("lancamento");

  useEffect(() => {
    setAutenticado(verificarSessao());
  }, []);

  const handleAutenticado = useCallback(() => {
    setAutenticado(true);
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
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <img
              src="/logo-empresa.png"
              alt="Logo"
              className="h-11 w-auto object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
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
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        <Tabs
          value={abaAtiva}
          onValueChange={setAbaAtiva}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-5 sm:grid-cols-8 h-auto p-1 bg-white dark:bg-gray-900 border shadow-sm">
            <TabsTrigger
              value="lancamento"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Lancar</span>
              <span className="sm:hidden">Lanc.</span>
            </TabsTrigger>
            <TabsTrigger
              value="cadastros"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Cadastros</span>
              <span className="sm:hidden">Cad.</span>
            </TabsTrigger>
            <TabsTrigger
              value="agenda"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Agenda</span>
              <span className="sm:hidden">Ag.</span>
            </TabsTrigger>
            <TabsTrigger
              value="financeiro"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <Receipt className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Financeiro</span>
              <span className="sm:hidden">Fin.</span>
            </TabsTrigger>
            <TabsTrigger
              value="equipe"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white hidden sm:inline-flex"
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              Equipe
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white hidden sm:inline-flex"
            >
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white hidden sm:inline-flex"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              Relatorios
            </TabsTrigger>
            <TabsTrigger
              value="zapbot"
              className="text-xs py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Bot className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">ZapBot</span>
              <span className="sm:hidden">Bot</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Lancamento */}
          <TabsContent value="lancamento" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Tab ZapBot */}
          <TabsContent value="zapbot">
            <PainelZapBot />
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
