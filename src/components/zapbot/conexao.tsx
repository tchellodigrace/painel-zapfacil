"use client";

import { useState } from "react";
import { useZapBotProStore } from "@/hooks/use-zapbot-pro-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  QrCode,
  Wifi,
  WifiOff,
  Loader2,
  Copy,
  RefreshCw,
  Server,
  Key,
  Globe,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export function ZapBotConexao() {
  const {
    configEvolution,
    setConfigEvolution,
    statusConexao,
    qrCodeBase64,
    conectado,
    conectar,
    desconectar,
  } = useZapBotProStore();

  const [editUrl, setEditUrl] = useState(configEvolution.apiUrl);
  const [editInstance, setEditInstance] = useState(configEvolution.instanceName);
  const [editKey, setEditKey] = useState(configEvolution.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function salvarConfig() {
    setSalvando(true);
    setConfigEvolution({
      apiUrl: editUrl,
      instanceName: editInstance,
      apiKey: editKey,
    });
    setTimeout(() => setSalvando(false), 500);
    toast.success("Configuracao salva!");
  }

  async function handleConectar() {
    toast.info("Iniciando conexao com a Evolution API...");
    await conectar();
    toast.success("Conectado com sucesso! (Modo demonstracao)");
  }

  function handleDesconectar() {
    desconectar();
    toast.info("Desconectado da instancia.");
  }

  function copiarConfig() {
    const config = `URL: ${configEvolution.apiUrl}
Instancia: ${configEvolution.instanceName}
API Key: ${configEvolution.apiKey}`;
    navigator.clipboard.writeText(config);
    toast.success("Configuracao copiada!");
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Conexao WhatsApp</h2>
        <p className="text-gray-500 text-sm mt-1">
          Configure a Evolution API e conecte seu WhatsApp via QR Code
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config API */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              Configuracao da API
            </CardTitle>
            <CardDescription>
              Dados da Evolution API instalada no seu servidor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                URL da API
              </Label>
              <Input
                id="api-url"
                placeholder="http://localhost:8080"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
              />
              <p className="text-[11px] text-gray-400">
                URL da Evolution API (ex: http://seu-servidor:8080)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instance-name" className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5" />
                Nome da Instancia
              </Label>
              <Input
                id="instance-name"
                placeholder="zapbot-pro"
                value={editInstance}
                onChange={(e) => setEditInstance(e.target.value)}
              />
              <p className="text-[11px] text-gray-400">
                Identificador unico da conexao WhatsApp
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key" className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                API Key
              </Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder="Sua API Key"
                  value={editKey}
                  onChange={(e) => setEditKey(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-gray-400">
                Chave de seguranca configurada na Evolution API
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={salvarConfig}
                disabled={salvando}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {salvando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Salvar Configuracao
              </Button>
              <Button variant="outline" size="icon" onClick={copiarConfig}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code / Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary" />
                  {conectado ? "Conectado" : "QR Code"}
                </CardTitle>
                <CardDescription className="mt-1">
                  {conectado
                    ? "WhatsApp conectado e funcionando"
                    : statusConexao === "conectando"
                      ? "Escaneie o QR Code com seu WhatsApp"
                      : "Conecte para ativar o bot"}
                </CardDescription>
              </div>
              <Badge
                className={
                  conectado
                    ? "bg-primary/10 text-primary"
                    : statusConexao === "conectando"
                      ? "bg-yellow-100 text-yellow-700"
                      : statusConexao === "erro"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                }
              >
                {conectado ? (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                ) : statusConexao === "conectando" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : statusConexao === "erro" ? (
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                )}
                {statusConexao === "conectado"
                  ? "Online"
                  : statusConexao === "conectando"
                    ? "Conectando"
                    : statusConexao === "erro"
                      ? "Erro"
                      : "Offline"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {conectado ? (
              /* Connected state */
              <div className="text-center py-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  WhatsApp Conectado!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Instancia: <strong>{configEvolution.instanceName}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  API: <strong>{configEvolution.apiUrl}</strong>
                </p>
                <Button
                  variant="destructive"
                  className="mt-6"
                  onClick={handleDesconectar}
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              </div>
            ) : statusConexao === "conectando" && !qrCodeBase64 ? (
              /* Loading state */
              <div className="text-center py-6">
                <Skeleton className="h-52 w-52 rounded-xl mx-auto mb-4" />
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-gray-500">
                    Gerando QR Code...
                  </span>
                </div>
              </div>
            ) : qrCodeBase64 ? (
              /* QR Code state */
              <div className="text-center py-4">
                <div className="inline-block p-3 bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
                  <img
                    src={qrCodeBase64}
                    alt="QR Code WhatsApp"
                    className="w-52 h-52 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Abra o WhatsApp no celular
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Vá em Aparelhos conectados &gt; Conectar aparelho &gt; Escaneie o QR Code
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDesconectar}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Gerar novo
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDesconectar}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              /* Disconnected state */
              <div className="text-center py-6">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700">
                  Nenhuma conexao ativa
                </h3>
                <p className="text-sm text-gray-400 mt-1 mb-6">
                  Configure a API e clique em conectar para comecar
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleConectar}
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Conectar WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Como funciona */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Como funciona a conexao?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-sm text-gray-900">
                Instale a Evolution API
              </h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Rode a Evolution API via Docker no seu servidor (Oracle Cloud gratis).
                Veja a aba &quot;Deploy&quot; para o guia completo.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-sm text-gray-900">
                Configure e conecte
              </h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Preencha a URL da API, nome da instancia e API Key. Clique em
                &quot;Conectar&quot; e escaneie o QR Code com seu WhatsApp.
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-sm text-gray-900">
                Ative o chatbot
              </h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Configure o menu de respostas automaticas na aba &quot;Chatbot&quot; e
                ative-o. Seu WhatsApp vai responder automaticamente 24h!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}