"use client";

import { useMemo, useState } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  BarChart3,
  Search,
  Trash2,
  Eye,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import { formatarMoeda, exportarParaCSV, filtrarVendasPorPeriodo } from "@/lib/utils-erp";
import type { Venda } from "@/types";

interface HistoricoProps {
  onReemitir: (venda: Venda) => void;
}

export function Historico({ onReemitir }: HistoricoProps) {
  const { vendas, removerVenda } = useERPStore();
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const vendasFiltradas = useMemo(() => {
    let lista = vendas;

    // Filtro de período
    if (periodo !== "todos") {
      lista = filtrarVendasPorPeriodo(lista, periodo) as Venda[];
    }

    // Filtro de status
    if (filtroStatus !== "todos") {
      lista = lista.filter((v) => v.status === filtroStatus);
    }

    // Busca
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (v) =>
          v.cliente.toLowerCase().includes(termo) ||
          v.itens.some((i) => i.servicoNome.toLowerCase().includes(termo))
      );
    }

    return lista;
  }, [vendas, busca, periodo, filtroStatus]);

  const stats = useMemo(() => {
    const vendasPeriodo = filtrarVendasPorPeriodo(vendas, periodo) as Venda[];
    const totalFaturado = vendasPeriodo.reduce((s, v) => s + v.total, 0);
    const totalPagas = vendasPeriodo
      .filter((v) => v.status === "PAGO")
      .reduce((s, v) => s + v.total, 0);
    const totalPendentes = vendasPeriodo
      .filter((v) => v.status === "PENDENTE")
      .reduce((s, v) => s + v.total, 0);
    const qtdVendas = vendasPeriodo.length;
    const qtdPagas = vendasPeriodo.filter((v) => v.status === "PAGO").length;
    const qtdPendentes = vendasPeriodo.filter(
      (v) => v.status === "PENDENTE"
    ).length;
    return {
      totalFaturado,
      totalPagas,
      totalPendentes,
      qtdVendas,
      qtdPagas,
      qtdPendentes,
    };
  }, [vendas, periodo]);

  const handleExportarCSV = () => {
    const dados = vendasFiltradas.map((v) => ({
      Data: v.data,
      Hora: v.hora,
      Cliente: v.cliente,
      Documento: v.docCliente,
      Servicos: v.itens.map((i) => i.servicoNome).join("; "),
      Subtotal: v.valor.toFixed(2),
      Desconto: v.desconto.toFixed(2),
      Acrescimo: v.acrescimo.toFixed(2),
      Total: v.total.toFixed(2),
      FormaPagamento: v.formaPagamento,
      Status: v.status,
    }));
    exportarParaCSV(dados);
    toast.success("CSV exportado!");
  };

  const handleCobrarPendente = (v: Venda) => {
    const empresa = useERPStore.getState().empresa;
    const msg = encodeURIComponent(
      `Ola ${v.cliente}!\n\n` +
        `Segue sua fatura de servico:\n\n` +
        `Empresa: ${empresa.nome || "Prestador"}\n` +
        `Data: ${v.data} as ${v.hora}\n\n` +
        `Servico(s):\n${v.itens.map((i) => `  - ${i.servicoNome} (${i.quantidade}x) ${formatarMoeda(i.valorTotal)}`).join("\n")}\n\n` +
        (v.desconto > 0 ? `Desconto: -${formatarMoeda(v.desconto)}\n` : "") +
        (v.acrescimo > 0 ? `Acrescimo: +${formatarMoeda(v.acrescimo)}\n` : "") +
        `TOTAL: ${formatarMoeda(v.total)}\n` +
        `Forma de Pagamento: ${v.formaPagamento}\n\n` +
        `Por favor, regularize o pagamento. Obrigado!`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
    toast.success("Mensagem de cobranca aberta no WhatsApp!");
  };

  const handleCobrarTodosPendentes = () => {
    const pendentes = vendasFiltradas.filter((v) => v.status === "PENDENTE");
    if (pendentes.length === 0) {
      toast.info("Nenhuma fatura pendente para cobrar.");
      return;
    }
    const empresa = useERPStore.getState().empresa;
    const msgs = pendentes.map((v) =>
      `*${v.cliente}* - ${v.data}\n` +
        `Servico: ${v.itens.map((i) => i.servicoNome).join(", ")}\n` +
        `Total: *${formatarMoeda(v.total)}*`
    ).join("\n\n");

    const resumo = encodeURIComponent(
      `*RELATORIO DE PENDENCIAS*\n` +
        `Empresa: ${empresa.nome || "Prestador"}\n` +
        `Data: ${new Date().toLocaleDateString("pt-BR")}\n\n` +
        msgs +
        `\n\nTotal Pendente: *${formatarMoeda(pendentes.reduce((s, v) => s + v.total, 0))}*\n` +
        `Quantidade: ${pendentes.length} fatura(s)`
    );
    window.open(
      `https://api.whatsapp.com/send?text=${resumo}`,
      "_blank"
    );
    toast.success(`Resumo de ${pendentes.length} cobranca(s) aberto!`);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-emerald-600" />
            Movimentações e Faturamento
          </CardTitle>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
              Total Faturado
            </span>
            <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
              {formatarMoeda(stats.totalFaturado)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-muted/50 rounded-lg p-3 text-center border">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase font-bold mb-1">
              <TrendingUp className="h-3 w-3" />
              Faturado
            </div>
            <p className="text-sm font-black">{formatarMoeda(stats.totalFaturado)}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3 text-center border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold mb-1">
              <CheckCircle2 className="h-3 w-3" />
              Recebido
            </div>
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
              {formatarMoeda(stats.totalPagas)}
            </p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-center border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold mb-1">
              <Clock className="h-3 w-3" />
              Pendente
            </div>
            <p className="text-sm font-black text-amber-700 dark:text-amber-400">
              {formatarMoeda(stats.totalPendentes)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center border">
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase font-bold mb-1">
              <BarChart3 className="h-3 w-3" />
              Vendas
            </div>
            <p className="text-sm font-black">
              {stats.qtdVendas}
              <span className="text-[10px] font-normal text-muted-foreground ml-1">
                ({stats.qtdPagas} / {stats.qtdPendentes})
              </span>
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou serviço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 text-sm h-9"
            />
          </div>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-full sm:w-36 text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="text-xs">
                Todo Período
              </SelectItem>
              <SelectItem value="hoje" className="text-xs">
                Hoje
              </SelectItem>
              <SelectItem value="semana" className="text-xs">
                Esta Semana
              </SelectItem>
              <SelectItem value="mes" className="text-xs">
                Este Mês
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full sm:w-32 text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="text-xs">
                Todos
              </SelectItem>
              <SelectItem value="PAGO" className="text-xs">
                Pagos
              </SelectItem>
              <SelectItem value="PENDENTE" className="text-xs">
                Pendentes
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={handleExportarCSV}
          >
            <Download className="h-3 w-3 mr-1" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            onClick={handleCobrarTodosPendentes}
          >
            <Send className="h-3 w-3 mr-1" />
            Cobrar Pendentes
          </Button>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {vendasFiltradas.length === 0 && (
            <div className="p-6 text-center text-muted-foreground text-xs">
              Nenhum registro encontrado.
            </div>
          )}
          {vendasFiltradas.map((v) => (
            <div key={v.id} className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{v.cliente}</p>
                  <p className="text-[11px] text-gray-400 truncate">{v.itens.map((i) => i.servicoNome).join(", ")}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="font-black text-sm text-gray-900">{formatarMoeda(v.total)}</p>
                  <Badge
                    variant={v.status === "PAGO" ? "default" : "secondary"}
                    className={`text-[10px] ${
                      v.status === "PAGO"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                    }`}
                  >
                    {v.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-gray-400">{v.data} {v.hora}</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] text-emerald-600" onClick={() => onReemitir(v)}>
                    <Eye className="h-3 w-3 mr-0.5" /> Ver
                  </Button>
                  {v.status === "PENDENTE" && (
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] text-amber-600" onClick={() => handleCobrarPendente(v)}>
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] text-red-500" onClick={() => { if (confirm("Excluir?")) { removerVenda(v.id); toast.success("Registro excluído."); } }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop tabela */}
        <div className="hidden sm:block overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="text-[10px] uppercase">
                <TableHead className="py-2 px-2">Data/Hora</TableHead>
                <TableHead className="py-2 px-2">Cliente</TableHead>
                <TableHead className="py-2 px-2">Serviço(s)</TableHead>
                <TableHead className="py-2 px-2 text-right">Total</TableHead>
                <TableHead className="py-2 px-2 text-center">Status</TableHead>
                <TableHead className="py-2 px-2 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendasFiltradas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground italic text-xs"
                  >
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
              {vendasFiltradas.map((v) => (
                <TableRow key={v.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="py-2 px-2 font-mono text-[10px] whitespace-nowrap">
                    <div>{v.data}</div>
                    <div className="text-muted-foreground">{v.hora}</div>
                  </TableCell>
                  <TableCell className="py-2 px-2 font-medium max-w-[100px] truncate">
                    {v.cliente}
                  </TableCell>
                  <TableCell className="py-2 px-2 max-w-[140px] truncate">
                    {v.itens.map((i) => i.servicoNome).join(", ")}
                  </TableCell>
                  <TableCell className="py-2 px-2 text-right font-bold whitespace-nowrap">
                    {formatarMoeda(v.total)}
                  </TableCell>
                  <TableCell className="py-2 px-2 text-center">
                    <Badge
                      variant={v.status === "PAGO" ? "default" : "secondary"}
                      className={`text-[10px] ${
                        v.status === "PAGO"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      }`}
                    >
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 px-2 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-emerald-600 text-[10px]"
                      onClick={() => onReemitir(v)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    {v.status === "PENDENTE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-amber-600 text-[10px]"
                        onClick={() => handleCobrarPendente(v)}
                        title="Cobrar via WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-red-500 text-[10px]"
                      onClick={() => {
                        if (confirm("Excluir este registro?")) {
                          removerVenda(v.id);
                          toast.success("Registro excluído.");
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {vendasFiltradas.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-right">
            Mostrando {vendasFiltradas.length} de {vendas.length} registros
          </p>
        )}
      </CardContent>
    </Card>
  );
}