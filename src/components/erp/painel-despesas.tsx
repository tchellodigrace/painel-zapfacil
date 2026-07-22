"use client";

import { useState, useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Receipt,
  Plus,
  Trash2,
  Search,
  TrendingDown,
  DollarSign,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatarMoeda, gerarId, filtrarVendasPorPeriodo } from "@/lib/utils-erp";
import type { Despesa, CategoriaDespesa } from "@/types";
import { CATEGORIAS_DESPESA } from "@/types";

export function PainelDespesas() {
  const { despesas, vendas, adicionarDespesa, editarDespesa, removerDespesa } =
    useERPStore();

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesa>("OUTROS");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [recorrente, setRecorrente] = useState(false);
  const [obs, setObs] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [periodo, setPeriodo] = useState("mes");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const despesasFiltradas = useMemo(() => {
    let lista = despesas;

    if (filtroCategoria !== "todos") {
      lista = lista.filter((d) => d.categoria === filtroCategoria);
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter((d) =>
        d.descricao.toLowerCase().includes(termo)
      );
    }

    return lista.sort((a, b) => b.timestamp - a.timestamp);
  }, [despesas, busca, filtroCategoria]);

  const vendasPeriodo = useMemo(() => {
    return filtrarVendasPorPeriodo(vendas, periodo);
  }, [vendas, periodo]);

  const despesasPeriodo = useMemo(() => {
    if (periodo === "todos") return despesas;
    return filtrarVendasPorPeriodo(despesas, periodo);
  }, [despesas, periodo]);

  const stats = useMemo(() => {
    const totalReceita = vendasPeriodo
      .filter((v) => v.status === "PAGO")
      .reduce((s, v) => s + v.total, 0);
    const totalDespesas = despesasPeriodo.reduce((s, d) => s + d.valor, 0);
    const lucroLiquido = totalReceita - totalDespesas;
    const margem = totalReceita > 0 ? (lucroLiquido / totalReceita) * 100 : 0;

    // Despesas por categoria
    const porCategoria: Record<string, number> = {};
    despesasPeriodo.forEach((d) => {
      porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.valor;
    });
    const topCategorias = Object.entries(porCategoria)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat, val]) => ({
        categoria: CATEGORIAS_DESPESA.find((c) => c.valor === cat)?.label || cat,
        valor: val,
        pct: totalDespesas > 0 ? (val / totalDespesas) * 100 : 0,
      }));

    return { totalReceita, totalDespesas, lucroLiquido, margem, topCategorias };
  }, [vendasPeriodo, despesasPeriodo]);

  const handleAdicionar = () => {
    if (!descricao.trim()) {
      toast.error("Descricao e obrigatoria.");
      return;
    }
    const valorNum = parseFloat(valor);
    if (!valorNum || valorNum <= 0) {
      toast.error("Informe um valor valido.");
      return;
    }
    if (!data) {
      toast.error("Informe a data.");
      return;
    }

    const dataFormatada = data.includes("/")
      ? data
      : new Date(data + "T12:00:00").toLocaleDateString("pt-BR");

    const despesa: Despesa = {
      id: gerarId(),
      descricao: descricao.trim(),
      categoria,
      valor: valorNum,
      data: dataFormatada,
      recorrente,
      observacoes: obs.trim(),
      timestamp: Date.now(),
    };

    adicionarDespesa(despesa);
    setDescricao("");
    setCategoria("OUTROS");
    setValor("");
    setData("");
    setRecorrente(false);
    setObs("");
    toast.success("Despesa registrada!");
  };

  const handleEditar = (id: string) => {
    if (!descricao.trim()) {
      toast.error("Descricao e obrigatoria.");
      return;
    }
    const valorNum = parseFloat(valor);
    if (!valorNum || valorNum <= 0) {
      toast.error("Informe um valor valido.");
      return;
    }

    editarDespesa(id, {
      descricao: descricao.trim(),
      categoria,
      valor: valorNum,
      observacoes: obs.trim(),
      recorrente,
    });
    setEditandoId(null);
    setDescricao("");
    setCategoria("OUTROS");
    setValor("");
    setObs("");
    setRecorrente(false);
    toast.success("Despesa atualizada!");
  };

  const iniciarEdicao = (d: Despesa) => {
    setEditandoId(d.id);
    setDescricao(d.descricao);
    setCategoria(d.categoria);
    setValor(d.valor.toString());
    setObs(d.observacoes);
    setRecorrente(d.recorrente);
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setDescricao("");
    setCategoria("OUTROS");
    setValor("");
    setObs("");
    setRecorrente(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Receipt className="h-4 w-4 text-emerald-600" />
          Controle de Despesas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* DRE Resumo */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 rounded-lg p-4 border border-emerald-100 dark:border-emerald-900 space-y-3">
          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            DRE Resumo - Demonstrativo de Resultados
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold mb-0.5">
                <DollarSign className="h-3 w-3" />
                Receita
              </div>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                {formatarMoeda(stats.totalReceita)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-bold mb-0.5">
                <TrendingDown className="h-3 w-3" />
                Despesas
              </div>
              <p className="text-sm font-black text-red-600 dark:text-red-400">
                {formatarMoeda(stats.totalDespesas)}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-[10px] font-bold mb-0.5 flex items-center justify-center gap-1 ${stats.lucroLiquido >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {stats.lucroLiquido >= 0 ? <DollarSign className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                Lucro
              </div>
              <p className={`text-sm font-black ${stats.lucroLiquido >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {formatarMoeda(stats.lucroLiquido)}
              </p>
              <p className="text-[9px] text-muted-foreground">
                Margem: {stats.margem.toFixed(1)}%
              </p>
            </div>
          </div>
          {stats.topCategorias.length > 0 && (
            <div className="text-[10px] text-muted-foreground">
              <span className="font-bold">Top despesas:</span>{" "}
              {stats.topCategorias.map((c, i) => (
                <span key={i} className="mr-2">
                  {c.categoria} ({c.pct.toFixed(0)}%)
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Formulário */}
        <div className="bg-muted/50 p-3 rounded-lg border space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {editandoId ? "Editando Despesa" : "Nova Despesa"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Descricao *"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="col-span-2 text-xs h-9"
            />
            <Select
              value={categoria}
              onValueChange={(v) => setCategoria(v as CategoriaDespesa)}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_DESPESA.map((c) => (
                  <SelectItem key={c.valor} value={c.valor} className="text-xs">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="text-xs h-9"
              placeholder="Valor (R$) *"
            />
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="text-xs h-9"
            />
            <div className="flex items-center gap-2 px-2">
              <Switch
                checked={recorrente}
                onCheckedChange={setRecorrente}
                className="scale-75"
              />
              <span className="text-[10px] text-muted-foreground">Recorrente</span>
            </div>
          </div>
          <Input
            placeholder="Observacoes (opcional)"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className="text-xs h-8"
          />
          <div className="flex gap-2">
            <Button
              className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
              onClick={() =>
                editandoId ? handleEditar(editandoId) : handleAdicionar()
              }
            >
              {editandoId ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Salvar Alteracao
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Registrar Despesa
                </>
              )}
            </Button>
            {editandoId && (
              <Button
                variant="outline"
                className="h-9 text-xs"
                onClick={cancelarEdicao}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar despesa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="text-xs h-9 pl-8"
            />
          </div>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-full sm:w-32 text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="text-xs">Todas</SelectItem>
              {CATEGORIAS_DESPESA.map((c) => (
                <SelectItem key={c.valor} value={c.valor} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-full sm:w-32 text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos" className="text-xs">Todo Periodo</SelectItem>
              <SelectItem value="hoje" className="text-xs">Hoje</SelectItem>
              <SelectItem value="semana" className="text-xs">Semana</SelectItem>
              <SelectItem value="mes" className="text-xs">Mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de despesas */}
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {despesasFiltradas.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6 italic">
              Nenhuma despesa registrada.
            </p>
          )}
          {despesasFiltradas.map((d) => {
            const catLabel = CATEGORIAS_DESPESA.find((c) => c.valor === d.categoria)?.label || d.categoria;
            return (
              <div
                key={d.id}
                className="flex items-center gap-2 p-2.5 rounded-lg border text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{d.descricao}</span>
                    <Badge variant="secondary" className="text-[9px] shrink-0">
                      {catLabel}
                    </Badge>
                    {d.recorrente && (
                      <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300 shrink-0">
                        Recorrente
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {d.data}
                    {d.observacoes && ` - ${d.observacoes}`}
                  </div>
                </div>
                <span className="font-bold text-red-600 dark:text-red-400 shrink-0">
                  - {formatarMoeda(d.valor)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground shrink-0"
                  onClick={() => iniciarEdicao(d)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-500 shrink-0"
                  onClick={() => {
                    if (confirm("Excluir esta despesa?")) {
                      removerDespesa(d.id);
                      toast.success("Despesa excluida.");
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>

        {despesasFiltradas.length > 0 && (
          <p className="text-[10px] text-muted-foreground text-right">
            Mostrando {despesasFiltradas.length} de {despesas.length} despesas
          </p>
        )}
      </CardContent>
    </Card>
  );
}