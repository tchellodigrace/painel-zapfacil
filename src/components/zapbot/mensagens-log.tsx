"use client";

import { useState, useMemo } from "react";
import { useZapBotProStore, type MensagemLog } from "@/hooks/use-zapbot-pro-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Bot,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ZapBotMensagens() {
  const { mensagensLog, limparMensagens, addMensagemLog, incrementarStats, conectado, chatbotAtivo } =
    useZapBotProStore();
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  function gerarMensagemTeste() {
    const numeros = ["+55119xxxx1234", "+55219xxxx5678", "+55319xxxx9012", "+55419xxxx3456"];
    const nomes = ["Joao Silva", "Maria Santos", "Pedro Costa", "Ana Oliveira"];
    const mensagensCliente = [
      "Ola, bom dia!",
      "1",
      "Quero agendar",
      "3",
      "3.1",
      "Horario de funcionamento",
      "xxx",
      "Boa tarde",
      "Preciso de um corte",
      "2",
      "Qual o valor?",
    ];
    const mensagensBot = [
      "Ola! Bem-vindo(a) a *Minha Empresa*!\n\nComo posso ajudar?",
      "Nosso horario e:\n\nSeg a Sex: 08:00 - 18:00\nSabado: 08:00 - 12:00",
      "Para agendar, envie:\n\n*Nome:*\n*Servico:*\n*Data:*\n*Horario:*",
      "Confira nossos servicos:\n\n1. Corte - R$ 30,00\n2. Barba - R$ 20,00",
      "*Corte Masculino* - R$ 30,00\n\nInclui lavagem e finalizacao.",
      "Desculpe, nao entendi. Escolha uma opcao do menu.",
    ];

    const idx = Math.floor(Math.random() * numeros.length);
    const isRecebida = Math.random() > 0.4;

    const msg: Omit<MensagemLog, "id"> = {
      numero: numeros[idx],
      nome: nomes[idx],
      texto: isRecebida
        ? mensagensCliente[Math.floor(Math.random() * mensagensCliente.length)]
        : mensagensBot[Math.floor(Math.random() * mensagensBot.length)],
      tipo: isRecebida
        ? "recebida"
        : Math.random() > 0.5
          ? "automatica"
          : "enviada",
      data: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      instancia: "zapbot-pro",
    };

    addMensagemLog(msg);
    incrementarStats(msg.tipo);
  }

  function gerarMultiplas() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => gerarMensagemTeste(), i * 200);
    }
    toast.success("5 mensagens simuladas!");
  }

  const mensagensFiltradas = useMemo(() => {
    return mensagensLog.filter((msg) => {
      const matchBusca =
        !busca ||
        msg.texto.toLowerCase().includes(busca.toLowerCase()) ||
        msg.numero.includes(busca) ||
        msg.nome.toLowerCase().includes(busca.toLowerCase());

      const matchTipo =
        filtroTipo === "todos" || msg.tipo === filtroTipo;

      return matchBusca && matchTipo;
    });
  }, [mensagensLog, busca, filtroTipo]);

  const contagem = useMemo(() => ({
    total: mensagensLog.length,
    enviadas: mensagensLog.filter((m) => m.tipo === "enviada").length,
    recebidas: mensagensLog.filter((m) => m.tipo === "recebida").length,
    automaticas: mensagensLog.filter((m) => m.tipo === "automatica").length,
  }), [mensagensLog]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mensagens</h2>
          <p className="text-gray-500 text-sm mt-1">
            Log de todas as mensagens recebidas e enviadas
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={gerarMensagemTeste}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Simular 1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={gerarMultiplas}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Simular 5
          </Button>
          {mensagensLog.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => {
                limparMensagens();
                toast.success("Log limpo!");
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-gray-50">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{contagem.total}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-700">{contagem.enviadas}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Enviadas</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-blue-700">{contagem.recebidas}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Recebidas</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-700">{contagem.automaticas}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Automaticas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por numero, nome ou conteudo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="recebida">Recebidas</SelectItem>
                <SelectItem value="enviada">Enviadas</SelectItem>
                <SelectItem value="automatica">Automaticas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de mensagens */}
      <Card>
        <CardContent className="p-0">
          {mensagensFiltradas.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {mensagensLog.length === 0
                  ? "Nenhuma mensagem registrada."
                  : "Nenhuma mensagem encontrada com esse filtro."}
              </p>
              {mensagensLog.length === 0 && (
                <p className="text-xs text-gray-300 mt-1">
                  Clique em &quot;Simular&quot; para gerar mensagens de teste.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {mensagensFiltradas.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors ${
                    msg.tipo === "recebida" ? "" : "bg-gray-50/50"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      msg.tipo === "enviada"
                        ? "bg-emerald-100"
                        : msg.tipo === "automatica"
                          ? "bg-amber-100"
                          : "bg-blue-100"
                    }`}
                  >
                    {msg.tipo === "enviada" ? (
                      <Send className="h-4 w-4 text-emerald-600" />
                    ) : msg.tipo === "automatica" ? (
                      <Bot className="h-4 w-4 text-amber-600" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {msg.nome || msg.numero}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {msg.numero}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap break-words">
                      {msg.texto}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-gray-400">{msg.data}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-400 pb-16 lg:pb-0">
        Exibindo {mensagensFiltradas.length} de {mensagensLog.length} mensagens
      </p>
    </div>
  );
}