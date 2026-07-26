"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Server,
  Globe,
  Bot,
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  Power,
  PowerOff,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ConfigGlobal {
  apiUrl: string;
  instanceName: string;
  apiKeyMascarada: string;
  temApiKey: boolean;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

/**
 * ConfigGlobalEvolutionAPI
 *
 * Tela do admin para configurar UMA VEZ o servidor Evolution API global.
 * - URL do servidor (ex: https://evolution.suaempresa.com)
 * - Nome da instância (criada na Evolution API)
 * - API Key (gerada na Evolution API)
 * - Botão ligar/desligar globalmente
 *
 * Depois que isso está configurado, cada cliente pode ter seu próprio
 * ZapBot (mensagens, menu, etc) — mas o servidor é compartilhado.
 *
 * Quando o admin ainda não tem a Evolution API rodando, mostra instruções
 * de como subir na Oracle Cloud Always Free.
 */
export function ConfigGlobalEvolutionAPI() {
  const [config, setConfig] = useState<ConfigGlobal | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Campos editáveis
  const [apiUrl, setApiUrl] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [mostrarKey, setMostrarKey] = useState(false);
  const [jaSalvou, setJaSalvou] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const res = await fetch(`/api/zapbot/config-global`, {
        cache: "no-store",
      });
      if (!res.ok) {
        toast.error("Erro ao carregar configuração.");
        return;
      }
      const data = await res.json();
      if (data.ok && data.config) {
        setConfig(data.config);
        setApiUrl(data.config.apiUrl || "");
        setInstanceName(data.config.instanceName || "");
        setAtivo(data.config.ativo);
        setJaSalvou(true);
      } else {
        setConfig(null);
        setJaSalvou(false);
      }
    } catch (e) {
      console.error("[ConfigGlobalEvolutionAPI] erro ao carregar:", e);
      toast.error("Erro de conexão.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async () => {
    if (!apiUrl.trim() || !instanceName.trim()) {
      toast.error("URL da API e nome da instância são obrigatórios.");
      return;
    }
    if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
      toast.error("URL deve começar com http:// ou https://");
      return;
    }
    // Se é a primeira vez (não tem api_key salva ainda), exige a api_key
    if (!jaSalvou && !apiKey.trim()) {
      toast.error("API Key é obrigatória na primeira configuração.");
      return;
    }

    try {
      setSalvando(true);
      const body: Record<string, unknown> = {
        apiUrl: apiUrl.trim(),
        instanceName: instanceName.trim(),
        ativo,
      };
      if (apiKey.trim()) {
        body.apiKey = apiKey.trim();
      }

      const res = await fetch(`/api/zapbot/config-global`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Configuração global salva!");
        setApiKey(""); // limpar campo depois de salvar
        carregar();
      } else {
        toast.error(data.error || "Erro ao salvar.");
      }
    } catch (e) {
      console.error("[ConfigGlobalEvolutionAPI] erro ao salvar:", e);
      toast.error("Erro de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async () => {
    if (
      !confirm(
        "Tem certeza? Isso remove a configuração global do servidor Evolution API. Os clientes vão parar de receber atendimento automático."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/zapbot/config-global`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Configuração removida.");
        setConfig(null);
        setApiUrl("");
        setInstanceName("");
        setApiKey("");
        setAtivo(true);
        setJaSalvou(false);
      } else {
        toast.error(data.error || "Erro ao remover.");
      }
    } catch (e) {
      console.error("[ConfigGlobalEvolutionAPI] erro ao remover:", e);
      toast.error("Erro de conexão.");
    }
  };

  if (carregando) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Carregando configuração...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            Servidor Evolution API
          </h2>
          <p className="text-xs text-muted-foreground">
            Configuração global — mesma para todos os clientes
          </p>
        </div>
        {config ? (
          <Badge
            className={
              config.ativo
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            }
          >
            {config.ativo ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" /> Ativo
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" /> Inativo
              </>
            )}
          </Badge>
        ) : (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" /> Não configurado
          </Badge>
        )}
      </div>

      {/* Aviso se ainda não configurado */}
      {!config && (
        <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground">
                  Servidor Evolution API ainda não configurado
                </h3>
                <p className="text-xs text-muted-foreground">
                  Para ativar o ZapBot para seus clientes, você precisa:
                </p>
                <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1">
                  <li>
                    Subir uma VM na Oracle Cloud Always Free (grátis para
                    sempre)
                  </li>
                  <li>Instalar a Evolution API na VM</li>
                  <li>Criar uma instância e gerar uma API key</li>
                  <li>Preencher os campos abaixo com os dados da VM</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  O passo-a-passo completo está no arquivo{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[10px]">
                    /supabase/schema-zapbot.sql
                  </code>{" "}
                  e no script de instalação{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-[10px]">
                    /scripts/install-evolution-api.sh
                  </code>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Configuração */}
      <Card className="border-2 border-dashed border-primary/20 dark:border-primary/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4 text-primary shrink-0" />
            Dados do Servidor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* URL da API */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Globe className="h-3 w-3 shrink-0" /> URL da Evolution API
            </Label>
            <Input
              placeholder="https://evolution.suaempresa.com"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="text-sm h-9"
            />
            <p className="text-[10px] text-muted-foreground">
              URL completa do servidor (com https://). Sem barra no final.
            </p>
          </div>

          {/* Instância + API Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Bot className="h-3 w-3 shrink-0" /> Nome da Instância
              </Label>
              <Input
                placeholder="zapfacil-prod"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Key className="h-3 w-3 shrink-0" /> API Key
                {config?.temApiKey && (
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (atual: {config.apiKeyMascarada})
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  type={mostrarKey ? "text" : "password"}
                  placeholder={
                    config?.temApiKey
                      ? "•••• (deixe vazio para manter)"
                      : "Cole a API key aqui"
                  }
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="text-sm h-9 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setMostrarKey(!mostrarKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarKey ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Ativar/Desativar */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              {ativo ? (
                <Power className="h-4 w-4 text-green-600" />
              ) : (
                <PowerOff className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs font-semibold">
                  {ativo ? "Servidor ativo" : "Servidor desativado"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {ativo
                    ? "Todos os clientes com ZapBot ligado estão recebendo atendimentos."
                    : "Nenhum cliente recebe atendimento até você reativar."}
                </p>
              </div>
            </div>
            <Switch checked={ativo} onCheckedChange={setAtivo} />
          </div>

          {/* Botões */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              className="bg-primary hover:bg-primary/90 h-9"
              onClick={handleSalvar}
              disabled={salvando}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {salvando ? "Salvando..." : jaSalvou ? "Atualizar" : "Salvar Configuração"}
            </Button>
            {config && (
              <Button
                variant="outline"
                className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={handleRemover}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Remover
              </Button>
            )}
          </div>

          {config?.atualizadoEm && (
            <p className="text-[10px] text-muted-foreground">
              Última atualização:{" "}
              {new Date(config.atualizadoEm).toLocaleString("pt-BR")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instruções rápidas */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary shrink-0" />
            Como obter esses dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>
            <strong>1. URL da API:</strong> é o endereço do seu servidor. Se
            você usou o script de instalação da Oracle Cloud, será algo como{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              http://IP_DA_VM:8080
            </code>{" "}
            ou{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              https://evolution.seudominio.com.br
            </code>{" "}
            (se configurou domínio).
          </p>
          <p>
            <strong>2. Nome da instância:</strong> escolha um nome curto, ex:{" "}
            <code className="bg-muted px-1 py-0.5 rounded">zapfacil-prod</code>.
            A instância é criada automaticamente na primeira conexão.
          </p>
          <p>
            <strong>3. API Key:</strong> gerada na Evolution API. Depois de
            instalar, acesse{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              http://IP_DA_VM:8080/manager
            </code>{" "}
            e gere uma key em "Settings → API Keys".
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
