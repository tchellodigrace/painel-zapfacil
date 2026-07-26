"use client";

import { useState, useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Venda, Agendamento } from "@/types";
import { STATUS_AGENDAMENTO } from "@/types";
import {
  Search,
  ShoppingBag,
  CalendarCheck,
  Wallet,
  ChevronRight,
  Clock,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Receipt,
} from "lucide-react";

export function PortalCliente() {
  const { vendas, agendamentos, empresa } = useERPStore();
  const [busca, setBusca] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<{
    nome: string;
    telefone: string;
  } | null>(null);
  const [vendaDetalhe, setVendaDetalhe] = useState<Venda | null>(null);

  // Busca clientes únicos por telefone ou nome parcial
  const clientesEncontrados = useMemo(() => {
    if (busca.trim().length < 3) return [];
    const termo = busca.trim().toLowerCase();
    const mapa = new Map<
      string,
      { nome: string; telefone: string; doc: string }
    >();

    // Dos clientes cadastrados
    const clientes = useERPStore.getState().clientes;
    for (const c of clientes) {
      const matchNome = c.nome.toLowerCase().includes(termo);
      const matchTel = c.telefone.includes(termo);
      const matchDoc = c.documento.includes(termo);
      if (matchNome || matchTel || matchDoc) {
        mapa.set(c.telefone, {
          nome: c.nome,
          telefone: c.telefone,
          doc: c.documento,
        });
      }
    }

    // Das vendas (para pegar clientes que compraram mas podem não estar cadastrados)
    for (const v of vendas) {
      const matchNome = v.cliente.toLowerCase().includes(termo);
      const matchDoc = v.docCliente.includes(termo);
      if (matchNome || matchDoc) {
        if (!mapa.has(v.docCliente)) {
          mapa.set(v.docCliente, {
            nome: v.cliente,
            telefone: v.docCliente,
            doc: v.docCliente,
          });
        }
      }
    }

    // Dos agendamentos
    for (const a of agendamentos) {
      const matchNome = a.clienteNome.toLowerCase().includes(termo);
      const matchTel = a.clienteTelefone.includes(termo);
      if (matchNome || matchTel) {
        if (!mapa.has(a.clienteTelefone)) {
          mapa.set(a.clienteTelefone, {
            nome: a.clienteNome,
            telefone: a.clienteTelefone,
            doc: "",
          });
        }
      }
    }

    return Array.from(mapa.values());
  }, [busca, vendas, agendamentos]);

  // Dados do cliente selecionado
  const dadosCliente = useMemo(() => {
    if (!clienteSelecionado) return null;
    const tel = clienteSelecionado.telefone;
    const nome = clienteSelecionado.nome.toLowerCase();

    const minhasVendas = vendas.filter(
      (v) =>
        v.docCliente === tel ||
        v.cliente.toLowerCase() === nome
    );
    const meusAgendamentos = agendamentos.filter(
      (a) =>
        a.clienteTelefone === tel ||
        a.clienteNome.toLowerCase() === nome
    );

    const totalGasto = minhasVendas
      .filter((v) => v.status === "PAGO")
      .reduce((s, v) => s + v.total, 0);
    const totalPendente = minhasVendas
      .filter((v) => v.status === "PENDENTE")
      .reduce((s, v) => s + v.total, 0);
    const totalVendas = minhasVendas.length;
    const proxAgendamento = meusAgendamentos
      .filter(
        (a) =>
          a.status !== "CONCLUIDO" &&
          a.status !== "CANCELADO" &&
          new Date(`${a.data}T${a.hora}`) >= new Date()
      )
      .sort(
        (a, b) =>
          new Date(`${a.data}T${a.hora}`).getTime() -
          new Date(`${b.data}T${b.hora}`).getTime()
      )[0];

    return {
      vendas: minhasVendas.sort(
        (a, b) => b.timestamp - a.timestamp
      ),
      agendamentos: meusAgendamentos.sort(
        (a, b) => b.timestamp - a.timestamp
      ),
      totalGasto,
      totalPendente,
      totalVendas,
      proxAgendamento,
    };
  }, [clienteSelecionado, vendas, agendamentos]);

  function formatarMoeda(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(data: string) {
    if (!data) return "";
    const partes = data.split("-");
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
  }

  function getStatusInfo(status: string) {
    if (status === "PAGO")
      return {
        label: "Pago",
        cor: "bg-primary/10 text-primary dark:bg-primary/30 dark:text-white/80",
        icone: CheckCircle2,
      };
    return {
      label: "Pendente",
      cor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      icone: AlertCircle,
    };
  }

  function getAgendamentoStatus(status: string) {
    return (
      STATUS_AGENDAMENTO.find((s) => s.valor === status) || {
        label: status,
        cor: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      }
    );
  }

  // === TELA DE BUSCA ===
  if (!clienteSelecionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
        {/* Header Portal */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-empresa.png"
                alt="Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <a
              href="/"
              className="text-xs text-primary dark:text-primary/80 hover:underline font-medium"
            >
              Acesso Admin
            </a>
          </div>
        </header>

        {/* Conteúdo busca */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-6">
            {/* Hero */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/30 mb-3">
                <Receipt className="w-7 h-7 text-primary dark:text-primary/80" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Meus Pedidos
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Consulte seu historico de compras, agendamentos e
                situacao de pagamento.
              </p>
            </div>

            {/* Campo busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Digite seu nome, telefone ou CPF..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus-visible:ring-primary"
              />
            </div>

            {/* Resultados */}
            {busca.trim().length >= 3 &&
              clientesEncontrados.length === 0 && (
                <div className="text-center py-8">
                  <User className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Nenhum cliente encontrado com &quot;{busca}&quot;
                  </p>
                </div>
              )}

            {clientesEncontrados.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 px-1">
                  {clientesEncontrados.length}{" "}
                  {clientesEncontrados.length === 1
                    ? "cliente encontrado"
                    : "clientes encontrados"}
                </p>
                {clientesEncontrados.map((c, i) => (
                  <button
                    key={`${c.telefone}-${i}`}
                    onClick={() => setClienteSelecionado(c)}
                    className="w-full flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/30 shrink-0">
                      <User className="w-5 h-5 text-primary dark:text-primary/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {c.nome}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {c.telefone}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === PAINEL DO CLIENTE ===
  const statusAgendProx = clienteSelecionado
    ? dadosCliente?.proxAgendamento
      ? getAgendamentoStatus(dadosCliente.proxAgendamento.status)
      : null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => {
              setClienteSelecionado(null);
              setBusca("");
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary dark:text-primary/80" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {clienteSelecionado.nome}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {clienteSelecionado.telefone}
              </p>
            </div>
          </div>
        </div>
      </header>

      {dadosCliente && (
        <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
          {/* Cards resumo */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    Total Pago
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatarMoeda(dadosCliente.totalGasto)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 text-blue-500" />
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    Pedidos
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {dadosCliente.totalVendas}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    Pendente
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatarMoeda(dadosCliente.totalPendente)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarCheck className="w-4 h-4 text-purple-500" />
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    Agendamentos
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {dadosCliente.agendamentos.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Próximo agendamento */}
          {dadosCliente.proxAgendamento && (
            <Card className="border-primary/20 dark:border-primary/40 bg-primary/5 dark:bg-primary/15">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarCheck className="w-5 h-5 text-primary dark:text-primary/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary dark:text-primary/80 uppercase tracking-wider mb-1">
                      Proximo Agendamento
                    </p>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {dadosCliente.proxAgendamento.servicoNome}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatarData(dadosCliente.proxAgendamento.data)} às{" "}
                        {dadosCliente.proxAgendamento.hora}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <User className="w-3 h-3" />
                        {dadosCliente.proxAgendamento.colaboradorNome}
                      </span>
                    </div>
                    <Badge
                      className={`mt-2 text-[10px] font-semibold ${getAgendamentoStatus(dadosCliente.proxAgendamento.status).cor}`}
                    >
                      {getAgendamentoStatus(dadosCliente.proxAgendamento.status).label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Histórico de vendas */}
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              Historico de Compras
            </h2>

            {dadosCliente.vendas.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="p-8 text-center">
                  <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Nenhuma compra encontrada
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {dadosCliente.vendas.map((venda) => {
                  const st = getStatusInfo(venda.status);
                  const StatusIcone = st.icone;
                  return (
                    <button
                      key={venda.id}
                      onClick={() => setVendaDetalhe(venda)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-400">
                              {formatarData(venda.data)} às {venda.hora}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {venda.itens
                              .map((i) => i.servicoNome)
                              .join(", ")}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {venda.itens.length}{" "}
                            {venda.itens.length === 1
                              ? "item"
                              : "itens"}
                            {venda.colaboradorNome &&
                              ` \u00b7 ${venda.colaboradorNome}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatarMoeda(venda.total)}
                          </p>
                          <Badge
                            className={`mt-1 text-[10px] font-semibold ${st.cor}`}
                          >
                            <StatusIcone className="w-3 h-3 mr-1" />
                            {st.label}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agendamentos */}
          {dadosCliente.agendamentos.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-gray-400" />
                Agendamentos
              </h2>
              <div className="space-y-2">
                {dadosCliente.agendamentos.map((ag) => {
                  const st = getAgendamentoStatus(ag.status);
                  return (
                    <Card
                      key={ag.id}
                      className="border-0 shadow-sm bg-white dark:bg-gray-900"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {ag.servicoNome}
                            </p>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="w-3 h-3" />
                                {formatarData(ag.data)} às {ag.hora}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <User className="w-3 h-3" />
                                {ag.colaboradorNome}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                <CreditCard className="w-3 h-3" />
                                {formatarMoeda(ag.valor)}
                              </span>
                            </div>
                            {ag.observacoes && (
                              <p className="text-xs text-gray-400 mt-1.5 italic">
                                {ag.observacoes}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={`text-[10px] font-semibold shrink-0 ${st.cor}`}
                          >
                            {st.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rodapé empresa */}
          {empresa.nome && (
            <div className="text-center py-6">
              {empresa.logoBase64 && (
                <img
                  src={empresa.logoBase64}
                  alt={empresa.nome}
                  className="h-6 w-auto mx-auto mb-2 object-contain opacity-60"
                />
              )}
              <p className="text-[11px] text-gray-400">{empresa.nome}</p>
              {empresa.telefone && (
                <p className="text-[11px] text-gray-400">
                  {empresa.telefone}
                </p>
              )}
            </div>
          )}
        </main>
      )}

      {/* Dialog detalhes da venda */}
      <Dialog
        open={!!vendaDetalhe}
        onOpenChange={() => setVendaDetalhe(null)}
      >
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          {vendaDetalhe && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Receipt className="w-4 h-4 text-primary" />
                  Detalhes do Pedido
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Status e data */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatarData(vendaDetalhe.data)} às{" "}
                    {vendaDetalhe.hora}
                  </span>
                  <Badge
                    className={`text-xs font-semibold ${getStatusInfo(vendaDetalhe.status).cor}`}
                  >
                    {getStatusInfo(vendaDetalhe.status).label}
                  </Badge>
                </div>

                <Separator />

                {/* Itens */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Servicos
                  </p>
                  {vendaDetalhe.itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.servicoNome}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantidade}x{" "}
                          {formatarMoeda(item.valorUnitario)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatarMoeda(item.valorTotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Valores */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatarMoeda(vendaDetalhe.valor)}
                    </span>
                  </div>
                  {vendaDetalhe.desconto > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-500">Desconto</span>
                      <span className="text-red-500">
                        -{formatarMoeda(vendaDetalhe.desconto)}
                      </span>
                    </div>
                  )}
                  {vendaDetalhe.acrescimo > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Acrescimo
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        +{formatarMoeda(vendaDetalhe.acrescimo)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-primary dark:text-primary/80">
                      {formatarMoeda(vendaDetalhe.total)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Info pagamento */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Pagamento
                  </p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {vendaDetalhe.formaPagamento}
                    </span>
                  </div>
                </div>

                {/* Profissional */}
                {vendaDetalhe.colaboradorNome && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Profissional
                    </p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {vendaDetalhe.colaboradorNome}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}