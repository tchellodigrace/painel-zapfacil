"use client";

import { useState, useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Trash2,
  Search,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Eye,
  MessageCircle,
} from "lucide-react";
import { formatarMoeda, gerarId } from "@/lib/utils-erp";
import type {
  Agendamento,
  StatusAgendamento,
  STATUS_AGENDAMENTO as StatusAgendamentoConst,
} from "@/types";
import { STATUS_AGENDAMENTO } from "@/types";

const STATUS_FLOW: Record<StatusAgendamento, StatusAgendamento | null> = {
  AGENDADO: "CONFIRMADO",
  CONFIRMADO: "EM_ANDAMENTO",
  EM_ANDAMENTO: "CONCLUIDO",
  CONCLUIDO: null,
  CANCELADO: null,
};

const STATUS_ICONS: Record<StatusAgendamento, React.ReactNode> = {
  AGENDADO: <Clock className="h-3.5 w-3.5" />,
  CONFIRMADO: <CheckCircle2 className="h-3.5 w-3.5" />,
  EM_ANDAMENTO: <PlayCircle className="h-3.5 w-3.5" />,
  CONCLUIDO: <CheckCircle2 className="h-3.5 w-3.5" />,
  CANCELADO: <XCircle className="h-3.5 w-3.5" />,
};

export function PainelAgendamento() {
  const {
    clientes,
    servicos,
    colaboradores,
    agendamentos,
    adicionarAgendamento,
    alterarStatusAgendamento,
    removerAgendamento,
  } = useERPStore();

  const [clienteId, setClienteId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [colaboradorId, setColaboradorId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [duracao, setDuracao] = useState("30");
  const [obs, setObs] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [detalheAberto, setDetalheAberto] = useState<Agendamento | null>(null);

  const agendamentosFiltrados = useMemo(() => {
    let lista = agendamentos;

    if (filtroData) {
      lista = lista.filter((a) => a.data === filtroData);
    }

    if (filtroStatus !== "todos") {
      lista = lista.filter((a) => a.status === filtroStatus);
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (a) =>
          a.clienteNome.toLowerCase().includes(termo) ||
          a.servicoNome.toLowerCase().includes(termo) ||
          a.colaboradorNome.toLowerCase().includes(termo)
      );
    }

    return lista.sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data);
      return a.hora.localeCompare(b.hora);
    });
  }, [agendamentos, busca, filtroData, filtroStatus]);

  const statsHoje = useMemo(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    const doDia = agendamentos.filter((a) => a.data === hoje);
    return {
      total: doDia.length,
      pendentes: doDia.filter((a) => a.status === "AGENDADO" || a.status === "CONFIRMADO").length,
      emAndamento: doDia.filter((a) => a.status === "EM_ANDAMENTO").length,
      concluidos: doDia.filter((a) => a.status === "CONCLUIDO").length,
    };
  }, [agendamentos]);

  const handleAdicionar = () => {
    const cliente = clientes.find((c) => c.id === clienteId);
    const servico = servicos.find((s) => s.id === servicoId);
    const colaborador = colaboradores.find((c) => c.id === colaboradorId);

    if (!cliente) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!servico) {
      toast.error("Selecione um servico.");
      return;
    }
    if (!data) {
      toast.error("Informe a data.");
      return;
    }
    if (!hora) {
      toast.error("Informe o horario.");
      return;
    }

    const dataFormatada = data.includes("/")
      ? data
      : new Date(data + "T12:00:00").toLocaleDateString("pt-BR");

    const agendamento: Agendamento = {
      id: gerarId(),
      clienteNome: cliente.nome,
      clienteTelefone: cliente.telefone,
      servicoNome: servico.nome,
      colaboradorId: colaboradorId || "",
      colaboradorNome: colaborador?.nome || "",
      data: dataFormatada,
      hora,
      duracaoMinutos: parseInt(duracao) || 30,
      valor: servico.valor,
      status: "AGENDADO",
      observacoes: obs.trim(),
      criadoEm: new Date().toISOString(),
      timestamp: Date.now(),
    };

    adicionarAgendamento(agendamento);
    setClienteId("");
    setServicoId("");
    setColaboradorId("");
    setData("");
    setHora("");
    setDuracao("30");
    setObs("");
    toast.success("Agendamento criado com sucesso!");
  };

  const handleProximoStatus = (agendamento: Agendamento) => {
    const proximo = STATUS_FLOW[agendamento.status];
    if (proximo) {
      alterarStatusAgendamento(agendamento.id, proximo);
      const statusInfo = STATUS_AGENDAMENTO.find((s) => s.valor === proximo);
      toast.success(`Status alterado para: ${statusInfo?.label || proximo}`);
    }
  };

  const handleCancelar = (id: string) => {
    alterarStatusAgendamento(id, "CANCELADO");
    toast.info("Agendamento cancelado.");
  };

  const handleWhatsApp = (telefone: string, nome: string) => {
    const telLimpo = telefone.replace(/\D/g, "");
    const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;
    const msg = encodeURIComponent(
      `Ola ${nome}! Aqui e da ${useERPStore.getState().empresa.nome || "sua empresa"}.`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
  };

  const obterStatusInfo = (status: StatusAgendamento) => {
    return STATUS_AGENDAMENTO.find((s) => s.valor === status) || STATUS_AGENDAMENTO[0];
  };

  const hojeStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            Agenda de Compromissos
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {statsHoje.total} hoje
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats rápidos do dia */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 text-center border border-blue-100 dark:border-blue-900">
              <p className="text-sm font-black text-blue-700 dark:text-blue-400">{statsHoje.pendentes}</p>
              <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase">Pendentes</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2 text-center border border-amber-100 dark:border-amber-900">
              <p className="text-sm font-black text-amber-700 dark:text-amber-400">{statsHoje.emAndamento}</p>
              <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase">Em Curso</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-2 text-center border border-emerald-100 dark:border-emerald-900">
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{statsHoje.concluidos}</p>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Concluidos</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 text-center border">
              <p className="text-sm font-black">{statsHoje.total}</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase">Total Hoje</p>
            </div>
          </div>

          {/* Formulário de agendamento */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900 space-y-2">
            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Novo Agendamento</p>
            <div className="grid grid-cols-2 gap-2">
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Cliente *" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={servicoId} onValueChange={setServicoId}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Servico *" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.nome} - {formatarMoeda(s.valor)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={colaboradorId} onValueChange={setColaboradorId}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Profissional (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.filter((c) => c.ativo).map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.nome} ({c.especialidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="15"
                step="15"
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                className="text-xs h-9"
                placeholder="Duracao (min)"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="text-xs h-9"
              />
              <Input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              className="text-xs min-h-[50px]"
              placeholder="Observacoes (opcional)..."
            />
            <Button
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
              onClick={handleAdicionar}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Agendar
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar agendamento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="text-xs h-9 pl-8"
              />
            </div>
            <Input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="text-xs h-9 sm:w-36"
              placeholder="Filtrar data"
            />
            {filtroData && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-xs text-blue-600"
                onClick={() => setFiltroData(hojeStr)}
              >
                Hoje
              </Button>
            )}
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-32 text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos" className="text-xs">Todos</SelectItem>
                {STATUS_AGENDAMENTO.map((s) => (
                  <SelectItem key={s.valor} value={s.valor} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de agendamentos */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {agendamentosFiltrados.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6 italic">
                Nenhum agendamento encontrado.
              </p>
            )}
            {agendamentosFiltrados.map((ag) => {
              const statusInfo = obterStatusInfo(ag.status);
              const podeAvancar = STATUS_FLOW[ag.status] !== null;
              return (
                <div
                  key={ag.id}
                  className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs">{ag.clienteNome}</span>
                        <Badge
                          variant="secondary"
                          className={`text-[9px] px-1.5 py-0 ${statusInfo.cor}`}
                        >
                          {STATUS_ICONS[ag.status]}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {ag.data} {ag.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {ag.duracaoMinutos}min
                        </span>
                        <span className="flex items-center gap-1">
                          <Wrench className="h-3 w-3" />
                          {ag.servicoNome}
                        </span>
                        {ag.colaboradorNome && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ag.colaboradorNome}
                          </span>
                        )}
                      </div>
                      {ag.observacoes && (
                        <p className="text-[10px] text-muted-foreground mt-1 italic truncate">
                          {ag.observacoes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                      {formatarMoeda(ag.valor)}
                    </span>
                  </div>
                  <div className="flex gap-1.5 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] text-muted-foreground"
                      onClick={() => setDetalheAberto(ag)}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Detalhes
                    </Button>
                    {ag.clienteTelefone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] text-emerald-600"
                        onClick={() => handleWhatsApp(ag.clienteTelefone, ag.clienteNome)}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    )}
                    {podeAvancar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] text-blue-600"
                        onClick={() => handleProximoStatus(ag)}
                      >
                        {STATUS_ICONS[ag.status]}
                        <span className="ml-1">Avançar</span>
                      </Button>
                    )}
                    {ag.status !== "CANCELADO" && ag.status !== "CONCLUIDO" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] text-red-500"
                        onClick={() => handleCancelar(ag.id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Cancelar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] text-red-500"
                      onClick={() => {
                        if (confirm("Excluir agendamento?")) {
                          removerAgendamento(ag.id);
                          toast.success("Agendamento excluido.");
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalhes */}
      <Dialog open={!!detalheAberto} onOpenChange={() => setDetalheAberto(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>
          {detalheAberto && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{detalheAberto.clienteNome}</span>
                  <Badge variant="secondary" className={`text-[10px] ${obterStatusInfo(detalheAberto.status).cor}`}>
                    {obterStatusInfo(detalheAberto.status).label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Data e Hora</span>
                    <span className="font-medium">{detalheAberto.data} as {detalheAberto.hora}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Duracao</span>
                    <span className="font-medium">{detalheAberto.duracaoMinutos} minutos</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Servico</span>
                    <span className="font-medium">{detalheAberto.servicoNome}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">Valor</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatarMoeda(detalheAberto.valor)}</span>
                  </div>
                  {detalheAberto.colaboradorNome && (
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Profissional</span>
                      <span className="font-medium">{detalheAberto.colaboradorNome}</span>
                    </div>
                  )}
                  {detalheAberto.clienteTelefone && (
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Telefone</span>
                      <span className="font-medium">{detalheAberto.clienteTelefone}</span>
                    </div>
                  )}
                </div>
                {detalheAberto.observacoes && (
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase mb-0.5">Observacoes</span>
                    <p className="text-xs bg-background p-2 rounded border">{detalheAberto.observacoes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {STATUS_FLOW[detalheAberto.status] && (
                  <Button
                    className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                    onClick={() => {
                      handleProximoStatus(detalheAberto);
                      setDetalheAberto(null);
                    }}
                  >
                    Avançar para: {obterStatusInfo(STATUS_FLOW[detalheAberto.status] as StatusAgendamento).label}
                  </Button>
                )}
                {detalheAberto.status !== "CANCELADO" && detalheAberto.status !== "CONCLUIDO" && (
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      handleCancelar(detalheAberto.id);
                      setDetalheAberto(null);
                    }}
                  >
                    Cancelar Agendamento
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}