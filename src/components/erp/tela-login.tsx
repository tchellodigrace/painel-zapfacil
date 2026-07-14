"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const AUTH_KEY = "zapfacil_auth";
const SESSION_KEY = "zapfacil_session";

interface Credenciais {
  usuario: string;
  senha: string;
  nomeEmpresa: string;
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
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (verificarSessao()) {
      onAutenticado();
      return;
    }
    const cred = carregarCredenciais();
    setTemCredenciais(!!cred);
  }, [onAutenticado]);

  const handleCriarConta = useCallback(() => {
    if (!usuario.trim()) {
      toast.error("Preencha o nome de usuario.");
      return;
    }
    if (usuario.trim().length < 3) {
      toast.error("O usuario deve ter pelo menos 3 caracteres.");
      return;
    }
    if (!senha.trim()) {
      toast.error("Preencha a senha.");
      return;
    }
    if (senha.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      toast.error("As senhas nao conferem.");
      return;
    }

    const cred: Credenciais = {
      usuario: usuario.trim().toLowerCase(),
      senha,
      nomeEmpresa: nomeEmpresa.trim(),
    };
    salvarCredenciais(cred);
    criarSessao();
    toast.success("Conta criada com sucesso! Bem-vindo ao sistema.");
    onAutenticado();
  }, [usuario, senha, confirmarSenha, nomeEmpresa, onAutenticado]);

  const handleLogin = useCallback(() => {
    if (!usuario.trim() || !senha.trim()) {
      toast.error("Preencha usuario e senha.");
      return;
    }
    setCarregando(true);
    // Pequeno delay para feedback visual
    setTimeout(() => {
      const cred = carregarCredenciais();
      if (
        cred &&
        cred.usuario === usuario.trim().toLowerCase() &&
        cred.senha === senha
      ) {
        criarSessao();
        toast.success("Bem-vindo de volta!");
        onAutenticado();
      } else {
        toast.error("Usuario ou senha incorretos.");
      }
      setCarregando(false);
    }, 600);
  }, [usuario, senha, onAutenticado]);

  // Loading inicial
  if (temCredenciais === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30" />
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  // === TELA DE CADASTRO (primeiro acesso) ===
  if (!temCredenciais) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
        <Card className="w-full max-w-sm border-0 shadow-xl">
          <CardContent className="p-8 space-y-6">
            {/* Logo e título */}
            <div className="text-center space-y-3">
              <img
                src="/logo-empresa.png"
                alt="Logo"
                className="h-16 w-auto mx-auto object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Configurar Sistema
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Crie seu usuario e senha para acessar o sistema de gestao.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Nome da empresa */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Nome da Empresa
                </Label>
                <Input
                  placeholder="Ex: Barbearia do Joao"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>

              {/* Usuário */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Seu nome de usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="pl-10 h-10 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleCriarConta()}
                    autoFocus
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Crie sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 pr-10 h-10 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleCriarConta()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={mostrarConfirmar ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-10 pr-10 h-10 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleCriarConta()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarConfirmar ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
                onClick={handleCriarConta}
              >
                Criar Conta e Entrar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
              <ShieldCheck className="h-3 w-3" />
              Dados protegidos localmente no seu dispositivo
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // === TELA DE LOGIN ===
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <Card className="w-full max-w-sm border-0 shadow-xl">
        <CardContent className="p-8 space-y-6">
          {/* Logo e título */}
          <div className="text-center space-y-3">
            <img
              src="/logo-empresa.png"
              alt="Logo"
              className="h-16 w-auto mx-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Acessar Sistema
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Digite seu usuario e senha para entrar.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Usuário */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Usuario
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Seu usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="pl-10 h-10 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pl-10 pr-10 h-10 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold"
              onClick={handleLogin}
              disabled={carregando}
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
            <ShieldCheck className="h-3 w-3" />
            Dados protegidos localmente no seu dispositivo
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { destruirSessao, carregarCredenciais };