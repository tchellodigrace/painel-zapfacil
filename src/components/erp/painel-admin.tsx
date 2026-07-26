"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
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
  Clock,
  Phone,
  Users,
  Bot,
  Mail,
  ArrowRight,
  Copy,
  Send,
  Zap,
  GitBranch,
  Sun,
  Moon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PainelCobranças } from "./admin-cobrancas";
import { PainelZapBot } from "./painel-zapbot";
import { ConfigGlobalEvolutionAPI } from "./config-global-evolution-api";

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
            <KeyRound className="h-5 w-5 text-muted-foreground shrink-0" />
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
            <Button size="sm" className="text-xs bg-primary hover:bg-primary/90" onClick={handleSalvar}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// TELA PRIMEIRO ACESSO ADMIN
// =============================================
function TelaPrimeiroAcesso({
  onConcluido,
}: {
  onConcluido: () => void;
}) {
  const { configurarPrimeiroAcesso } = useAdminStore();
  const [etapa, setEtapa] = useState(0);
  const [carregando, setCarregando] = useState(false);

  // Etapa 0: Dados pessoais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Etapa 1: Credenciais de acesso
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Etapa 2: E-mail de recuperacao
  const [emailRecuperacao, setEmailRecuperacao] = useState("");

  const podeAvancarEtapa0 = nome.trim().length >= 2 && email.trim().includes("@") && telefone.trim().length >= 10;
  const podeAvancarEtapa1 = usuario.trim().length >= 3 && senha.length >= 6 && senha === confirmarSenha;
  const podeConcluir = emailRecuperacao.trim().includes("@");

  const handleConcluir = () => {
    if (!podeConcluir) return;
    setCarregando(true);
    setTimeout(() => {
      configurarPrimeiroAcesso({
        usuario: usuario.trim(),
        senha,
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        emailRecuperacao: emailRecuperacao.trim(),
      });
      sessionStorage.setItem("zapfacil_admin_session", "autenticado");
      setCarregando(false);
      toast.success("Configuracao concluida! Bem-vindo ao painel admin.");
      onConcluido();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Lado esquerdo - branding estilo Bitrix24 */}
      <div className="hidden lg:flex lg:w-[44%] bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[24rem] h-[24rem] rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>
        <div className="relative z-10">
          <img src="/logo-admin.png" alt="Logo" width={400} height={100} className="h-[60px] w-[240px] object-contain drop-shadow-lg" />
        </div>
        <div className="relative z-10 space-y-5 max-w-md">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">Primeiro Acesso</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Configure seu painel de gestao.
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Preencha seus dados para personalizar o acesso ao painel administrativo. Essa configuracao sera necessaria apenas na primeira vez ou apos atualizacoes do sistema.
          </p>
        </div>
        <div className="relative z-10">
          {/* Steps indicator */}
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  etapa > i
                    ? "bg-white text-primary"
                    : etapa === i
                      ? "bg-white text-primary ring-2 ring-white/50"
                      : "bg-white/15 text-white/60"
                }`}>
                  {etapa > i ? <Check className="h-4 w-4 shrink-0" /> : i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-8 h-0.5 rounded ${etapa > i ? "bg-white" : "bg-white/15"}`} />
                )}
              </div>
            ))}
            <div className="ml-3 text-[11px] text-white/70">
              {etapa === 0 && "Dados pessoais"}
              {etapa === 1 && "Credenciais"}
              {etapa === 2 && "Seguranca"}
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-7">
          {/* Header mobile */}
          <div className="lg:hidden text-center space-y-4">
            <img src="/logo-admin.png" alt="Logo" width={400} height={100} className="h-[60px] w-[240px] mx-auto object-contain" />
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-2">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Primeiro Acesso</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Configure seu painel</h2>
              <p className="text-sm text-muted-foreground mt-1">Etapa {etapa + 1} de 3</p>
            </div>
            {/* Mobile steps */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    etapa > i
                      ? "bg-primary text-primary-foreground"
                      : etapa === i
                        ? "bg-primary/10 text-primary ring-2 ring-primary"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {etapa > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  {i < 2 && <div className={`w-6 h-0.5 rounded ${etapa > i ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Etapa 0: Dados pessoais */}
          {etapa === 0 && (
            <div className="space-y-5">
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Seus dados</h2>
                <p className="text-sm text-muted-foreground">Informe seus dados de gestor</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Nome completo</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="pl-10 h-12 text-sm rounded-xl border-border"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    type="email"
                    placeholder="gestor@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-sm rounded-xl border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    placeholder="11999999999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 h-12 text-sm rounded-xl border-border"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Apenas numeros, com DDD</p>
              </div>
              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-sm font-semibold rounded-xl"
                onClick={() => setEtapa(1)}
                disabled={!podeAvancarEtapa0}
              >
                Prosseguir
                <ArrowRight className="h-4 w-4 ml-2 shrink-0" />
              </Button>
            </div>
          )}

          {/* Etapa 1: Credenciais */}
          {etapa === 1 && (
            <div className="space-y-5">
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Credenciais de acesso</h2>
                <p className="text-sm text-muted-foreground">Defina usuario e senha para o painel</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Usuario de acesso</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    placeholder="admin"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value.trim().toLowerCase())}
                    className="pl-10 h-12 text-sm rounded-xl border-border"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-400">Minimo 3 caracteres. Sera usado para login.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Minimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 pr-10 h-12 text-sm rounded-xl border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className={`pl-10 h-12 text-sm rounded-xl border-border ${
                      confirmarSenha && senha !== confirmarSenha ? "border-red-300 focus-visible:ring-red-400" : ""
                    }`}
                  />
                </div>
                {confirmarSenha && senha !== confirmarSenha && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> As senhas nao conferem
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 text-sm rounded-xl" onClick={() => setEtapa(0)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-sm font-semibold rounded-xl"
                  onClick={() => setEtapa(2)}
                  disabled={!podeAvancarEtapa1}
                >
                  Prosseguir
                  <ArrowRight className="h-4 w-4 ml-2 shrink-0" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2: Email de recuperacao */}
          {etapa === 2 && (
            <div className="space-y-5">
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Seguranca</h2>
                <p className="text-sm text-muted-foreground">Configure a recuperacao de senha</p>
              </div>
              <div className="bg-info/10 border border-info/30 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-info shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-info">E-mail de recuperacao</p>
                    <p className="text-xs text-info mt-0.5">
                      Caso esqueca sua senha, voce podera redefini-la informando este e-mail na tela de login. Recomendamos usar um e-mail diferente do pessoal para maior seguranca.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">E-mail de recuperacao</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                  <Input
                    type="email"
                    placeholder="recuperacao@seuemail.com"
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    className="pl-10 h-12 text-sm rounded-xl border-border"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEmailRecuperacao(email)}
                  className="text-[11px] text-primary hover:text-primary/80 font-medium"
                >
                  Usar o mesmo e-mail ({email})
                </button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 text-sm rounded-xl" onClick={() => setEtapa(1)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-sm font-semibold rounded-xl"
                  onClick={handleConcluir}
                  disabled={carregando || !podeConcluir}
                >
                  {carregando ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Configurando...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2 shrink-0" />
                      Concluir configuracao
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Info footer */}
          <div className="text-center">
            <p className="text-[11px] text-gray-400">
              Essa configuracao sera necessaria apenas na primeira vez.
              <br />Apos atualizacoes do sistema, basta refazer este passo rapidamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// =============================================
// TELA DE LOGIN DO ADMIN (CLARO)
// =============================================
const CREDENCIAIS_PADRAO = { usuario: "admin", senha: "zapfacil123" };

function TelaLoginAdmin({
  onAutenticado,
  onPrimeiroAcesso,
}: {
  onAutenticado: () => void;
  onPrimeiroAcesso: () => void;
}) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Estado de recuperacao
  const [dialogRecuperar, setDialogRecuperar] = useState(false);
  const [recuperarEmail, setRecuperarEmail] = useState("");
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<"email" | "redefinir">("email");
  const [novaSenhaRecuperacao, setNovaSenhaRecuperacao] = useState("");
  const [confirmarSenhaRecuperacao, setConfirmarSenhaRecuperacao] = useState("");
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false);

  const handleLogin = () => {
    if (!usuario.trim() || !senha.trim()) {
      toast.error("Preencha usuario e senha.");
      return;
    }
    setCarregando(true);
    setTimeout(() => {
      const store = useAdminStore.getState();
      if (!store.adminCredenciais) {
        store.configurarAdmin(CREDENCIAIS_PADRAO.usuario, CREDENCIAIS_PADRAO.senha);
      }
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

  const handleVerificarEmail = () => {
    if (!recuperarEmail.trim() || !recuperarEmail.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    setCarregandoRecuperacao(true);
    setTimeout(() => {
      const store = useAdminStore.getState();
      const emailCadastrado = store.emailRecuperacao || "";
      if (emailCadastrado && emailCadastrado === recuperarEmail.trim().toLowerCase()) {
        setEtapaRecuperacao("redefinir");
        toast.success("E-mail verificado! Defina sua nova senha.");
      } else if (!emailCadastrado) {
        toast.error("Nenhum e-mail de recuperacao configurado. Contate o suporte.");
      } else {
        toast.error("E-mail nao corresponde ao cadastrado para recuperacao.");
      }
      setCarregandoRecuperacao(false);
    }, 800);
  };

  const handleRedefinirSenha = () => {
    if (!novaSenhaRecuperacao.trim() || novaSenhaRecuperacao.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenhaRecuperacao !== confirmarSenhaRecuperacao) {
      toast.error("As senhas nao conferem.");
      return;
    }
    setCarregandoRecuperacao(true);
    setTimeout(() => {
      useAdminStore.getState().resetarSenhaAdmin(novaSenhaRecuperacao);
      setCarregandoRecuperacao(false);
      setDialogRecuperar(false);
      setEtapaRecuperacao("email");
      setRecuperarEmail("");
      setNovaSenhaRecuperacao("");
      setConfirmarSenhaRecuperacao("");
      toast.success("Senha redefinida com sucesso! Faca login com a nova senha.");
    }, 800);
  };

  const handleEnviarEmailRecuperacao = () => {
    const store = useAdminStore.getState();
    const emailCadastrado = store.emailRecuperacao;
    if (!emailCadastrado) {
      toast.error("Nenhum e-mail de recuperacao configurado.");
      return;
    }
    const assunto = encodeURIComponent("Recuperacao de Senha - Painel Admin ZapFacil Pro");
    const corpo = encodeURIComponent(
      "Voce solicitou a recuperacao de senha do Painel Admin ZapFacil Pro.\n\n" +
      "Para redefinir sua senha:\n" +
      "1. Acesse o painel admin\n" +
      "2. Clique em \"Esqueceu a senha?\"\n" +
      "3. Informe este e-mail: " + emailCadastrado + "\n" +
      "4. Defina sua nova senha\n\n" +
      "Se nao foi voce, ignore este e-mail.\n\n" +
      "Equipe ZapFacil Pro"
    );
    window.open("mailto:" + emailCadastrado + "?subject=" + assunto + "&body=" + corpo, "_self");
  };

  const fecharDialogRecuperar = () => {
    setDialogRecuperar(false);
    setEtapaRecuperacao("email");
    setRecuperarEmail("");
    setNovaSenhaRecuperacao("");
    setConfirmarSenhaRecuperacao("");
  };

  return (
    <>
      <div className="min-h-screen bg-background flex">
        {/* Lado esquerdo - branding estilo Bitrix24 */}
        <div className="hidden lg:flex lg:w-[44%] bg-primary relative overflow-hidden flex-col justify-between p-12">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 -left-20 w-[24rem] h-[24rem] rounded-full bg-primary-foreground/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <img src="/logo-admin.png" alt="Logo" width={400} height={100} className="h-[60px] w-[240px] object-contain drop-shadow-lg" />
          </div>
          <div className="relative z-10 space-y-5 max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Painel do Gestor.
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              Gerencie todos os sistemas vendidos, acompanhe clientes, controle licencas e receita em um so lugar.
            </p>
            <ul className="space-y-2.5 pt-2">
              {[
                "Visao consolidada de todos os clientes",
                "Controle de licencas e mensalidades",
                "Suporte direto via WhatsApp",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-white/70 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acesso restrito ao administrador
          </div>
        </div>

        {/* Lado direito - formulário */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm space-y-7">
            <div className="lg:hidden text-center">
              <img src="/logo-admin.png" alt="Logo" width={400} height={100} className="h-[60px] w-[240px] mx-auto object-contain mb-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Entrar</h2>
              <p className="text-sm text-muted-foreground">Acesso exclusivo do gestor do sistema</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Usuario</Label>
                <Input
                  placeholder="admin"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pr-11 h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-11 text-sm font-semibold rounded-lg shadow-sm"
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

            {/* Link de recuperacao */}
            <div className="text-center space-y-1.5">
              <button
                type="button"
                onClick={() => setDialogRecuperar(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueceu a senha?
              </button>
              <button
                type="button"
                onClick={() => onPrimeiroAcesso()}
                className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Primeiro acesso?{" "}
                <span className="text-primary hover:text-primary/80 font-semibold">
                  Configurar perfil
                </span>
              </button>
            </div>

            <div className="bg-muted/60 rounded-lg p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">Credenciais padrao</p>
              <p className="text-center text-sm">
                <span className="font-mono font-semibold text-foreground">admin</span>
                <span className="text-muted-foreground mx-2">/</span>
                <span className="font-mono font-semibold text-foreground">zapfacil123</span>
              </p>
              <p className="text-[10px] text-muted-foreground text-center">Troque a senha apos o primeiro acesso pelo icone de chave no painel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de recuperacao de senha */}
      <Dialog open={dialogRecuperar} onOpenChange={(v) => { if (!v) fecharDialogRecuperar(); else setDialogRecuperar(true); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500 shrink-0" />
              {etapaRecuperacao === "email" ? "Recuperar Senha" : "Redefinir Senha"}
            </DialogTitle>
          </DialogHeader>

          {etapaRecuperacao === "email" ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  Informe o e-mail de recuperacao cadastrado nas configuracoes do painel admin. Se o e-mail corresponder, voce podera definir uma nova senha.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">E-mail de recuperacao</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={recuperarEmail}
                  onChange={(e) => setRecuperarEmail(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleVerificarEmail()}
                />
              </div>

              <Button
                className="w-full h-11 bg-primary hover:bg-primary/90 text-sm font-semibold rounded-xl"
                onClick={handleVerificarEmail}
                disabled={carregandoRecuperacao}
              >
                {carregandoRecuperacao ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Verificar E-mail"
                )}
              </Button>

              <div className="flex items-center gap-2 pt-1">
                <Separator className="flex-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">ou</span>
                <Separator className="flex-1" />
              </div>

              <Button
                variant="outline"
                className="w-full h-10 text-sm rounded-xl"
                onClick={handleEnviarEmailRecuperacao}
              >
                <Mail className="h-4 w-4 mr-2 shrink-0" />
                Receber instrucoes por e-mail
              </Button>
              <p className="text-[11px] text-gray-400 text-center">
                Abre seu cliente de e-mail com as instrucoes de recuperacao.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 border-primary/20 rounded-lg p-3 flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary">
                  E-mail verificado com sucesso! Defina sua nova senha abaixo.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Nova senha</Label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Minimo 6 caracteres"
                    value={novaSenhaRecuperacao}
                    onChange={(e) => setNovaSenhaRecuperacao(e.target.value)}
                    className="h-11 text-sm rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirmar nova senha</Label>
                <Input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmarSenhaRecuperacao}
                  onChange={(e) => setConfirmarSenhaRecuperacao(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleRedefinirSenha()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11 text-sm rounded-xl" onClick={fecharDialogRecuperar}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-11 bg-primary hover:bg-primary/90 text-sm font-semibold rounded-xl"
                  onClick={handleRedefinirSenha}
                  disabled={carregandoRecuperacao}
                >
                  {carregandoRecuperacao ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redefinindo...
                    </span>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
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

  // Feature flags Premium
  const [zapbotAtivo, setZapbotAtivo] = useState(sistema?.zapbotAtivo ?? (sistema?.plano === "PREMIUM" || sistema?.plano === "PRO"));
  const [disparoAtivo, setDisparoAtivo] = useState(sistema?.disparoAtivo ?? (sistema?.plano === "PREMIUM"));
  const [funilAtivo, setFunilAtivo] = useState(sistema?.funilAtivo ?? (sistema?.plano === "PREMIUM"));
  const [fluxosAtivo, setFluxosAtivo] = useState(sistema?.fluxosAtivo ?? (sistema?.plano === "PREMIUM"));

  // Senha de acesso do cliente (somente para novo cadastro)
  const ehNovoCadastro = !sistema;
  const [senhaAcesso, setSenhaAcesso] = useState("");
  const [confirmarSenhaAcesso, setConfirmarSenhaAcesso] = useState("");
  const [mostrarSenhaForm, setMostrarSenhaForm] = useState(false);
  const [mostrarSenhaVisivel, setMostrarSenhaVisivel] = useState(false);

  // Hash da senha existente (apenas para edicao - buscado do Supabase via API)
  const [senhaHashExistente, setSenhaHashExistente] = useState<string | null>(null);
  const [carregandoSenhaHash, setCarregandoSenhaHash] = useState(false);

  // Em modo edicao: buscar o hash da senha do cliente (busca pelo email)
  useEffect(() => {
    if (ehNovoCadastro || !email) return;
    let cancelado = false;
    setCarregandoSenhaHash(true);
    setSenhaHashExistente(null);
    (async () => {
      try {
        const res = await fetch(`/api/cliente/senha-hash?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        if (cancelado) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.ok && json.senhaHash) {
            setSenhaHashExistente(json.senhaHash);
          }
        }
      } catch (e) {
        console.warn("[FormularioSistema] erro ao buscar hash:", e);
      } finally {
        if (!cancelado) setCarregandoSenhaHash(false);
      }
    })();
    return () => { cancelado = true; };
  }, [ehNovoCadastro, email]);

  const LINK_SISTEMA = "https://my-project-rho-sooty.vercel.app/";

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
    if (ehNovoCadastro && senhaAcesso && senhaAcesso.length < 6) {
      toast.error("A senha do cliente deve ter pelo menos 6 caracteres.");
      return;
    }
    if (ehNovoCadastro && senhaAcesso && senhaAcesso !== confirmarSenhaAcesso) {
      toast.error("As senhas nao conferem.");
      return;
    }
    if (ehNovoCadastro && !email.trim()) {
      toast.error("E-mail e obrigatorio para definir senha de acesso do cliente.");
      return;
    }

    // Montar dadosRegistro com senha se definida pelo admin
    let dadosRegistroFinal = sistema?.dadosRegistro || null;
    if (ehNovoCadastro && senhaAcesso) {
      dadosRegistroFinal = {
        usuario: responsavel.trim(),
        nomeEmpresa: empresa.trim(),
        telefone: telefone.trim(),
        email: email.trim().toLowerCase(),
        senha: senhaAcesso,
        registradoEm: new Date().toISOString(),
      };
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
      dadosRegistro: dadosRegistroFinal,
      zapbotAtivo,
      disparoAtivo,
      funilAtivo,
      fluxosAtivo,
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
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Taxa Instalacao (R$)</Label>
            {taxaInstalacao && (
              <button
                type="button"
                onClick={() => setTaxaInstalacao("")}
                className="text-[10px] text-red-500 hover:text-red-700 underline"
              >
                Limpar
              </button>
            )}
          </div>
          <Input
            type="number"
            step="0.01"
            value={taxaInstalacao}
            onChange={(e) => setTaxaInstalacao(e.target.value)}
            placeholder="0,00 (vazio = sem taxa)"
            className="text-sm h-9"
          />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Deixe vazio ou "0" para remover a taxa de instalacao deste cliente.
          </p>
        </div>
        {/* Senha de acesso - em modo edicao mostra o hash, em novo cadastro permite definir */}
        <div className="sm:col-span-2 border border-dashed border-primary/30 dark:border-primary/40 rounded-lg p-3 bg-primary/5 dark:bg-primary/15 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary shrink-0" />
              <Label className="text-xs font-medium text-primary dark:text-foreground/80">
                {ehNovoCadastro
                  ? "Senha de Acesso do Cliente"
                  : "Senha Cadastrada do Cliente"}
              </Label>
            </div>
            {ehNovoCadastro && (
              <button
                type="button"
                onClick={() => setMostrarSenhaForm(!mostrarSenhaForm)}
                className="text-[10px] text-primary hover:text-primary underline"
              >
                {mostrarSenhaForm ? "Ocultar" : "Definir senha"}
              </button>
            )}
          </div>

          {/* MODO EDICAO: mostra o hash bcrypt da senha existente */}
          {!ehNovoCadastro && (
            <div className="space-y-2">
              {carregandoSenhaHash ? (
                <div className="text-[11px] text-muted-foreground italic">
                  Carregando senha...
                </div>
              ) : senhaHashExistente ? (
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-medium text-muted-foreground">
                    Hash bcrypt (senha criptografada - nao e possivel decifrar)
                  </Label>
                  <div className="bg-background dark:bg-black/30 border border-border rounded p-2">
                    <code className="text-[10px] text-foreground/80 break-all font-mono leading-relaxed">
                      {senhaHashExistente}
                    </code>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    A senha do cliente e armazenada com hash bcrypt (one-way).
                    Por seguranca, nao e possivel recuperar a senha original.
                    Para dar uma nova senha ao cliente, use o botao "Redefinir
                    senha" no painel ou solicite que o cliente use "Esqueci minha senha".
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground italic">
                  Este cliente nao possui senha cadastrada (pode ter sido criado
                  direto pelo painel admin sem criar login de cliente).
                </div>
              )}
            </div>
          )}

          {/* MODO NOVO CADASTRO: formulario para definir senha */}
          {ehNovoCadastro && mostrarSenhaForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-medium text-muted-foreground">Senha *</Label>
                <div className="relative">
                  <Input
                    type={mostrarSenhaVisivel ? "text" : "password"}
                    value={senhaAcesso}
                    onChange={(e) => setSenhaAcesso(e.target.value)}
                    placeholder="Min. 6 caracteres"
                    className="text-sm h-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenhaVisivel(!mostrarSenhaVisivel)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenhaVisivel ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-medium text-muted-foreground">Confirmar Senha *</Label>
                <Input
                  type="password"
                  value={confirmarSenhaAcesso}
                  onChange={(e) => setConfirmarSenhaAcesso(e.target.value)}
                  placeholder="Repita a senha"
                  className="text-sm h-9"
                />
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Defina uma senha generica para o cliente. Ele podera altera-la apos o primeiro acesso.
                  Sem senha, o cliente precisara se cadastrar pelo link.
                </p>
              </div>
            </div>
          )}
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
        {/* Recursos Premium */}
        <div className="sm:col-span-2 border border-purple-200 dark:border-purple-800 rounded-xl p-4 bg-purple-50/50 dark:bg-purple-950/20 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <Label className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">Recursos Premium</Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/30 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary dark:text-primary/80 shrink-0" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">ZapBot</p>
                  <p className="text-[10px] text-gray-400">Chatbot automatico</p>
                </div>
              </div>
              <Switch checked={zapbotAtivo} onCheckedChange={setZapbotAtivo} />
            </div>
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-info/15 dark:bg-info/25 flex items-center justify-center">
                  <Send className="h-4 w-4 text-info dark:text-info/80 shrink-0" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Disparo em Massa</p>
                  <p className="text-[10px] text-gray-400">Envio em lote</p>
                </div>
              </div>
              <Switch checked={disparoAtivo} onCheckedChange={setDisparoAtivo} />
            </div>
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Funil de Leads</p>
                  <p className="text-[10px] text-gray-400">Pipeline CRM</p>
                </div>
              </div>
              <Switch checked={funilAtivo} onCheckedChange={setFunilAtivo} />
            </div>
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <GitBranch className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Fluxos de Automacao</p>
                  <p className="text-[10px] text-gray-400">Regras SE/ENTAO</p>
                </div>
              </div>
              <Switch checked={fluxosAtivo} onCheckedChange={setFluxosAtivo} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        {!sistema && (
          <Button
            type="button"
            size="sm"
            className="text-xs bg-success hover:bg-success/90"
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
          className="text-xs bg-primary hover:bg-primary/90"
        >
          {sistema ? "Salvar Alteracoes" : "Cadastrar Sistema"}
        </Button>
      </div>
    </form>
  );
}

// =============================================
// SECAO RECUPERACOES DE SENHA
// =============================================
type SubAbaRecuperacao = "enviar" | "pedidos";

function SecaoRecuperacoes() {
  const { pedidosRecuperacao, sistemas, resolverPedidoRecuperacao, limparPedidosResolvidos, recarregarDados } =
    useAdminStore();
  const [subAba, setSubAba] = useState<SubAbaRecuperacao>("enviar");
  const [mostrarResolvidos, setMostrarResolvidos] = useState(false);

  // --- Estado para "Enviar Dados de Acesso" ---
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<SistemaCliente | null>(null);
  const [dialogConfirmarEnvio, setDialogConfirmarEnvio] = useState(false);
  const [telefoneEnvio, setTelefoneEnvio] = useState("");

  // Recarrega dados do localStorage ao montar (resolve pedidos criados em outra pagina)
  useEffect(() => {
    try { recarregarDados(); } catch (e) { console.warn("Erro ao recarregar dados:", e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Pedidos de recuperacao ---
  const pendentes = pedidosRecuperacao.filter((p) => p.status === "PENDENTE");
  const resolvidos = pedidosRecuperacao.filter((p) => p.status !== "PENDENTE");
  const listaExibida = mostrarResolvidos ? [...pendentes, ...resolvidos] : pendentes;

  // --- Filtro de clientes para envio proativo ---
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return sistemas;
    const termo = buscaCliente.toLowerCase().trim();
    return sistemas.filter((s) => {
      try {
        return (
          (s.empresa || "").toLowerCase().includes(termo) ||
          (s.responsavel || "").toLowerCase().includes(termo) ||
          (s.email || "").toLowerCase().includes(termo) ||
          (s.telefone || "").includes(termo) ||
          (s.cidade || "").toLowerCase().includes(termo)
        );
      } catch {
        return false;
      }
    });
  }, [sistemas, buscaCliente]);

  // --- Funcoes auxiliares ---
  function buscarCredenciaisCliente(email: string) {
    const sistema = sistemas.find(
      (s) =>
        s.email.toLowerCase() === email.toLowerCase() ||
        s.dadosRegistro?.email.toLowerCase() === email.toLowerCase()
    );
    if (sistema?.dadosRegistro) {
      return {
        nome: sistema.dadosRegistro.usuario || sistema.responsavel,
        empresa: sistema.dadosRegistro.nomeEmpresa || sistema.empresa,
        telefone: sistema.dadosRegistro.telefone || sistema.telefone || "",
        email: sistema.dadosRegistro.email || sistema.email,
      };
    }
    const s = sistemas.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (s) {
      return { nome: s.responsavel, empresa: s.empresa, telefone: s.telefone, email: s.email };
    }
    return null;
  }

  function formatarDataISO(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
      });
    } catch (_e) { return iso; }
  }

  // --- Enviar dados proativamente via WhatsApp ---
  function handleSelecionarCliente(cliente: SistemaCliente) {
    setClienteSelecionado(cliente);
    setTelefoneEnvio(cliente.dadosRegistro?.telefone || cliente.telefone || "");
  }

  function confirmarEnvioProativo() {
    if (!clienteSelecionado) return;
    const telDestino = telefoneEnvio.trim() || clienteSelecionado.dadosRegistro?.telefone || clienteSelecionado.telefone;
    if (!telDestino) {
      toast.error("Nenhum telefone disponivel. Informe o numero do cliente.");
      return;
    }
    const telLimpo = telDestino.replace(/\D/g, "");
    const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;
    const nomeCliente = clienteSelecionado.dadosRegistro?.usuario || clienteSelecionado.responsavel;
    const nomeEmpresa = clienteSelecionado.dadosRegistro?.nomeEmpresa || clienteSelecionado.empresa;
    const emailLogin = clienteSelecionado.dadosRegistro?.email || clienteSelecionado.email;

    const msg = encodeURIComponent(
      `Ola ${nomeCliente}! Aqui e o suporte do ZapFacil Pro.\n\nEstamos enviando seus dados de acesso ao sistema da ${nomeEmpresa}.\n\n*Link de acesso:*\nhttps://my-project-rho-sooty.vercel.app/\n\nSeu e-mail de login: *${emailLogin}*\n\nCaso nao lembre a senha, podemos redefinir juntos. Basta responder esta mensagem.\n\nQualquer duvida, estou a disposicao!`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
    setDialogConfirmarEnvio(false);
    toast.success("WhatsApp aberto com os dados de acesso do cliente!");
  }

  // --- Enviar dados via WhatsApp (pedido do cliente) ---
  function enviarCredenciaisWhatsApp(pedido: (typeof pedidosRecuperacao)[0]) {
    const cliente = buscarCredenciaisCliente(pedido.email);
    const telefoneDestino = pedido.telefoneSolicitado || cliente?.telefone || "";
    if (!telefoneDestino) {
      toast.error("Nenhum telefone disponivel para enviar. Peca ao cliente o numero.");
      return;
    }
    const telLimpo = telefoneDestino.replace(/\D/g, "");
    const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;
    const nomeCliente = cliente?.nome || "Cliente";
    const nomeEmpresa = cliente?.empresa || "sua empresa";
    const msg = encodeURIComponent(
      `Ola ${nomeCliente}! Aqui e o suporte do ZapFacil Pro.\n\nVoce solicitou a recuperacao dos seus dados de acesso ao sistema da ${nomeEmpresa}.\n\n*Link de acesso:*\nhttps://my-project-rho-sooty.vercel.app/\n\nSeu e-mail de login: *${pedido.email}*\n\nCaso nao lembre a senha, podemos redefinir juntos. Responda esta mensagem.\n\nQualquer duvida, estou a disposicao!`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
    resolverPedidoRecuperacao(pedido.id, "ENVIADO");
    toast.success("WhatsApp aberto com as credenciais! Pedido marcado como enviado.");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-500 shrink-0" />
          Recuperacao de Acesso
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Envie dados de acesso para clientes ou atenda pedidos de recuperacao
        </p>
      </div>

      {/* Sub-abas */}
      <div className="flex gap-2 bg-secondary rounded-lg p-1">
        <button
          onClick={() => setSubAba("enviar")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            subAba === "enviar"
              ? "bg-card text-primary dark:text-primary/80 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          Enviar Dados de Acesso
          {sistemas.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              subAba === "enviar" ? "bg-primary/10 text-primary" : "bg-muted dark:bg-gray-600 text-muted-foreground"
            }`}>{sistemas.length}</span>
          )}
        </button>
        <button
          onClick={() => setSubAba("pedidos")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            subAba === "pedidos"
              ? "bg-card text-amber-700 dark:text-amber-400 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4 shrink-0" />
          Pedidos de Recuperacao
          {pendentes.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              subAba === "pedidos" ? "bg-amber-100 text-amber-700" : "bg-amber-200 text-amber-800"
            }`}>{pendentes.length}</span>
          )}
        </button>
      </div>

      {/* ============================================= */}
      {/* SUB-ABA: ENVIAR DADOS DE ACESSO (proativo)    */}
      {/* ============================================= */}
      {subAba === "enviar" && (
        <div className="space-y-4">
          {/* Busca */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                <Input
                  placeholder="Buscar por nome, empresa, e-mail ou telefone..."
                  value={buscaCliente}
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              {buscaCliente.trim() && (
                <p className="text-xs text-gray-400">
                  {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? "s" : ""} encontrado{clientesFiltrados.length !== 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Lista de clientes */}
          {sistemas.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground/70 mx-auto mb-3 shrink-0" />
                <p className="text-sm text-muted-foreground font-medium">Nenhum cliente cadastrado</p>
                <p className="text-xs text-gray-400 mt-1">
                  Cadastre clientes na aba "Sistemas" para enviar dados de acesso.
                </p>
              </CardContent>
            </Card>
          ) : clientesFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground/70 mx-auto mb-3 shrink-0" />
                <p className="text-sm text-muted-foreground font-medium">Nenhum cliente encontrado</p>
                <p className="text-xs text-gray-400 mt-1">Tente buscar por outro termo.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {clientesFiltrados.map((sistema) => {
                const isSelected = clienteSelecionado?.id === sistema.id;
                const temTelefone = !!(sistema.dadosRegistro?.telefone || sistema.telefone);
                const emailLogin = sistema.dadosRegistro?.email || sistema.email;
                const nomeExibido = sistema.dadosRegistro?.usuario || sistema.responsavel;
                const empresaExibida = sistema.dadosRegistro?.nomeEmpresa || sistema.empresa;
                const telExibido = sistema.dadosRegistro?.telefone || sistema.telefone;

                return (
                  <Card
                    key={sistema.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "ring-2 ring-primary border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/15"
                        : "hover:border-primary/30 dark:hover:border-primary/40"
                    }`}
                    onClick={() => handleSelecionarCliente(sistema)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm ${
                          isSelected ? "bg-primary" : "bg-gray-400 dark:bg-gray-600"
                        }`}>
                          {(nomeExibido || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{nomeExibido}</span>
                            <Badge variant="outline" className="text-[10px]">{empresaExibida}</Badge>
                            <Badge className={`text-[10px] ${
                              sistema.status === "ATIVO" ? "bg-primary/10 text-primary"
                              : sistema.status === "TRIAL" ? "bg-info/15 text-info"
                              : sistema.status === "EXPIRADO" ? "bg-red-100 text-red-700"
                              : "bg-secondary text-muted-foreground"
                            }`}>{sistema.status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" />{emailLogin}</span>
                            {telExibido && <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{telExibido}</span>}
                            {sistema.cidade && <span>{sistema.cidade}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {temTelefone ? (
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-8"
                              onClick={(e) => { e.stopPropagation(); handleSelecionarCliente(sistema); setDialogConfirmarEnvio(true); }}>
                              <MessageCircle className="h-3.5 w-3.5 mr-1" />Enviar WhatsApp
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="text-xs h-8 text-amber-600 border-amber-300"
                              onClick={(e) => { e.stopPropagation(); handleSelecionarCliente(sistema); setDialogConfirmarEnvio(true); }}>
                              <AlertTriangle className="h-3.5 w-3.5 mr-1" />Sem telefone
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Dialog confirmar envio */}
          <Dialog open={dialogConfirmarEnvio} onOpenChange={setDialogConfirmarEnvio}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary shrink-0" />
                  Enviar Dados de Acesso
                </DialogTitle>
              </DialogHeader>
              {clienteSelecionado && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-primary dark:text-foreground/80 font-bold text-sm">
                        {(clienteSelecionado.dadosRegistro?.usuario || clienteSelecionado.responsavel || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          {clienteSelecionado.dadosRegistro?.usuario || clienteSelecionado.responsavel}
                        </p>
                        <p className="text-xs text-muted-foreground">{clienteSelecionado.dadosRegistro?.nomeEmpresa || clienteSelecionado.empresa}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-muted-foreground">E-mail de login:</span>
                        <span className="font-medium text-foreground">
                          {clienteSelecionado.dadosRegistro?.email || clienteSelecionado.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className="text-[10px] bg-primary/10 text-primary">{clienteSelecionado.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">WhatsApp de destino</Label>
                    <Input placeholder="Ex: 11999999999" value={telefoneEnvio} onChange={(e) => setTelefoneEnvio(e.target.value)} />
                    <p className="text-[11px] text-gray-400">Numero do WhatsApp que recebera a mensagem com os dados de acesso.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Preview da mensagem</Label>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-primary dark:text-foreground/80 whitespace-pre-line leading-relaxed">
                        Ola {clienteSelecionado.dadosRegistro?.usuario || clienteSelecionado.responsavel}! Aqui e o suporte do ZapFacil Pro.

Estamos enviando seus dados de acesso ao sistema da {clienteSelecionado.dadosRegistro?.nomeEmpresa || clienteSelecionado.empresa}.

Link de acesso:
https://my-project-rho-sooty.vercel.app/

Seu e-mail de login: {clienteSelecionado.dadosRegistro?.email || clienteSelecionado.email}

Caso nao lembre a senha, podemos redefinir juntos. Basta responder esta mensagem.

Qualquer duvida, estou a disposicao!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 text-sm" onClick={() => setDialogConfirmarEnvio(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-sm" onClick={confirmarEnvioProativo} disabled={!telefoneEnvio.trim()}>
                      <MessageCircle className="h-4 w-4 mr-2 shrink-0" />Abrir WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="bg-primary/5 border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-primary leading-relaxed">
              <strong>Como enviar:</strong> Busque o cliente pelo nome, empresa ou e-mail. Clique em <strong>"Enviar WhatsApp"</strong> ao lado do cliente. O WhatsApp sera aberto com uma mensagem contendo o link de acesso e o e-mail de login. Voce pode editar o numero de destino antes de enviar.
            </div>
          </div>
        </div>
      )}

      {/* ============================================= */}
      {/* SUB-ABA: PEDIDOS DE RECUPERACAO (reativo)     */}
      {/* ============================================= */}
      {subAba === "pedidos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2">
            {resolvidos.length > 0 && (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setMostrarResolvidos(!mostrarResolvidos)}>
                {mostrarResolvidos ? "Ocultar resolvidos" : `Ver resolvidos (${resolvidos.length})`}
              </Button>
            )}
            {resolvidos.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600"
                onClick={() => { limparPedidosResolvidos(); toast.success("Pedidos resolvidos removidos!"); }}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Limpar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-amber-50 border-amber-200 min-w-0">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-amber-700">{pendentes.length}</p>
                <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">Pendentes</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border border-primary/20 min-w-0">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-primary">
                  {pedidosRecuperacao.filter((p) => p.status === "ENVIADO").length}
                </p>
                <p className="text-[10px] text-primary uppercase tracking-wider font-medium">Enviados</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-border min-w-0">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-muted-foreground">{pedidosRecuperacao.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Total</p>
              </CardContent>
            </Card>
          </div>

          {listaExibida.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <KeyRound className="h-12 w-12 text-muted-foreground/70 mx-auto mb-3 shrink-0" />
                <p className="text-sm text-muted-foreground font-medium">Nenhum pedido de recuperacao</p>
                <p className="text-xs text-gray-400 mt-1">
                  {mostrarResolvidos
                    ? "Todos os pedidos foram resolvidos e limpos."
                    : "Quando um cliente clicar em \"Esqueceu a senha?\" na tela de login, o pedido aparecera aqui."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {listaExibida.map((pedido) => {
                const cliente = buscarCredenciaisCliente(pedido.email);
                const isPendente = pedido.status === "PENDENTE";
                return (
                  <Card key={pedido.id} className={`overflow-hidden ${!isPendente ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">{cliente?.nome || pedido.email}</span>
                            {cliente?.empresa && <Badge variant="outline" className="text-[10px]">{cliente.empresa}</Badge>}
                            <Badge className={`text-[10px] ${
                              pedido.status === "PENDENTE" ? "bg-amber-100 text-amber-700"
                              : pedido.status === "ENVIADO" ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                            }`}>
                              {pedido.status === "PENDENTE" ? "Pendente" : pedido.status === "ENVIADO" ? "Enviado" : "Ignorado"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" />{pedido.email}</span>
                            {pedido.telefoneSolicitado && <span className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" />{pedido.telefoneSolicitado}</span>}
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3 shrink-0" />{formatarDataISO(pedido.dataPedido)}</span>
                          </div>
                          {cliente && !cliente?.telefone && !pedido.telefoneSolicitado && isPendente && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <p className="text-[11px] text-amber-700">Nenhum telefone cadastrado para este cliente. Voce precisara pedir o numero diretamente.</p>
                            </div>
                          )}
                          {pedido.dataResposta && <p className="text-[10px] text-gray-400">Respondido em {formatarDataISO(pedido.dataResposta)}</p>}
                        </div>
                        {isPendente && (
                          <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-9" onClick={() => enviarCredenciaisWhatsApp(pedido)}>
                              <MessageCircle className="h-3.5 w-3.5 mr-1" />Enviar WhatsApp
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-9 text-muted-foreground hover:text-foreground"
                              onClick={() => { resolverPedidoRecuperacao(pedido.id, "IGNORADO"); toast.info("Pedido marcado como ignorado."); }}>
                              Ignorar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="bg-info/10 border border-info/30 rounded-xl p-4 flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <div className="text-xs text-info leading-relaxed">
              <strong>Como funciona:</strong> Quando um cliente clica em "Esqueceu a senha?" na tela de login, ele informa o e-mail e opcionalmente o WhatsApp. O pedido aparece aqui com status "Pendente". Clique em "Enviar WhatsApp" para abrir o WhatsApp com a mensagem contendo o link de acesso e o e-mail do cliente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// =============================================
// DIALOG EMAIL RECUPERACAO FORM
// =============================================
function DialogEmailRecuperacaoForm() {
  const { emailRecuperacao, configurarEmailRecuperacao } = useAdminStore();
  const [email, setEmail] = useState(emailRecuperacao || "");
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    setSalvando(true);
    setTimeout(() => {
      configurarEmailRecuperacao(email.trim().toLowerCase());
      setSalvando(false);
      toast.success("E-mail de recuperacao atualizado com sucesso!");
    }, 500);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">E-mail de recuperacao</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
          <Input
            type="email"
            placeholder="recuperacao@seuemail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-10 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
          />
        </div>
      </div>
      {emailRecuperacao && (
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400">Atualmente configurado:</p>
          <p className="text-xs text-muted-foreground font-medium">{emailRecuperacao}</p>
        </div>
      )}
      <div className="flex gap-2 justify-end pt-1">
        <Button
          size="sm"
          className="text-xs bg-primary hover:bg-primary/90"
          onClick={handleSalvar}
          disabled={salvando}
        >
          {salvando ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </div>
  );
}


// =============================================
// SECAO SISTEMAS (aba principal)
// =============================================
function SecaoSistemas({
  onNovo,
  onVerDetalhe,
  onEditar,
  onRemover,
  onMudarAba,
  onWhatsApp,
}: {
  onNovo: () => void;
  onVerDetalhe: (s: SistemaCliente) => void;
  onEditar: (s: SistemaCliente) => void;
  onRemover: (id: string) => void;
  onMudarAba: (aba: AbaAdmin) => void;
  onWhatsApp: (tel: string, sistema?: SistemaCliente) => void;
}) {
  const { sistemas, getCobrancasBySistema } = useAdminStore();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPlano, setFiltroPlano] = useState<string>("TODOS");

  const getStatusInfo = (status: StatusSistema) =>
    STATUS_SISTEMA.find((s) => s.valor === status) || STATUS_SISTEMA[3];
  const getPlanoInfo = (plano: PlanoSistema) =>
    PLANOS.find((p) => p.valor === plano) || PLANOS[0];
  const getTipoLicencaInfo = (tipo: TipoLicenca) =>
    TIPOS_LICENCA.find((t) => t.valor === tipo) || TIPOS_LICENCA[0];


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

  return (
    <div className="space-y-6">
            {/* Cards de estatísticas - Sistemas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card className="border-0 shadow-sm min-w-0">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Monitor className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider truncate">Total</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-foreground font-display">{stats.total}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm min-w-0">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[10px] text-primary font-medium uppercase tracking-wider truncate">Ativos</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-primary font-display">{stats.ativos}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm min-w-0">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Monitor className="w-3.5 h-3.5 text-info shrink-0" />
                    <span className="text-[10px] text-info font-medium uppercase tracking-wider truncate">Trial</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-info font-display">{stats.trials}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm min-w-0">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-[10px] text-red-600 font-medium uppercase tracking-wider truncate">Expirados</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-red-600 font-display">{stats.expirados}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm min-w-0">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider truncate">Vencendo</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-amber-600 font-display">{stats.vencendo}</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm min-w-0">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[10px] text-primary font-medium uppercase tracking-wider truncate">Receita/mes</span>
                  </div>
                  <p className="text-base sm:text-lg font-black text-primary font-display whitespace-nowrap overflow-hidden text-ellipsis">{formatarMoeda(stats.receitaMensal)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Barra de ações */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 shrink-0" />
                <Input
                  placeholder="Buscar por empresa, responsavel, cidade, telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 h-9 text-sm bg-white border-border"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-white border-border">
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
                <SelectTrigger className="w-full sm:w-36 h-9 text-sm bg-white border-border">
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
                className="h-9 bg-primary hover:bg-primary/90 text-sm shrink-0"
                onClick={onNovo}
              >
                <Plus className="h-4 w-4 mr-1.5 shrink-0" />
                Novo Sistema
              </Button>
            </div>

            {/* Tabela de sistemas */}
            <Card className="border-0 shadow-sm min-w-0">
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
                            <p className="font-semibold text-sm text-foreground truncate">{s.empresa}</p>
                            <p className="text-xs text-gray-400">{s.responsavel}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                            <Badge className={`text-[10px] font-semibold ${st.cor}`}>{st.label}</Badge>
                            <Badge className={`text-[10px] font-semibold ${pl.cor}`}>{pl.label}</Badge>
                            <Badge className={`text-[10px] font-semibold ${tl.cor}`}>{tl.label}</Badge>
                            {s.zapbotAtivo && <Badge className="text-[9px] bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary/80">Bot</Badge>}
                            {s.disparoAtivo && <Badge className="text-[9px] bg-info/15 text-info dark:bg-info/25 dark:text-info/80">Disparo</Badge>}
                            {s.funilAtivo && <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Funil</Badge>}
                            {s.fluxosAtivo && <Badge className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">Fluxos</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                          {s.cidade && <span>{s.cidade}</span>}
                          {s.dadosRegistro && <span className="text-primary font-semibold">Cadastrado</span>}
                          {s.tipoLicenca === "ALUGUEL" && (
                            <>
                              <span>Vence: {formatarData(s.dataVencimento)}</span>
                              {s.status === "ATIVO" && (
                                <span className={dias <= 7 ? "text-amber-600 font-semibold" : "text-primary"}>
                                  {dias}d restantes
                                </span>
                              )}
                            </>
                          )}
                          {s.tipoLicenca === "AQUISICAO" && (
                            <span className="text-primary font-semibold">
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
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground" onClick={() => onVerDetalhe(s)}>
                            <Eye className="h-3 w-3 mr-1 shrink-0" /> Ver
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-info" onClick={() => onEditar(s)}>
                            <Pencil className="h-3 w-3 mr-1 shrink-0" /> Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-purple-600" onClick={() => onMudarAba("cobrancas")}>
                            <Receipt className="h-3 w-3 mr-1 shrink-0" /> Cobrancas
                          </Button>
                          {(s.telefone || s.dadosRegistro?.telefone) && (
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] text-primary" onClick={() => onWhatsApp(s.telefone || s.dadosRegistro?.telefone || "", s)}>
                              <MessageCircle className="h-3 w-3 shrink-0" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-500 ml-auto" onClick={() => onRemover(s.id)}>
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
                      <tr className="border-b border-border text-[10px] text-gray-400 uppercase tracking-wider bg-gray-50/50">
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
                              <p className="font-semibold text-foreground">{s.empresa}</p>
                              {s.cidade && <p className="text-[11px] text-gray-400">{s.cidade}</p>}
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <Badge className={`text-[9px] font-semibold ${pl.cor}`}>{pl.label}</Badge>
                                {s.zapbotAtivo && <Badge className="text-[8px] bg-primary/10 text-primary">Bot</Badge>}
                                {s.disparoAtivo && <Badge className="text-[8px] bg-info/15 text-info">Disparo</Badge>}
                                {s.funilAtivo && <Badge className="text-[8px] bg-amber-100 text-amber-700">Funil</Badge>}
                                {s.fluxosAtivo && <Badge className="text-[8px] bg-violet-100 text-violet-700">Fluxos</Badge>}
                                {s.dadosRegistro && (
                                  <span className="text-[9px] text-primary font-medium flex items-center gap-0.5">
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
                            <td className="py-3 px-4 text-muted-foreground">{s.responsavel}</td>
                            <td className="py-3 px-4">
                              {s.telefone && <p className="text-muted-foreground text-xs">{s.telefone}</p>}
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
                            <td className="py-3 px-4 text-muted-foreground text-xs whitespace-nowrap">
                              {s.tipoLicenca === "ALUGUEL" ? formatarData(s.dataVencimento) : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-primary whitespace-nowrap">
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
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700 shrink-0" onClick={() => onVerDetalhe(s)}>
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Detalhes</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-info hover:text-info shrink-0" onClick={() => onEditar(s)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-purple-500 hover:text-purple-700 shrink-0" onClick={() => onMudarAba("cobrancas")}>
                                        <Receipt className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Cobrancas</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                {(s.telefone || s.dadosRegistro?.telefone) && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary shrink-0" onClick={() => onWhatsApp(s.telefone || s.dadosRegistro?.telefone || "", s)}>
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
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 shrink-0" onClick={() => onRemover(s.id)}>
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
    </div>
  );
}

// =============================================
// PAINEL ADMIN PRINCIPAL COM ABAS
// =============================================
type AbaAdmin = "sistemas" | "cobrancas" | "recuperacoes" | "zapbot";

function PainelAdminConteudo() {
  const { theme, setTheme } = useTheme();
  const { sistemas, cobrancas, pedidosRecuperacao, adminCredenciais, dadosGestor, adicionarSistema, editarSistema, removerSistema, getCobrancasBySistema, resolverPedidoRecuperacao, limparPedidosResolvidos, recarregarDados, sincronizarDoSupabase } =
    useAdminStore();
  const [abaAtiva, setAbaAtiva] = useState<AbaAdmin>("sistemas");
  const [dialogForm, setDialogForm] = useState<SistemaCliente | null>(null);
  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogDetalhe, setDialogDetalhe] = useState<SistemaCliente | null>(null);
  const [confirmaRemover, setConfirmaRemover] = useState<string | null>(null);
  const [dialogTrocarSenha, setDialogTrocarSenha] = useState(false);
  const [dialogEmailRecuperacao, setDialogEmailRecuperacao] = useState(false);
  const [mostrarCredenciaisAdmin, setMostrarCredenciaisAdmin] = useState(false);

  // Recarregar dados do localStorage ao montar (para pegar cadastros de clientes)
  useEffect(() => {
    recarregarDados();
    // Buscar dados mais recentes do Supabase (multi-device)
    sincronizarDoSupabase();
  }, [recarregarDados, sincronizarDoSupabase]);

  // Tambem recarregar quando a janela ganha foco (usuario voltou do painel cliente)
  useEffect(() => {
    const handleFocus = () => {
      recarregarDados();
      sincronizarDoSupabase();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [recarregarDados, sincronizarDoSupabase]);

  // POLLING AUTOMATICO: busca novos clientes no Supabase a cada 15 segundos
  // Nao recarrega do localStorage (nao precisa - dados sao do servidor).
  // Isso garante que admin veja novos cadastros sem precisar dar F5.
  useEffect(() => {
    const POLL_INTERVAL_MS = 15000; // 15 segundos
    const intervalId = setInterval(() => {
      try {
        sincronizarDoSupabase();
      } catch (e) {
        console.warn("[polling] erro ao sincronizar:", e);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [sincronizarDoSupabase]);

const handleSalvarNovo = useCallback(
    async (dados: Omit<SistemaCliente, "id" | "criadoEm">) => {
      adicionarSistema(dados);
      // Sincronizar com Supabase (fonte centralizada multi-device)
      try {
        await fetch("/api/sistemas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa: dados.empresa,
            responsavel: dados.responsavel,
            telefone: dados.telefone,
            email: dados.email,
            cidade: dados.cidade,
            dataInstalacao: dados.dataInstalacao,
            dataVencimento: dados.dataVencimento,
            status: dados.status,
            plano: dados.plano,
            tipoLicenca: dados.tipoLicenca,
            valorMensal: dados.valorMensal,
            valorAquisicao: dados.valorAquisicao,
            taxaInstalacao: dados.taxaInstalacao,
            observacoes: dados.observacoes,
            zapbotAtivo: !!dados.zapbotAtivo,
            disparoAtivo: !!dados.disparoAtivo,
            funilAtivo: !!dados.funilAtivo,
            fluxosAtivo: !!dados.fluxosAtivo,
          }),
        });
      } catch (e) {
        console.error("[handleSalvarNovo] erro sync Supabase:", e);
      }
      setDialogNovo(false);
      toast.success("Sistema cadastrado!");
      // Re-sincronizar do Supabase para pegar o ID real
      sincronizarDoSupabase();
    },
    [adicionarSistema, sincronizarDoSupabase]
  );

  const handleSalvarEdicao = useCallback(
    async (dados: Omit<SistemaCliente, "id" | "criadoEm">) => {
      if (!dialogForm) return;
      editarSistema(dialogForm.id, dados);
      // Sincronizar com Supabase
      try {
        await fetch(`/api/sistemas?id=${encodeURIComponent(dialogForm.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa: dados.empresa,
            responsavel: dados.responsavel,
            telefone: dados.telefone,
            email: dados.email,
            cidade: dados.cidade,
            dataInstalacao: dados.dataInstalacao,
            dataVencimento: dados.dataVencimento,
            status: dados.status,
            plano: dados.plano,
            tipoLicenca: dados.tipoLicenca,
            valorMensal: dados.valorMensal,
            valorAquisicao: dados.valorAquisicao,
            taxaInstalacao: dados.taxaInstalacao,
            observacoes: dados.observacoes,
            zapbotAtivo: !!dados.zapbotAtivo,
            disparoAtivo: !!dados.disparoAtivo,
            funilAtivo: !!dados.funilAtivo,
            fluxosAtivo: !!dados.fluxosAtivo,
          }),
        });
      } catch (e) {
        console.error("[handleSalvarEdicao] erro sync Supabase:", e);
      }
      setDialogForm(null);
      toast.success("Sistema atualizado!");
      sincronizarDoSupabase();
    },
    [dialogForm, editarSistema, sincronizarDoSupabase]
  );

  const handleRemover = useCallback(
    async (id: string) => {
      removerSistema(id);
      setConfirmaRemover(null);
      toast.success("Sistema removido.");
      // Sincronizar remoção com Supabase
      try {
        await fetch(`/api/sistemas?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        sincronizarDoSupabase();
      } catch (e) {
        console.error("[handleRemover] erro sync Supabase:", e);
      }
    },
    [removerSistema, sincronizarDoSupabase]
  );

  const handleWhatsApp = (telefone: string, sistema?: SistemaCliente) => {
    const telLimpo = telefone.replace(/\D/g, "");
    if (telLimpo.length < 10) {
      toast.error("Numero de telefone invalido.");
      return;
    }
    const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;

    let msg = "Ola! Aqui e o suporte do ZapFacil Pro.";
    if (sistema) {
      const nomeCliente = sistema.dadosRegistro?.usuario || sistema.responsavel || "Cliente";
      const nomeEmpresa = sistema.dadosRegistro?.nomeEmpresa || sistema.empresa || "sua empresa";
      const emailLogin = sistema.dadosRegistro?.email || sistema.email || "";
      msg = `Ola ${nomeCliente}! Aqui e o suporte do ZapFacil Pro.\n\nEstamos entrando em contato sobre o sistema da *${nomeEmpresa}*.`;
      if (emailLogin) {
        msg += `\n\n*Link de acesso:*\nhttps://my-project-rho-sooty.vercel.app/\n\nSeu e-mail de login: *${emailLogin}*`;
      }
      msg += `\n\nQualquer duvida, estou a disposicao!`;
    }

    const msgEncoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${numero}?text=${msgEncoded}`, "_blank");
    toast.success("WhatsApp aberto!");
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

  // Pedidos de recuperacao pendentes
  const pedidosPendentes = useMemo(
    () => pedidosRecuperacao.filter((p) => p.status === "PENDENTE").length,
    [pedidosRecuperacao]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header com glass effect e sombra sticky */}
      <header className="glass border-b border-border sticky top-0 z-50 shadow-sticky">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <img
              src="/logo-admin.png"
              alt="Logo Admin"
              width={400}
              height={100}
              className="h-[50px] w-[200px] sm:h-[60px] sm:w-[240px] md:h-[70px] md:w-[280px] lg:h-[80px] lg:w-[320px] xl:h-[100px] xl:w-[400px] object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Dados do admin logado - estilo cliente */}
            <button
              type="button"
              onClick={() => setMostrarCredenciaisAdmin(!mostrarCredenciaisAdmin)}
              className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg px-3 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {(dadosGestor?.nome || adminCredenciais?.usuario || "A").charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {dadosGestor?.nome || adminCredenciais?.usuario || "Admin"}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight flex items-center gap-1">
                  {mostrarCredenciaisAdmin ? (
                    <span className="font-mono text-muted-foreground">
                      {adminCredenciais?.usuario} / {adminCredenciais?.senha}
                    </span>
                  ) : (
                    <><Mail className="h-2.5 w-2.5 shrink-0" />{dadosGestor?.email || adminCredenciais?.usuario}</>
                  )}
                </p>
              </div>
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground shrink-0"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4 shrink-0" />
                    ) : (
                      <Moon className="h-4 w-4 shrink-0" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
                    onClick={() => setDialogTrocarSenha(true)}
                  >
                    <KeyRound className="h-4 w-4 shrink-0" />
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
                    className="h-8 w-8 text-info hover:bg-info/10 dark:hover:bg-info/20 shrink-0"
                    onClick={() => setDialogEmailRecuperacao(true)}
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>E-mail de Recuperacao</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
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
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-card rounded-xl p-1 border border-border shadow-card">
          <button
            onClick={() => setAbaAtiva("sistemas")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "sistemas"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Monitor className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Sistemas</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
              abaAtiva === "sistemas"
                ? "bg-white/20 text-white"
                : "bg-secondary text-muted-foreground"
            }`}>
              {sistemas.length}
            </span>
          </button>
          <button
            onClick={() => setAbaAtiva("cobrancas")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "cobrancas"
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Receipt className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Cobrancas</span>
            {cobrancasEmAberto > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                abaAtiva === "cobrancas"
                  ? "bg-white/20 text-white"
                  : "bg-red-100 text-red-600"
              }`}>
                {cobrancasEmAberto}
              </span>
            )}
          </button>
          <button
            onClick={() => setAbaAtiva("recuperacoes")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "recuperacoes"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <KeyRound className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">Recuperacoes</span>
            {pedidosPendentes > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                abaAtiva === "recuperacoes"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-600"
              }`}>
                {pedidosPendentes}
              </span>
            )}
          </button>
          <button
            onClick={() => setAbaAtiva("zapbot")}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "zapbot"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Bot className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">ZapBot</span>
          </button>
        </div>

        {/* Conteúdo da aba ativa */}
        {abaAtiva === "cobrancas" ? (
          <PainelCobranças />
        ) : abaAtiva === "recuperacoes" ? (
          <SecaoRecuperacoes />
        ) : abaAtiva === "zapbot" ? (
          <div className="space-y-6">
            <ConfigGlobalEvolutionAPI />
            <div className="border-t pt-4">
              <PainelZapBot />
            </div>
          </div>
        ) : (
          <SecaoSistemas
            onNovo={() => setDialogNovo(true)}
            onVerDetalhe={setDialogDetalhe}
            onEditar={setDialogForm}
            onRemover={setConfirmaRemover}
            onMudarAba={setAbaAtiva}
            onWhatsApp={handleWhatsApp}
          />
        )}
      </main>

      {/* Dialog Novo Sistema */}
      <Dialog open={dialogNovo} onOpenChange={() => setDialogNovo(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus className="h-5 w-5 text-primary shrink-0" />
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
              <Pencil className="h-5 w-5 text-info shrink-0" />
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
              <Eye className="h-5 w-5 text-primary shrink-0" />
              Detalhes do Sistema
            </DialogTitle>
          </DialogHeader>
          {dialogDetalhe && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-foreground">{dialogDetalhe.empresa}</p>
                    <p className="text-sm text-muted-foreground">{dialogDetalhe.responsavel}</p>
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
                    <p className="text-muted-foreground">{dialogDetalhe.telefone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">E-mail</p>
                    <p className="text-muted-foreground">{dialogDetalhe.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Cidade</p>
                    <p className="text-muted-foreground">{dialogDetalhe.cidade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Tipo de Licenca</p>
                    <p className="text-muted-foreground">
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
                        <p className="text-primary font-bold">{formatarMoeda(dialogDetalhe.valorMensal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-medium">Vencimento</p>
                        <p className={dialogDetalhe.status === "ATIVO" && diasRestantes(dialogDetalhe.dataVencimento) <= 7 ? "text-amber-600 font-bold" : "text-muted-foreground"}>
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
                      <p className="text-primary font-bold text-base sm:text-lg font-display whitespace-nowrap">{formatarMoeda(dialogDetalhe.valorAquisicao)}</p>
                      <p className="text-[10px] text-gray-400">Pagamento unico - licenca definitiva</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Instalacao</p>
                    <p className="text-muted-foreground">{formatarData(dialogDetalhe.dataInstalacao)}</p>
                  </div>
                  {dialogDetalhe.taxaInstalacao > 0 && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">Taxa Instalacao</p>
                      <p className="text-muted-foreground">{formatarMoeda(dialogDetalhe.taxaInstalacao)}</p>
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">Recursos Premium Ativos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dialogDetalhe.zapbotAtivo && <Badge className="text-[10px] bg-primary/10 text-primary"><Bot className="h-3 w-3 mr-1 shrink-0" />ZapBot</Badge>}
                    {dialogDetalhe.disparoAtivo && <Badge className="text-[10px] bg-info/15 text-info"><Send className="h-3 w-3 mr-1 shrink-0" />Disparo em Massa</Badge>}
                    {dialogDetalhe.funilAtivo && <Badge className="text-[10px] bg-amber-100 text-amber-700"><TrendingUp className="h-3 w-3 mr-1 shrink-0" />Funil de Leads</Badge>}
                    {dialogDetalhe.fluxosAtivo && <Badge className="text-[10px] bg-violet-100 text-violet-700"><GitBranch className="h-3 w-3 mr-1 shrink-0" />Fluxos</Badge>}
                    {!dialogDetalhe.zapbotAtivo && !dialogDetalhe.disparoAtivo && !dialogDetalhe.funilAtivo && !dialogDetalhe.fluxosAtivo && (
                      <p className="text-xs text-gray-400">Nenhum recurso Premium ativo</p>
                    )}
                  </div>
                </div>
                {dialogDetalhe.observacoes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Observacoes</p>
                      <p className="text-sm text-muted-foreground">{dialogDetalhe.observacoes}</p>
                    </div>
                  </>
                )}
                {dialogDetalhe.dadosRegistro && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[10px] text-primary uppercase font-semibold mb-2 flex items-center gap-1">
                        <Check className="h-3 w-3 shrink-0" />
                        Dados do Cadastro do Cliente
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm bg-primary/5 rounded-lg p-3 border border-primary/15">
                        <div>
                          <p className="text-[10px] text-gray-400">Usuario criado</p>
                          <p className="text-muted-foreground font-medium">{dialogDetalhe.dadosRegistro.usuario}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Empresa cadastrada</p>
                          <p className="text-muted-foreground font-medium">{dialogDetalhe.dadosRegistro.nomeEmpresa}</p>
                        </div>
                        {dialogDetalhe.dadosRegistro.telefone && (
                          <div>
                            <p className="text-[10px] text-gray-400">Telefone</p>
                            <p className="text-muted-foreground">{dialogDetalhe.dadosRegistro.telefone}</p>
                          </div>
                        )}
                        {dialogDetalhe.dadosRegistro.email && (
                          <div>
                            <p className="text-[10px] text-gray-400">E-mail</p>
                            <p className="text-muted-foreground">{dialogDetalhe.dadosRegistro.email}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-400">Registrado em</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(dialogDetalhe.dadosRegistro.registradoEm).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Credenciais de Acesso do Cliente */}
                <div className="bg-gray-50 dark:bg-gray-900 border border-border rounded-xl p-4">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-3 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    Credenciais de Acesso do Cliente
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground dark:text-gray-500 mb-1">E-mail de login (usuario)</p>
                      <div className="bg-card border border-border rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
                        <p className="text-sm font-mono font-semibold text-foreground truncate">
                          {dialogDetalhe.dadosRegistro?.email || dialogDetalhe.email || "-"}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const emailCopiar = dialogDetalhe.dadosRegistro?.email || dialogDetalhe.email || "";
                            navigator.clipboard.writeText(emailCopiar);
                            toast.success("E-mail copiado!");
                          }}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="h-4 w-4 shrink-0" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground dark:text-gray-500 mb-1">Senha</p>
                      <div className="bg-card border border-border rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
                        <p className="text-sm font-mono font-semibold text-foreground">
                          {dialogDetalhe.dadosRegistro?.senha || "Senha nao definida"}
                        </p>
                        {dialogDetalhe.dadosRegistro?.senha && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(dialogDetalhe.dadosRegistro!.senha);
                              toast.success("Senha copiada!");
                            }}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Copy className="h-4 w-4 shrink-0" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2">
                      <span className="text-[10px] text-muted-foreground">Link de acesso:</span>
                      <span className="text-[11px] text-muted-foreground font-mono truncate flex-1">https://my-project-rho-sooty.vercel.app/</span>
                    </div>
                    {dialogDetalhe.dadosRegistro?.senha ? (
                      <Button
                        className="w-full h-9 bg-primary hover:bg-primary/90 text-xs font-medium rounded-lg"
                        onClick={() => {
                          const emailLogin = dialogDetalhe.dadosRegistro?.email || dialogDetalhe.email || "";
                          const senhaCliente = dialogDetalhe.dadosRegistro?.senha || "";
                          const tel = dialogDetalhe.dadosRegistro?.telefone || dialogDetalhe.telefone || "";
                          if (!tel) { toast.error("Sem telefone cadastrado."); return; }
                          const telLimpo = tel.replace(/\D/g, "");
                          const numero = telLimpo.startsWith("55") ? telLimpo : "55" + telLimpo;
                          const nomeCliente = dialogDetalhe.dadosRegistro?.usuario || dialogDetalhe.responsavel;
                          const msg = encodeURIComponent(
                            "Ola " + nomeCliente + "! Aqui e o suporte do ZapFacil Pro.\n\n" +
                            "Segue seus dados de acesso ao sistema:\n\n" +
                            "Link: https://my-project-rho-sooty.vercel.app/\n" +
                            "Login (e-mail): " + emailLogin + "\n" +
                            "Senha: " + senhaCliente + "\n\n" +
                            "Salve esses dados! Qualquer duvida, estou a disposicao."
                          );
                          window.open("https://wa.me/" + numero + "?text=" + msg, "_blank");
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Enviar credenciais por WhatsApp
                      </Button>
                    ) : dialogDetalhe.dadosRegistro ? (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 text-center leading-relaxed">
                        A senha deste cliente nao foi definida no cadastro.
                        Envie o link de acesso via WhatsApp ou oriente o cliente a usar "Esqueceu a senha?" na tela de login.
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground bg-secondary border border-border rounded-lg p-2.5 text-center leading-relaxed">
                        Cliente cadastrado sem credenciais de acesso. Ele devera se registrar pelo link.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {(dialogDetalhe.telefone || dialogDetalhe.dadosRegistro?.telefone) && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-primary/5 border border-primary/20 text-primary hover:bg-primary/10 text-xs"
                    onClick={() => handleWhatsApp(dialogDetalhe.telefone || dialogDetalhe.dadosRegistro?.telefone || "", dialogDetalhe)}
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    WhatsApp
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-border text-muted-foreground hover:bg-gray-50 text-xs"
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
          <p className="text-sm text-muted-foreground">
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

      {/* Dialog E-mail de Recuperacao */}
      <Dialog open={dialogEmailRecuperacao} onOpenChange={setDialogEmailRecuperacao}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-info shrink-0" />
              E-mail de Recuperacao
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-info/10 border border-info/30 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-info shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-info">E-mail de recuperacao de senha</p>
                  <p className="text-xs text-info mt-0.5">
                    Este e-mail sera usado para verificar a identidade do administrador caso ele precise redefinir a senha na tela de login.
                  </p>
                </div>
              </div>
            </div>
            <DialogEmailRecuperacaoForm />
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
type EtapaAdmin = "loading" | "primeiro_acesso" | "login" | "autenticado";

export function PainelAdmin() {
  const [etapa, setEtapa] = useState<EtapaAdmin>("loading");

  useEffect(() => {
    const store = useAdminStore.getState();
    // Garante credenciais padrao se nao existir nada
    if (!store.adminCredenciais) {
      store.configurarAdmin(CREDENCIAIS_PADRAO.usuario, CREDENCIAIS_PADRAO.senha);
    }

    // Verifica se ja esta autenticado nesta sessao
    const session = sessionStorage.getItem("zapfacil_admin_session");
    if (session === "autenticado") {
      setEtapa("autenticado");
      return;
    }

    // Sempre mostra login. Primeiro acesso fica acessivel via link.
    setEtapa("login");
  }, []);

  if (etapa === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/20" />
          <div className="h-4 w-28 bg-muted rounded skeleton" />
        </div>
      </div>
    );
  }

  if (etapa === "primeiro_acesso") {
    return <TelaPrimeiroAcesso onConcluido={() => setEtapa("autenticado")} />;
  }

  if (etapa === "login") {
    return <TelaLoginAdmin onAutenticado={() => setEtapa("autenticado")} onPrimeiroAcesso={() => setEtapa("primeiro_acesso")} />;
  }

  return <PainelAdminConteudo />;
}