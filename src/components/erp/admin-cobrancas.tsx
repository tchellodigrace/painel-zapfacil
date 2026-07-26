"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useAdminStore,
  TIPOS_COBRANCA,
  STATUS_COBRANCA,
  FORMAS_PAGAMENTO_ADMIN,
  TIPOS_LICENCA,
  type Cobranca,
  type TipoCobranca,
  type StatusCobranca,
  type FormaPagamentoAdmin,
  type SistemaCliente,
} from "@/hooks/use-admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Receipt,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Clock,
  Send,
  FileText,
} from "lucide-react";
import { abrirWhatsApp } from "@/lib/utils-erp";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string) {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
  return data;
}

function diasRestantes(vencimento: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(vencimento + "T00:00:00");
  const diff = venc.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// =============================================
// FORMULÁRIO DE COBRANÇA
// =============================================
function FormularioCobranca({
  sistema,
  cobrancaEdit,
  onSalvar,
  onCancelar,
}: {
  sistema?: SistemaCliente;
  cobrancaEdit?: Cobranca;
  onSalvar: (dados: Omit<Cobranca, "id" | "criadoEm">) => void;
  onCancelar: () => void;
}) {
  const { sistemas } = useAdminStore();
  const sistemasAtivos = sistemas.filter(
    (s) => s.status === "ATIVO" || s.status === "TRIAL"
  );

  const hoje = new Date().toISOString().split("T")[0];

  const [sistemaId, setSistemaId] = useState(
    cobrancaEdit?.sistemaId || sistema?.id || ""
  );
  const [tipo, setTipo] = useState<TipoCobranca>(
    cobrancaEdit?.tipo || "MENSALIDADE"
  );
  const [descricao, setDescricao] = useState(
    cobrancaEdit?.descricao || ""
  );
  const [valor, setValor] = useState(
    cobrancaEdit?.valor?.toString() || ""
  );
  const [dataVencimento, setDataVencimento] = useState(
    cobrancaEdit?.dataVencimento || hoje
  );
  const [observacoes, setObservacoes] = useState(
    cobrancaEdit?.observacoes || ""
  );

  // Auto-preenche quando seleciona sistema
  const sistemaSel = sistemasAtivos.find((s) => s.id === sistemaId);

  const handleSelectSistema = (id: string) => {
    setSistemaId(id);
    const s = sistemasAtivos.find((x) => x.id === id);
    if (s && !cobrancaEdit) {
      if (s.tipoLicenca === "ALUGUEL") {
        setTipo("MENSALIDADE");
        setValor(s.valorMensal?.toString() || "");
      } else {
        setTipo("AQUISICAO");
        setValor(s.valorAquisicao?.toString() || "");
      }
      setDescricao("");
    }
  };

  const handleSelectTipo = (t: string) => {
    setTipo(t as TipoCobranca);
    if (!cobrancaEdit && sistemaSel) {
      if (t === "MENSALIDADE") setValor(sistemaSel.valorMensal?.toString() || "");
      if (t === "AQUISICAO") setValor(sistemaSel.valorAquisicao?.toString() || "");
      if (t === "TAXA_INSTALACAO") setValor(sistemaSel.taxaInstalacao?.toString() || "");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sistemaId) {
      toast.error("Selecione um sistema.");
      return;
    }
    const s = sistemas.find((x) => x.id === sistemaId);
    if (!descricao.trim() && tipo === "OUTROS") {
      toast.error("Descreva esta cobranca.");
      return;
    }
    if (!dataVencimento) {
      toast.error("Data de vencimento e obrigatoria.");
      return;
    }
    const valorNum = parseFloat(valor) || 0;
    if (valorNum <= 0) {
      toast.error("Valor deve ser maior que zero.");
      return;
    }

    let descFinal = descricao.trim();
    if (!descFinal) {
      const mesRef = new Date(dataVencimento + "T00:00:00").toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      if (tipo === "MENSALIDADE") descFinal = `Mensalidade - ${mesRef}`;
      else if (tipo === "AQUISICAO") descFinal = "Aquisicao do sistema (licenca definitiva)";
      else if (tipo === "TAXA_INSTALACAO") descFinal = "Taxa de instalacao";
      else if (tipo === "TAXA_SUPORTE") descFinal = "Taxa de suporte tecnico";
    }

    onSalvar({
      sistemaId,
      sistemaNome: s?.empresa || "",
      tipo,
      descricao: descFinal,
      valor: valorNum,
      dataVencimento,
      dataPagamento: cobrancaEdit?.dataPagamento || null,
      status: cobrancaEdit?.status || "PENDENTE",
      formaPagamento: cobrancaEdit?.formaPagamento || null,
      observacoes: observacoes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs font-medium">Sistema *</Label>
          <Select value={sistemaId} onValueChange={handleSelectSistema} disabled={!!cobrancaEdit}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue placeholder="Selecione o sistema" />
            </SelectTrigger>
            <SelectContent>
              {sistemasAtivos.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.empresa} — {s.responsavel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tipo de Cobranca *</Label>
          <Select value={tipo} onValueChange={handleSelectTipo}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_COBRANCA.map((t) => (
                <SelectItem key={t.valor} value={t.valor}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Valor (R$) *</Label>
          <Input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            className="text-sm h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Vencimento *</Label>
          <Input
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            className="text-sm h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Descricao</Label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Auto-preenchido pelo tipo"
            className="text-sm h-9"
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs font-medium">Observacoes</Label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Notas internas..."
            className="text-sm min-h-[50px]"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={onCancelar}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          className="text-xs bg-primary hover:bg-primary/90"
        >
          {cobrancaEdit ? "Salvar Alteracoes" : "Gerar Cobranca"}
        </Button>
      </div>
    </form>
  );
}

// =============================================
// FORMULÁRIO DE REGISTRO DE PAGAMENTO
// =============================================
function FormularioPagamento({
  cobranca,
  onConfirmar,
  onCancelar,
}: {
  cobranca: Cobranca;
  onConfirmar: (data: string, forma: FormaPagamentoAdmin) => void;
  onCancelar: () => void;
}) {
  const hoje = new Date().toISOString().split("T")[0];
  const [dataPag, setDataPag] = useState(hoje);
  const [forma, setForma] = useState<FormaPagamentoAdmin>("PIX");

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-900">{cobranca.sistemaNome}</p>
        <p className="text-xs text-gray-500">{cobranca.descricao}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-400">Vencimento: {formatarData(cobranca.dataVencimento)}</span>
          <span className="text-lg font-black text-primary">{formatarMoeda(cobranca.valor)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Data do Pagamento *</Label>
          <Input
            type="date"
            value={dataPag}
            onChange={(e) => setDataPag(e.target.value)}
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Forma de Pagamento *</Label>
          <Select value={forma} onValueChange={(v) => setForma(v as FormaPagamentoAdmin)}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMAS_PAGAMENTO_ADMIN.map((f) => (
                <SelectItem key={f.valor} value={f.valor}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="ghost" size="sm" className="text-xs" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          size="sm"
          className="text-xs bg-primary hover:bg-primary/90"
          onClick={() => onConfirmar(dataPag, forma)}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Confirmar Pagamento
        </Button>
      </div>
    </div>
  );
}

// =============================================
// PAINEL DE COBRANÇAS
// =============================================
export function PainelCobranças() {
  const {
    cobrancas,
    sistemas,
    adicionarCobranca,
    editarCobranca,
    removerCobranca,
    registrarPagamento,
    cancelarCobranca,
    gerarCobrancaMensal,
    gerarCobrancaAquisicao,
  } = useAdminStore();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroSistema, setFiltroSistema] = useState<string>("TODOS");
  const [dialogNova, setDialogNova] = useState(false);
  const [dialogPagamento, setDialogPagamento] = useState<Cobranca | null>(null);
  const [dialogEditCobranca, setDialogEditCobranca] = useState<Cobranca | null>(null);
  const [dialogHistorico, setDialogHistorico] = useState<SistemaCliente | null>(null);
  const [confirmaRemoverCob, setConfirmaRemoverCob] = useState<string | null>(null);

  // Estatísticas
  const stats = useMemo(() => {
    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const pagosMes = cobrancas.filter((c) => {
      if (c.status !== "PAGO" || !c.dataPagamento) return false;
      const dp = new Date(c.dataPagamento + "T00:00:00");
      return dp.getMonth() === mesAtual && dp.getFullYear() === anoAtual;
    });

    const pendentes = cobrancas.filter((c) => c.status === "PENDENTE");
    const atrasados = cobrancas.filter((c) => c.status === "ATRASADO");
    const totalRecebidoMes = pagosMes.reduce((s, c) => s + c.valor, 0);
    const totalPendente = pendentes.reduce((s, c) => s + c.valor, 0);
    const totalAtrasado = atrasados.reduce((s, c) => s + c.valor, 0);
    const previstoMes = cobrancas
      .filter((c) => {
        if (c.status === "CANCELADO") return false;
        const venc = new Date(c.dataVencimento + "T00:00:00");
        return venc.getMonth() === mesAtual && venc.getFullYear() === anoAtual;
      })
      .reduce((s, c) => s + c.valor, 0);

    return {
      recebidoMes: totalRecebidoMes,
      pendentes: pendentes.length,
      atrasados: atrasados.length,
      totalPendente,
      totalAtrasado,
      previstoMes,
      totalCobrancas: cobrancas.length,
    };
  }, [cobrancas]);

  // Filtragem
  const cobrancasFiltradas = useMemo(() => {
    let lista = cobrancas;
    if (filtroStatus !== "TODOS")
      lista = lista.filter((c) => c.status === filtroStatus);
    if (filtroTipo !== "TODOS") lista = lista.filter((c) => c.tipo === filtroTipo);
    if (filtroSistema !== "TODOS")
      lista = lista.filter((c) => c.sistemaId === filtroSistema);
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (c) =>
          c.sistemaNome.toLowerCase().includes(termo) ||
          c.descricao.toLowerCase().includes(termo) ||
          c.observacoes.toLowerCase().includes(termo)
      );
    }
    return lista;
  }, [cobrancas, filtroStatus, filtroTipo, filtroSistema, busca]);

  const getStatusInfo = (status: StatusCobranca) =>
    STATUS_COBRANCA.find((s) => s.valor === status) || STATUS_COBRANCA[0];
  const getTipoInfo = (tipo: TipoCobranca) =>
    TIPOS_COBRANCA.find((t) => t.valor === tipo) || TIPOS_COBRANCA[0];
  const getFormaInfo = (forma: FormaPagamentoAdmin) =>
    FORMAS_PAGAMENTO_ADMIN.find((f) => f.valor === forma);

  const handleSalvarNova = useCallback(
    (dados: Omit<Cobranca, "id" | "criadoEm">) => {
      adicionarCobranca(dados);
      setDialogNova(false);
      toast.success("Cobranca gerada com sucesso!");
    },
    [adicionarCobranca]
  );

  const handleSalvarEdicao = useCallback(
    (dados: Omit<Cobranca, "id" | "criadoEm">) => {
      if (!dialogEditCobranca) return;
      editarCobranca(dialogEditCobranca.id, dados);
      setDialogEditCobranca(null);
      toast.success("Cobranca atualizada!");
    },
    [dialogEditCobranca, editarCobranca]
  );

  const handleConfirmarPagamento = useCallback(
    (id: string, dataPag: string, forma: FormaPagamentoAdmin) => {
      registrarPagamento(id, dataPag, forma);
      setDialogPagamento(null);
      toast.success("Pagamento registrado!");
    },
    [registrarPagamento]
  );

  const handleRemover = useCallback(
    (id: string) => {
      removerCobranca(id);
      setConfirmaRemoverCob(null);
      toast.success("Cobranca removida.");
    },
    [removerCobranca]
  );

  const enviarLembreteWhatsApp = async (cobranca: Cobranca) => {
    const sistema = sistemas.find((s) => s.id === cobranca.sistemaId);
    if (!sistema?.telefone) {
      toast.error("Telefone nao cadastrado para este sistema.");
      return;
    }
    const msg =
      `Ola! Aqui e o suporte do *ZapFacil Pro*.\n\n` +
      `Gostariamos de lhe lembrar sobre a cobranca:\n\n` +
      `*${cobranca.descricao}*\n` +
      `Valor: ${formatarMoeda(cobranca.valor)}\n` +
      `Vencimento: ${formatarData(cobranca.dataVencimento)}\n\n` +
      `Por favor, entre em contato para confirmar o pagamento. Estamos a disposicao!`;
    const resultado = await abrirWhatsApp(sistema.telefone, msg);
    if (resultado === "imagem_enviada") toast.success("Lembrete com logomarca enviado!");
    else if (resultado === "imagem_baixada") toast.success("Imagem baixada! Anexe no WhatsApp com a mensagem copiada.");
    else toast.success("Lembrete aberto no WhatsApp!");
  };

  // Cobranças do sistema selecionado para histórico
  const cobrancasHistorico = dialogHistorico
    ? cobrancas.filter((c) => c.sistemaId === dialogHistorico.id)
    : [];

  const totalPagoHistorico = cobrancasHistorico
    .filter((c) => c.status === "PAGO")
    .reduce((s, c) => s + c.valor, 0);
  const totalPendenteHistorico = cobrancasHistorico
    .filter((c) => c.status !== "PAGO" && c.status !== "CANCELADO")
    .reduce((s, c) => s + c.valor, 0);

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="border-0 shadow-sm min-w-0">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Recebido/mes
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-primary font-display">
              {formatarMoeda(stats.recebidoMes)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm min-w-0">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-info" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Previsto/mes
              </span>
            </div>
            <p className="text-base sm:text-lg font-black text-info font-display">
              {formatarMoeda(stats.previstoMes)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm min-w-0">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">
                Pendentes
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-amber-600 font-display">{stats.pendentes}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {formatarMoeda(stats.totalPendente)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm min-w-0">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] text-red-600 font-medium uppercase tracking-wider">
                Atrasados
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-red-600 font-display">{stats.atrasados}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {formatarMoeda(stats.totalAtrasado)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm col-span-2 lg:col-span-1 min-w-0">
          <CardContent className="p-3.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Receipt className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Total
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900 font-display">
              {stats.totalCobrancas}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">cobranca(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
          <Input
            placeholder="Buscar por sistema, descricao..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-9 text-sm bg-white border-gray-200"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-32 h-9 text-sm bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos Status</SelectItem>
            {STATUS_COBRANCA.map((s) => (
              <SelectItem key={s.valor} value={s.valor}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos Tipos</SelectItem>
            {TIPOS_COBRANCA.map((t) => (
              <SelectItem key={t.valor} value={t.valor}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtroSistema} onValueChange={setFiltroSistema}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm bg-white border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos Sistemas</SelectItem>
            {sistemas.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.empresa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="h-9 bg-primary hover:bg-primary/90 text-sm shrink-0"
          onClick={() => setDialogNova(true)}
        >
          <Plus className="h-4 w-4 mr-1.5 shrink-0" />
          Nova Cobranca
        </Button>
      </div>

      {/* Tabela de cobranças */}
      <Card className="border-0 shadow-sm min-w-0">
        <CardContent className="p-0">
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-gray-100">
            {cobrancasFiltradas.length === 0 && (
              <div className="p-8 text-center">
                <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  {busca || filtroStatus !== "TODOS" || filtroTipo !== "TODOS"
                    ? "Nenhuma cobranca encontrada."
                    : "Nenhuma cobranca cadastrada."}
                </p>
              </div>
            )}
            {cobrancasFiltradas.map((c) => {
              const st = getStatusInfo(c.status);
              const tp = getTipoInfo(c.tipo);
              const dias = diasRestantes(c.dataVencimento);
              return (
                <div key={c.id} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {c.sistemaNome}
                      </p>
                      <p className="text-xs text-gray-400">{c.descricao}</p>
                    </div>
                    <Badge className={`text-[10px] font-semibold shrink-0 ${st.cor}`}>
                      {st.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <Badge className="text-[10px] bg-gray-100 text-gray-500">
                      {tp.label}
                    </Badge>
                    <span>Vence: {formatarData(c.dataVencimento)}</span>
                    {c.status === "PENDENTE" && (
                      <span className={dias <= 3 ? "text-amber-600 font-semibold" : "text-gray-400"}>
                        {dias}d
                      </span>
                    )}
                    {c.status === "ATRASADO" && (
                      <span className="text-red-600 font-semibold">
                        {Math.abs(dias)}d atrasado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-black text-gray-900">
                      {formatarMoeda(c.valor)}
                    </p>
                    <div className="flex gap-1">
                      {c.status !== "PAGO" && c.status !== "CANCELADO" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-primary"
                          onClick={() => setDialogPagamento(c)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-0.5" /> Pagar
                        </Button>
                      )}
                      {(c.status === "PENDENTE" || c.status === "ATRASADO") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-success"
                          onClick={() => enviarLembreteWhatsApp(c)}
                        >
                          <Send className="h-3 w-3 shrink-0" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] text-red-400 ml-auto"
                        onClick={() => setConfirmaRemoverCob(c.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="text-left py-3 px-4 font-semibold">Sistema</th>
                  <th className="text-left py-3 px-4 font-semibold">Descricao</th>
                  <th className="text-center py-3 px-4 font-semibold">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold">Vencimento</th>
                  <th className="text-right py-3 px-4 font-semibold">Valor</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Pagamento</th>
                  <th className="text-center py-3 px-4 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cobrancasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                      {busca || filtroStatus !== "TODOS" || filtroTipo !== "TODOS"
                        ? "Nenhuma cobranca encontrada."
                        : "Nenhuma cobranca cadastrada. Clique em 'Nova Cobranca' para comecar."}
                    </td>
                  </tr>
                )}
                {cobrancasFiltradas.map((c) => {
                  const st = getStatusInfo(c.status);
                  const tp = getTipoInfo(c.tipo);
                  const dias = diasRestantes(c.dataVencimento);
                  const formaInfo = c.formaPagamento
                    ? getFormaInfo(c.formaPagamento)
                    : null;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{c.sistemaNome}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-gray-600 text-xs max-w-[200px] truncate">
                          {c.descricao}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {tp.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                        {formatarData(c.dataVencimento)}
                        {c.status === "PENDENTE" && (
                          <span
                            className={`block text-[10px] ${dias <= 3 ? "text-amber-600 font-semibold" : "text-gray-400"}`}
                          >
                            {dias > 0 ? `${dias}d restantes` : "Hoje!"}
                          </span>
                        )}
                        {c.status === "ATRASADO" && (
                          <span className="block text-[10px] text-red-600 font-semibold">
                            {Math.abs(dias)}d atrasado
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatarMoeda(c.valor)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`text-[10px] font-semibold ${st.cor}`}>
                          {st.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs whitespace-nowrap">
                        {c.status === "PAGO" && c.dataPagamento ? (
                          <div>
                            <p className="text-gray-600">
                              {formatarData(c.dataPagamento)}
                            </p>
                            {formaInfo && (
                              <p className="text-[10px] text-gray-400">
                                {formaInfo.label}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-0.5">
                          {c.status !== "PAGO" && c.status !== "CANCELADO" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-primary hover:text-primary shrink-0"
                                    onClick={() => setDialogPagamento(c)}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Registrar Pagamento</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {c.status === "PAGO" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="h-7 w-7 flex items-center justify-center">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-white/80" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Pago</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(c.status === "PENDENTE" || c.status === "ATRASADO") && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-success hover:text-success/80 shrink-0"
                                    onClick={() => enviarLembreteWhatsApp(c)}
                                  >
                                    <Send className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Enviar Lembrete WhatsApp</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {c.status !== "PAGO" && c.status !== "CANCELADO" && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-amber-500 hover:text-amber-700 shrink-0"
                                    onClick={() => setDialogEditCobranca(c)}
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-400 hover:text-red-600 shrink-0"
                                  onClick={() => setConfirmaRemoverCob(c.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remover</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-[10px] text-gray-400 pb-4">
        {cobrancasFiltradas.length} de {cobrancas.length} cobranca
        {cobrancas.length !== 1 ? "s" : ""}
      </div>

      {/* Dialog Nova Cobrança */}
      <Dialog open={dialogNova} onOpenChange={() => setDialogNova(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus className="h-5 w-5 text-primary shrink-0" />
              Gerar Nova Cobranca
            </DialogTitle>
          </DialogHeader>
          <FormularioCobranca
            onSalvar={handleSalvarNova}
            onCancelar={() => setDialogNova(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Registrar Pagamento */}
      <Dialog open={!!dialogPagamento} onOpenChange={() => setDialogPagamento(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5 text-primary shrink-0" />
              Registrar Pagamento
            </DialogTitle>
          </DialogHeader>
          {dialogPagamento && (
            <FormularioPagamento
              cobranca={dialogPagamento}
              onConfirmar={(data, forma) =>
                handleConfirmarPagamento(dialogPagamento.id, data, forma)
              }
              onCancelar={() => setDialogPagamento(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Cobrança */}
      <Dialog
        open={!!dialogEditCobranca}
        onOpenChange={() => setDialogEditCobranca(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-amber-600 shrink-0" />
              Editar Cobranca
            </DialogTitle>
          </DialogHeader>
          {dialogEditCobranca && (
            <FormularioCobranca
              cobrancaEdit={dialogEditCobranca}
              onSalvar={handleSalvarEdicao}
              onCancelar={() => setDialogEditCobranca(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Histórico por Sistema */}
      <Dialog
        open={!!dialogHistorico}
        onOpenChange={() => setDialogHistorico(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-5 w-5 text-primary shrink-0" />
              Historico de Cobrancas — {dialogHistorico?.empresa}
            </DialogTitle>
          </DialogHeader>
          {dialogHistorico && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/5 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-primary uppercase font-medium">
                    Total Pago
                  </p>
                  <p className="text-base sm:text-lg font-black text-primary font-display">
                    {formatarMoeda(totalPagoHistorico)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-amber-600 uppercase font-medium">
                    Pendente
                  </p>
                  <p className="text-base sm:text-lg font-black text-amber-700 font-display">
                    {formatarMoeda(totalPendenteHistorico)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Ações rápidas */}
              <div className="flex gap-2">
                {dialogHistorico.tipoLicenca === "ALUGUEL" && (
                  <Button
                    size="sm"
                    className="text-xs bg-info hover:bg-info/90 flex-1"
                    onClick={() => {
                      gerarCobrancaMensal(dialogHistorico.id);
                      toast.success("Cobranca de mensalidade gerada!");
                    }}
                  >
                    <Receipt className="h-3.5 w-3.5 mr-1" />
                    Gerar Mensalidade
                  </Button>
                )}
                {dialogHistorico.tipoLicenca === "AQUISICAO" && (
                  <Button
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90 flex-1"
                    onClick={() => {
                      gerarCobrancaAquisicao(dialogHistorico.id);
                      toast.success("Cobranca de aquisicao gerada!");
                    }}
                  >
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    Gerar Cobranca Aquisicao
                  </Button>
                )}
                {dialogHistorico.taxaInstalacao > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-gray-200 flex-1"
                    onClick={() => {
                      const s = dialogHistorico;
                      adicionarCobranca({
                        sistemaId: s.id,
                        sistemaNome: s.empresa,
                        tipo: "TAXA_INSTALACAO",
                        descricao: "Taxa de instalacao",
                        valor: s.taxaInstalacao,
                        dataVencimento: new Date().toISOString().split("T")[0],
                        dataPagamento: null,
                        status: "PENDENTE",
                        formaPagamento: null,
                        observacoes: "",
                      });
                      toast.success("Taxa de instalacao cobrada!");
                    }}
                  >
                    <CreditCard className="h-3.5 w-3.5 mr-1" />
                    Taxa Instalacao
                  </Button>
                )}
              </div>

              <Separator />

              {/* Lista de cobranças */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cobrancasHistorico.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-6">
                    Nenhuma cobranca registrada para este sistema.
                  </p>
                )}
                {cobrancasHistorico.map((c) => {
                  const st = getStatusInfo(c.status);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {c.descricao}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Vence: {formatarData(c.dataVencimento)}
                          {c.dataPagamento && (
                            <span className="text-primary ml-2">
                              Pago: {formatarData(c.dataPagamento)}
                            </span>
                          )}
                          {c.formaPagamento && (
                            <span className="text-gray-500 ml-1">
                              ({getFormaInfo(c.formaPagamento)?.label})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className="text-xs font-bold text-gray-900">
                          {formatarMoeda(c.valor)}
                        </span>
                        <Badge className={`text-[9px] font-semibold ${st.cor}`}>
                          {st.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmação de Remoção */}
      <Dialog
        open={!!confirmaRemoverCob}
        onOpenChange={() => setConfirmaRemoverCob(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Confirmar Remocao</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tem certeza que deseja remover esta cobranca? Esta acao nao pode ser
            desfeita.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setConfirmaRemoverCob(null)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="text-xs bg-red-600 hover:bg-red-700"
              onClick={() =>
                confirmaRemoverCob && handleRemover(confirmaRemoverCob)
              }
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}