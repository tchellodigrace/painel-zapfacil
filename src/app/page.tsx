"use client";

import { useState, useCallback } from "react";
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
  Briefcase,
  Sun,
  Moon,
  FileText,
  BarChart3,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { EmpresaPanel } from "@/components/erp/empresa-panel";
import { CatalogoServicos } from "@/components/erp/catalogo-servicos";
import { CRMClientes } from "@/components/erp/crm-clientes";
import { LancamentoForm } from "@/components/erp/lancamento-form";
import { AcoesCupom } from "@/components/erp/acoes-cupom";
import { Historico } from "@/components/erp/historico";
import { DashboardGrafico } from "@/components/erp/dashboard-grafico";
import type { Venda } from "@/types";

export default function ZapFacilPage() {
  const { theme, setTheme } = useTheme();
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("lancamento");

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-emerald-600 text-white shadow-md py-3 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <div>
              <h1 className="text-base font-bold tracking-tight">
                ZapFacil ERP
              </h1>
              <p className="text-[9px] text-emerald-100">
                Sistema Profissional de Gestao
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-emerald-500/30 text-emerald-100 text-[10px] border-emerald-400/30"
            >
              V11.0 PRO
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-emerald-700"
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
          <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white dark:bg-gray-900 border shadow-sm">
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
              value="dashboard"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="text-xs py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Relatorios</span>
              <span className="sm:hidden">Rel.</span>
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

          {/* Tab Dashboard */}
          <TabsContent value="dashboard">
            <DashboardGrafico />
          </TabsContent>

          {/* Tab Relatorios */}
          <TabsContent value="historico">
            <Historico onReemitir={handleReemitir} />
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