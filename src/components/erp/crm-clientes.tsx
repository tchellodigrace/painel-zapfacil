"use client";

import { useState, useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Pencil, Trash2, Check, X, Search } from "lucide-react";

export function CRMClientes() {
  const { clientes, adicionarCliente, editarCliente, removerCliente } =
    useERPStore();
  const [nome, setNome] = useState("");
  const [doc, setDoc] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editDoc, setEditDoc] = useState("");
  const [editTel, setEditTel] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [busca, setBusca] = useState("");

  const clientesFiltrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    const termo = busca.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.documento.toLowerCase().includes(termo) ||
        c.telefone.toLowerCase().includes(termo)
    );
  }, [clientes, busca]);

  const resetarForm = () => {
    setNome("");
    setDoc("");
    setTel("");
    setEmail("");
  };

  const handleAdicionar = () => {
    if (!nome.trim()) {
      toast.error("Nome do cliente é obrigatório.");
      return;
    }
    adicionarCliente(nome.trim(), doc.trim(), tel.trim(), email.trim());
    resetarForm();
    toast.success("Cliente adicionado!");
  };

  const handleEditar = (id: string) => {
    if (!editNome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    editarCliente(id, editNome.trim(), editDoc.trim(), editTel.trim(), editEmail.trim());
    setEditandoId(null);
    toast.success("Cliente atualizado!");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-emerald-600" />
          CRM Clientes
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {clientes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          <Input
            placeholder="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="col-span-2 text-xs h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
          />
          <Input
            placeholder="CPF/CNPJ"
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            className="text-xs h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
          />
          <Input
            placeholder="Telefone"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="text-xs h-9"
            onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
          />
          <Button
            size="sm"
            className="col-span-2 h-9 bg-gray-800 hover:bg-gray-900 text-xs"
            onClick={handleAdicionar}
          >
            <Plus className="h-3 w-3 mr-1" />
            Adicionar Cliente
          </Button>
        </div>

        {clientes.length > 3 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="text-xs h-8 pl-8"
            />
          </div>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto">
          {clientesFiltrados.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">
              {busca ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
            </p>
          )}
          {clientesFiltrados.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 p-2 rounded-lg border text-xs hover:bg-muted/30 transition-colors"
            >
              {editandoId === c.id ? (
                <div className="flex-1 grid grid-cols-2 gap-1">
                  <Input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="col-span-2 text-xs h-7"
                    onKeyDown={(e) => e.key === "Enter" && handleEditar(c.id)}
                    autoFocus
                  />
                  <Input
                    value={editDoc}
                    onChange={(e) => setEditDoc(e.target.value)}
                    placeholder="CPF/CNPJ"
                    className="text-xs h-7"
                  />
                  <Input
                    value={editTel}
                    onChange={(e) => setEditTel(e.target.value)}
                    placeholder="Telefone"
                    className="text-xs h-7"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full text-emerald-600 text-[10px]"
                    onClick={() => handleEditar(c.id)}
                  >
                    <Check className="h-3 w-3 mr-1" /> Salvar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full text-[10px]"
                    onClick={() => setEditandoId(null)}
                  >
                    <X className="h-3 w-3 mr-1" /> Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.nome}</p>
                    {(c.documento || c.telefone) && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        {c.documento && c.telefone
                          ? `${c.documento} · ${c.telefone}`
                          : c.documento || c.telefone}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground shrink-0"
                    onClick={() => {
                      setEditandoId(c.id);
                      setEditNome(c.nome);
                      setEditDoc(c.documento);
                      setEditTel(c.telefone);
                      setEditEmail(c.email);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 shrink-0"
                    onClick={() => {
                      removerCliente(c.id);
                      toast.success("Cliente removido.");
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