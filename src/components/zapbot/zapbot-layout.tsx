"use client";

import { useState } from "react";
import { useZapBotProStore } from "@/hooks/use-zapbot-pro-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  QrCode,
  Bot,
  MessageSquare,
  Rocket,
  Menu,
  X,
  Zap,
} from "lucide-react";

type Pagina = "dashboard" | "conexao" | "chatbot" | "mensagens" | "deploy";

const navItems: { id: Pagina; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: "conexao", label: "Conexao", icon: <QrCode className="h-5 w-5" /> },
  { id: "chatbot", label: "Chatbot", icon: <Bot className="h-5 w-5" /> },
  { id: "mensagens", label: "Mensagens", icon: <MessageSquare className="h-5 w-5" /> },
  { id: "deploy", label: "Deploy", icon: <Rocket className="h-5 w-5" /> },
];

interface ZapBotLayoutProps {
  paginaAtiva: Pagina;
  setPaginaAtiva: (p: Pagina) => void;
  children: React.ReactNode;
}

export function ZapBotLayout({ paginaAtiva, setPaginaAtiva, children }: ZapBotLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { conectado, statusConexao, chatbotAtivo, totalEnviadas, totalRecebidas, mensagensLog } =
    useZapBotProStore();

  const naoLidas = mensagensLog.filter((m) => m.tipo === "recebida").length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-primary/25 text-white flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/50 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">ZapBot Pro</h1>
              <p className="text-white/80 text-xs">Automacao WhatsApp</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-primary/40"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-primary/40" />

        {/* Status */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                statusConexao === "conectado"
                  ? "bg-success animate-pulse"
                  : statusConexao === "conectando"
                    ? "bg-yellow-400 animate-pulse"
                    : statusConexao === "erro"
                      ? "bg-red-400"
                      : "bg-gray-500"
              )}
            />
            <span className="text-sm text-white/60">
              {statusConexao === "conectado"
                ? "Conectado"
                : statusConexao === "conectando"
                  ? "Conectando..."
                  : statusConexao === "erro"
                    ? "Erro na conexao"
                    : "Desconectado"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                chatbotAtivo ? "bg-primary/60" : "bg-gray-600"
              )}
            />
            <span className="text-sm text-white/60">
              Chatbot: {chatbotAtivo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <Separator className="bg-primary/40" />

        {/* Nav */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setPaginaAtiva(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full text-left",
                  paginaAtiva === item.id
                    ? "bg-primary text-white shadow-lg"
                    : "text-white/60 hover:bg-primary/50 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
                {item.id === "mensagens" && naoLidas > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                    {naoLidas}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer stats */}
        <div className="p-4 border-t border-primary/40">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-primary/80 text-base sm:text-lg font-bold font-display">{totalEnviadas}</p>
              <p className="text-primary/70 text-[10px] uppercase tracking-wider">Enviadas</p>
            </div>
            <div>
              <p className="text-primary/80 text-base sm:text-lg font-bold font-display">{totalRecebidas}</p>
              <p className="text-primary/70 text-[10px] uppercase tracking-wider">Recebidas</p>
            </div>
            <div>
              <p className="text-primary/80 text-base sm:text-lg font-bold font-display">{conectado ? "ON" : "OFF"}</p>
              <p className="text-primary/70 text-[10px] uppercase tracking-wider">Status</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar mobile */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-bold text-base">ZapBot Pro</h1>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                conectado ? "bg-success" : "bg-gray-400"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {conectado ? "Online" : "Offline"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-1.5 px-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPaginaAtiva(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors min-w-0 flex-1",
                paginaAtiva === item.id
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}