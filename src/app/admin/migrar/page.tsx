"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface MigrationLog {
  tipo: "info" | "success" | "warn" | "error";
  msg: string;
}

export default function MigrarSupabasePage() {
  const [executando, setExecutando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [stats, setStats] = useState({ success: 0, skipped: 0, errors: 0 });

  const appendLog = (tipo: MigrationLog["tipo"], msg: string) => {
    setLogs((prev) => [...prev, { tipo, msg }]);
  };

  const executarMigracao = async () => {
    setExecutando(true);
    setConcluido(false);
    setLogs([]);
    setStats({ success: 0, skipped: 0, errors: 0 });

    const ADMIN_PREFIX = "zapfacil_admin_";

    appendLog("info", "Iniciando migracao localStorage -> Supabase...");

    const sistemasRaw = localStorage.getItem(`${ADMIN_PREFIX}sistemas`);
    if (!sistemasRaw) {
      appendLog("warn", "Nenhum sistema encontrado no localStorage.");
      setExecutando(false);
      setConcluido(true);
      return;
    }

    let sistemas: any[];
    try {
      sistemas = JSON.parse(sistemasRaw);
    } catch (e) {
      appendLog("error", "Erro ao ler sistemas: " + String(e));
      setExecutando(false);
      return;
    }

    appendLog("info", `${sistemas.length} sistema(s) encontrado(s).`);

    let success = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < sistemas.length; i++) {
      const s = sistemas[i];
      appendLog("info", `[${i + 1}/${sistemas.length}] Migrando: ${s.empresa} (${s.email || "sem email"})`);

      if (s.dadosRegistro && s.dadosRegistro.email) {
        try {
          const resCliente = await fetch("/api/auth/registrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: s.dadosRegistro.email,
              senha: s.dadosRegistro.senha,
              nomeEmpresa: s.dadosRegistro.nomeEmpresa || s.empresa,
              nomeResponsavel: s.dadosRegistro.usuario || s.responsavel,
              telefone: s.dadosRegistro.telefone || s.telefone || "",
            }),
          });

          const dataCliente = await resCliente.json();

          if (resCliente.ok && dataCliente.ok) {
            appendLog("success", `  Cliente criado: ${dataCliente.cliente.email}`);
          } else {
            appendLog("warn", `  Cliente nao criado: ${dataCliente.error}. Continuando...`);
          }
        } catch (e: any) {
          appendLog("error", `  Erro ao criar cliente: ${e?.message || String(e)}`);
        }
      }

      try {
        const resSistema = await fetch("/api/sistemas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empresa: s.empresa,
            responsavel: s.responsavel,
            telefone: s.telefone,
            email: s.email || s.dadosRegistro?.email || "",
            cidade: s.cidade,
            dataInstalacao: s.dataInstalacao,
            dataVencimento: s.dataVencimento,
            status: s.status,
            plano: s.plano,
            tipoLicenca: s.tipoLicenca,
            valorMensal: s.valorMensal,
            valorAquisicao: s.valorAquisicao,
            taxaInstalacao: s.taxaInstalacao,
            observacoes: s.observacoes,
            zapbotAtivo: !!s.zapbotAtivo,
            disparoAtivo: !!s.disparoAtivo,
            funilAtivo: !!s.funilAtivo,
            fluxosAtivo: !!s.fluxosAtivo,
          }),
        });

        const dataSistema = await resSistema.json();

        if (resSistema.ok && dataSistema.ok) {
          appendLog("success", `  Sistema criado no Supabase`);
          success++;
        } else {
          appendLog("error", `  Erro ao criar sistema: ${dataSistema.error || "erro desconhecido"}`);
          errors++;
        }
      } catch (e: any) {
        appendLog("error", `  Erro ao criar sistema: ${e?.message || String(e)}`);
        errors++;
      }

      await new Promise((r) => setTimeout(r, 150));
    }

    appendLog("info", "=== Migracao concluida ===");
    appendLog("info", `Sucesso: ${success} | Pulados: ${skipped} | Erros: ${errors}`);
    setStats({ success, skipped, errors });
    setConcluido(true);
    setExecutando(false);

    if (errors === 0) {
      toast.success(`Migracao concluida! ${success} sistema(s) migrado(s).`);
    } else {
      toast.warning(`Migracao concluida com ${errors} erro(s). Veja os detalhes.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Migrar dados para Supabase
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Migra sistemas e clientes do localStorage para o banco Supabase
              </p>
            </div>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Migracao de dados
            </CardTitle>
            <CardDescription>
              Este processo vai copiar todos os sistemas e clientes que estao no seu
              navegador para o banco de dados central Supabase. Isso permite que
              clientes facam login de qualquer dispositivo (celular, computador, etc).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Antes de migrar, certifique-se:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc pl-5 space-y-1">
                <li>O schema SQL foi executado no Supabase (SQL Editor)</li>
                <li>As variaveis de ambiente estao configuradas no Vercel</li>
                <li>O ultimo deploy no Vercel esta &quot;Ready&quot;</li>
                <li>Voce esta migrando do NAVEGADOR onde os dados estao salvos</li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Atencao:</strong> este processo nao apaga seus dados locais.
                Ele apenas cria uma copia no Supabase. Se algo der errado, seus dados
                antigos continuam intactos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={executarMigracao}
                disabled={executando}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                {executando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrando...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Iniciar migracao
                  </>
                )}
              </Button>
            </div>

            {concluido && (
              <div className="bg-primary/5 dark:bg-primary/15 border border-primary/20 dark:border-primary/40 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary dark:text-primary/80" />
                  <p className="text-sm font-semibold text-primary dark:text-white/80">
                    Migracao concluida!
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-white dark:bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sucesso</p>
                    <p className="text-lg font-bold text-primary dark:text-primary/80 font-display">
                      {stats.success}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pulados</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-display">
                      {stats.skipped}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Erros</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400 font-display">
                      {stats.errors}
                    </p>
                  </div>
                </div>
                {stats.errors === 0 ? (
                  <p className="text-xs text-primary dark:text-primary/80 mt-3">
                    Tudo certo! Agora clientes podem logar de qualquer dispositivo.
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">
                    Alguns erros ocorreram. Veja o log abaixo para detalhes.
                  </p>
                )}
              </div>
            )}

            {stats.errors > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                  Diagnóstico de erro
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mb-3">
                  Se a migração falhou com &quot;Erro interno do servidor&quot;, abra o
                  link abaixo no navegador para ver o diagnóstico completo. Copie o JSON
                  de resposta e envie para análise.
                </p>
                <a
                  href="/api/debug-supabase"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 px-3 py-2 rounded-md border border-red-300 dark:border-red-700"
                >
                  /api/debug-supabase ↗
                </a>
              </div>
            )}

            {logs.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Log de execucao:
                </p>
                <div className="bg-gray-900 dark:bg-black rounded-lg p-3 max-h-80 overflow-y-auto font-mono text-xs space-y-1">
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.tipo === "success"
                          ? "text-primary/80"
                          : log.tipo === "error"
                          ? "text-red-400"
                          : log.tipo === "warn"
                          ? "text-amber-400"
                          : "text-gray-300"
                      }
                    >
                      {log.tipo === "success" && "✓ "}
                      {log.tipo === "error" && "✗ "}
                      {log.tipo === "warn" && "⚠ "}
                      {log.msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {concluido && stats.errors === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Proximos passos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>
                Seus dados estao agora no Supabase. Para validar, faca logout e login
                novamente no admin — voce deve ver os mesmos sistemas.
              </p>
              <p>
                Peca para o seu cliente tentar logar pelo celular com o mesmo
                email/senha. Agora vai funcionar!
              </p>
              <p>
                Para gerenciar feature flags (ZapBot, Disparo, Funil, Fluxos),
                edite cada sistema no painel admin — as alteracoes sincronizam
                automaticamente com todos os dispositivos.
              </p>
              <Link href="/admin">
                <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-white">
                  Voltar para o painel admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
