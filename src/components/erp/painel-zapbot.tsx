"use client";

import { useState, useMemo } from "react";
import { useZapBotStore } from "@/hooks/use-zapbot-store";
import { useERPStore } from "@/hooks/use-erp-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bot,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  Pencil,
  Power,
  PowerOff,
  MessageSquare,
  Settings,
  List,
  Send,
  Zap,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Clock,
  Globe,
  Key,
  Server,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// =============================================
// Sub-componentes
// =============================================

function SecaoConexao() {
  const {
    apiUrl, instanceName, apiKey, conectado,
    configurarConexao, setConectado,
  } = useZapBotStore();
  const [editUrl, setEditUrl] = useState(apiUrl);
  const [editInstance, setEditInstance] = useState(instanceName);
  const [editKey, setEditKey] = useState(apiKey);
  const [mostrarKey, setMostrarKey] = useState(false);
  const [salvo, setSalvo] = useState(!!apiUrl);

  const handleSalvar = () => {
    if (!editUrl.trim() || !editInstance.trim()) {
      toast.error("Preencha a URL e o nome da instancia.");
      return;
    }
    configurarConexao(
      editUrl.trim().replace(/\/$/, ""),
      editInstance.trim(),
      editKey.trim()
    );
    setSalvo(true);
    toast.success("Configuracao salva!");
  };

  const handleConectar = async () => {
    if (!apiUrl || !instanceName) {
      toast.error("Configure a conexao primeiro.");
      return;
    }
    toast.loading("Conectando ao WhatsApp...");
    try {
      const resp = await fetch(
        `${apiUrl}/instance/connect/${instanceName}?apikey=${apiKey}`,
        { method: "POST" }
      );
      const data = await resp.json();
      if (data.code === 200 || data.connected) {
        setConectado(true);
        toast.dismiss();
        toast.success("WhatsApp conectado com sucesso!");
      } else if (data.base64) {
        toast.dismiss();
        toast.info("Escaneie o QR Code no WhatsApp para conectar.");
        setConectado(true);
      } else {
        setConectado(false);
        toast.dismiss();
        toast.error("Erro ao conectar. Verifique os dados.");
      }
    } catch {
      // Demo mode - conexao simulada
      toast.dismiss();
      setConectado(true);
      toast.success("Modo demonstracao ativo! (Conexao simulada)");
    }
  };

  const handleDesconectar = async () => {
    try {
      await fetch(
        `${apiUrl}/instance/logout/${instanceName}?apikey=${apiKey}`,
        { method: "DELETE" }
      );
    } catch { /* demo */ }
    setConectado(false);
    toast.info("WhatsApp desconectado.");
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 dark:border-primary/40 min-w-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Server className="h-4 w-4 text-primary shrink-0" />
          Conexao Evolution API
          {conectado ? (
            <Badge className="ml-auto bg-primary/10 text-primary dark:bg-primary/30 dark:text-white/60 text-[10px]">
              <Wifi className="h-3 w-3 mr-1 shrink-0" /> Online
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-auto text-[10px]">
              <WifiOff className="h-3 w-3 mr-1 shrink-0" /> Offline
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!salvo ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="h-3 w-3 shrink-0" /> URL da API
              </Label>
              <Input
                placeholder="https://seu-servidor.com:8080"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="text-xs h-9"
              />
              <p className="text-[10px] text-muted-foreground">
                URL do servidor onde a Evolution API esta rodando
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Bot className="h-3 w-3 shrink-0" /> Nome da Instancia
                </Label>
                <Input
                  placeholder="minha-empresa"
                  value={editInstance}
                  onChange={(e) => setEditInstance(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Key className="h-3 w-3 shrink-0" /> API Key
                </Label>
                <div className="relative">
                  <Input
                    type={mostrarKey ? "text" : "password"}
                    placeholder="Sua API Key"
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                    className="text-xs h-9 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarKey(!mostrarKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              className="w-full h-9 bg-primary hover:bg-primary/90 text-xs font-bold"
              onClick={handleSalvar}
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Salvar Configuracao
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">URL</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={() => { navigator.clipboard.writeText(apiUrl); toast.success("URL copiada!"); }}
                >
                  <Copy className="h-3 w-3 mr-1 shrink-0" /> Copiar
                </Button>
              </div>
              <p className="text-xs font-mono break-all">{apiUrl}</p>
              <div className="flex gap-4">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Instancia</span>
                  <p className="text-xs font-mono">{instanceName}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className={`h-10 text-xs font-bold ${conectado ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
                onClick={conectado ? handleDesconectar : handleConectar}
              >
                {conectado ? (
                  <><PowerOff className="h-3.5 w-3.5 mr-1.5" /> Desconectar</>
                ) : (
                  <><Power className="h-3.5 w-3.5 mr-1.5" /> Conectar</>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-10 text-xs"
                onClick={() => setSalvo(false)}
              >
                <Settings className="h-3.5 w-3.5 mr-1.5" />
                Editar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SecaoBoasVindas() {
  const {
    mensagemBoasVindas, ativarBoasVindas,
    mensagemForaHorario, ativarForaHorario,
    horarioInicio, horarioFim,
    setMensagemBoasVindas, setAtivarBoasVindas,
    setMensagemForaHorario, setAtivarForaHorario,
    setHorarioInicio, setHorarioFim,
  } = useZapBotStore();
  const { empresa } = useERPStore();

  const preview = mensagemBoasVindas
    .replace("{empresa}", empresa.nome || "sua empresa")
    .replace(/\*/g, "")
    .replace(/_/g, "");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageSquare className="h-4 w-4 text-primary shrink-0" />
          Mensagens Automaticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Boas-vindas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Mensagem de Boas-vindas</Label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{ativarBoasVindas ? "Ativo" : "Inativo"}</span>
              <Switch checked={ativarBoasVindas} onCheckedChange={setAtivarBoasVindas} />
            </div>
          </div>
          <Textarea
            value={mensagemBoasVindas}
            onChange={(e) => setMensagemBoasVindas(e.target.value)}
            rows={4}
            className="text-xs resize-none"
            disabled={!ativarBoasVindas}
          />
          <p className="text-[10px] text-muted-foreground">
            Use {"{empresa}"} para inserir o nome da empresa automaticamente. Use *texto* para negrito.
          </p>
          {/* Preview */}
          {ativarBoasVindas && (
            <div className="bg-primary/5 dark:bg-primary/15 border border-primary/20 dark:border-primary/40 rounded-lg p-3">
              <p className="text-[10px] font-bold text-primary dark:text-primary/80 uppercase mb-1.5">Preview:</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">{preview}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Fora de horario */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Mensagem Fora de Horario</Label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{ativarForaHorario ? "Ativo" : "Inativo"}</span>
              <Switch checked={ativarForaHorario} onCheckedChange={setAtivarForaHorario} />
            </div>
          </div>
          {ativarForaHorario && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" /> Inicio
                  </Label>
                  <Input
                    type="time"
                    value={horarioInicio}
                    onChange={(e) => setHorarioInicio(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" /> Fim
                  </Label>
                  <Input
                    type="time"
                    value={horarioFim}
                    onChange={(e) => setHorarioFim(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>
              <Textarea
                value={mensagemForaHorario}
                onChange={(e) => setMensagemForaHorario(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
              <p className="text-[10px] text-muted-foreground">
                Use {"{inicio}"} e {"{fim}"} para os horarios.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SecaoRespostas() {
  const { respostas, adicionarResposta, editarResposta, toggleResposta, removerResposta } = useZapBotStore();
  const [novoGatilho, setNovoGatilho] = useState("");
  const [novaResposta, setNovaResposta] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editGatilho, setEditGatilho] = useState("");
  const [editRespostaVal, setEditRespostaVal] = useState("");

  const handleAdicionar = () => {
    if (!novoGatilho.trim() || !novaResposta.trim()) {
      toast.error("Preencha o gatilho e a resposta.");
      return;
    }
    adicionarResposta(novoGatilho, novaResposta);
    setNovoGatilho("");
    setNovaResposta("");
    toast.success("Resposta adicionada!");
  };

  const handleEditar = (id: string) => {
    if (!editGatilho.trim() || !editRespostaVal.trim()) return;
    editarResposta(id, editGatilho, editRespostaVal);
    setEditId(null);
    toast.success("Resposta atualizada!");
  };

  const ativas = useMemo(() => respostas.filter((r) => r.ativo), [respostas]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          Respostas Automaticas
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {ativas.length} ativa{ativas.length !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Form novo */}
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Gatilho (ex: horario)"
              value={novoGatilho}
              onChange={(e) => setNovoGatilho(e.target.value)}
              className="text-xs h-9 sm:col-span-1"
              onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
            />
            <Input
              placeholder="Resposta automatica..."
              value={novaResposta}
              onChange={(e) => setNovaResposta(e.target.value)}
              className="text-xs h-9 sm:col-span-1"
              onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
            />
            <Button
              size="sm"
              className="h-9 bg-amber-500 hover:bg-amber-600 text-xs"
              onClick={handleAdicionar}
            >
              <Plus className="h-3 w-3 mr-1 shrink-0" /> Adicionar
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Quando o cliente digitar o gatilho, o bot responde automaticamente.
          </p>
        </div>

        {/* Lista */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {respostas.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 italic">
              Nenhuma resposta configurada.
            </p>
          )}
          {respostas.map((r) => (
            <div
              key={r.id}
              className={`flex items-start gap-2 p-2.5 rounded-lg border transition-colors ${
                r.ativo
                  ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60"
              }`}
            >
              {editId === r.id ? (
                <div className="flex-1 space-y-1.5">
                  <Input
                    value={editGatilho}
                    onChange={(e) => setEditGatilho(e.target.value)}
                    className="text-xs h-7"
                    placeholder="Gatilho"
                  />
                  <Input
                    value={editRespostaVal}
                    onChange={(e) => setEditRespostaVal(e.target.value)}
                    className="text-xs h-7"
                    placeholder="Resposta"
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] text-primary"
                      onClick={() => handleEditar(r.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-0.5" /> Salvar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px]"
                      onClick={() => setEditId(null)}
                    >
                      <XCircle className="h-3 w-3 mr-0.5 shrink-0" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Switch
                    checked={r.ativo}
                    onCheckedChange={() => toggleResposta(r.id)}
                    className="mt-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                        {r.gatilho}
                      </Badge>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate">
                        {r.resposta}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => { setEditId(r.id); setEditGatilho(r.gatilho); setEditRespostaVal(r.resposta); }}
                  >
                    <Pencil className="h-3 w-3 shrink-0" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 shrink-0"
                    onClick={() => { removerResposta(r.id); toast.success("Removida."); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SecaoMenu() {
  const {
    menuAtivo, tituloMenu, itensMenu,
    setMenuAtivo, setTituloMenu,
    adicionarItemMenu, editarItemMenu, toggleItemMenu, removerItemMenu,
  } = useZapBotStore();
  const [novoTexto, setNovoTexto] = useState("");
  const [novaResp, setNovaResp] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTexto, setEditTexto] = useState("");
  const [editResp, setEditResp] = useState("");

  const handleAdicionar = () => {
    if (!novoTexto.trim() || !novaResp.trim()) {
      toast.error("Preencha o texto e a resposta.");
      return;
    }
    adicionarItemMenu(novoTexto, novaResp);
    setNovoTexto("");
    setNovaResp("");
    toast.success("Opcao adicionada ao menu!");
  };

  const handleEditar = (id: string) => {
    if (!editTexto.trim() || !editResp.trim()) return;
    editarItemMenu(id, editTexto, editResp);
    setEditId(null);
    toast.success("Opcao atualizada!");
  };

  const previewMenu = useMemo(() => {
    if (!menuAtivo || itensMenu.filter((i) => i.ativo).length === 0) return "";
    const ativos = itensMenu.filter((i) => i.ativo);
    const linhas = ativos.map((i) => `${i.numero}️⃣ ${i.texto}`);
    return `*${tituloMenu}*\n\n${linhas.join("\n")}\n\n0️⃣ Falar com atendente`;
  }, [menuAtivo, tituloMenu, itensMenu]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <List className="h-4 w-4 text-blue-500 shrink-0" />
            Menu Interativo
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{menuAtivo ? "Ativo" : "Inativo"}</span>
            <Switch checked={menuAtivo} onCheckedChange={setMenuAtivo} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {menuAtivo && (
          <>
            {/* Titulo do menu */}
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Titulo do Menu</Label>
              <Input
                value={tituloMenu}
                onChange={(e) => setTituloMenu(e.target.value)}
                className="text-xs h-9"
                placeholder="Menu de Atendimento"
              />
            </div>

            {/* Preview do menu */}
            {previewMenu && (
              <div className="bg-primary/5 dark:bg-primary/15 border border-primary/20 dark:border-primary/40 rounded-lg p-3">
                <p className="text-[10px] font-bold text-primary dark:text-primary/80 uppercase mb-1.5">
                  Preview do Menu:
                </p>
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {previewMenu.replace(/\*/g, "")}
                </p>
              </div>
            )}

            {/* Form novo item */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Adicionar Opcao</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder="Texto da opcao (ex: Horarios)"
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                  className="text-xs h-9"
                  onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
                />
                <Input
                  placeholder="Resposta do bot..."
                  value={novaResp}
                  onChange={(e) => setNovaResp(e.target.value)}
                  className="text-xs h-9"
                  onKeyDown={(e) => e.key === "Enter" && handleAdicionar()}
                />
                <Button
                  size="sm"
                  className="h-9 bg-blue-500 hover:bg-blue-600 text-xs"
                  onClick={handleAdicionar}
                >
                  <Plus className="h-3 w-3 mr-1 shrink-0" /> Adicionar
                </Button>
              </div>
            </div>

            {/* Lista de itens */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {itensMenu.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 italic">
                  Nenhuma opcao no menu.
                </p>
              )}
              {itensMenu.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border transition-colors ${
                    item.ativo
                      ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                      : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60"
                  }`}
                >
                  {editId === item.id ? (
                    <div className="flex-1 space-y-1.5">
                      <Input
                        value={editTexto}
                        onChange={(e) => setEditTexto(e.target.value)}
                        className="text-xs h-7"
                        placeholder="Texto"
                      />
                      <Input
                        value={editResp}
                        onChange={(e) => setEditResp(e.target.value)}
                        className="text-xs h-7"
                        placeholder="Resposta"
                      />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary" onClick={() => handleEditar(item.id)}>
                          <CheckCircle2 className="h-3 w-3 mr-0.5" /> Salvar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setEditId(null)}>
                          <XCircle className="h-3 w-3 mr-0.5 shrink-0" /> Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">{item.numero}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.texto}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{item.resposta}</p>
                      </div>
                      <Switch checked={item.ativo} onCheckedChange={() => toggleItemMenu(item.id)} className="mt-1 shrink-0" />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0" onClick={() => { setEditId(item.id); setEditTexto(item.texto); setEditResp(item.resposta); }}>
                        <Pencil className="h-3 w-3 shrink-0" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 shrink-0" onClick={() => { removerItemMenu(item.id); toast.success("Opcao removida."); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {!menuAtivo && (
          <div className="text-center py-6">
            <MousePointerClick className="h-8 w-8 text-muted-foreground mx-auto mb-2 shrink-0" />
            <p className="text-xs text-muted-foreground">Ative o menu interativo para configurar as opcoes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SecaoDisparo() {
  const { conectado, apiUrl, instanceName, apiKey } = useZapBotStore();
  const { clientes } = useERPStore();
  const [msgDisparo, setMsgDisparo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleDisparar = async () => {
    if (!msgDisparo.trim()) {
      toast.error("Escreva a mensagem para disparar.");
      return;
    }
    const clientesComTel = clientes.filter((c) => c.telefone);
    if (clientesComTel.length === 0) {
      toast.error("Nenhum cliente com telefone cadastrado.");
      return;
    }

    setEnviando(true);
    let sucesso = 0;
    let falha = 0;

    for (const cliente of clientesComTel) {
      try {
        const telLimpo = cliente.telefone.replace(/\D/g, "");
        const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;
        await fetch(
          `${apiUrl}/message/sendText/${instanceName}?apikey=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              number: `${numero}@s.whatsapp.net`,
              text: msgDisparo,
            }),
          }
        );
        sucesso++;
      } catch {
        falha++;
      }
    }

    setEnviando(false);
    if (falha === 0) {
      toast.success(`${sucesso} mensagem(ns) enviada(s)!`);
    } else {
      toast.warning(`${sucesso} enviada(s), ${falha} falha(s).`);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Send className="h-4 w-4 text-purple-500 shrink-0" />
          Disparo em Massa
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {clientes.filter((c) => c.telefone).length} contato(s)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={msgDisparo}
          onChange={(e) => setMsgDisparo(e.target.value)}
          rows={4}
          className="text-xs resize-none"
          placeholder="Digite a mensagem que sera enviada para todos os clientes com telefone cadastrado..."
        />
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Use *texto* para negrito e _texto_ para italico no WhatsApp.
          </p>
          <Button
            size="sm"
            className="h-9 bg-purple-600 hover:bg-purple-700 text-xs"
            onClick={handleDisparar}
            disabled={enviando || !msgDisparo.trim()}
          >
            {enviando ? (
              <><RefreshCw className="h-3 w-3 mr-1 animate-spin shrink-0" /> Enviando...</>
            ) : (
              <><Send className="h-3 w-3 mr-1 shrink-0" /> Disparar para Todos</>
            )}
          </Button>
        </div>
        {!conectado && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400">
              WhatsApp nao conectado. Configure a Evolution API na secao de conexao para habilitar o disparo real.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SecaoLog() {
  const { mensagens, limparLog } = useZapBotStore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-gray-500 shrink-0" />
            Historico de Mensagens
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {mensagens.length}
            </Badge>
          </CardTitle>
          {mensagens.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] text-red-500"
              onClick={() => { limparLog(); toast.success("Log limpo."); }}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-1.5">
          {mensagens.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30 shrink-0" />
              <p className="text-xs text-muted-foreground italic">
                Nenhuma mensagem registrada ainda.
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                As mensagens aparecerao aqui quando o bot estiver ativo.
              </p>
            </div>
          )}
          {mensagens.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${
                msg.tipo === "enviada"
                  ? "bg-primary/5 dark:bg-primary/15 border-primary/15 dark:border-primary/40"
                  : "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.tipo === "enviada"
                  ? "bg-primary/15 dark:bg-primary/40"
                  : "bg-blue-200 dark:bg-blue-800"
              }`}>
                {msg.tipo === "enviada" ? (
                  <Send className="h-3 w-3 text-primary dark:text-primary/80 shrink-0" />
                ) : (
                  <MessageSquare className="h-3 w-3 text-blue-700 dark:text-blue-300 shrink-0" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="font-medium truncate">{msg.nome || msg.numero}</span>
                  <span className="text-[9px] text-muted-foreground shrink-0">{msg.data} {msg.hora}</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">{msg.conteudo}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Painel Principal
// =============================================

export function PainelZapBot() {
  const { conectado, respostas, menuAtivo, itensMenu, ativarBoasVindas } = useZapBotStore();

  const totalRegras = respostas.filter((r) => r.ativo).length + (menuAtivo ? itensMenu.filter((i) => i.ativo).length : 0);
  const regrasAtivas = ativarBoasVindas ? totalRegras + 1 : totalRegras;

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border shadow-sm text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1.5 ${conectado ? "bg-primary/50 shadow-sm shadow-primary" : "bg-gray-300"}`} />
          <p className="text-base sm:text-lg font-black font-display">{conectado ? "Online" : "Offline"}</p>
          <p className="text-[9px] text-muted-foreground uppercase font-bold">Status</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border shadow-sm text-center">
          <p className="text-base sm:text-lg font-black text-primary font-display">{regrasAtivas}</p>
          <p className="text-[9px] text-muted-foreground uppercase font-bold">Regras Ativas</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border shadow-sm text-center">
          <p className="text-base sm:text-lg font-black text-amber-600 font-display">{respostas.length}</p>
          <p className="text-[9px] text-muted-foreground uppercase font-bold">Respostas</p>
        </div>
      </div>

      {/* Configuracao + Boas-vindas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecaoConexao />
        <SecaoBoasVindas />
      </div>

      {/* Respostas + Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecaoRespostas />
        <SecaoMenu />
      </div>

      {/* Disparo em massa */}
      <SecaoDisparo />

      {/* Log de mensagens */}
      <SecaoLog />
    </div>
  );
}