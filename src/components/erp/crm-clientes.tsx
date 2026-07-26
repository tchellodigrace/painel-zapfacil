"use client";

import { useState, useMemo } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Users,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Eye,
  MessageCircle,
  Calendar,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { formatarMoeda, abrirWhatsApp } from "@/lib/utils-erp";
import type { Cliente, Venda } from "@/types";

export function CRMClientes() {
  const { clientes, vendas, adicionarCliente, editarCliente, removerCliente } =
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
  const [fichaAberta, setFichaAberta] = useState<Cliente | null>(null);

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
      toast.error("Nome do cliente e obrigatorio.");
      return;
    }
    adicionarCliente(nome.trim(), doc.trim(), tel.trim(), email.trim());
    resetarForm();
    toast.success("Cliente adicionado!");
  };

  const handleEditar = (id: string) => {
    if (!editNome.trim()) {
      toast.error("Nome e obrigatorio.");
      return;
    }
    editarCliente(
      id,
      editNome.trim(),
      editDoc.trim(),
      editTel.trim(),
      editEmail.trim()
    );
    setEditandoId(null);
    toast.success("Cliente atualizado!");
  };

  const obterHistoricoCliente = (clienteNome: string): Venda[] => {
    return vendas.filter((v) => v.cliente === clienteNome);
  };

  const obterTotalGasto = (clienteNome: string): number => {
    return vendas
      .filter((v) => v.cliente === clienteNome)
      .reduce((s, v) => s + v.total, 0);
  };

  const handleWhatsAppCliente = async (telefone: string, nome: string) => {
    const msg =
      `Ola ${nome}! Aqui e da *${useERPStore.getState().empresa.nome || "sua empresa"}*.\n\n` +
      `Estamos entrando em contato. Estamos a disposicao!`;
    const resultado = await abrirWhatsApp(telefone, msg);
    if (resultado === "imagem_enviada") toast.success("Mensagem com logomarca enviada!");
    else if (resultado === "imagem_baixada") toast.success("Imagem baixada! Anexe no WhatsApp com a mensagem copiada.");
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary shrink-0" />
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
              <Plus className="h-3 w-3 mr-1 shrink-0" />
              Adicionar Cliente
            </Button>
          </div>

          {clientes.length > 3 && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground shrink-0" />
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
                {busca
                  ? "Nenhum cliente encontrado."
                  : "Nenhum cliente cadastrado."}
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
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleEditar(c.id)
                      }
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
                      className="h-7 w-full text-primary text-[10px]"
                      onClick={() => handleEditar(c.id)}
                    >
                      <Check className="h-3 w-3 mr-1 shrink-0" /> Salvar
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
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setFichaAberta(c)}>
                      <p className="font-medium truncate">{c.nome}</p>
                      {(c.documento || c.telefone) && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {c.documento && c.telefone
                            ? `${c.documento} · ${c.telefone}`
                            : c.documento || c.telefone}
                        </p>
                      )}
                      <p className="text-[9px] text-primary font-medium">
                        Total: {formatarMoeda(obterTotalGasto(c.nome))}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-info shrink-0"
                      onClick={() => setFichaAberta(c)}
                      title="Ver ficha"
                    >
                      <Eye className="h-3 w-3 shrink-0" />
                    </Button>
                    {c.telefone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-primary shrink-0"
                        onClick={() =>
                          handleWhatsAppCliente(c.telefone, c.nome)
                        }
                        title="WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3 shrink-0" />
                      </Button>
                    )}
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
                      <Pencil className="h-3 w-3 shrink-0" />
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

      {/* Dialog Ficha do Cliente */}
      <Dialog
        open={!!fichaAberta}
        onOpenChange={() => setFichaAberta(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary shrink-0" />
              Ficha do Cliente
            </DialogTitle>
          </DialogHeader>

          {fichaAberta && (
            <FichaCliente
              cliente={fichaAberta}
              historico={obterHistoricoCliente(fichaAberta.nome)}
              totalGasto={obterTotalGasto(fichaAberta.nome)}
              onWhatsApp={() =>
                fichaAberta.telefone
                  ? handleWhatsAppCliente(
                      fichaAberta.telefone,
                      fichaAberta.nome
                    )
                  : toast.error("Cliente nao tem telefone cadastrado.")
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function FichaCliente({
  cliente,
  historico,
  totalGasto,
  onWhatsApp,
}: {
  cliente: Cliente;
  historico: Venda[];
  totalGasto: number;
  onWhatsApp: () => void;
}) {
  const qtdCompras = historico.length;
  const qtdPagas = historico.filter((v) => v.status === "PAGO").length;
  const qtdPendentes = historico.filter((v) => v.status === "PENDENTE").length;
  const totalPendente = historico
    .filter((v) => v.status === "PENDENTE")
    .reduce((s, v) => s + v.total, 0);

  return (
    <div className="space-y-4">
      {/* Info do cliente */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-muted/50 rounded-lg p-3">
          <p className="text-sm font-bold">{cliente.nome}</p>
          <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
            {cliente.documento && <span>Doc: {cliente.documento}</span>}
            {cliente.telefone && <span>Tel: {cliente.telefone}</span>}
          </div>
          {cliente.email && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {cliente.email}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-primary/5 dark:bg-primary/15 rounded-lg p-2.5 text-center border border-primary/15 dark:border-primary/40">
          <div className="flex items-center justify-center gap-1 text-[10px] text-primary dark:text-primary/80 font-bold mb-0.5">
            <DollarSign className="h-3 w-3 shrink-0" />
            Total Gasto
          </div>
          <p className="text-sm font-black text-primary dark:text-primary/80">
            {formatarMoeda(totalGasto)}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center border">
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-bold mb-0.5">
            <ShoppingBag className="h-3 w-3 shrink-0" />
            Compras
          </div>
          <p className="text-sm font-black">{qtdCompras}</p>
        </div>
        <div className="bg-primary/5 dark:bg-primary/15 rounded-lg p-2.5 text-center border border-primary/15 dark:border-primary/40">
          <div className="text-[10px] text-primary dark:text-primary/80 font-bold mb-0.5">
            Pagas
          </div>
          <p className="text-sm font-black text-primary dark:text-primary/80">
            {qtdPagas}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2.5 text-center border border-amber-100 dark:border-amber-900">
          <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold mb-0.5">
            Pendentes
          </div>
          <p className="text-sm font-black text-amber-700 dark:text-amber-400">
            {qtdPendentes}
            {totalPendente > 0 && (
              <span className="text-[10px] font-normal block">
                {formatarMoeda(totalPendente)}
              </span>
            )}
          </p>
        </div>
      </div>

      {cliente.telefone && (
        <Button
          variant="outline"
          className="w-full bg-primary/5 dark:bg-primary/15 border-primary/20 dark:border-primary/40 text-primary hover:bg-primary/10 text-xs"
          onClick={onWhatsApp}
        >
          <MessageCircle className="h-3.5 w-3.5 mr-2" />
          Abrir WhatsApp
        </Button>
      )}

      {/* Historico de compras */}
      <div>
        <h3 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Historico de Compras
        </h3>
        {historico.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4 italic">
            Nenhuma compra registrada.
          </p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100 rounded-lg border">
              {historico.map((v) => (
                <div key={v.id} className="p-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 font-mono">{v.data}</p>
                    <p className="text-xs text-gray-700 truncate">{v.itens.map((i) => i.servicoNome).join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="secondary"
                      className={`text-[9px] ${
                        v.status === "PAGO"
                          ? "bg-primary/10 text-primary dark:bg-primary/30 dark:text-white/60"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      }`}
                    >
                      {v.status}
                    </Badge>
                    <p className="text-xs font-bold text-gray-900">{formatarMoeda(v.total)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop tabela */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="text-[10px] uppercase">
                    <TableHead className="py-1.5 px-2">Data</TableHead>
                    <TableHead className="py-1.5 px-2">Servicos</TableHead>
                    <TableHead className="py-1.5 px-2 text-right">
                      Total
                    </TableHead>
                    <TableHead className="py-1.5 px-2 text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historico.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="py-1.5 px-2 font-mono text-[10px] whitespace-nowrap">
                        {v.data}
                      </TableCell>
                      <TableCell className="py-1.5 px-2 max-w-[140px] truncate">
                        {v.itens.map((i) => i.servicoNome).join(", ")}
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-right font-bold whitespace-nowrap">
                        {formatarMoeda(v.total)}
                      </TableCell>
                      <TableCell className="py-1.5 px-2 text-center">
                        <Badge
                          variant="secondary"
                          className={`text-[9px] ${
                            v.status === "PAGO"
                              ? "bg-primary/10 text-primary dark:bg-primary/30 dark:text-white/60"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          }`}
                        >
                          {v.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}