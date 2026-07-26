"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Wifi,
  WifiOff,
  Clock,
  MessageSquare,
  Power,
  PowerOff,
  Phone,
  HelpCircle,
} from "lucide-react";

interface StatusZapBot {
  servidorConfigurado: boolean;
  conectado: boolean;
  numeroConectado: string | null;
  ultimaMensagem: string | null;
  ultimaMensagemData: string | null;
  boasVindas: string | null;
  menuAtivo: boolean;
  respostasAtivas: number;
}

/**
 * Painel ZapBot - Lado do Cliente
 *
 * Mostra STATUS do ZapBot configurado pelo admin.
 * O cliente NÃO configura — apenas visualiza que o bot está ativo,
 * qual número está conectado, e estatísticas básicas.
 *
 * Quando o admin ainda não configurou o servidor Evolution API global
 * (Etapa 2 pendente), mostra mensagem amigável pedindo pra contatar suporte.
 */
export function PainelZapBotCliente() {
  const [status, setStatus] = useState<StatusZapBot | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarStatus = async () => {
      try {
        // Pegar email do localStorage (mesma chave usada pelo tela-login)
        const authRaw =
          typeof window !== "undefined"
            ? localStorage.getItem("zapfacil_auth")
            : null;
        let email = "";
        try {
          email = authRaw ? JSON.parse(authRaw)?.email || "" : "";
        } catch {
          email = "";
        }

        if (!email) {
          setErro("Email não encontrado. Faça login novamente.");
          return;
        }

        const res = await fetch(
          `/api/zapbot/status-cliente?email=${encodeURIComponent(email)}`,
          {
            cache: "no-store",
          }
        );
        if (!res.ok) {
          setErro("Não foi possível carregar o status do ZapBot.");
          return;
        }
        const data = await res.json();
        if (data.ok) {
          setStatus(data.status);
        } else {
          setErro(data.error || "Erro ao buscar status.");
        }
      } catch (e) {
        console.error("[PainelZapBotCliente] erro:", e);
        setErro("Erro de conexão.");
      } finally {
        setCarregando(false);
      }
    };

    buscarStatus();
    // Polling a cada 30s para atualizar status
    const interval = setInterval(buscarStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (carregando) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ZapBot</h2>
            <p className="text-xs text-muted-foreground">Carregando status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Cenário 1: servidor Evolution API ainda não configurado globalmente
  if (status && !status.servidorConfigurado) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ZapBot</h2>
            <p className="text-xs text-muted-foreground">
              Chatbot automático para WhatsApp
            </p>
          </div>
        </div>

        <Card className="border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Bot className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Seu ZapBot está quase pronto!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                O recurso <strong>ZapBot</strong> foi liberado para você. Nossa
                equipe está finalizando a configuração do servidor de
                atendimento automático.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-left">
              <p className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>O que você precisa fazer:</strong> contate o suporte
                  pelo WhatsApp informando seu email de cadastro. Vamos
                  configurar o bot personalizado para sua empresa em poucos
                  minutos.
                </span>
              </p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                const numero = "5511999999999"; // trocar pelo suporte real
                const msg = encodeURIComponent(
                  "Olá! Preciso configurar o ZapBot para minha conta. Meu email de cadastro é: "
                );
                window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
              Falar com Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cenário 2: servidor configurado, mas bot não conectado pra este cliente
  if (status && status.servidorConfigurado && !status.conectado) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">ZapBot</h2>
            <p className="text-xs text-muted-foreground">
              Chatbot automático para WhatsApp
            </p>
          </div>
        </div>

        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <WifiOff className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Aguardando ativação
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                O servidor está pronto, mas o seu WhatsApp ainda não foi
                conectado ao bot. Entre em contato com o suporte para concluir a
                ativação escaneando o QR Code.
              </p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                const numero = "5511999999999";
                const msg = encodeURIComponent(
                  "Olá! Meu ZapBot está aguardando ativação. Quero escanear o QR Code. Email: "
                );
                window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2 shrink-0" />
              Solicitar Ativação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cenário 3: bot ativo e conectado — mostrar status + estatísticas
  if (status && status.conectado) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">ZapBot</h2>
            <p className="text-xs text-muted-foreground">
              Chatbot automático para WhatsApp
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5" />
            Online
          </Badge>
        </div>

        {/* Stats principais */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Wifi className="h-5 w-5 text-green-600 mx-auto mb-1.5" />
              <p className="text-sm font-bold">Online</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">
                Status
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <MessageSquare className="h-5 w-5 text-purple-600 mx-auto mb-1.5" />
              <p className="text-sm font-bold">{status.respostasAtivas}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">
                Regras Ativas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Power className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
              <p className="text-sm font-bold">
                {status.menuAtivo ? "Ativo" : "Off"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">
                Menu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Número conectado */}
        {status.numeroConectado && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                WhatsApp Conectado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-mono font-bold text-foreground">
                {status.numeroConectado}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recebendo atendimentos automáticos neste número
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de boas-vindas */}
        {status.boasVindas && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                Mensagem de Boas-vindas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg border">
                {status.boasVindas}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Última mensagem recebida */}
        {status.ultimaMensagem && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                Última Interação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{status.ultimaMensagem}</p>
              {status.ultimaMensagemData && (
                <p className="text-xs text-muted-foreground mt-1">
                  {status.ultimaMensagemData}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Aviso de suporte */}
        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Precisa alterar mensagens, menu ou horário de atendimento?
                Contate o suporte pelo WhatsApp para ajustar as configurações do
                seu bot.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">ZapBot</h2>
          <p className="text-xs text-muted-foreground">
            Chatbot automático para WhatsApp
          </p>
        </div>
      </div>
      {erro && (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-700 dark:text-red-400">{erro}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
