"use client";

import { useState, useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  UserCheck,
  UserX,
  DollarSign,
  Star,
} from "lucide-react";
import { formatarMoeda } from "@/lib/utils-erp";
import type { Colaborador } from "@/types";

export function PainelColaboradores() {
  const {
    colaboradores,
    vendas,
    adicionarColaborador,
    editarColaborador,
    toggleColaboradorAtivo,
    removerColaborador,
  } = useERPStore();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [comissao, setComissao] = useState("0");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Calcula comissoes por colaborador
  const comissoes = useMemo(() => {
    const mapa: Record<
      string,
      { nome: string; totalVendas: number; comissaoValor: number; qtdVendas: number; percentual: number }
    > = {};

    colaboradores.forEach((c) => {
      mapa[c.id] = {
        nome: c.nome,
        totalVendas: 0,
        comissaoValor: 0,
        qtdVendas: 0,
        percentual: c.comissaoPercentual,
      };
    });

    vendas.forEach((v) => {
      if (v.colaboradorId && mapa[v.colaboradorId]) {
        mapa[v.colaboradorId].totalVendas += v.total;
        mapa[v.colaboradorId].qtdVendas += 1;
        mapa[v.colaboradorId].comissaoValor +=
          (v.total * mapa[v.colaboradorId].percentual) / 100;
      }
    });

    return Object.values(mapa).sort((a, b) => b.comissaoValor - a.comissaoValor);
  }, [colaboradores, vendas]);

  const totalComissoes = useMemo(
    () => comissoes.reduce((s, c) => s + c.comissaoValor, 0),
    [comissoes]
  );

  const handleAdicionar = () => {
    if (!nome.trim()) {
      toast.error("Nome e obrigatorio.");
      return;
    }

    adicionarColaborador(
      nome.trim(),
      telefone.trim(),
      especialidade.trim(),
      parseFloat(comissao) || 0
    );
    setNome("");
    setTelefone("");
    setEspecialidade("");
    setComissao("0");
    toast.success("Colaborador adicionado!");
  };

  const handleEditar = (id: string) => {
    if (!nome.trim()) {
      toast.error("Nome e obrigatorio.");
      return;
    }

    editarColaborador(
      id,
      nome.trim(),
      telefone.trim(),
      especialidade.trim(),
      parseFloat(comissao) || 0
    );
    setEditandoId(null);
    setNome("");
    setTelefone("");
    setEspecialidade("");
    setComissao("0");
    toast.success("Colaborador atualizado!");
  };

  const iniciarEdicao = (c: Colaborador) => {
    setEditandoId(c.id);
    setNome(c.nome);
    setTelefone(c.telefone);
    setEspecialidade(c.especialidade);
    setComissao(c.comissaoPercentual.toString());
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setNome("");
    setTelefone("");
    setEspecialidade("");
    setComissao("0");
  };

  const ativos = colaboradores.filter((c) => c.ativo);
  const inativos = colaboradores.filter((c) => !c.ativo);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-emerald-600" />
          Equipe / Colaboradores
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {ativos.length} ativos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo de comissoes */}
        {comissoes.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900 space-y-2">
            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Resumo de Comissoes
            </p>
            <div className="space-y-1.5">
              {comissoes.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {i === 0 && <Star className="h-3 w-3 text-amber-500" />}
                    <span className="font-medium">{c.nome}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({c.qtdVendas} vendas, {c.percentual}%)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      {formatarMoeda(c.comissaoValor)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-t pt-1.5 flex justify-between font-bold text-xs">
                <span>Total a Pagar</span>
                <span className="text-amber-700 dark:text-amber-400">
                  {formatarMoeda(totalComissoes)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-muted/50 p-3 rounded-lg border space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {editandoId ? "Editando Colaborador" : "Novo Colaborador"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Nome *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="col-span-2 text-xs h-9"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (editandoId ? handleEditar(editandoId) : handleAdicionar())
              }
            />
            <Input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="text-xs h-9"
            />
            <Input
              placeholder="Especialidade"
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              className="text-xs h-9"
            />
            <div className="col-span-2">
              <Label className="text-[10px] text-muted-foreground mb-0.5 block">
                Comissao (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={comissao}
                onChange={(e) => setComissao(e.target.value)}
                className="text-xs h-9"
                placeholder="0"
              />
            </div>
          </div>
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
                  Salvar
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Adicionar
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

        {/* Lista de colaboradores ativos */}
        <div className="space-y-1">
          {ativos.length === 0 && inativos.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 italic">
              Nenhum colaborador cadastrado.
            </p>
          )}
          {ativos.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 p-2.5 rounded-lg border text-xs hover:bg-muted/30 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                {c.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{c.nome}</span>
                  <Badge variant="secondary" className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    <UserCheck className="h-2.5 w-2.5 mr-0.5" />
                    Ativo
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {c.especialidade && (
                    <span>{c.especialidade}</span>
                  )}
                  {c.especialidade && c.telefone && " · "}
                  {c.telefone && <span>{c.telefone}</span>}
                  {c.comissaoPercentual > 0 && (
                    <span className="text-amber-600 dark:text-amber-400 ml-1">
                      ({c.comissaoPercentual}% comissao)
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground shrink-0"
                onClick={() => iniciarEdicao(c)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-amber-500 shrink-0"
                onClick={() => {
                  toggleColaboradorAtivo(c.id);
                  toast.info(`${c.nome} desativado.`);
                }}
                title="Desativar"
              >
                <UserX className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-500 shrink-0"
                onClick={() => {
                  if (confirm(`Excluir ${c.nome}?`)) {
                    removerColaborador(c.id);
                    toast.success("Colaborador removido.");
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Inativos */}
          {inativos.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-muted-foreground uppercase pt-2">
                Inativos ({inativos.length})
              </p>
              {inativos.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border text-xs opacity-50"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-[10px] shrink-0">
                    {c.nome
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">
                      {c.nome}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {c.especialidade || "Sem especialidade"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-emerald-600 shrink-0"
                    onClick={() => {
                      toggleColaboradorAtivo(c.id);
                      toast.info(`${c.nome} reativado.`);
                    }}
                    title="Reativar"
                  >
                    <UserCheck className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 shrink-0"
                    onClick={() => {
                      if (confirm(`Excluir ${c.nome}?`)) {
                        removerColaborador(c.id);
                        toast.success("Colaborador removido.");
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}