"use client";

import { useState, useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Wrench, Plus, Pencil, Trash2, Check, X, Search } from "lucide-react";
import { formatarMoeda, gerarId } from "@/lib/utils-erp";

export function CatalogoServicos() {
  const { servicos, adicionarServico, editarServico, removerServico } =
    useERPStore();
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editValor, setEditValor] = useState("");
  const [busca, setBusca] = useState("");

  const servicosFiltrados = useMemo(() => {
    if (!busca.trim()) return servicos;
    const termo = busca.toLowerCase();
    return servicos.filter((s) =>
      s.nome.toLowerCase().includes(termo)
    );
  }, [servicos, busca]);

  const handleAdicionar = () => {
    if (!nome.trim()) {
      toast.error("Nome do serviço é obrigatório.");
      return;
    }
    const v = parseFloat(valor) || 0;
    adicionarServico(nome.trim(), v);
    setNome("");
    setValor("");
    toast.success("Serviço adicionado!");
  };

  const handleEditar = (id: string) => {
    if (!editNome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    editarServico(id, editNome.trim(), parseFloat(editValor) || 0);
    setEditandoId(null);
    toast.success("Serviço atualizado!");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Wrench className="h-4 w-4 text-primary" />
          Catálogo de Serviços
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {servicos.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1.5">
          <Input
            placeholder="Serviço"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1 text-xs h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
          />
          <Input
            placeholder="R$"
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-24 text-xs h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
          />
          <Button
            size="sm"
            className="h-9 px-3 bg-primary hover:bg-primary/90"
            onClick={handleAdicionar}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {servicos.length > 3 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar serviço..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="text-xs h-8 pl-8"
            />
          </div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {servicosFiltrados.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              {busca ? "Nenhum serviço encontrado." : "Nenhum serviço cadastrado."}
            </p>
          )}
          {servicosFiltrados.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 p-2 rounded-lg border text-xs hover:bg-muted/30 transition-colors"
            >
              {editandoId === s.id ? (
                <>
                  <Input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="flex-1 text-xs h-7"
                    onKeyDown={(e) => e.key === "Enter" && handleEditar(s.id)}
                    autoFocus
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={editValor}
                    onChange={(e) => setEditValor(e.target.value)}
                    className="w-20 text-xs h-7"
                    onKeyDown={(e) => e.key === "Enter" && handleEditar(s.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-primary"
                    onClick={() => handleEditar(s.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setEditandoId(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-medium truncate flex-1">
                    {s.nome}
                  </span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {formatarMoeda(s.valor)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground"
                    onClick={() => {
                      setEditandoId(s.id);
                      setEditNome(s.nome);
                      setEditValor(String(s.valor));
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500"
                    onClick={() => {
                      removerServico(s.id);
                      toast.success("Serviço removido.");
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}