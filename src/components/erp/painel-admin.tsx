"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useAdminStore,
  STATUS_SISTEMA,
  PLANOS,
  TIPOS_LICENCA,
  type SistemaCliente,
  type StatusSistema,
  type PlanoSistema,
  type TipoLicenca,
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
  Pencil,
  Trash2,
  Eye,
  MessageCircle,
  Monitor,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  LogOut,
  Receipt,
  Lock,
  EyeOff,
  Check,
  KeyRound,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PainelCobranças } from "./admin-cobrancas";

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
// DIALOG TROCAR SENHA
// =============================================
function DialogTrocarSenha({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { alterarSenha } = useAdminStore();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNova, setConfirmarNova] = useState("");
  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);

  const handleSalvar = () => {
    if (!senhaAtual || !novaSenha) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (novaSenha.length < 4) {
      toast.error("A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (novaSenha !== confirmarNova) {
      toast.error("As senhas nao conferem.");
      return;
    }
    const ok = alterarSenha(senhaAtual, novaSenha);
    if (ok) {
      toast.success("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNova("");
      onOpenChange(false);
    } else {
      toast.error("Senha atual incorreta.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-5 w-5 text-gray-600" />
            Alterar Senha
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Senha atual</Label>
            <div className="relative">
              <Input
                type={mostrarAtual ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite a senha atual"
                className="pr-10 h-10 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
              />
              <button
                type="button"
                onClick={() => setMostrarAtual(!mostrarAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarAtual ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nova senha</Label>
            <Input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Minimo 4 caracteres"
              className="h-10 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Confirmar nova senha</Label>
            <Input
              type="password"
              value={confirmarNova}
              onChange={(e) => setConfirmarNova(e.target.value)}
              placeholder="Repita a nova senha"
              className="h-10 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
            />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700" onClick={handleSalvar}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// TELA DE LOGIN DO ADMIN (CLARO)
// =============================================
function TelaLoginAdmin({
  onAutenticado,
}: {
  onAutenticado: () => void;
}) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleLogin = () => {
    if (!usuario.trim() || !senha.trim()) {
      toast.error("Preencha usuario e senha.");
      return;
    }
    setCarregando(true);
    setTimeout(() => {
      const cred = useAdminStore.getState().adminCredenciais;
      if (
        cred &&
        cred.usuario === usuario.trim().toLowerCase() &&
        cred.senha === senha
      ) {
        sessionStorage.setItem("zapfacil_admin_session", "autenticado");
        toast.success("Bem-vindo, Admin!");
        onAutenticado();
      } else {
        toast.error("Usuario ou senha incorretos.");
      }
      setCarregando(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado esquerdo */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <img src="/logo-empresa.png" alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Painel do Gestor.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Gerencie todos os sistemas vendidos, acompanhe clientes, controle licencas e receita em um so lugar.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 text-[11px]">Acesso restrito ao administrador</span>
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center space-y-4">
            <img src="/logo-empresa.png" alt="Logo" className="h-20 w-auto mx-auto object-contain" />
            <h2 className="text-xl font-bold text-gray-900">Painel Admin</h2>
          </div>

          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-500">Acesso exclusivo do gestor do sistema</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Usuario</Label>
              <Input
                placeholder="admin"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-gray-400"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Senha</Label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pr-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-gray-400"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-sm font-semibold rounded-xl"
              onClick={handleLogin}
              disabled={carregando}
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                "Entrar no painel"
              )}
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">Credenciais padrao</p>
            <p className="text-center text-sm">
              <span className="font-mono font-semibold text-gray-700">admin</span>
              <span className="text-gray-300 mx-2">/</span>
              <span className="font-mono font-semibold text-gray-700">zapfacil123</span>
            </p>
            <p className="text-[10px] text-gray-400 text-center">Troque a senha apos o primeiro acesso pelo icone de chave no painel</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// FORMULÁRIO DE SISTEMA (com tipo de licença)
// =============================================
function FormularioSistema({
  sistema,
  onSalvar,
  onCancelar,
}: {
  sistema?: SistemaCliente;
  onSalvar: (dados: Omit<SistemaCliente, "id" | "criadoEm">) => void;
  onCancelar: () => void;
}) {
  const hoje = new Date().toISOString().split("T")[0];
  const [empresa, setEmpresa] = useState(sistema?.empresa || "");
  const [responsavel, setResponsavel] = useState(sistema?.responsavel || "");
  const [telefone, setTelefone] = useState(sistema?.telefone || "");
  const [email, setEmail] = useState(sistema?.email || "");
  const [cidade, setCidade] = useState(sistema?.cidade || "");
  const [dataInstalacao, setDataInstalacao] = useState(
    sistema?.dataInstalacao || hoje
  );
  const [dataVencimento, setDataVencimento] = useState(
    sistema?.dataVencimento || ""
  );
  const [plano, setPlano] = useState<PlanoSistema>(sistema?.plano || "PRO");
  const [status, setStatus] = useState<StatusSistema>(
    sistema?.status || "TRIAL"
  );
  const [tipoLicenca, setTipoLicenca] = useState<TipoLicenca>(
    sistema?.tipoLicenca || "ALUGUEL"
  );
  const [valorMensal, setValorMensal] = useState(
    sistema?.valorMensal?.toString() || ""
  );
  const [valorAquisicao, setValorAquisicao] = useState(
    sistema?.valorAquisicao?.toString() || ""
  );
  const [taxaInstalacao, setTaxaInstalacao] = useState(
    sistema?.taxaInstalacao?.toString() || ""
  );
  const [observacoes, setObservacoes] = useState(
    sistema?.observacoes || ""
  );

  const LINK_SISTEMA = "https://j1ewd51wcs60-d.space-z.ai/";

  const enviarWhatsApp = () => {
    if (!telefone.trim()) {
      toast.error("Preencha o telefone para enviar o link.");
      return;
    }
    const telLimpo = telefone.replace(/\D/g, "");
    const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;
    const msg = encodeURIComponent(
      `Ola! Aqui e o suporte do ZapFacil Pro. Seu sistema esta pronto para uso. Acesse pelo link abaixo e faca seu cadastro:\n\n${LINK_SISTEMA}\n\nQualquer duvida, estou a disposicao!`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim()) {
      toast.error("Nome da empresa e obrigatorio.");
      return;
    }
    if (!responsavel.trim()) {
      toast.error("Nome do responsavel e obrigatorio.");
      return;
    }
    if (tipoLicenca === "ALUGUEL" && !dataVencimento) {
      toast.error("Data de vencimento e obrigatoria para aluguel.");
      return;
    }
    onSalvar({
      empresa: empresa.trim(),
      responsavel: responsavel.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      cidade: cidade.trim(),
      dataInstalacao,
      dataVencimento,
      plano,
      status,
      tipoLicenca,
      valorMensal: parseFloat(valorMensal) || 0,
      valorAquisicao: parseFloat(valorAquisicao) || 0,
      taxaInstalacao: parseFloat(taxaInstalacao) || 0,
      observacoes: observacoes.trim(),
      dadosRegistro: sistema?.dadosRegistro || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs font-medium">Empresa *</Label>
          <Input
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Responsavel *</Label>
          <Input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Nome do contato"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Telefone</Label>
          <Input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@empresa.com"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Cidade</Label>
          <Input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade - UF"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Data Instalacao</Label>
          <Input
            type="date"
            value={dataInstalacao}
            onChange={(e) => setDataInstalacao(e.target.value)}
            className="text-sm h-9"
          />
        </div>
        {tipoLicenca === "ALUGUEL" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Vencimento *</Label>
            <Input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              className="text-sm h-9"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Tipo de Licenca</Label>
          <Select value={tipoLicenca} onValueChange={(v) => setTipoLicenca(v as TipoLicenca)}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_LICENCA.map((t) => (
                <SelectItem key={t.valor} value={t.valor}>
                  <span className="flex flex-col">
                    <span>{t.label}</span>
                    <span className="text-[10px] text-gray-400">{t.descricao}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Plano</Label>
          <Select value={plano} onValueChange={(v) => setPlano(v as PlanoSistema)}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLANOS.map((p) => (
                <SelectItem key={p.valor} value={p.valor}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusSistema)}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_SISTEMA.map((s) => (
                <SelectItem key={s.valor} value={s.valor}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {tipoLicenca === "ALUGUEL" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Valor Mensal (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={valorMensal}
              onChange={(e) => setValorMensal(e.target.value)}
              placeholder="0,00"
              className="text-sm h-9"
            />
          </div>
        )}
        {tipoLicenca === "AQUISICAO" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Valor Aquisicao (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={valorAquisicao}
              onChange={(e) => setValorAquisicao(e.target.value)}
              placeholder="0,00"
              className="text-sm h-9"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Taxa Instalacao (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={taxaInstalacao}
            onChange={(e) => setTaxaInstalacao(e.target.value)}
            placeholder="0,00"
            className="text-sm h-9"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs font-medium">Observacoes</Label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Notas sobre o cliente..."
            className="text-sm min-h-[60px]"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        {!sistema && (
          <Button
            type="button"
            size="sm"
            className="text-xs bg-green-600 hover:bg-green-700"
            onClick={enviarWhatsApp}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            Enviar Link via WhatsApp
          </Button>
        )}
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
          className="text-xs bg-emerald-600 hover:bg-emerald-700"
        >
          {sistema ? "Salvar Alteracoes" : "Cadastrar Sistema"}
        </Button>
      </div>
    </form>
  );
}

// =============================================
// PAINEL ADMIN PRINCIPAL COM ABAS
// =============================================
type AbaAdmin = "sistemas" | "cobrancas";

function PainelAdminConteudo() {
  const { sistemas, cobrancas, adicionarSistema, editarSistema, removerSistema, getCobrancasBySistema } =
    useAdminStore();
  const [abaAtiva, setAbaAtiva] = useState<AbaAdmin>("sistemas");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPlano, setFiltroPlano] = useState<string>("TODOS");
  const [dialogForm, setDialogForm] = useState<SistemaCliente | null>(null);
  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogDetalhe, setDialogDetalhe] = useState<SistemaCliente | null>(null);
  const [confirmaRemover, setConfirmaRemover] = useState<string | null>(null);
  const [dialogTrocarSenha, setDialogTrocarSenha] = useState(false);

  // Estatísticas
  const stats = useMemo(() => {
    const ativos = sistemas.filter((s) => s.status === "ATIVO").length;
    const trials = sistemas.filter((s) => s.status === "TRIAL").length;
    const expirados = sistemas.filter((s) => s.status === "EXPIRADO").length;
    const receitaMensal = sistemas
      .filter((s) => (s.status === "ATIVO" || s.status === "TRIAL") && s.tipoLicenca === "ALUGUEL")
      .reduce((s, v) => s + v.valorMensal, 0);
    const vencendo = sistemas.filter(
      (s) => s.status === "ATIVO" && diasRestantes(s.dataVencimento) <= 7 && diasRestantes(s.dataVencimento) > 0
    ).length;
    return { ativos, trials, expirados, receitaMensal, vencendo, total: sistemas.length };
  }, [sistemas]);

  // Filtragem
  const sistemasFiltrados = useMemo(() => {
    let lista = sistemas;
    if (filtroStatus !== "TODOS") lista = lista.filter((s) => s.status === filtroStatus);
    if (filtroPlano !== "TODOS") lista = lista.filter((s) => s.plano === filtroPlano);
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (s) =>
          s.empresa.toLowerCase().includes(termo) ||
          s.responsavel.toLowerCase().includes(termo) ||
          s.cidade.toLowerCase().includes(termo) ||
          s.telefone.includes(termo) ||
          s.email.toLowerCase().includes(termo)
      );
    }
    return lista;
  }, [sistemas, filtroStatus, filtroPlano, busca]);

  const handleSalvarNovo = useCallback(
    (dados: Omit<SistemaCliente, "id" | "criadoEm">) => {
      adicionarSistema(dados);
      setDialogNovo(false);
      toast.success("Sistema cadastrado!");
    },
    [adicionarSistema]
  );

  const handleSalvarEdicao = useCallback(
    (dados: Omit<SistemaCliente, "id" | "criadoEm">) => {
      if (!dialogForm) return;
      editarSistema(dialogForm.id, dados);
      setDialogForm(null);
      toast.success("Sistema atualizado!");
    },
    [dialogForm, editarSistema]
  );

  const handleRemover = useCallback(
    (id: string) => {
      removerSistema(id);
      setConfirmaRemover(null);
      toast.success("Sistema removido.");
    },
    [removerSistema]
  );

  const handleWhatsApp = (telefone: string) => {
    const telLimpo = telefone.replace(/\D/g, "");
    const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;
    window.open(`https://wa.me/${numero}`, "_blank");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("zapfacil_admin_session");
    window.location.reload();
  };

  const getStatusInfo = (status: StatusSistema) =>
    STATUS_SISTEMA.find((s) => s.valor === status) || STATUS_SISTEMA[3];
  const getPlanoInfo = (plano: PlanoSistema) =>
    PLANOS.find((p) => p.valor === plano) || PLANOS[0];
  const getTipoLicencaInfo = (tipo: TipoLicenca) =>
    TIPOS_LICENCA.find((t) => t.valor === tipo) || TIPOS_LICENCA[0];

  // Cobranças pendentes/atrasadas para badge
  const cobrancasEmAberto = useMemo(
    () => cobrancas.filter((c) => c.status === "PENDENTE" || c.status === "ATRASADO").length,
    [cobrancas]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Painel Admin</h1>
              <p className="text-[10px] text-gray-400">Controle de Sistemas</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                    onClick={() => setDialogTrocarSenha(true)}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Alterar Senha</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
        {/* Abas de navegação */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setAbaAtiva("sistemas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "sistemas"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Monitor className="h-4 w-4" />
            Sistemas
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              abaAtiva === "sistemas"
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-500"
            }`}>
              {sistemas.length}
            </span>
          </button>
          <button
            onClick={() => setAbaAtiva("cobrancas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "cobrancas"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Cobrancas
            {cobrancasEmAberto > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                abaAtiva === "cobrancas"
                  ? "bg-white/20 text-white"
                  : "bg-red-100 text-red-600"
              }`}>
                {cobrancasEmAberto}
              </span>
            )}
          </button>
        </div>

        {/* Conteúdo da aba ativa */}
        {abaAtiva === "cobrancas" ? (
          <PainelCobranças />
        ) : (
          <>
            {/* Cards de estatísticas - Sistemas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Monitor className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Ativos</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-600">{stats.ativos}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Monitor className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Trial</span>
                  </div>
                  <p className="text-2xl font-black text-blue-600">{stats.trials}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-[10px] text-red-600 font-medium uppercase tracking-wider">Expirados</span>
                  </div>
                  <p className="text-2xl font-black text-red-600">{stats.expirados}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">Vencendo</span>
                  </div>
                  <p className="text-2xl font-black text-amber-600">{stats.vencendo}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Receita/mes</span>
                  </div>
                  <p className="text-lg font-black text-emerald-600">{formatarMoeda(stats.receitaMensal)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Barra de ações */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por empresa, responsavel, cidade, telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 h-9 text-sm bg-white border-gray-200"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos Status</SelectItem>
                  {STATUS_SISTEMA.map((s) => (
                    <SelectItem key={s.valor} value={s.valor}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroPlano} onValueChange={setFiltroPlano}>
                <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos Planos</SelectItem>
                  {PLANOS.map((p) => (
                    <SelectItem key={p.valor} value={p.valor}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="h-9 bg-emerald-600 hover:bg-emerald-700 text-sm shrink-0"
                onClick={() => setDialogNovo(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Novo Sistema
              </Button>
            </div>

            {/* Tabela de sistemas */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {sistemasFiltrados.length === 0 && (
                    <div className="p-8 text-center">
                      <Monitor className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">
                        {busca || filtroStatus !== "TODOS" || filtroPlano !== "TODOS"
                          ? "Nenhum sistema encontrado."
                          : "Nenhum sistema cadastrado ainda."}
                      </p>
                    </div>
                  )}
                  {sistemasFiltrados.map((s) => {
                    const dias = diasRestantes(s.dataVencimento);
                    const st = getStatusInfo(s.status);
                    const pl = getPlanoInfo(s.plano);
                    const tl = getTipoLicencaInfo(s.tipoLicenca);
                    const cobrancasSistema = getCobrancasBySistema(s.id);
                    const pendentesSistema = cobrancasSistema.filter(
                      (c) => c.status === "PENDENTE" || c.status === "ATRASADO"
                    ).length;
                    return (
                      <div key={s.id} className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{s.empresa}</p>
                            <p className="text-xs text-gray-400">{s.responsavel}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            <Badge className={`text-[10px] font-semibold ${st.cor}`}>{st.label}</Badge>
                            <Badge className={`text-[10px] font-semibold ${pl.cor}`}>{pl.label}</Badge>
                            <Badge className={`text-[10px] font-semibold ${tl.cor}`}>{tl.label}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                          {s.cidade && <span>{s.cidade}</span>}
                          {s.dadosRegistro && <span className="text-emerald-600 font-semibold">Cadastrado</span>}
                          {s.tipoLicenca === "ALUGUEL" && (
                            <>
                              <span>Vence: {formatarData(s.dataVencimento)}</span>
                              {s.status === "ATIVO" && (
                                <span className={dias <= 7 ? "text-amber-600 font-semibold" : "text-emerald-600"}>
                                  {dias}d restantes
                                </span>
                              )}
                            </>
                          )}
                          {s.tipoLicenca === "AQUISICAO" && (
                            <span className="text-emerald-600 font-semibold">
                              Aquisicao: {formatarMoeda(s.valorAquisicao)}
                            </span>
                          )}
                          {pendentesSistema > 0 && (
                            <span className="text-amber-600 font-semibold">
                              {pendentesSistema} cobranca(s)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-gray-500" onClick={() => setDialogDetalhe(s)}>
                            <Eye className="h-3 w-3 mr-1" /> Ver
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-blue-600" onClick={() => setDialogForm(s)}>
                            <Pencil className="h-3 w-3 mr-1" /> Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-purple-600" onClick={() => setAbaAtiva("cobrancas")}>
                            <Receipt className="h-3 w-3 mr-1" /> Cobrancas
                          </Button>
                          {s.telefone && (
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-emerald-600" onClick={() => handleWhatsApp(s.telefone)}>
                              <MessageCircle className="h-3 w-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-500 ml-auto" onClick={() => setConfirmaRemover(s.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/50">
                        <th className="text-left py-3 px-4 font-semibold">Empresa</th>
                        <th className="text-left py-3 px-4 font-semibold">Responsavel</th>
                        <th className="text-left py-3 px-4 font-semibold">Contato</th>
                        <th className="text-left py-3 px-4 font-semibold">Licenca</th>
                        <th className="text-center py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Vencimento</th>
                        <th className="text-right py-3 px-4 font-semibold">Valor</th>
                        <th className="text-center py-3 px-4 font-semibold">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sistemasFiltrados.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                            {busca || filtroStatus !== "TODOS" || filtroPlano !== "TODOS"
                              ? "Nenhum sistema encontrado."
                              : "Nenhum sistema cadastrado. Clique em 'Novo Sistema' para comecar."}
                          </td>
                        </tr>
                      )}
                      {sistemasFiltrados.map((s) => {
                        const dias = diasRestantes(s.dataVencimento);
                        const st = getStatusInfo(s.status);
                        const pl = getPlanoInfo(s.plano);
                        const tl = getTipoLicencaInfo(s.tipoLicenca);
                        const cobrancasSistema = getCobrancasBySistema(s.id);
                        const pendentesSistema = cobrancasSistema.filter(
                          (c) => c.status === "PENDENTE" || c.status === "ATRASADO"
                        ).length;
                        return (
                          <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-semibold text-gray-900">{s.empresa}</p>
                              {s.cidade && <p className="text-[11px] text-gray-400">{s.cidade}</p>}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge className={`text-[9px] font-semibold ${pl.cor}`}>{pl.label}</Badge>
                                {s.dadosRegistro && (
                                  <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-0.5">
                                    <Check className="h-2.5 w-2.5" /> Cadastrado
                                  </span>
                                )}
                                {pendentesSistema > 0 && (
                                  <span className="text-[9px] text-amber-600 font-semibold">
                                    {pendentesSistema} pend.
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{s.responsavel}</td>
                            <td className="py-3 px-4">
                              {s.telefone && <p className="text-gray-600 text-xs">{s.telefone}</p>}
                              {s.email && <p className="text-[11px] text-gray-400">{s.email}</p>}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`text-[10px] font-semibold ${tl.cor}`}>{tl.label}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={`text-[10px] font-semibold ${st.cor}`}>{st.label}</Badge>
                              {s.status === "ATIVO" && s.tipoLicenca === "ALUGUEL" && (
                                <p className={`text-[10px] mt-0.5 ${dias <= 7 ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                                  {dias > 0 ? `${dias}d` : "Vencido"}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-xs whitespace-nowrap">
                              {s.tipoLicenca === "ALUGUEL" ? formatarData(s.dataVencimento) : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-emerald-600 whitespace-nowrap">
                              {s.tipoLicenca === "ALUGUEL"
                                ? formatarMoeda(s.valorMensal) + "/mes"
                                : formatarMoeda(s.valorAquisicao)}
                              {s.taxaInstalacao > 0 && (
                                <p className="text-[10px] text-gray-400 font-normal">
                                  + {formatarMoeda(s.taxaInstalacao)} inst.
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-0.5">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700" onClick={() => setDialogDetalhe(s)}>
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Detalhes</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:text-blue-700" onClick={() => setDialogForm(s)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-500 hover:text-purple-700" onClick={() => setAbaAtiva("cobrancas")}>
                                        <Receipt className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Cobrancas</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {s.telefone && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:text-emerald-700" onClick={() => handleWhatsApp(s.telefone)}>
                                          <MessageCircle className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>WhatsApp</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => setConfirmaRemover(s.id)}>
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
              {sistemasFiltrados.length} de {sistemas.length} sistema{sistemas.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </main>

      {/* Dialog Novo Sistema */}
      <Dialog open={dialogNovo} onOpenChange={() => setDialogNovo(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus className="h-5 w-5 text-emerald-600" />
              Cadastrar Novo Sistema
            </DialogTitle>
          </DialogHeader>
          <FormularioSistema
            onSalvar={handleSalvarNovo}
            onCancelar={() => setDialogNovo(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Sistema */}
      <Dialog open={!!dialogForm} onOpenChange={() => setDialogForm(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Pencil className="h-5 w-5 text-blue-600" />
              Editar Sistema
            </DialogTitle>
          </DialogHeader>
          {dialogForm && (
            <FormularioSistema
              sistema={dialogForm}
              onSalvar={handleSalvarEdicao}
              onCancelar={() => setDialogForm(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={!!dialogDetalhe} onOpenChange={() => setDialogDetalhe(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="h-5 w-5 text-emerald-600" />
              Detalhes do Sistema
            </DialogTitle>
          </DialogHeader>
          {dialogDetalhe && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{dialogDetalhe.empresa}</p>
                    <p className="text-sm text-gray-500">{dialogDetalhe.responsavel}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <Badge className={`text-[10px] font-semibold ${getStatusInfo(dialogDetalhe.status).cor}`}>
                      {getStatusInfo(dialogDetalhe.status).label}
                    </Badge>
                    <Badge className={`text-[10px] font-semibold ${getPlanoInfo(dialogDetalhe.plano).cor}`}>
                      {getPlanoInfo(dialogDetalhe.plano).label}
                    </Badge>
                    <Badge className={`text-[10px] font-semibold ${getTipoLicencaInfo(dialogDetalhe.tipoLicenca).cor}`}>
                      {getTipoLicencaInfo(dialogDetalhe.tipoLicenca).label}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Telefone</p>
                    <p className="text-gray-700">{dialogDetalhe.telefone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">E-mail</p>
                    <p className="text-gray-700">{dialogDetalhe.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Cidade</p>
                    <p className="text-gray-700">{dialogDetalhe.cidade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Tipo de Licenca</p>
                    <p className="text-gray-700">
                      {getTipoLicencaInfo(dialogDetalhe.tipoLicenca).label}
                      <span className="text-[10px] text-gray-400 block">
                        {getTipoLicencaInfo(dialogDetalhe.tipoLicenca).descricao}
                      </span>
                    </p>
                  </div>
                  {dialogDetalhe.tipoLicenca === "ALUGUEL" ? (
                    <>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Valor Mensal</p>
                        <p className="text-emerald-600 font-bold">{formatarMoeda(dialogDetalhe.valorMensal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Vencimento</p>
                        <p className={dialogDetalhe.status === "ATIVO" && diasRestantes(dialogDetalhe.dataVencimento) <= 7 ? "text-amber-600 font-bold" : "text-gray-700"}>
                          {formatarData(dialogDetalhe.dataVencimento)}
                          {dialogDetalhe.status === "ATIVO" && (
                            <span className="block text-[11px]">
                              {diasRestantes(dialogDetalhe.dataVencimento) > 0
                                ? `${diasRestantes(dialogDetalhe.dataVencimento)} dias restantes`
                                : "Vencido!"}
                            </span>
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Valor Aquisicao</p>
                      <p className="text-emerald-600 font-bold text-lg">{formatarMoeda(dialogDetalhe.valorAquisicao)}</p>
                      <p className="text-[10px] text-gray-400">Pagamento unico - licenca definitiva</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Instalacao</p>
                    <p className="text-gray-700">{formatarData(dialogDetalhe.dataInstalacao)}</p>
                  </div>
                  {dialogDetalhe.taxaInstalacao > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Taxa Instalacao</p>
                      <p className="text-gray-700">{formatarMoeda(dialogDetalhe.taxaInstalacao)}</p>
                    </div>
                  )}
                </div>
                {dialogDetalhe.observacoes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Observacoes</p>
                      <p className="text-sm text-gray-500">{dialogDetalhe.observacoes}</p>
                    </div>
                  </>
                )}
                {dialogDetalhe.dadosRegistro && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[10px] text-emerald-600 uppercase font-semibold mb-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Dados do Cadastro do Cliente
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                        <div>
                          <p className="text-[10px] text-gray-400">Usuario criado</p>
                          <p className="text-gray-700 font-medium">{dialogDetalhe.dadosRegistro.usuario}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Empresa cadastrada</p>
                          <p className="text-gray-700 font-medium">{dialogDetalhe.dadosRegistro.nomeEmpresa}</p>
                        </div>
                        {dialogDetalhe.dadosRegistro.telefone && (
                          <div>
                            <p className="text-[10px] text-gray-400">Telefone</p>
                            <p className="text-gray-700">{dialogDetalhe.dadosRegistro.telefone}</p>
                          </div>
                        )}
                        {dialogDetalhe.dadosRegistro.email && (
                          <div>
                            <p className="text-[10px] text-gray-400">E-mail</p>
                            <p className="text-gray-700">{dialogDetalhe.dadosRegistro.email}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-400">Registrado em</p>
                          <p className="text-gray-700 text-xs">
                            {new Date(dialogDetalhe.dadosRegistro.registradoEm).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {dialogDetalhe.telefone && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs"
                    onClick={() => handleWhatsApp(dialogDetalhe.telefone)}
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    WhatsApp
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                  onClick={() => {
                    setDialogDetalhe(null);
                    setDialogForm(dialogDetalhe);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmação de Remoção */}
      <Dialog open={!!confirmaRemover} onOpenChange={() => setConfirmaRemover(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Confirmar Remocao</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tem certeza que deseja remover este sistema e todas as suas cobrancas? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setConfirmaRemover(null)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="text-xs bg-red-600 hover:bg-red-700"
              onClick={() => confirmaRemover && handleRemover(confirmaRemover)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remover
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Trocar Senha */}
      <DialogTrocarSenha
        open={dialogTrocarSenha}
        onOpenChange={setDialogTrocarSenha}
      />
    </div>
  );
}

// =============================================
// EXPORT PRINCIPAL
// =============================================
export function PainelAdmin() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem("zapfacil_admin_session");
    setAutenticado(session === "autenticado");
  }, []);

  if (autenticado === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <TelaLoginAdmin onAutenticado={() => setAutenticado(true)} />;
  }

  return <PainelAdminConteudo />;
}