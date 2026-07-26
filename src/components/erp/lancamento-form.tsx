"use client";

import { useState, useCallback } from "react";
import { useERPStore } from "@/hooks/use-erp-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Trash2,
  ShoppingCart,
  User,
  Wrench,
} from "lucide-react";
import {
  type ItemVenda,
  type FormaPagamento,
  type StatusPagamento,
  type Venda,
  FORMAS_PAGAMENTO,
} from "@/types";
import {
  gerarId,
  formatarMoeda,
  formatarDataHora,
} from "@/lib/utils-erp";

interface LancamentoFormProps {
  onVendaCriada: (venda: Venda) => void;
}

export function LancamentoForm({ onVendaCriada }: LancamentoFormProps) {
  const {
    empresa,
    clientes,
    servicos,
    colaboradores,
    obterChavePixAtiva,
  } = useERPStore();

  const [clienteId, setClienteId] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [docCliente, setDocCliente] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("PIX");
  const [status, setStatus] = useState<StatusPagamento>("PAGO");
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [servicoSelId, setServicoSelId] = useState("");
  const [qtdItem, setQtdItem] = useState("1");
  const [colaboradorId, setColaboradorId] = useState("");
  const [desconto, setDesconto] = useState("0");
  const [acrescimo, setAcrescimo] = useState("0");

  const handleClienteSelect = (id: string) => {
    setClienteId(id);
    if (id) {
      const c = clientes.find((cl) => cl.id === id);
      if (c) {
        setNomeCliente(c.nome);
        setDocCliente(c.documento);
      }
    }
  };

  const subtotal = itens.reduce((s, i) => s + i.valorTotal, 0);
  const desc = parseFloat(desconto) || 0;
  const acr = parseFloat(acrescimo) || 0;
  const totalGeral = subtotal - desc + acr;

  const adicionarItem = useCallback(() => {
    let nome: string;
    let valor: number;

    if (servicoSelId) {
      const s = servicos.find((sv) => sv.id === servicoSelId);
      if (!s) return;
      nome = s.nome;
      valor = s.valor;
    } else {
      toast.error("Selecione um serviço do catálogo.");
      return;
    }

    const qtd = parseInt(qtdItem) || 1;
    const item: ItemVenda = {
      id: gerarId(),
      servicoNome: nome,
      quantidade: qtd,
      valorUnitario: valor,
      valorTotal: valor * qtd,
    };
    setItens((prev) => [...prev, item]);
    setServicoSelId("");
    setQtdItem("1");
  }, [servicoSelId, servicos, qtdItem]);

  const removerItem = useCallback((id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const colaboradorSel = colaboradorId
    ? colaboradores.find((c) => c.id === colaboradorId)
    : null;

  const handleSubmit = useCallback(() => {
    if (!nomeCliente.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (itens.length === 0) {
      toast.error("Adicione pelo menos um item.");
      return;
    }

    const { data, hora } = formatarDataHora();
    const chavePixAtiva = obterChavePixAtiva();
    const chavePixStr = chavePixAtiva
      ? `${chavePixAtiva.tipo}: ${chavePixAtiva.valor}`
      : "";
    const col = colaboradorId
      ? colaboradores.find((c) => c.id === colaboradorId)
      : null;

    const venda: Venda = {
      id: gerarId(),
      empresa: empresa.nome || "PRESTADOR DE SERVIÇOS",
      endereco: empresa.endereco,
      telefone: empresa.telefone,
      cliente: nomeCliente.trim() || "CONSUMIDOR PADRÃO",
      docCliente: docCliente.trim(),
      itens,
      valor: subtotal,
      desconto: desc,
      acrescimo: acr,
      total: totalGeral,
      formaPagamento,
      status,
      chavePix: chavePixStr,
      colaboradorId: col?.id || "",
      colaboradorNome: col?.nome || "",
      data,
      hora,
      timestamp: Date.now(),
    };

    const store = useERPStore.getState();
    store.adicionarVenda(venda);
    store.atualizarEmpresa({
      nome: empresa.nome,
      endereco: empresa.endereco,
      telefone: empresa.telefone,
    });

    onVendaCriada(venda);

    // Resetar formulário
    setClienteId("");
    setNomeCliente("");
    setDocCliente("");
    setColaboradorId("");
    setItens([]);
    setDesconto("0");
    setAcrescimo("0");

    toast.success(
      status === "PAGO"
        ? "Comprovante gerado com sucesso!"
        : "Fatura gerada com sucesso!"
    );
  }, [
    nomeCliente,
    docCliente,
    itens,
    subtotal,
    desc,
    acr,
    totalGeral,
    formaPagamento,
    status,
    empresa,
    colaboradorId,
    colaboradores,
    onVendaCriada,
    obterChavePixAtiva,
  ]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-primary" />
          Lançar Atendimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Atalhos */}
        <div className="grid grid-cols-2 gap-2 bg-primary/5 dark:bg-primary/15 p-3 rounded-lg border border-primary/15 dark:border-primary/40">
          <div>
            <Label className="text-[10px] font-bold text-primary dark:text-white/80 uppercase mb-1 block">
              <User className="h-3 w-3 inline mr-1" />
              Atalho CRM
            </Label>
            <Select value={clienteId} onValueChange={handleClienteSelect}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Selecionar cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] font-bold text-primary dark:text-white/80 uppercase mb-1 block">
              <Wrench className="h-3 w-3 inline mr-1" />
              Atalho Catálogo
            </Label>
            <Select value={servicoSelId} onValueChange={setServicoSelId}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue placeholder="Selecionar serviço..." />
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
        </div>

        {/* Dados do Cliente */}
        <div className="space-y-2">
          <Input
            placeholder="Nome do Cliente *"
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            className="text-sm h-9"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Doc. Cliente (Opcional)"
              value={docCliente}
              onChange={(e) => setDocCliente(e.target.value)}
              className="text-xs h-9"
            />
            <Select
              value={formaPagamento}
              onValueChange={(v) => setFormaPagamento(v as FormaPagamento)}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAGAMENTO.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {colaboradores.filter((c) => c.ativo).length > 0 && (
            <div>
              <Label className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 block">
                Profissional (Opcional)
              </Label>
              <Select value={colaboradorId} onValueChange={setColaboradorId}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Selecionar profissional..." />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores
                    .filter((c) => c.ativo)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.nome} {c.especialidade ? `(${c.especialidade})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Adicionar Itens */}
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase">
            <ShoppingCart className="h-3 w-3 inline mr-1" />
            Itens do Atendimento
          </Label>
          <div className="flex gap-1.5">
            <Select value={servicoSelId} onValueChange={setServicoSelId}>
              <SelectTrigger className="flex-1 text-xs h-9">
                <SelectValue placeholder="Serviço..." />
              </SelectTrigger>
              <SelectContent>
                {servicos.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.nome} - {formatarMoeda(s.valor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="1"
              value={qtdItem}
              onChange={(e) => setQtdItem(e.target.value)}
              className="w-16 text-xs h-9 text-center"
              placeholder="Qtd"
            />
            <Button
              size="sm"
              className="h-9 px-3 bg-primary hover:bg-primary/90"
              onClick={adicionarItem}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Lista de Itens */}
          {itens.length > 0 && (
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium truncate block">
                      {item.servicoNome}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.quantidade}x {formatarMoeda(item.valorUnitario)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold">
                      {formatarMoeda(item.valorTotal)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500"
                      onClick={() => removerItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desconto / Acréscimo / Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <Label className="text-[10px] font-bold text-red-600 uppercase mb-0.5 block">
              Desc. (R$)
            </Label>
            <Input
              type="number"
              step="0.01"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              className="text-xs h-9"
              placeholder="0,00"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-blue-600 uppercase mb-0.5 block">
              Taxa (R$)
            </Label>
            <Input
              type="number"
              step="0.01"
              value={acrescimo}
              onChange={(e) => setAcrescimo(e.target.value)}
              className="text-xs h-9"
              placeholder="0,00"
            />
          </div>
          <div>
            <Label className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 block">
              Situação
            </Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as StatusPagamento)}
            >
              <SelectTrigger className="text-xs h-9 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PAGO" className="text-xs text-primary">
                  PAGO
                </SelectItem>
                <SelectItem value="PENDENTE" className="text-xs text-amber-700">
                  PENDENTE
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Total e Botão */}
        <div className="bg-muted/50 p-3 rounded-lg border">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
            <span>Subtotal: {formatarMoeda(subtotal)}</span>
            {desc > 0 && (
              <span className="text-red-600">- {formatarMoeda(desc)}</span>
            )}
            {acr > 0 && (
              <span className="text-blue-600">+ {formatarMoeda(acr)}</span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">Total:</span>
            <span className="text-lg font-black text-primary dark:text-primary/80">
              {formatarMoeda(totalGeral)}
            </span>
          </div>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary/90 h-11 text-sm font-bold uppercase tracking-wider"
          onClick={handleSubmit}
        >
          <FileText className="h-4 w-4 mr-2" />
          {status === "PAGO" ? "Processar e Gerar Comprovante" : "Processar e Gerar Fatura"}
        </Button>
      </CardContent>
    </Card>
  );
}