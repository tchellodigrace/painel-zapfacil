"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  ShieldCheck,
  Mail,
  Building2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/hooks/use-admin-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone } from "lucide-react";

const AUTH_KEY = "zapfacil_auth";
const SESSION_KEY = "zapfacil_session";

interface Credenciais {
  email: string;
  senha: string;
  nomeEmpresa: string;
  nomeResponsavel: string;
  telefone: string;
}

function carregarCredenciais(): Credenciais | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(AUTH_KEY);
    return item ? (JSON.parse(item) as Credenciais) : null;
  } catch {
    return null;
  }
}

function salvarCredenciais(cred: Credenciais): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(cred));
}

function criarSessao(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, "autenticado");
}

function verificarSessao(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "autenticado";
}

function destruirSessao(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function TelaLogin({ onAutenticado }: { onAutenticado: () => void }) {
  const [temCredenciais, setTemCredenciais] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [etapaCadastro, setEtapaCadastro] = useState(0);
  // Estados de recuperacao
  const [dialogRecuperar, setDialogRecuperar] = useState(false);
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<"menu" | "auto" | "admin">("menu");
  const [recuperarEmail, setRecuperarEmail] = useState("");
  const [recuperarTelefone, setRecuperarTelefone] = useState("");
  const [enviandoPedido, setEnviandoPedido] = useState(false);
  // Auto-recuperacao
  const [novaSenhaRecuperacao, setNovaSenhaRecuperacao] = useState("");
  const [confirmarSenhaRec, setConfirmarSenhaRec] = useState("");
  const [carregandoAutoRecuperacao, setCarregandoAutoRecuperacao] = useState(false);
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [credenciaisEncontradas, setCredenciaisEncontradas] = useState<{ email: string; nome: string } | null>(null);

  useEffect(() => {
    if (verificarSessao()) {
      onAutenticado();
      return;
    }
    const cred = carregarCredenciais();
    setTemCredenciais(!!cred);
  }, [onAutenticado]);

  const handleCriarConta = useCallback(() => {
    if (!nomeEmpresa.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    if (!nomeResponsavel.trim()) {
      toast.error("Informe seu nome.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    if (!senha.trim() || senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      toast.error("As senhas nao conferem.");
      return;
    }

    const cred: Credenciais = {
      email: email.trim().toLowerCase(),
      senha,
      nomeEmpresa: nomeEmpresa.trim(),
      nomeResponsavel: nomeResponsavel.trim(),
      telefone: telefone.trim(),
    };
    salvarCredenciais(cred);
    criarSessao();

    try {
      useAdminStore.getState().salvarRegistroCliente({
        usuario: nomeResponsavel.trim(),
        nomeEmpresa: nomeEmpresa.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha: senha,
        registradoEm: new Date().toISOString(),
      });
    } catch {
      // Admin store pode nao estar disponivel
    }

    toast.success("Conta criada com sucesso!");
    onAutenticado();
  }, [email, senha, confirmarSenha, nomeEmpresa, nomeResponsavel, telefone, onAutenticado]);

  // === RECUPERACAO DE SENHA ===

  const fecharDialogRecuperar = useCallback(() => {
    setDialogRecuperar(false);
    setEtapaRecuperacao("menu");
    setRecuperarEmail("");
    setRecuperarTelefone("");
    setNovaSenhaRecuperacao("");
    setConfirmarSenhaRec("");
    setEmailVerificado(false);
    setCredenciaisEncontradas(null);
  }, []);

  // Verifica se o e-mail existe no localStorage (auto-recuperacao)
  const handleVerificarEmailRecuperacao = useCallback(() => {
    if (!recuperarEmail.trim() || !recuperarEmail.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    const cred = carregarCredenciais();
    if (cred && cred.email === recuperarEmail.trim().toLowerCase()) {
      setCredenciaisEncontradas({ email: cred.email, nome: cred.nomeResponsavel });
      setEmailVerificado(true);
      toast.success("E-mail encontrado! Defina sua nova senha.");
    } else {
      toast.error("E-mail nao encontrado neste dispositivo. Voce pode solicitar ajuda ao administrador.");
    }
  }, [recuperarEmail]);

  // Redefine a senha do cliente
  const handleRedefinirSenha = useCallback(() => {
    if (!novaSenhaRecuperacao.trim() || novaSenhaRecuperacao.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenhaRecuperacao !== confirmarSenhaRec) {
      toast.error("As senhas nao conferem.");
      return;
    }
    setCarregandoAutoRecuperacao(true);
    setTimeout(() => {
      const cred = carregarCredenciais();
      if (cred) {
        const novaCred = { ...cred, senha: novaSenhaRecuperacao };
        localStorage.setItem(AUTH_KEY, JSON.stringify(novaCred));
        setCarregandoAutoRecuperacao(false);
        fecharDialogRecuperar();
        toast.success("Senha redefinida com sucesso! Faca login com a nova senha.");
      } else {
        setCarregandoAutoRecuperacao(false);
        toast.error("Erro ao redefinir. Tente solicitar ajuda ao administrador.");
      }
    }, 800);
  }, [novaSenhaRecuperacao, confirmarSenhaRec, fecharDialogRecuperar]);

  // Envia pedido ao admin (fluxo original)
  const handleSolicitarAdmin = useCallback(() => {
    if (!recuperarEmail.trim() || !recuperarEmail.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    setEnviandoPedido(true);
    setTimeout(() => {
      useAdminStore.getState().criarPedidoRecuperacao(
        recuperarEmail.trim(),
        recuperarTelefone.trim()
      );
      setEnviandoPedido(false);
      fecharDialogRecuperar();
      toast.success(
        "Pedido enviado ao administrador! Voce recebera seus dados de acesso pelo WhatsApp."
      );
    }, 800);
  }, [recuperarEmail, recuperarTelefone, fecharDialogRecuperar]);

  // Envia credenciais por e-mail (mailto)
  const handleEnviarPorEmail = useCallback(() => {
    const cred = carregarCredenciais();
    if (!cred) {
      toast.error("Nenhuma conta encontrada neste dispositivo.");
      return;
    }
    const assunto = encodeURIComponent("Seus dados de acesso - ZapFacil Pro");
    const corpo = encodeURIComponent(
      "Ol\u00e1 " + cred.nomeResponsavel + "!\n\n" +
      "Aqui est\u00e3o seus dados de acesso ao sistema ZapFacil Pro:\n\n" +
      "Link de acesso: https://j1ewd51wcs60-d.space-z.ai/\n" +
      "E-mail de login: " + cred.email + "\n" +
      "Empresa: " + cred.nomeEmpresa + "\n\n" +
      "Caso tenha esquecido a senha, entre em contato com o suporte.\n\n" +
      "Equipe ZapFacil Pro"
    );
    window.open("mailto:" + cred.email + "?subject=" + assunto + "&body=" + corpo, "_self");
  }, []);

  const handleLogin = useCallback(() => {
    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);
    setTimeout(() => {
      const cred = carregarCredenciais();
      if (
        cred &&
        cred.email === email.trim().toLowerCase() &&
        cred.senha === senha
      ) {
        criarSessao();
        toast.success(`Bem-vindo, ${cred.nomeResponsavel}!`);
        onAutenticado();
      } else {
        toast.error("E-mail ou senha incorretos.");
      }
      setCarregando(false);
    }, 800);
  }, [email, senha, onAutenticado]);

  // Loading
  if (temCredenciais === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <img src="/logo-empresa.png" alt="" className="h-24 w-auto object-contain animate-pulse opacity-40" />
      </div>
    );
  }

  // === CADASTRO (primeiro acesso) ===
  if (!temCredenciais) {
    const podeAvancarEtapa0 = nomeEmpresa.trim() && nomeResponsavel.trim() && email.trim().includes("@");
    const podeAvancarEtapa1 = telefone.trim().length >= 10;

    return (
      <div className="min-h-screen bg-white flex">
        {/* Lado esquerdo - branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative z-10">
            <img src="/logo-empresa.png" alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Configure seu sistema<br />de gestao em 2 minutos.
            </h2>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-md">
              Preencha seus dados para criar sua conta. Depois e so comecar a usar: lancar vendas, agendar clientes, controlar financeiro e muito mais.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {["bg-amber-400", "bg-blue-400", "bg-pink-400", "bg-purple-400"].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-emerald-700 flex items-center justify-center text-[10px] font-bold text-white`}>
                    {["A", "B", "C", "D"][i]}
                  </div>
                ))}
              </div>
              <p className="text-emerald-200 text-xs">
                <span className="font-semibold">+2.000 empresas</span> ja usam o sistema
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-2 text-emerald-200 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Seus dados ficam salvos apenas no seu dispositivo
          </div>
        </div>

        {/* Lado direito - formulário */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Header mobile */}
            <div className="lg:hidden text-center space-y-4">
              <img src="/logo-empresa.png" alt="Logo" className="h-20 w-auto mx-auto object-contain" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Criar sua conta</h2>
                <p className="text-sm text-gray-500 mt-1">Configure o sistema em poucos passos</p>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="hidden lg:flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    etapaCadastro > i
                      ? "bg-emerald-600 text-white"
                      : etapaCadastro === i
                        ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600"
                        : "bg-gray-100 text-gray-400"
                  }`}>
                    {etapaCadastro > i ? "✓" : i + 1}
                  </div>
                  {i < 2 && (
                    <div className={`w-12 h-0.5 transition-colors ${etapaCadastro > i ? "bg-emerald-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Etapa 0: Dados da empresa */}
            {etapaCadastro === 0 && (
              <div className="space-y-5">
                <div className="hidden lg:block">
                  <h3 className="text-lg font-semibold text-gray-900">Dados da empresa</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Como podemos chamar seu negocio?</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Nome da empresa</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Ex: Barbearia do Joao"
                        value={nomeEmpresa}
                        onChange={(e) => setNomeEmpresa(e.target.value)}
                        className="pl-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Seu nome</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Ex: Joao Silva"
                        value={nomeResponsavel}
                        onChange={(e) => setNomeResponsavel(e.target.value)}
                        className="pl-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="contato@empresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                        onKeyDown={(e) => e.key === "Enter" && podeAvancarEtapa0 && setEtapaCadastro(1)}
                      />
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
                  disabled={!podeAvancarEtapa0}
                  onClick={() => setEtapaCadastro(1)}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Etapa 1: Contato */}
            {etapaCadastro === 1 && (
              <div className="space-y-5">
                <div className="hidden lg:block">
                  <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Como podemos entrar em contato?</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</Label>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                      autoFocus
                    />
                    <p className="text-xs text-gray-400">Opcional, mas recomendado para suporte via WhatsApp</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl text-sm font-medium border-gray-200"
                    onClick={() => setEtapaCadastro(0)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
                    onClick={() => setEtapaCadastro(2)}
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Etapa 2: Senha */}
            {etapaCadastro === 2 && (
              <div className="space-y-5">
                <div className="hidden lg:block">
                  <h3 className="text-lg font-semibold text-gray-900">Seguranca</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Crie uma senha para proteger seu acesso.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={mostrarSenha ? "text" : "password"}
                        placeholder="Minimo 6 caracteres"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="pl-11 pr-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                        onKeyDown={(e) => e.key === "Enter" && handleCriarConta()}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Indicador de forca */}
                    {senha.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                senha.length >= 6 && senha.length < 8
                                  ? "bg-amber-400"
                                  : senha.length >= 8
                                    ? "bg-emerald-500"
                                    : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {senha.length < 6
                            ? "Muito curta"
                            : senha.length < 8
                              ? "Razoavel"
                              : "Forte"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type={mostrarConfirmar ? "text" : "password"}
                        placeholder="Repita a senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className={`pl-11 pr-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500 ${
                          confirmarSenha && confirmarSenha !== senha ? "border-red-300 focus-visible:ring-red-500" : ""
                        }`}
                        onKeyDown={(e) => e.key === "Enter" && handleCriarConta()}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {mostrarConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmarSenha && confirmarSenha !== senha && (
                      <p className="text-xs text-red-500">As senhas nao conferem</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-xl text-sm font-medium border-gray-200"
                    onClick={() => setEtapaCadastro(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
                    onClick={handleCriarConta}
                  >
                    Criar conta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === LOGIN ===
  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado esquerdo - branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10">
          <img src="/logo-empresa.png" alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Bem-vindo de volta.
          </h2>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-sm">
            Acesse seu sistema de gestao e controle seu negocio de qualquer lugar.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-emerald-200 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Seus dados ficam salvos apenas no seu dispositivo
        </div>
      </div>

      {/* Lado direito - login */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center space-y-4">
            <img src="/logo-empresa.png" alt="Logo" className="h-20 w-auto mx-auto object-contain" />
            <h2 className="text-xl font-bold text-gray-900">Bem-vindo de volta</h2>
          </div>

          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-500">Use seu e-mail e senha para acessar</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Senha</Label>
                <button
                  type="button"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  onClick={() => setDialogRecuperar(true)}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-11 pr-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
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
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
              onClick={handleLogin}
              disabled={carregando}
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Entrar no sistema"
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Sistema protegido. Acesso privado e seguro.
          </p>
        </div>
      </div>

      {/* Dialog Recuperar Acesso */}
      <Dialog open={dialogRecuperar} onOpenChange={(v) => { if (!v) fecharDialogRecuperar(); else setDialogRecuperar(true); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Lock className="h-5 w-5 text-emerald-600" />
              {etapaRecuperacao === "menu" && "Recuperar acesso"}
              {etapaRecuperacao === "auto" && (emailVerificado ? "Redefinir senha" : "Auto-recuperacao")}
              {etapaRecuperacao === "admin" && "Solicitar ao administrador"}
            </DialogTitle>
          </DialogHeader>

          {/* MENU DE OPCOES */}
          {etapaRecuperacao === "menu" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 leading-relaxed">
                Escolha como deseja recuperar seus dados de acesso:
              </p>

              {/* Opcao 1: Auto-recuperacao */}
              <button
                type="button"
                onClick={() => { setEtapaRecuperacao("auto"); setEmailVerificado(false); setCredenciaisEncontradas(null); }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Auto-recuperacao</p>
                    <p className="text-xs text-gray-500 mt-0.5">Se voce esta no mesmo dispositivo onde se cadastrou, pode redefinir sua senha informando seu e-mail.</p>
                  </div>
                </div>
              </button>

              {/* Opcao 2: Receber por e-mail */}
              <button
                type="button"
                onClick={handleEnviarPorEmail}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                    <Mail className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Receber por e-mail</p>
                    <p className="text-xs text-gray-500 mt-0.5">Abre seu aplicativo de e-mail com seus dados de acesso prontos para enviar.</p>
                  </div>
                </div>
              </button>

              {/* Opcao 3: Pedir ao admin */}
              <button
                type="button"
                onClick={() => { setEtapaRecuperacao("admin"); setRecuperarTelefone(""); }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
                    <MessageCircle className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Solicitar ao administrador</p>
                    <p className="text-xs text-gray-500 mt-0.5">Envia um pedido ao admin, que enviara seus dados pelo WhatsApp.</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* AUTO-RECUPERACAO: Verificar email */}
          {etapaRecuperacao === "auto" && !emailVerificado && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Informe o e-mail que voce usou no cadastro. Se estiver neste dispositivo, podera redefinir sua senha imediatamente.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">E-mail cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={recuperarEmail}
                    onChange={(e) => setRecuperarEmail(e.target.value)}
                    className="pl-11 h-11 text-sm rounded-xl border-gray-200"
                    onKeyDown={(e) => e.key === "Enter" && handleVerificarEmailRecuperacao()}
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-11 rounded-xl text-sm" onClick={() => setEtapaRecuperacao("menu")}>
                  Voltar
                </Button>
                <Button className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl" onClick={handleVerificarEmailRecuperacao}>
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Verificar
                </Button>
              </div>
            </div>
          )}

          {/* AUTO-RECUPERACAO: Redefinir senha */}
          {etapaRecuperacao === "auto" && emailVerificado && credenciaisEncontradas && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-emerald-800">E-mail verificado!</p>
                  <p className="text-xs text-emerald-700">Conta de <strong>{credenciaisEncontradas.nome}</strong> encontrada. Defina sua nova senha abaixo.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={novaSenhaRecuperacao}
                    onChange={(e) => setNovaSenhaRecuperacao(e.target.value)}
                    className="pl-11 h-11 text-sm rounded-xl border-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmarSenhaRec}
                    onChange={(e) => setConfirmarSenhaRec(e.target.value)}
                    className="pl-11 h-11 text-sm rounded-xl border-gray-200"
                    onKeyDown={(e) => e.key === "Enter" && handleRedefinirSenha()}
                  />
                </div>
                {confirmarSenhaRec && novaSenhaRecuperacao !== confirmarSenhaRec && (
                  <p className="text-[11px] text-red-500">As senhas nao conferem</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-11 rounded-xl text-sm" onClick={() => { setEmailVerificado(false); setNovaSenhaRecuperacao(""); setConfirmarSenhaRec(""); }}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
                  onClick={handleRedefinirSenha}
                  disabled={carregandoAutoRecuperacao}
                >
                  {carregandoAutoRecuperacao ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redefinindo...
                    </span>
                  ) : (
                    "Redefinir senha"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* PEDIR AO ADMIN */}
          {etapaRecuperacao === "admin" && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  Informe o e-mail do seu cadastro e opcionalmente seu WhatsApp. O administrador recebera seu pedido e enviara seus dados de acesso.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">E-mail cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={recuperarEmail}
                    onChange={(e) => setRecuperarEmail(e.target.value)}
                    className="pl-11 h-11 text-sm rounded-xl border-gray-200"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">WhatsApp (opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="(00) 00000-0000"
                    value={recuperarTelefone}
                    onChange={(e) => setRecuperarTelefone(e.target.value)}
                    className="pl-11 h-11 text-sm rounded-xl border-gray-200"
                    onKeyDown={(e) => e.key === "Enter" && handleSolicitarAdmin()}
                  />
                </div>
                <p className="text-[11px] text-gray-400">Se informado, o admin usara este numero para contato via WhatsApp</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-11 rounded-xl text-sm" onClick={() => setEtapaRecuperacao("menu")}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
                  onClick={handleSolicitarAdmin}
                  disabled={enviandoPedido}
                >
                  {enviandoPedido ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Enviar pedido
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { destruirSessao, carregarCredenciais };