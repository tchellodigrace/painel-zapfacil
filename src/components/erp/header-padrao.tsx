"use client";

import { useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sun, Moon, LogOut, KeyRound, Mail } from "lucide-react";

interface HeaderPadraoProps {
  /** URL da logo a ser exibida (cada painel passa a sua) */
  logoSrc: string;
  /** Alt da logo */
  logoAlt?: string;
  /** Nome do usuario (mostrado no card clicavel) */
  nomeUsuario: string;
  /** Email do usuario (mostrado no card clicavel) */
  emailUsuario: string;
  /** Texto opcional de credenciais mostrado quando o card e clicado
   *  (ex: "usuario / senha" no admin). Se nao passar, mostra o email. */
  credenciais?: string;
  /** Badge opcional ao lado do usuario (ex: "PRO") */
  badge?: ReactNode;
  /** Callback de logout */
  onLogout: () => void;
  /** Callback opcional para o botao "Alterar Senha". Se nao passar, botao nao aparece. */
  onAlterarSenha?: () => void;
  /** Callback opcional para o botao "Email de Recuperacao". Se nao passar, botao nao aparece. */
  onEmailRecuperacao?: () => void;
}

/**
 * Header padrao unificado para ambos os paineis (admin e cliente).
 *
 * Estrutura identica em ambos os paineis:
 *   [logo] ...... [card usuario] [badge] [tema] [senha?] [email?] [sair]
 *
 * Estilos sao definidos em globals.css sob as classes:
 *   .header-padrao, .header-left, .header-logo, .header-right,
 *   .usuario-card, .usuario-avatar, .usuario-nome, .usuario-email
 *
 * As cores usam tokens semanticos (var(--background), var(--foreground), etc.)
 * para funcionar corretamente em light e dark mode.
 */
export function HeaderPadrao({
  logoSrc,
  logoAlt = "Logo",
  nomeUsuario,
  emailUsuario,
  credenciais,
  badge,
  onLogout,
  onAlterarSenha,
  onEmailRecuperacao,
}: HeaderPadraoProps) {
  const { theme, setTheme } = useTheme();
  const [mostrarCredenciais, setMostrarCredenciais] = useState(false);

  const inicial = (nomeUsuario || "?").charAt(0).toUpperCase();
  const textoCredenciais = credenciais || emailUsuario || "—";

  return (
    <header className="header-padrao">
      {/* Lado esquerdo: logo */}
      <div className="header-left">
        <img
          src={logoSrc}
          alt={logoAlt}
          className="header-logo"
        />
      </div>

      {/* Lado direito: card usuario + acoes */}
      <div className="header-right">
        <button
          type="button"
          onClick={() => setMostrarCredenciais(!mostrarCredenciais)}
          className="usuario-card"
          aria-label="Alternar credenciais"
        >
          <div className="usuario-avatar">{inicial}</div>
          <div className="usuario-info-text">
            <p className="usuario-nome">{nomeUsuario || "Usuário"}</p>
            <p className="usuario-email">
              {mostrarCredenciais ? (
                <span className="font-mono">{textoCredenciais}</span>
              ) : (
                <>
                  <Mail className="h-2.5 w-2.5 shrink-0 inline" /> {emailUsuario || "—"}
                </>
              )}
            </p>
          </div>
        </button>

        {badge}

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

        {onAlterarSenha && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-accent-foreground shrink-0"
                  onClick={onAlterarSenha}
                >
                  <KeyRound className="h-4 w-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Alterar Senha</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {onEmailRecuperacao && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-info hover:bg-info/10 dark:hover:bg-info/20 shrink-0"
                  onClick={onEmailRecuperacao}
                >
                  <Mail className="h-4 w-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>E-mail de Recuperação</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 shrink-0" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sair</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}

/** Helper para criar o badge PRO usado no painel cliente */
export function BadgePro() {
  return (
    <Badge
      variant="outline"
      className="text-success dark:text-success border-success/30 bg-success/10 font-semibold shrink-0"
    >
      PRO
    </Badge>
  );
}
