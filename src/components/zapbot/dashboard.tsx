"use client";

import { useZapBotProStore } from "@/hooks/use-zapbot-pro-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send,
  MessageSquare,
  Bot,
  TrendingUp,
  Wifi,
  WifiOff,
  Zap,
  ArrowUpRight,
  Clock,
} from "lucide-react";

export function ZapBotDashboard() {
  const {
    conectado,
    statusConexao,
    chatbotAtivo,
    menuItems,
    mensagensLog,
    totalEnviadas,
    totalRecebidas,
    totalAutomaticas,
    configEvolution,
  } = useZapBotProStore();

  const taxaResposta =
    totalRecebidas > 0
      ? Math.round((totalAutomaticas / totalRecebidas) * 100)
      : 0;

  const mensagensRecentes = mensagensLog.slice(0, 5);

  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1 capitalize">{hoje}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={conectado ? "default" : "secondary"}
            className={conectado ? "bg-emerald-600" : ""}
          >
            {conectado ? (
              <Wifi className="h-3.5 w-3.5 mr-1" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 mr-1" />
            )}
            {statusConexao === "conectado"
              ? "Online"
              : statusConexao === "conectando"
                ? "Conectando..."
                : "Offline"}
          </Badge>
          <Badge variant={chatbotAtivo ? "default" : "outline"} className={chatbotAtivo ? "bg-emerald-600" : ""}>
            <Bot className="h-3.5 w-3.5 mr-1" />
            Chatbot {chatbotAtivo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enviadas</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnviadas}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Send className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recebidas</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecebidas}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Automaticas</p>
                <p className="text-2xl font-bold text-gray-900">{totalAutomaticas}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Bot className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Taxa Resposta</p>
                <p className="text-2xl font-bold text-gray-900">{taxaResposta}%</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status da conexao */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600" />
              Status da Conexao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Status</span>
              <Badge
                className={
                  conectado
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {statusConexao === "conectado"
                  ? "Conectado"
                  : statusConexao === "conectando"
                    ? "Conectando..."
                    : statusConexao === "erro"
                      ? "Erro"
                      : "Desconectado"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Instancia</span>
              <span className="text-sm font-medium">{configEvolution.instanceName}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">API URL</span>
              <span className="text-sm font-mono text-xs">{configEvolution.apiUrl}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Chatbot</span>
              <Badge
                className={
                  chatbotAtivo
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {chatbotAtivo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Menu ativo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-600" />
              Menu do Chatbot
            </CardTitle>
          </CardHeader>
          <CardContent>
            {menuItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum menu configurado
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                  >
                    <span className="h-7 w-7 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {item.numero}
                    </span>
                    <span className="text-sm font-medium flex-1 truncate">
                      {item.titulo}
                    </span>
                    {item.ativo ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Off
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mensagens recentes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Mensagens Recentes
            </CardTitle>
            {mensagensRecentes.length > 0 && (
              <Badge variant="secondary">{mensagensLog.length} total</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {mensagensRecentes.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                Nenhuma mensagem registrada ainda.
              </p>
              <p className="text-xs text-gray-300 mt-1">
                As mensagens aparecerao aqui quando o bot estiver conectado.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mensagensRecentes.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.tipo === "enviada"
                        ? "bg-emerald-100"
                        : msg.tipo === "automatica"
                          ? "bg-amber-100"
                          : "bg-blue-100"
                    }`}
                  >
                    {msg.tipo === "enviada" ? (
                      <Send className="h-3.5 w-3.5 text-emerald-600" />
                    ) : msg.tipo === "automatica" ? (
                      <Bot className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {msg.nome || msg.numero}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {msg.data}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {msg.texto}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${
                      msg.tipo === "enviada"
                        ? "border-emerald-200 text-emerald-600"
                        : msg.tipo === "automatica"
                          ? "border-amber-200 text-amber-600"
                          : "border-blue-200 text-blue-600"
                    }`}
                  >
                    {msg.tipo === "enviada"
                      ? "Enviada"
                      : msg.tipo === "automatica"
                        ? "Auto"
                        : "Recebida"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick start (when not connected) */}
      {!conectado && (
        <Card className="border-emerald-300 bg-emerald-50/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">
                  Pronto para comecar?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configure a conexao com a Evolution API, escaneie o QR Code e ative seu chatbot automatico de WhatsApp.
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-emerald-600 shrink-0 hidden sm:block" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}