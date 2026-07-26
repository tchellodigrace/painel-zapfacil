"use client";

import { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  MessageSquare,
  UserPlus,
  Clock,
  AlertCircle,
  Loader2,
  History,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Contact {
  id: string;
  nome: string;
  telefone: string;
  selecionado: boolean;
  status: "pendente" | "enviando" | "enviado" | "falhou";
}

interface Campaign {
  id: string;
  nome: string;
  mensagem: string;
  totalContatos: number;
  enviados: number;
  falharam: number;
  dataCriacao: string;
  status: "rascunho" | "enviando" | "concluida";
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatarTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 11) {
    return `+55 (${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  }
  if (digitos.length === 10) {
    return `+55 (${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return telefone;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ZapBotDisparo() {
  /* ---------- Campaign form ---------- */
  const [campaignName, setCampaignName] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");

  /* ---------- Manual add ---------- */
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");

  /* ---------- Bulk paste ---------- */
  const [bulkText, setBulkText] = useState("");

  /* ---------- Contacts ---------- */
  const [contacts, setContacts] = useState<Contact[]>([]);

  /* ---------- Stats ---------- */
  const [enviados, setEnviados] = useState(0);
  const [falharam, setFalharam] = useState(0);

  /* ---------- Sending state ---------- */
  const [enviando, setEnviando] = useState(false);

  /* ---------- Campaign history ---------- */
  const [historico, setHistorico] = useState<Campaign[]>([]);

  /* ---------- Active tab ---------- */
  const [activeTab, setActiveTab] = useState<"manual" | "bulk">("manual");

  /* ---------- Refs ---------- */
  const abortRef = useRef(false);

  /* ---- Derived stats ---- */
  const totalContatos = contacts.length;
  const selecionados = contacts.filter((c) => c.selecionado).length;

  /* ---- Reset counters when contacts change ---- */
  const recalcStats = useCallback(
    (list: Contact[]) => {
      setEnviados(list.filter((c) => c.status === "enviado").length);
      setFalharam(list.filter((c) => c.status === "falhou").length);
    },
    [],
  );

  /* ================================================================ */
  /*  Contact management                                               */
  /* ================================================================ */

  function addContatoManual() {
    const nome = manualName.trim();
    const telefone = manualPhone.trim();
    if (!nome || !telefone) {
      toast.error("Preencha nome e telefone para adicionar um contato.");
      return;
    }
    const contato: Contact = {
      id: gerarId(),
      nome,
      telefone,
      selecionado: true,
      status: "pendente",
    };
    setContacts((prev) => [...prev, contato]);
    setManualName("");
    setManualPhone("");
    toast.success(`Contato "${nome}" adicionado.`);
  }

  function addContatosBulk() {
    const linhas = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (linhas.length === 0) {
      toast.error("Cole ao menos uma linha no formato: nome,telefone");
      return;
    }

    const novos: Contact[] = [];
    const erros: string[] = [];

    for (const linha of linhas) {
      const partes = linha.split(",").map((s) => s.trim());
      if (partes.length >= 2 && partes[0] && partes[1]) {
        novos.push({
          id: gerarId(),
          nome: partes[0],
          telefone: partes[1],
          selecionado: true,
          status: "pendente",
        });
      } else {
        erros.push(linha);
      }
    }

    if (novos.length > 0) {
      setContacts((prev) => [...prev, ...novos]);
      setBulkText("");
      toast.success(`${novos.length} contato(s) importado(s).`);
    }
    if (erros.length > 0) {
      toast.warning(
        `${erros.length} linha(s) ignorada(s) — formato invalido.`,
      );
    }
  }

  function toggleAll() {
    const allSelected = contacts.every((c) => c.selecionado);
    setContacts((prev) =>
      prev.map((c) => ({ ...c, selecionado: !allSelected })),
    );
  }

  function toggleOne(id: string) {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selecionado: !c.selecionado } : c)),
    );
  }

  function removeOne(id: string) {
    setContacts((prev) => {
      const next = prev.filter((c) => c.id !== id);
      recalcStats(next);
      return next;
    });
    toast.success("Contato removido.");
  }

  function removeSelected() {
    const count = contacts.filter((c) => c.selecionado).length;
    if (count === 0) {
      toast.info("Nenhum contato selecionado para remover.");
      return;
    }
    setContacts((prev) => {
      const next = prev.filter((c) => !c.selecionado);
      recalcStats(next);
      return next;
    });
    toast.success(`${count} contato(s) removido(s).`);
  }

  function clearAllContacts() {
    setContacts([]);
    setEnviados(0);
    setFalharam(0);
    toast.success("Todos os contatos removidos.");
  }

  /* ================================================================ */
  /*  Simulate sending                                                 */
  /* ================================================================ */

  async function enviarMensagens() {
    const selecionadosList = contacts.filter((c) => c.selecionado);
    if (selecionadosList.length === 0) {
      toast.error("Selecione ao menos um contato para enviar.");
      return;
    }
    if (!campaignName.trim()) {
      toast.error("Defina um nome para a campanha.");
      return;
    }
    if (!campaignMessage.trim()) {
      toast.error("Escreva uma mensagem para a campanha.");
      return;
    }

    setEnviando(true);
    abortRef.current = false;

    const idsSelecionados = new Set(selecionadosList.map((c) => c.id));

    // Mark selected as "enviando"
    setContacts((prev) =>
      prev.map((c) =>
        idsSelecionados.has(c.id) ? { ...c, status: "enviando" as const } : c,
      ),
    );

    toast.info(`Enviando ${selecionadosList.length} mensagem(ns)...`);

    for (const contato of selecionadosList) {
      if (abortRef.current) break;

      // Simulate 3-second delay per message
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, 3000);
        // Store so we can clear on abort if needed
        return () => clearTimeout(timer);
      });

      if (abortRef.current) break;

      // 80% success rate simulation
      const sucesso = Math.random() < 0.8;

      setContacts((prev) => {
        const next = prev.map((c) =>
          c.id === contato.id
            ? { ...c, status: sucesso ? ("enviado" as const) : ("falhou" as const) }
            : c,
        );
        // Recalc stats after each update
        setTimeout(() => recalcStats(next), 0);
        return next;
      });
    }

    // Build campaign history entry
    const finalContacts = contacts; // stale – compute from state after settle
    setContacts((prev) => {
      const env = prev.filter(
        (c) => idsSelecionados.has(c.id) && c.status === "enviado",
      ).length;
      const fal = prev.filter(
        (c) => idsSelecionados.has(c.id) && c.status === "falhou",
      ).length;

      setHistorico((h) => [
        {
          id: gerarId(),
          nome: campaignName.trim(),
          mensagem: campaignMessage.trim(),
          totalContatos: selecionadosList.length,
          enviados: env,
          falharam: fal,
          dataCriacao: new Date().toISOString(),
          status: "concluida",
        },
        ...h,
      ]);

      return prev;
    });

    setEnviando(false);
    toast.success("Campanha finalizada!");
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Disparo em Massa
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Envie mensagens em lote para seus contatos via WhatsApp
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActiveTab("manual");
            setCampaignName("");
            setCampaignMessage("");
            clearAllContacts();
          }}
        >
          <MessageSquare className="h-4 w-4 mr-1 shrink-0" />
          Nova Campanha
        </Button>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total */}
        <Card className="bg-gray-50 dark:bg-gray-900/50 min-w-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <p className="text-base sm:text-lg font-bold text-foreground font-display">
                {totalContatos}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Total
            </p>
          </CardContent>
        </Card>
        {/* Selected */}
        <Card className="bg-primary/5 dark:bg-primary/25 min-w-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <UserPlus className="h-4 w-4 text-primary shrink-0" />
              <p className="text-base sm:text-lg font-bold text-primary dark:text-primary/80 font-display">
                {selecionados}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Selecionados
            </p>
          </CardContent>
        </Card>
        {/* Sent */}
        <Card className="bg-success/10 dark:bg-success/20 min-w-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-success shrink-0" />
              <p className="text-base sm:text-lg font-bold text-success dark:text-success/80 font-display">
                {enviados}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Enviados
            </p>
          </CardContent>
        </Card>
        {/* Failed */}
        <Card className="bg-red-50 dark:bg-red-950/40 min-w-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400 font-display">
                {falharam}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Falharam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Campaign config ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <FileText className="h-4 w-4 text-primary dark:text-primary/80 shrink-0" />
            Configuração da Campanha
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Defina o nome e a mensagem que sera enviada aos contatos selecionados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="campaign-name"
                className="text-xs font-medium text-muted-foreground"
              >
                Nome da Campanha
              </Label>
              <Input
                id="campaign-name"
                placeholder="Ex: Promoção Black Friday"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="text-sm"
              />
            </div>
            {/* Placeholder for spacing on mobile */}
            <div className="hidden sm:block" />
          </div>

          {/* Message template */}
          <div className="space-y-1.5">
            <Label
              htmlFor="campaign-message"
              className="text-xs font-medium text-muted-foreground"
            >
              Mensagem
            </Label>
            <Textarea
              id="campaign-message"
              placeholder="Olá {nome}! Temos uma novidade especial para você..."
              value={campaignMessage}
              onChange={(e) => setCampaignMessage(e.target.value)}
              rows={3}
              className="text-sm resize-none"
            />
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Use{" "}
              <code className="bg-secondary px-1 py-0.5 rounded text-[10px] font-mono">
                {"{nome}"}
              </code>{" "}
              para personalizar com o nome do contato
            </p>

            {/* Preview */}
            {campaignMessage && (
              <div className="mt-2 p-3 rounded-lg bg-primary/5 dark:bg-primary/20 border border-primary/15 dark:border-primary/50">
                <p className="text-[10px] text-primary dark:text-primary/80 font-medium mb-1">
                  Preview:
                </p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {campaignMessage.replace(
                    /\{nome\}/g,
                    contacts[0]?.nome || "João Silva",
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Add contacts ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <UserPlus className="h-4 w-4 text-primary dark:text-primary/80 shrink-0" />
            Adicionar Contatos
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Adicione contatos manualmente ou importe em lote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab toggle */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "manual" ? "default" : "outline"}
              size="sm"
              className={
                activeTab === "manual"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : ""
              }
              onClick={() => setActiveTab("manual")}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Manual
            </Button>
            <Button
              variant={activeTab === "bulk" ? "default" : "outline"}
              size="sm"
              className={
                activeTab === "bulk"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : ""
              }
              onClick={() => setActiveTab("bulk")}
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              Em Lote
            </Button>
          </div>

          {/* Manual add */}
          {activeTab === "manual" && (
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <Label className="text-xs text-muted-foreground">
                  Nome
                </Label>
                <Input
                  placeholder="Nome do contato"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addContatoManual()}
                />
              </div>
              <div className="flex-1 space-y-1.5 w-full">
                <Label className="text-xs text-muted-foreground">
                  Telefone
                </Label>
                <Input
                  placeholder="5511999999999"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addContatoManual()}
                />
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={addContatoManual}
              >
                <Plus className="h-4 w-4 mr-1 shrink-0" />
                Adicionar
              </Button>
            </div>
          )}

          {/* Bulk add */}
          {activeTab === "bulk" && (
            <div className="space-y-3">
              <Textarea
                placeholder={"João Silva,5511999999999\nMaria Santos,5521977776666\nPedro Costa,5531955544444"}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={5}
                className="text-sm font-mono resize-none"
              />
              <p className="text-[10px] text-gray-400 dark:text-gray-500">
                Um contato por linha no formato:{" "}
                <code className="bg-secondary px-1 py-0.5 rounded text-[10px] font-mono">
                  nome,telefone
                </code>
              </p>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={addContatosBulk}
              >
                <Users className="h-4 w-4 mr-1 shrink-0" />
                Importar Contatos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Contacts table ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
                <Users className="h-4 w-4 text-primary dark:text-primary/80 shrink-0" />
                Lista de Contatos
                <Badge
                  variant="secondary"
                  className="text-[10px] font-normal bg-primary/10 dark:bg-primary/50 text-primary dark:text-primary/80"
                >
                  {totalContatos}
                </Badge>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {contacts.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-600 border-red-200 dark:border-red-900 dark:hover:bg-red-950/50"
                    onClick={removeSelected}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remover Selecionados
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                    onClick={clearAllContacts}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-muted-foreground/70 dark:text-gray-600 mx-auto mb-3 shrink-0" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Nenhum contato adicionado.
              </p>
              <p className="text-xs text-muted-foreground/70 dark:text-gray-600 mt-1">
                Adicione contatos manualmente ou importe em lote acima.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/60">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={contacts.every((c) => c.selecionado)}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Nome
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground">
                      Telefone
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground text-center">
                      Status
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contato) => (
                    <TableRow
                      key={contato.id}
                      className={
                        contato.selecionado
                          ? "bg-primary/5 dark:bg-primary/15"
                          : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={contato.selecionado}
                          onCheckedChange={() => toggleOne(contato.id)}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {contato.nome}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatarTelefone(contato.telefone)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={contato.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 shrink-0"
                          onClick={() => removeOne(contato.id)}
                          disabled={enviando}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---------- Send button ---------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {selecionados === 0
            ? "Selecione contatos para enviar."
            : `${selecionados} contato(s) selecionado(s) para envio.`}
        </p>
        <Button
          size="lg"
          disabled={enviando || selecionados === 0}
          className="bg-primary hover:bg-primary/90 text-white disabled:opacity-50 min-w-[160px]"
          onClick={enviarMensagens}
        >
          {enviando ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2 shrink-0" />
              Enviar ({selecionados})
            </>
          )}
        </Button>
      </div>

      {/* ---------- Progress bar while sending ---------- */}
      {enviando && (
        <Card className="border-primary/20 dark:border-primary/50 bg-primary/5 dark:bg-primary/15 min-w-0">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary dark:text-primary/80 animate-spin" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary dark:text-foreground/80">
                Enviando mensagens...
              </p>
              <p className="text-xs text-primary dark:text-primary/80">
                {enviados + falharam} de {selecionados} — {enviados} enviados,{" "}
                {falharam} falharam
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Taxa de sucesso
                </p>
                <p className="text-sm font-bold text-primary dark:text-primary/80">
                  {enviados + falharam > 0
                    ? Math.round((enviados / (enviados + falharam)) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />

      {/* ---------- Campaign history ---------- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <History className="h-4 w-4 text-primary dark:text-primary/80 shrink-0" />
            Histórico de Campanhas
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Campanhas enviadas anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {historico.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-10 w-10 text-muted-foreground/70 dark:text-gray-600 mx-auto mb-2 shrink-0" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Nenhuma campanha enviada ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {historico.map((camp) => (
                <div
                  key={camp.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {camp.nome}
                      </span>
                      <Badge
                        className={`text-[10px] ${
                          camp.status === "concluida"
                            ? "bg-success/15 dark:bg-success/25 text-success dark:text-success/80"
                            : camp.status === "enviando"
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {camp.status === "concluida"
                          ? "Concluída"
                          : camp.status === "enviando"
                            ? "Enviando"
                            : "Rascunho"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {camp.mensagem}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      {formatarData(camp.dataCriacao)}
                    </p>
                  </div>

                  {/* Right: Stats */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Total
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {camp.totalContatos}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-success dark:text-success/80 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 shrink-0" />
                        Enviados
                      </p>
                      <p className="text-sm font-bold text-success dark:text-success/80">
                        {camp.enviados}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <XCircle className="h-3 w-3 shrink-0" />
                        Falharam
                      </p>
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">
                        {camp.falharam}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Taxa
                      </p>
                      <p className="text-sm font-bold text-primary dark:text-primary/80">
                        {camp.totalContatos > 0
                          ? Math.round(
                              (camp.enviados / camp.totalContatos) * 100,
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-component: Status badge                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: Contact["status"] }) {
  switch (status) {
    case "pendente":
      return (
        <Badge
          variant="outline"
          className="text-[10px] border-gray-300 dark:border-gray-700 text-muted-foreground"
        >
          Pendente
        </Badge>
      );
    case "enviando":
      return (
        <Badge className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Enviando
        </Badge>
      );
    case "enviado":
      return (
        <Badge className="text-[10px] bg-success/15 dark:bg-success/25 text-success dark:text-success/80 flex items-center gap-1">
          <CheckCircle className="h-3 w-3 shrink-0" />
          Enviado
        </Badge>
      );
    case "falhou":
      return (
        <Badge className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 flex items-center gap-1">
          <XCircle className="h-3 w-3 shrink-0" />
          Falhou
        </Badge>
      );
  }
}
