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
import { TrendingUp, Trophy, Users, DollarSign, CalendarDays, Receipt } from "lucide-react";
import { formatarMoeda, filtrarVendasPorPeriodo } from "@/lib/utils-erp";

// Paleta Bitrix24 (azul principal + acentos complementares)
const CORES_GRAFICO = [
  "#0093ce", // azul Bitrix24 primario
  "#2bb7ff", // azul claro
  "#f5a623", // amber
  "#9c5cff", // roxo
  "#2dbc5f", // verde sucesso
  "#ea4335", // vermelho
];

// Cor primaria para grafico de barras (Bitrix24 blue)
const COR_PRIMARIA = "#0093ce";
const COR_PRIMARIA_DARK = "#2bb7ff";

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  value: string;
  valueClassName?: string;
  label: string;
}

function MetricCard({ icon, iconBg, iconColor, value, valueClassName, label }: MetricCardProps) {
  return (
    <Card className="p-3 sm:p-3.5 gap-1.5 min-w-0 overflow-hidden transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-2">
        <div className={`p-1.5 rounded-md shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p
        className={`text-base sm:text-lg font-black font-display tabular-nums whitespace-nowrap overflow-hidden text-ellipsis ${valueClassName || ""}`}
        title={value}
      >
        {value}
      </p>
      <p className="text-[11px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wide truncate">
        {label}
      </p>
    </Card>
  );
}

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
    const vendasMes = filtrarVendasPorPeriodo(vendas, "mes");
    const despesasMes = filtrarVendasPorPeriodo(despesas, "mes");
    const receita = vendasMes.filter((v) => v.status === "PAGO").reduce((s, v) => s + v.total, 0);
    const totalDespesas = despesasMes.reduce((s, d) => s + d.valor, 0);
    return { receita, despesas: totalDespesas, lucro: receita - totalDespesas };
  }, [vendas, despesas]);

  const agendamentosHoje = useMemo(() => {
    const hoje = new Date().toLocaleDateString("pt-BR");
    return agendamentos.filter((a) => a.data === hoje);
  }, [agendamentos]);

  const despesasPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    const despesasMes = filtrarVendasPorPeriodo(despesas, "mes");
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
      {/* Cards resumo rápido - mobile 2 colunas, tablet 3, desktop 6 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <MetricCard
          icon={<DollarSign className="h-4 w-4 text-primary dark:text-primary/80 shrink-0" />}
          iconBg="bg-primary/10 dark:bg-primary/25"
          iconColor="primary"
          value={formatarMoeda(receitaPorDia.reduce((s, d) => s + d.total, 0))}
          label="Receita (7 dias)"
        />
        <MetricCard
          icon={<TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />}
          iconBg="bg-blue-100 dark:bg-blue-950"
          iconColor="blue"
          value={formatarMoeda(ticketMedio)}
          label="Ticket Médio"
        />
        <MetricCard
          icon={<Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />}
          iconBg="bg-amber-100 dark:bg-amber-950"
          iconColor="amber"
          value={topServicos[0]?.nome || "-"}
          label="Serviço Top"
        />
        <MetricCard
          icon={<Users className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />}
          iconBg="bg-purple-100 dark:bg-purple-950"
          iconColor="purple"
          value={topClientes[0]?.nome || "-"}
          label="Cliente Top"
        />
        <MetricCard
          icon={
            <Receipt
              className={`h-4 w-4 shrink-0 ${lucroMes.lucro >= 0 ? "text-primary dark:text-primary/80" : "text-red-600 dark:text-red-400"}`}
            />
          }
          iconBg={lucroMes.lucro >= 0 ? "bg-primary/10 dark:bg-primary/25" : "bg-red-100 dark:bg-red-950"}
          iconColor={lucroMes.lucro >= 0 ? "primary" : "red"}
          value={formatarMoeda(lucroMes.lucro)}
          valueClassName={lucroMes.lucro >= 0 ? "text-primary" : "text-red-600"}
          label="Lucro Liq. (Mês)"
        />
        <MetricCard
          icon={<CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />}
          iconBg="bg-blue-100 dark:bg-blue-950"
          iconColor="blue"
          value={String(agendamentosHoje.length)}
          label="Agend. Hoje"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de Receita por Dia */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
              Receita dos Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ total: { label: "Receita", color: COR_PRIMARIA } }}
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
                  fill={COR_PRIMARIA}
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
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              Distribuição por Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {distribuicaoPagamento.length > 0 ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ChartContainer
                  config={Object.fromEntries(
                    distribuicaoPagamento.map((d, i) => [
                      d.forma,
                      { label: d.forma, color: CORES_GRAFICO[i % CORES_GRAFICO.length] },
                    ])
                  )}
                  className="h-[180px] w-[180px] sm:h-[200px] sm:w-[200px]"
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
                <div className="space-y-2 flex-1 w-full">
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
                      <div key={d.forma} className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-3 h-3 rounded-sm shrink-0"
                            style={{
                              backgroundColor:
                                CORES_GRAFICO[i % CORES_GRAFICO.length],
                            }}
                          />
                          <span className="font-medium truncate">{d.forma}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold font-display tabular-nums">
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
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              Top 5 Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topServicos.length > 0 ? (
              <div className="space-y-2.5">
                {topServicos.map((s, i) => {
                  const maxTotal = topServicos[0].total;
                  const pct = maxTotal > 0 ? (s.total / maxTotal) * 100 : 0;
                  return (
                    <div key={s.nome} className="space-y-1">
                      <div className="flex justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="secondary"
                            className="text-[10px] w-5 h-5 p-0 flex items-center justify-center shrink-0"
                          >
                            {i + 1}
                          </Badge>
                          <span className="font-medium truncate">{s.nome}</span>
                          <span className="text-muted-foreground shrink-0">
                            ({s.qtd}x)
                          </span>
                        </div>
                        <span className="font-bold font-display tabular-nums shrink-0">
                          {formatarMoeda(s.total)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
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
              <Users className="h-4 w-4 text-purple-500 shrink-0" />
              Top 5 Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topClientes.length > 0 ? (
              <div className="space-y-2.5">
                {topClientes.map((c, i) => {
                  const maxTotal = topClientes[0].total;
                  const pct = maxTotal > 0 ? (c.total / maxTotal) * 100 : 0;
                  return (
                    <div key={c.nome} className="space-y-1">
                      <div className="flex justify-between text-xs gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="secondary"
                            className="text-[10px] w-5 h-5 p-0 flex items-center justify-center shrink-0"
                          >
                            {i + 1}
                          </Badge>
                          <span className="font-medium truncate">{c.nome}</span>
                          <span className="text-muted-foreground shrink-0">
                            ({c.qtd} compras)
                          </span>
                        </div>
                        <span className="font-bold font-display tabular-nums shrink-0">
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
