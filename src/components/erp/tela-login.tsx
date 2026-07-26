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
  Check,
} from "lucide-react";
import { toast } from "sonner";
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
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
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
  const [dialogRecuperar, setDialogRecuperar] = useState(false);
  const [recuperarEmail, setRecuperarEmail] = useState("");
  const [recuperarTelefone, setRecuperarTelefone] = useState("");
  const [enviandoPedido, setEnviandoPedido] = useState(false);

  useEffect(() => {
    if (verificarSessao()) {
      onAutenticado();
      return;
    }
    const cred = carregarCredenciais();
    setTemCredenciais(!!cred);
  }, [onAutenticado]);

  const handleCriarConta = useCallback(async () => {
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

    setCarregando(true);

    try {
      const res = await fetch("/api/auth/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha,
          nomeEmpresa: nomeEmpresa.trim(),
          nomeResponsavel: nomeResponsavel.trim(),
          telefone: telefone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error(data.error || "Erro ao criar conta.");
        setCarregando(false);
        return;
      }

      const cred: Credenciais = {
        email: data.cliente.email,
        senha,
        nomeEmpresa: data.cliente.nomeEmpresa,
        nomeResponsavel: data.cliente.nomeResponsavel,
        telefone: data.cliente.telefone || "",
      };
      salvarCredenciais(cred);
      criarSessao();

      toast.success("Conta criada com sucesso!");
      onAutenticado();
    } catch (e) {
      console.error("[handleCriarConta] erro:", e);
      toast.error("Erro de conexao. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [email, senha, confirmarSenha, nomeEmpresa, nomeResponsavel, telefone, onAutenticado]);

  const handleRecuperarSenha = useCallback(async () => {
    if (!recuperarEmail.trim() || !recuperarEmail.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    setEnviandoPedido(true);

    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recuperarEmail.trim().toLowerCase(),
          telefone: recuperarTelefone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error(data.error || "Erro ao enviar pedido.");
        setEnviandoPedido(false);
        return;
      }

      setEnviandoPedido(false);
      setDialogRecuperar(false);
      setRecuperarEmail("");
      setRecuperarTelefone("");
      toast.success(
        data.mensagem ||
          "Pedido enviado ao administrador! Voce recebera seus dados de acesso pelo WhatsApp."
      );
    } catch (e) {
      console.error("[handleRecuperarSenha] erro:", e);
      toast.error("Erro de conexao. Tente novamente.");
      setEnviandoPedido(false);
    }
  }, [recuperarEmail, recuperarTelefone]);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        toast.error(data.error || "E-mail ou senha incorretos.");
        setCarregando(false);
        return;
      }

      const cred: Credenciais = {
        email: data.cliente.email,
        senha,
        nomeEmpresa: data.cliente.nomeEmpresa,
        nomeResponsavel: data.cliente.nomeResponsavel,
        telefone: data.cliente.telefone || "",
      };
      salvarCredenciais(cred);
      criarSessao();
      toast.success(`Bem-vindo, ${cred.nomeResponsavel}!`);
      onAutenticado();
    } catch (e) {
      console.error("[handleLogin] erro:", e);
      toast.error("Erro de conexao. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [email, senha, onAutenticado]);

  // Loading
  if (temCredenciais === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src="/logo-cliente.png" alt="" width={400} height={100} className="h-[80px] w-[160px] object-contain animate-pulse opacity-60" />
      </div>
    );
  }

  // ====== TELA DE LOGIN - ESTILO BITRIX24 ======
  // Layout: card centralizado em fundo claro com leve ilustração lateral em desktop
  if (!mostrarCadastro) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Painel esquerdo - branding (apenas desktop) */}
        <div className="hidden lg:flex lg:w-[44%] bg-primary relative overflow-hidden flex-col justify-between p-12">
          {/* Elementos decorativos - estilo Bitrix24 (gradientes sutis) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 -left-20 w-[24rem] h-[24rem] rounded-full bg-primary-foreground/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            <img
              src="/logo-cliente.png"
              alt="Logo"
              width={400} height={100}
              className="h-[60px] w-[120px] object-contain drop-shadow-lg"
            />
          </div>

          {/* Conteúdo central */}
          <div className="relative z-10 space-y-5 max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              O sistema de gestao feito para o seu negocio crescer.
            </h1>
            <p className="text-white/80 text-base leading-relaxed">
              Vendas, agendamentos, financeiro, estoque e clientes em um so lugar. Simples, rapido e seguro.
            </p>

            {/* Lista de benefícios */}
            <ul className="space-y-2.5 pt-2">
              {[
                "Controle financeiro completo",
                "Agenda inteligente de clientes",
                "Relatorios em tempo real",
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

          {/* Rodapé */}
          <div className="relative z-10 flex items-center gap-2 text-white/70 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            Seus dados ficam protegidos e seguros
          </div>
        </div>

        {/* Painel direito - formulário de login */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm space-y-7">
            <div className="lg:hidden text-center">
              <img
                src="/logo-cliente.png"
                alt="Logo"
                width={400} height={100}
                className="h-[60px] w-[120px] mx-auto object-contain mb-6"
              />
            </div>

            {/* Cabeçalho */}
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Entrar
              </h2>
              <p className="text-sm text-muted-foreground">
                Bem-vindo de volta. Acesse sua conta.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  E-mail
                </Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Senha
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    onClick={() => setDialogRecuperar(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
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
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    Entrando...
                  </span>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Divisor */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-background px-3 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            {/* Link de cadastro */}
            <button
              type="button"
              onClick={() => setMostrarCadastro(true)}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Nao tem conta?{" "}
              <span className="text-primary hover:text-primary/80 font-semibold">
                Cadastre-se gratis
              </span>
            </button>

            <p className="text-center text-[11px] text-muted-foreground/80">
              Ao continuar, voce concorda com os Termos de Uso e a Politica de Privacidade.
            </p>
          </div>
        </div>

        {/* Dialog Esqueceu a Senha */}
        <Dialog open={dialogRecuperar} onOpenChange={setDialogRecuperar}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Lock className="h-5 w-5 text-primary" />
                Recuperar acesso
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Informe o e-mail usado no cadastro. O administrador enviara seus dados de acesso pelo WhatsApp.
              </p>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">E-mail cadastrado</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={recuperarEmail}
                  onChange={(e) => setRecuperarEmail(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleRecuperarSenha()}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">WhatsApp (opcional)</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={recuperarTelefone}
                  onChange={(e) => setRecuperarTelefone(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && handleRecuperarSenha()}
                />
                <p className="text-[11px] text-muted-foreground">
                  Se informado, o admin usara este numero para contato
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-lg text-sm"
                  onClick={() => setDialogRecuperar(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-11 text-sm font-semibold rounded-lg"
                  onClick={handleRecuperarSenha}
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
                      Solicitar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ====== TELA DE CADASTRO - ESTILO BITRIX24 ======
  const podeAvancarEtapa0 = nomeEmpresa.trim() && nomeResponsavel.trim() && email.trim().includes("@");
  const podeAvancarEtapa1 = telefone.trim().length >= 10;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Painel esquerdo - branding (desktop) */}
      <div className="hidden lg:flex lg:w-[44%] bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-[24rem] h-[24rem] rounded-full bg-primary-foreground/10 blur-3xl" />
        </div>

        <div className="relative z-10">
          <img
            src="/logo-cliente.png"
            alt="Logo"
            width={400} height={100}
            className="h-[60px] w-[120px] object-contain drop-shadow-lg"
          />
        </div>

        <div className="relative z-10 space-y-5 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Comece a gerir seu negocio em poucos minutos.
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Preencha seus dados para criar sua conta. Sem cartao de credito, sem burocracia.
          </p>

          <ul className="space-y-2.5 pt-2">
            {[
              "Configuracao em menos de 2 minutos",
              "Suporte humano via WhatsApp",
              "Comece gratis agora mesmo",
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
          Seus dados ficam protegidos e seguros
        </div>
      </div>

      {/* Painel direito - formulário de cadastro */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-7">
          {/* Logo mobile */}
          <div className="lg:hidden text-center">
            <img
              src="/logo-cliente.png"
              alt="Logo"
              width={400} height={100}
              className="h-[60px] w-[120px] mx-auto object-contain mb-4"
            />
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    etapaCadastro > i
                      ? "bg-primary text-primary-foreground"
                      : etapaCadastro === i
                        ? "bg-primary/10 text-primary ring-2 ring-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {etapaCadastro > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-10 h-0.5 rounded transition-colors ${
                      etapaCadastro > i ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
            <div className="ml-3 text-xs text-muted-foreground">
              Etapa {etapaCadastro + 1} de 3
            </div>
          </div>

          {/* Cabeçalho dinâmico */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {etapaCadastro === 0 && "Dados da empresa"}
              {etapaCadastro === 1 && "Contato"}
              {etapaCadastro === 2 && "Seguranca"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {etapaCadastro === 0 && "Como podemos chamar seu negocio?"}
              {etapaCadastro === 1 && "Como podemos entrar em contato?"}
              {etapaCadastro === 2 && "Crie uma senha para proteger seu acesso."}
            </p>
          </div>

          {/* Etapa 0 */}
          {etapaCadastro === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Nome da empresa</Label>
                <Input
                  placeholder="Ex: Barbearia do Joao"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Seu nome</Label>
                <Input
                  placeholder="Ex: Joao Silva"
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">E-mail</Label>
                <Input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                  onKeyDown={(e) => e.key === "Enter" && podeAvancarEtapa0 && setEtapaCadastro(1)}
                />
              </div>
              <Button
                className="w-full h-11 text-sm font-semibold rounded-lg shadow-sm"
                disabled={!podeAvancarEtapa0}
                onClick={() => setEtapaCadastro(1)}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          )}

          {/* Etapa 1 */}
          {etapaCadastro === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Telefone / WhatsApp</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">
                  Opcional, mas recomendado para suporte via WhatsApp
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-lg text-sm font-medium"
                  onClick={() => setEtapaCadastro(0)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-11 text-sm font-semibold rounded-lg shadow-sm"
                  onClick={() => setEtapaCadastro(2)}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2 */}
          {etapaCadastro === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Minimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pr-11 h-11 text-sm rounded-lg border-border focus-visible:ring-primary"
                    onKeyDown={(e) => e.key === "Enter" && handleCriarConta()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Indicador de forca */}
                {senha.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            senha.length >= 6 && senha.length < 8
                              ? "bg-warning"
                              : senha.length >= 8
                                ? "bg-success"
                                : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {senha.length < 6
                        ? "Muito curta"
                        : senha.length < 8
                          ? "Razoavel"
                          : "Forte"}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Confirmar senha</Label>
                <div className="relative">
                  <Input
                    type={mostrarConfirmar ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className={`pr-11 h-11 text-sm rounded-lg border-border focus-visible:ring-primary ${
                      confirmarSenha && confirmarSenha !== senha
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    onKeyDown={(e) => e.key === "Enter" && handleCriarConta()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mostrarConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmarSenha && confirmarSenha !== senha && (
                  <p className="text-xs text-destructive">As senhas nao conferem</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-lg text-sm font-medium"
                  onClick={() => setEtapaCadastro(1)}
                >
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-11 text-sm font-semibold rounded-lg shadow-sm"
                  onClick={handleCriarConta}
                  disabled={carregando}
                >
                  {carregando ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando...
                    </span>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Link voltar p/ login */}
          <button
            type="button"
            onClick={() => setMostrarCadastro(false)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ja tem conta?{" "}
            <span className="text-primary hover:text-primary/80 font-semibold">
              Fazer login
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { destruirSessao, carregarCredenciais };
