"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useAdminStore,
  STATUS_SISTEMA,
  PLANOS,
  type SistemaCliente,
  type StatusSistema,
  type PlanoSistema,
} from "@/hooks/use-admin-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Check,
  X,
  Eye,
  MessageCircle,
  Monitor,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Crown,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  ArrowRight,
  User,
  Lock,
  EyeOff,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "next-themes";

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
// TELA DE LOGIN DO ADMIN
// =============================================
function TelaLoginAdmin({
  onAutenticado,
}: {
  onAutenticado: () => void;
}) {
  const { adminCredenciais, configurarAdmin } = useAdminStore();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [ehPrimeiroAcesso, setEhPrimeiroAcesso] = useState(
    !adminCredenciais
  );

  const handleCriar = () => {
    if (!usuario.trim() || !senha.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (senha !== confirmarSenha) {
      toast.error("As senhas nao conferem.");
      return;
    }
    configurarAdmin(usuario.trim().toLowerCase(), senha);
    sessionStorage.setItem("zapfacil_admin_session", "autenticado");
    toast.success("Admin criado com sucesso!");
    onAutenticado();
  };

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
        toast.error("Credenciais invalidas.");
      }
      setCarregando(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <Card className="w-full max-w-sm border-gray-700 bg-gray-900/80 backdrop-blur">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-900/40 mb-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white">
              {ehPrimeiroAcesso ? "Configurar Admin" : "Painel Administrativo"}
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              {ehPrimeiroAcesso
                ? "Crie as credenciais do administrador master."
                : "Acesso restrito ao gestor dos sistemas."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="admin"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="pl-10 h-10 text-sm bg-gray-800 border-gray-700 text-white"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (ehPrimeiroAcesso ? handleCriar() : handleLogin())
                  }
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 pr-10 h-10 text-sm bg-gray-800 border-gray-700 text-white"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (ehPrimeiroAcesso ? handleCriar() : handleLogin())
                  }
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {ehPrimeiroAcesso && (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-10 h-10 text-sm bg-gray-800 border-gray-700 text-white"
                    onKeyDown={(e) => e.key === "Enter" && handleCriar()}
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
              onClick={ehPrimeiroAcesso ? handleCriar : handleLogin}
              disabled={carregando}
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <>
                  {ehPrimeiroAcesso ? "Criar Admin" : "Entrar"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {!ehPrimeiroAcesso && (
              <p className="text-center">
                <button
                  className="text-[10px] text-gray-500 hover:text-gray-300"
                  onClick={() => setEhPrimeiroAcesso(true)}
                >
                  Primeiro acesso? Clique aqui
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================
// FORMULÁRIO DE SISTEMA
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
  const [valorMensal, setValorMensal] = useState(
    sistema?.valorMensal?.toString() || ""
  );
  const [observacoes, setObservacoes] = useState(
    sistema?.observacoes || ""
  );

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
    if (!dataVencimento) {
      toast.error("Data de vencimento e obrigatoria.");
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
      valorMensal: parseFloat(valorMensal) || 0,
      observacoes: observacoes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs">Empresa *</Label>
          <Input
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Nome da empresa"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Responsavel *</Label>
          <Input
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            placeholder="Nome do contato"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telefone</Label>
          <Input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@empresa.com"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Cidade</Label>
          <Input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade - UF"
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Data Instalacao</Label>
          <Input
            type="date"
            value={dataInstalacao}
            onChange={(e) => setDataInstalacao(e.target.value)}
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Vencimento *</Label>
          <Input
            type="date"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            className="text-sm h-9"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Plano</Label>
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
          <Label className="text-xs">Status</Label>
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
        <div className="space-y-1.5">
          <Label className="text-xs">Valor Mensal (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={valorMensal}
            onChange={(e) => setValorMensal(e.target.value)}
            placeholder="0,00"
            className="text-sm h-9"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="text-xs">Observacoes</Label>
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Notas sobre o cliente..."
            className="text-sm min-h-[60px]"
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
          className="text-xs bg-emerald-600 hover:bg-emerald-700"
        >
          {sistema ? "Salvar Alteracoes" : "Cadastrar Sistema"}
        </Button>
      </div>
    </form>
  );
}

// =============================================
// PAINEL ADMIN PRINCIPAL
// =============================================
function PainelAdminConteudo() {
  const { theme, setTheme } = useTheme();
  const { sistemas, adicionarSistema, editarSistema, removerSistema, alterarStatus } =
    useAdminStore();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPlano, setFiltroPlano] = useState<string>("TODOS");
  const [dialogForm, setDialogForm] = useState<SistemaCliente | null>(null);
  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogDetalhe, setDialogDetalhe] = useState<SistemaCliente | null>(null);
  const [confirmaRemover, setConfirmaRemover] = useState<string | null>(null);

  // Estatísticas
  const stats = useMemo(() => {
    const ativos = sistemas.filter((s) => s.status === "ATIVO").length;
    const trials = sistemas.filter((s) => s.status === "TRIAL").length;
    const expirados = sistemas.filter((s) => s.status === "EXPIRADO").length;
    const cancelados = sistemas.filter((s) => s.status === "CANCELADO").length;
    const receitaMensal = sistemas
      .filter((s) => s.status === "ATIVO" || s.status === "TRIAL")
      .reduce((s, v) => s + v.valorMensal, 0);
    const vencendo = sistemas.filter(
      (s) => s.status === "ATIVO" && diasRestantes(s.dataVencimento) <= 7 && diasRestantes(s.dataVencimento) > 0
    ).length;
    return { ativos, trials, expirados, cancelados, receitaMensal, vencendo, total: sistemas.length };
  }, [sistemas]);

  // Filtragem
  const sistemasFiltrados = useMemo(() => {
    let lista = sistemas;
    if (filtroStatus !== "TODOS") {
      lista = lista.filter((s) => s.status === filtroStatus);
    }
    if (filtroPlano !== "TODOS") {
      lista = lista.filter((s) => s.plano === filtroPlano);
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* Header Admin */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-900/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Painel Admin</h1>
              <p className="text-[10px] text-gray-500">
                Controle de Sistemas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:bg-gray-800"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tema</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:bg-red-950/30"
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
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Monitor className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-black">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-emerald-900/50">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Ativos</span>
              </div>
              <p className="text-2xl font-black text-emerald-400">{stats.ativos}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-blue-900/50">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] text-blue-500 font-medium uppercase tracking-wider">Trial</span>
              </div>
              <p className="text-2xl font-black text-blue-400">{stats.trials}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-red-900/50">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[10px] text-red-500 font-medium uppercase tracking-wider">Expirados</span>
              </div>
              <p className="text-2xl font-black text-red-400">{stats.expirados}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-amber-900/50">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] text-amber-500 font-medium uppercase tracking-wider">Vencendo</span>
              </div>
              <p className="text-2xl font-black text-amber-400">{stats.vencendo}</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-emerald-900/50">
            <CardContent className="p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Receita/mes</span>
              </div>
              <p className="text-lg font-black text-emerald-400">{formatarMoeda(stats.receitaMensal)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de ações */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por empresa, responsavel, cidade, telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-9 text-sm bg-gray-900 border-gray-800 text-white"
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-gray-900 border-gray-800 text-white">
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
            <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-gray-900 border-gray-800 text-white">
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
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-800">
              {sistemasFiltrados.length === 0 && (
                <div className="p-8 text-center">
                  <Monitor className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
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
                return (
                  <div key={s.id} className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{s.empresa}</p>
                        <p className="text-xs text-gray-500">{s.responsavel}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge className={`text-[10px] font-semibold ${st.cor}`}>{st.label}</Badge>
                        <Badge className={`text-[10px] font-semibold ${pl.cor}`}>{pl.label}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      {s.cidade && <span>{s.cidade}</span>}
                      <span>Vence: {formatarData(s.dataVencimento)}</span>
                      {s.status === "ATIVO" && (
                        <span className={dias <= 7 ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                          {dias}d restantes
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-gray-400" onClick={() => setDialogDetalhe(s)}>
                        <Eye className="h-3 w-3 mr-1" /> Ver
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-blue-400" onClick={() => setDialogForm(s)}>
                        <Pencil className="h-3 w-3 mr-1" /> Editar
                      </Button>
                      {s.telefone && (
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-emerald-400" onClick={() => handleWhatsApp(s.telefone)}>
                          <MessageCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-400 ml-auto" onClick={() => setConfirmaRemover(s.id)}>
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
                  <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-4 font-semibold">Empresa</th>
                    <th className="text-left py-3 px-4 font-semibold">Responsavel</th>
                    <th className="text-left py-3 px-4 font-semibold">Contato</th>
                    <th className="text-left py-3 px-4 font-semibold">Plano</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Vencimento</th>
                    <th className="text-right py-3 px-4 font-semibold">Valor/mes</th>
                    <th className="text-center py-3 px-4 font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {sistemasFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500 text-sm">
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
                    return (
                      <tr key={s.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{s.empresa}</p>
                          {s.cidade && <p className="text-[11px] text-gray-500">{s.cidade}</p>}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{s.responsavel}</td>
                        <td className="py-3 px-4">
                          {s.telefone && <p className="text-gray-300 text-xs">{s.telefone}</p>}
                          {s.email && <p className="text-[11px] text-gray-500">{s.email}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`text-[10px] font-semibold ${pl.cor}`}>{pl.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={`text-[10px] font-semibold ${st.cor}`}>{st.label}</Badge>
                          {s.status === "ATIVO" && (
                            <p className={`text-[10px] mt-0.5 ${dias <= 7 ? "text-amber-400 font-semibold" : "text-gray-500"}`}>
                              {dias > 0 ? `${dias}d` : "Vencido"}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-xs whitespace-nowrap">
                          {formatarData(s.dataVencimento)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-400 whitespace-nowrap">
                          {formatarMoeda(s.valorMensal)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => setDialogDetalhe(s)}>
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Detalhes</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-400 hover:text-blue-300" onClick={() => setDialogForm(s)}>
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {s.telefone && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400 hover:text-emerald-300" onClick={() => handleWhatsApp(s.telefone)}>
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
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setConfirmaRemover(s.id)}>
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

        <div className="text-center text-[10px] text-gray-600 pb-4">
          {sistemasFiltrados.length} de {sistemas.length} sistema{sistemas.length !== 1 ? "s" : ""}
        </div>
      </main>

      {/* Dialog Novo Sistema */}
      <Dialog open={dialogNovo} onOpenChange={() => setDialogNovo(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-white">
              <Plus className="h-5 w-5 text-emerald-400" />
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-white">
              <Pencil className="h-5 w-5 text-blue-400" />
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
        <DialogContent className="max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-white">
              <Eye className="h-5 w-5 text-emerald-400" />
              Detalhes do Sistema
            </DialogTitle>
          </DialogHeader>
          {dialogDetalhe && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white">{dialogDetalhe.empresa}</p>
                    <p className="text-sm text-gray-400">{dialogDetalhe.responsavel}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge className={`text-[10px] font-semibold ${getStatusInfo(dialogDetalhe.status).cor}`}>
                      {getStatusInfo(dialogDetalhe.status).label}
                    </Badge>
                    <Badge className={`text-[10px] font-semibold ${getPlanoInfo(dialogDetalhe.plano).cor}`}>
                      {getPlanoInfo(dialogDetalhe.plano).label}
                    </Badge>
                  </div>
                </div>
                <Separator className="bg-gray-700" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Telefone</p>
                    <p className="text-gray-300">{dialogDetalhe.telefone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">E-mail</p>
                    <p className="text-gray-300">{dialogDetalhe.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Cidade</p>
                    <p className="text-gray-300">{dialogDetalhe.cidade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Valor Mensal</p>
                    <p className="text-emerald-400 font-bold">{formatarMoeda(dialogDetalhe.valorMensal)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Instalacao</p>
                    <p className="text-gray-300">{formatarData(dialogDetalhe.dataInstalacao)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">Vencimento</p>
                    <p className={dialogDetalhe.status === "ATIVO" && diasRestantes(dialogDetalhe.dataVencimento) <= 7 ? "text-amber-400 font-bold" : "text-gray-300"}>
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
                </div>
                {dialogDetalhe.observacoes && (
                  <>
                    <Separator className="bg-gray-700" />
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Observacoes</p>
                      <p className="text-sm text-gray-400">{dialogDetalhe.observacoes}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {dialogDetalhe.telefone && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-emerald-950/30 border-emerald-800 text-emerald-400 hover:bg-emerald-950/50 text-xs"
                    onClick={() => handleWhatsApp(dialogDetalhe.telefone)}
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    WhatsApp
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs"
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
        <DialogContent className="max-w-sm bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-base text-white">Confirmar Remocao</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400">
            Tem certeza que deseja remover este sistema? Esta acao nao pode ser desfeita.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-900/40" />
          <div className="h-4 w-28 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <TelaLoginAdmin onAutenticado={() => setAutenticado(true)} />;
  }

  return <PainelAdminConteudo />;
}