"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Rocket,
  Server,
  Terminal,
  FileText,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Zap,
  Shield,
  Clock,
  DollarSign,
  Cloud,
} from "lucide-react";
import { toast } from "sonner";

function CopyBlock({ code, label }: { code: string; label: string }) {
  function copiar() {
    navigator.clipboard.writeText(code);
    toast.success(`${label} copiado!`);
  }

  return (
    <div className="relative group">
      <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={copiar}
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function Passo({ num, titulo, children }: { num: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-9 w-9 rounded-full bg-primary text-white text-sm flex items-center justify-center font-bold shrink-0">
          {num}
        </div>
        {num < 6 && <div className="w-0.5 flex-1 bg-primary/15 mt-2" />}
      </div>
      <div className="flex-1 pb-6">
        <h4 className="font-semibold text-gray-900 mb-2">{titulo}</h4>
        {children}
      </div>
    </div>
  );
}

export function ZapBotDeploy() {
  const dockerCompose = `version: "3.8"

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_API_KEY=sua_chave_secreta_aqui
    volumes:
      - evolution-data:/evolution/dist/store

volumes:
  evolution-data:`;

  const deployScript = `#!/bin/bash

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker \$USER

# Criar pasta do projeto
mkdir -p ~/zapbot-pro && cd ~/zapbot-pro

# Criar docker-compose.yml
nano docker-compose.yml
# Cole o conteudo do docker-compose acima

# Subir a Evolution API
docker compose up -d

# Verificar se esta rodando
curl http://localhost:8080

# A Evolution API estara em http://SEU_IP:8080`;

  const webhookSetup = `# Na Evolution API, configure estes webhooks:

# URL do Webhook (para receber mensagens):
https://SEU_DOMINIO/api/zapbot/webhook

# Eventos para ouvir:
- messages.upsert  (mensagens recebidas)
- connection.update  (status da conexao)

# Na aba Chatbot do ZapBot Pro, configure:
# URL da API: http://SEU_IP:8080
# Instancia: zapbot-pro
# API Key: sua_chave_secreta_aqui`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Guia de Deploy</h2>
        <p className="text-gray-500 text-sm mt-1">
          Passo a passo para colocar o ZapBot Pro no ar 24h de graca
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5 min-w-0">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2 shrink-0" />
            <h4 className="font-bold text-sm">100% Gratuito</h4>
            <p className="text-xs text-gray-500 mt-1">Oracle Cloud ARM com 24GB RAM, para sempre</p>
          </CardContent>
        </Card>
        <Card className="border-info/30 bg-info/10 min-w-0">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-info mx-auto mb-2 shrink-0" />
            <h4 className="font-bold text-sm">30 minutos</h4>
            <p className="text-xs text-gray-500 mt-1">Tempo estimado de configuracao completa</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50 min-w-0">
          <CardContent className="p-4 text-center">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2 shrink-0" />
            <h4 className="font-bold text-sm">Seguro</h4>
            <p className="text-xs text-gray-500 mt-1">Open-source, sem intermedirios, voce controla tudo</p>
          </CardContent>
        </Card>
      </div>

      {/* Arquitetura */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-primary shrink-0" />
            Arquitetura do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Badge className="bg-success text-sm px-3 py-1">Cliente WhatsApp</Badge>
                <span className="text-gray-400">→</span>
                <Badge className="bg-primary text-sm px-3 py-1">Evolution API (Docker)</Badge>
                <span className="text-gray-400">→</span>
                <Badge className="bg-amber-600 text-sm px-3 py-1">ZapBot Pro (Next.js)</Badge>
              </div>
              <p className="text-xs text-gray-500 max-w-md">
                A Evolution API gerencia a conexao com o WhatsApp 24h. O ZapBot Pro processa as mensagens e envia respostas automaticas. Tudo roda na mesma VM do Oracle Cloud.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passo a passo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary shrink-0" />
            Passo a Passo
          </CardTitle>
          <CardDescription>
            Siga cada passo na ordem para configurar tudo corretamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Passo num={1} titulo="Criar conta no Oracle Cloud">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Acesse o site da Oracle Cloud e crie sua conta gratuita. Voce precisara de um cartao de credito para validacao (nao sera cobrado). Escolha a regiao mais proxima do Brasil (ex: Sao Paulo).
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.oracle.com/cloud/free/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  oracle.com/cloud/free
                </a>
              </Button>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <strong>Dica:</strong> Se der erro no cadastro, tente de novo em outro horario, use Chrome anonimo, ou use VPN. O Oracle costuma bloquear por regiao/IP.
                  </div>
                </div>
              </div>
            </div>
          </Passo>

          <Passo num={2} titulo="Criar a VM (Compute Instance)">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                No painel do Oracle Cloud, va em Compute &gt; Instances &gt; Create Instance. Escolha:
              </p>
              <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
                <li><strong>Image:</strong> Ubuntu 22.04 (Canonical)</li>
                <li><strong>Shape:</strong> Ampere A1 (ARM) - 4 OCPUs, 24 GB RAM</li>
                <li><strong>Boot volume:</strong> 50 GB</li>
                <li><strong>SSH Key:</strong> Gere uma nova ou use uma existente</li>
              </ul>
              <p className="text-xs text-gray-500">
                Anote o IP publico da VM (algo como 152.xx.xx.xx).
              </p>
            </div>
          </Passo>

          <Passo num={3} titulo="Acessar a VM e instalar Docker">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Acesse a VM via SSH e execute os comandos abaixo. Este script instala o Docker e sobe a Evolution API automaticamente:
              </p>
              <CopyBlock
                label="Script de instalacao"
                code={deployScript}
              />
            </div>
          </Passo>

          <Passo num={4} titulo="Criar o docker-compose.yml">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Crie o arquivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">docker-compose.yml</code> na pasta ~/zapbot-pro com o conteudo abaixo. Troque <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">sua_chave_secreta_aqui</code> por uma chave segura:
              </p>
              <CopyBlock
                label="docker-compose.yml"
                code={dockerCompose}
              />
              <p className="text-sm text-gray-600 leading-relaxed">
                Depois de salvar, execute:
              </p>
              <CopyBlock
                label="Comando"
                code="docker compose up -d"
              />
              <p className="text-xs text-gray-500">
                Acesse <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">http://SEU_IP:8080</code> no navegador - a Evolution API deve aparecer!
              </p>
            </div>
          </Passo>

          <Passo num={5} titulo="Criar instancia na Evolution API">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Com a Evolution API rodando, crie a instancia WhatsApp:
              </p>
              <CopyBlock
                label="Criar instancia"
                code={`curl -X POST http://SEU_IP:8080/instance/create \\
  -H "apikey: sua_chave_secreta_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "instanceName": "zapbot-pro",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'`}
              />
              <p className="text-sm text-gray-600 leading-relaxed">
                Isso vai retornar o QR Code para voce escanear com o WhatsApp do celular.
              </p>
            </div>
          </Passo>

          <Passo num={6} titulo="Configurar o ZapBot Pro">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                No painel do ZapBot Pro (aba Conexao), preencha:
              </p>
              <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
                <li><strong>URL da API:</strong> http://SEU_IP:8080</li>
                <li><strong>Nome da instancia:</strong> zapbot-pro</li>
                <li><strong>API Key:</strong> sua_chave_secreta_aqui</li>
              </ul>
              <p className="text-sm text-gray-600 leading-relaxed">
                Depois configure o chatbot na aba &quot;Chatbot&quot; e ative-o!
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs text-primary">
                    <strong>Pronto!</strong> Seu WhatsApp esta automatizado. O chatbot vai responder 24h por dia, 7 dias por semana!
                  </div>
                </div>
              </div>
            </div>
          </Passo>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            Configuracao de Webhooks
          </CardTitle>
          <CardDescription>
            Para receber mensagens em tempo real e enviar respostas automaticas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Os webhooks sao necessarios para que a Evolution API avise o ZapBot Pro quando uma mensagem chegar. Assim o bot pode processar e responder automaticamente:
          </p>
          <CopyBlock
            label="Webhook config"
            code={webhookSetup}
          />
        </CardContent>
      </Card>

      {/* Links uteis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary shrink-0" />
            Links Uteis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://github.com/EvolutionAPI/evolution-api" target="_blank" rel="noopener noreferrer">
                <Zap className="h-4 w-4 mr-2 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Evolution API (GitHub)</p>
                  <p className="text-[10px] text-gray-400">Documentacao oficial</p>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://doc.evolution-api.com" target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-2 text-info shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Documentacao da API</p>
                  <p className="text-[10px] text-gray-400">Referencia completa</p>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://www.oracle.com/cloud/free/" target="_blank" rel="noopener noreferrer">
                <Cloud className="h-4 w-4 mr-2 text-red-600 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Oracle Cloud Free Tier</p>
                  <p className="text-[10px] text-gray-400">Criar conta gratuita</p>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://hub.docker.com/r/atendai/evolution-api" target="_blank" rel="noopener noreferrer">
                <Server className="h-4 w-4 mr-2 text-purple-600 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium">Docker Hub</p>
                  <p className="text-[10px] text-gray-400">Imagem oficial</p>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-400 pb-16 lg:pb-0">
        ZapBot Pro - Automacao WhatsApp com Evolution API
      </p>
    </div>
  );
}