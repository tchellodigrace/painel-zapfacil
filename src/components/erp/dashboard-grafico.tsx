"use client";

import { useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Trophy, Users, DollarSign, CalendarDays, Receipt, UserCheck } from "lucide-react";
import { formatarMoeda, filtrarVendasPorPeriodo } from "@/lib/utils-erp";

const CORES_GRAFICO = [
  "hsl(142, 76%, 36%)",
  "hsl(45, 93%, 47%)",
  "hsl(210, 79%, 46%)",
  "hsl(0, 84%, 60%)",
  "hsl(270, 67%, 47%)",
  "hsl(180, 70%, 36%)",
];

export function DashboardGrafico() {
  const { vendas, despesas, agendamentos, colaboradores } = useERPStore();

  // === Dados do gráfico de receita por dia (últimos 7 dias) ===
  const receitaPorDia = useMemo(() => {
    const dias: Record<string, number> = {};
    const agora = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(agora);
      d.setDate(d.getDate() - i);
      const chave = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      dias[chave] = 0;
    }
    vendas.forEach((v) => {
      if (dias[v.data] !== undefined) {
        dias[v.data] += v.total;
      }
    });
    return Object.entries(dias).map(([dia, total]) => ({
      dia,
      total: Math.round(total * 100) / 100,
    }));
  }, [vendas]);

  // === Top 5 Serviços ===
  const topServicos = useMemo(() => {
    const mapa: Record<string, { nome: string; qtd: number; total: number }> = {};
    vendas.forEach((v) => {
      v.itens.forEach((item) => {
        if (!mapa[item.servicoNome]) {
          mapa[item.servicoNome] = { nome: item.servicoNome, qtd: 0, total: 0 };
        }
        mapa[item.servicoNome].qtd += item.quantidade;
        mapa[item.servicoNome].total += item.valorTotal;
      });
    });
    return Object.values(mapa)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [vendas]);

  // === Top 5 Clientes ===
  const topClientes = useMemo(() => {
    const mapa: Record<string, { nome: string; qtd: number; total: number }> = {};
    vendas.forEach((v) => {
      const nome = v.cliente;
      if (!mapa[nome]) {
        mapa[nome] = { nome, qtd: 0, total: 0 };
      }
      mapa[nome].qtd += 1;
      mapa[nome].total += v.total;
    });
    return Object.values(mapa)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [vendas]);

  // === Distribuição por forma de pagamento ===
  const distribuicaoPagamento = useMemo(() => {
    const mapa: Record<string, number> = {};
    vendas.forEach((v) => {
      mapa[v.formaPagamento] = (mapa[v.formaPagamento] || 0) + v.total;
    });
    return Object.entries(mapa).map(([forma, total]) => ({
      forma,
      total: Math.round(total * 100) / 100,
    }));
  }, [vendas]);

  const ticketMedio = useMemo(() => {
    if (vendas.length === 0) return 0;
    return vendas.reduce((s, v) => s + v.total, 0) / vendas.length;
  }, [vendas]);

  // === Novas métricas ===
  const lucroMes = useMemo(() => {
    const vendasMes = filtrarVendasPorPeriodo(vendas, "mes") as typeof vendas;
    const despesasMes = filtrarVendasPorPeriodo(despesas, "mes") as typeof despesas;
    const receita = vendasMes.filter((v) => v.status === "PAGO").reduce((s, v) => s + v.total, 0);
    const totalDespesas = despesasMes.reduce((s, d) => s + d.valor, 0);
    return { receita, despesas: totalDespesas, lucro: receita - totalDespesas };
  }, [vendas, despesas]);

  const agendamentosHoje = useMemo(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    return agendamentos.filter((a) => a.data === hoje);
  }, [agendamentos]);

  const totalComissoes = useMemo(() => {
    return colaboradores.reduce((s, col) => {
      const vendasCol = vendas.filter((v) => v.colaboradorId === col.id);
      return s + vendasCol.reduce((vs, v) => vs + (v.total * col.comissaoPercentual) / 100, 0);
    }, 0);
  }, [vendas, colaboradores]);

  const despesasPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    const despesasMes = filtrarVendasPorPeriodo(despesas, "mes") as typeof despesas;
    despesasMes.forEach((d) => {
      mapa[d.categoria] = (mapa[d.categoria] || 0) + d.valor;
    });
    return Object.entries(mapa)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, total]) => ({ categoria: cat, total }));
  }, [despesas]);

  return (
    <div className="space-y-4">
      {/* Cards resumo rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-lg font-black">{formatarMoeda(receitaPorDia.reduce((s, d) => s + d.total, 0))}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Receita (7 dias)</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-lg font-black">{formatarMoeda(ticketMedio)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Ticket Medio</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-950">
              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-lg font-black">{topServicos[0]?.nome || "-"}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Servico Top</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-950">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-lg font-black">{topClientes[0]?.nome || "-"}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Cliente Top</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className={`p-1.5 rounded-md ${lucroMes.lucro >= 0 ? "bg-emerald-100 dark:bg-emerald-950" : "bg-red-100 dark:bg-red-950"}`}>
              <Receipt className={`h-4 w-4 ${lucroMes.lucro >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`} />
            </div>
          </div>
          <p className={`text-lg font-black ${lucroMes.lucro >= 0 ? "text-emerald-700" : "text-red-600"}`}>{formatarMoeda(lucroMes.lucro)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Lucro Liq. (Mes)</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950">
              <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-lg font-black">{agendamentosHoje.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Agend. Hoje</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Receita por Dia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Receita dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ total: { label: "Receita", color: "hsl(142, 76%, 36%)" } }}
              className="h-[250px] w-full"
            >
              <BarChart data={receitaPorDia} accessibilityLayer>
                <XAxis
                  dataKey="dia"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) =>
                    `R$${(v / 100).toFixed(0)}`
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="hsl(142, 76%, 36%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Forma de Pagamento */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Distribuição por Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {distribuicaoPagamento.length > 0 ? (
              <div className="flex items-center gap-4">
                <ChartContainer
                  config={Object.fromEntries(
                    distribuicaoPagamento.map((d, i) => [
                      d.forma,
                      { label: d.forma, color: CORES_GRAFICO[i % CORES_GRAFICO.length] },
                    ])
                  )}
                  className="h-[200px] w-[200px]"
                >
                  <PieChart>
                    <Pie
                      data={distribuicaoPagamento}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="total"
                      nameKey="forma"
                    >
                      {distribuicaoPagamento.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CORES_GRAFICO[i % CORES_GRAFICO.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 flex-1">
                  {distribuicaoPagamento.map((d, i) => {
                    const totalGeral = distribuicaoPagamento.reduce(
                      (s, x) => s + x.total,
                      0
                    );
                    const pct =
                      totalGeral > 0
                        ? ((d.total / totalGeral) * 100).toFixed(1)
                        : "0";
                    return (
                      <div key={d.forma} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{
                              backgroundColor:
                                CORES_GRAFICO[i % CORES_GRAFICO.length],
                            }}
                          />
                          <span className="font-medium">{d.forma}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">
                            {formatarMoeda(d.total)}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Serviços */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top 5 Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topServicos.length > 0 ? (
              <div className="space-y-2">
                {topServicos.map((s, i) => {
                  const maxTotal = topServicos[0].total;
                  const pct = maxTotal > 0 ? (s.total / maxTotal) * 100 : 0;
                  return (
                    <div key={s.nome} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] w-5 h-5 p-0 flex items-center justify-center"
                          >
                            {i + 1}
                          </Badge>
                          <span className="font-medium">{s.nome}</span>
                          <span className="text-muted-foreground">
                            ({s.qtd}x)
                          </span>
                        </div>
                        <span className="font-bold">
                          {formatarMoeda(s.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 Clientes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Top 5 Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topClientes.length > 0 ? (
              <div className="space-y-2">
                {topClientes.map((c, i) => {
                  const maxTotal = topClientes[0].total;
                  const pct = maxTotal > 0 ? (c.total / maxTotal) * 100 : 0;
                  return (
                    <div key={c.nome} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-[10px] w-5 h-5 p-0 flex items-center justify-center"
                          >
                            {i + 1}
                          </Badge>
                          <span className="font-medium">{c.nome}</span>
                          <span className="text-muted-foreground">
                            ({c.qtd} compras)
                          </span>
                        </div>
                        <span className="font-bold">
                          {formatarMoeda(c.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}