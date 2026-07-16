#!/usr/bin/env python3
"""
Substitui a secao SecaoRecuperacoes no painel-admin.tsx pela versao nova
que inclui lista de clientes e sub-abas.
"""

import re

FILE_PATH = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Encontrar o inicio e fim da secao SecaoRecuperacoes
# Inicio: o comentario antes da funcao
inicio_pattern = r"// =+\n// SECAO RECUPERACOES DE SENHA\n// =+"
fim_pattern = r"\n// =+\n// PAINEL ADMIN PRINCIPAL COM ABAS\n// =+"

inicio_match = re.search(inicio_pattern, content)
fim_match = re.search(fim_pattern, content)

if not inicio_match or not fim_match:
    print("ERRO: Nao encontrou os marcadores da secao")
    print(f"Inicio encontrado: {inicio_match is not None}")
    print(f"Fim encontrado: {fim_match is not None}")
    exit(1)

inicio_pos = inicio_match.start()
fim_pos = fim_match.start()

print(f"Secao encontrada: linha {content[:inicio_pos].count(chr(10))+1} ate linha {content[:fim_pos].count(chr(10))+1}")

NOVA_SECAO = r'''// =============================================
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
    recarregarDados();
  }, [recarregarDados]);

  // --- Pedidos de recuperacao ---
  const pendentes = pedidosRecuperacao.filter((p) => p.status === "PENDENTE");
  const resolvidos = pedidosRecuperacao.filter((p) => p.status !== "PENDENTE");
  const listaExibida = mostrarResolvidos ? [...pendentes, ...resolvidos] : pendentes;

  // --- Filtro de clientes para envio proativo ---
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return sistemas;
    const termo = buscaCliente.toLowerCase().trim();
    return sistemas.filter(
      (s) =>
        s.empresa.toLowerCase().includes(termo) ||
        s.responsavel.toLowerCase().includes(termo) ||
        s.email.toLowerCase().includes(termo) ||
        (s.telefone && s.telefone.includes(termo)) ||
        (s.cidade && s.cidade.toLowerCase().includes(termo))
    );
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
    } catch { return iso; }
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
      `Ola ${nomeCliente}! Aqui e o suporte do ZapFacil Pro.\n\nEstamos enviando seus dados de acesso ao sistema da ${nomeEmpresa}.\n\n*Link de acesso:*\nhttps://j1ewd51wcs60-d.space-z.ai/\n\nSeu e-mail de login: *${emailLogin}*\n\nCaso nao lembre a senha, podemos redefinir juntos. Basta responder esta mensagem.\n\nQualquer duvida, estou a disposicao!`
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
      `Ola ${nomeCliente}! Aqui e o suporte do ZapFacil Pro.\n\nVoce solicitou a recuperacao dos seus dados de acesso ao sistema da ${nomeEmpresa}.\n\n*Link de acesso:*\nhttps://j1ewd51wcs60-d.space-z.ai/\n\nSeu e-mail de login: *${pedido.email}*\n\nCaso nao lembre a senha, podemos redefinir juntos. Responda esta mensagem.\n\nQualquer duvida, estou a disposicao!`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
    resolverPedidoRecuperacao(pedido.id, "ENVIADO");
    toast.success("WhatsApp aberto com as credenciais! Pedido marcado como enviado.");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-amber-500" />
          Recuperacao de Acesso
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Envie dados de acesso para clientes ou atenda pedidos de recuperacao
        </p>
      </div>

      {/* Sub-abas */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setSubAba("enviar")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            subAba === "enviar"
              ? "bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          Enviar Dados de Acesso
          {sistemas.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              subAba === "enviar" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 dark:bg-gray-600 text-gray-500"
            }`}>{sistemas.length}</span>
          )}
        </button>
        <button
          onClick={() => setSubAba("pedidos")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            subAba === "pedidos"
              ? "bg-white dark:bg-gray-700 text-amber-700 dark:text-amber-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Clock className="h-4 w-4" />
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Nenhum cliente cadastrado</p>
                <p className="text-xs text-gray-400 mt-1">
                  Cadastre clientes na aba "Sistemas" para enviar dados de acesso.
                </p>
              </CardContent>
            </Card>
          ) : clientesFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Nenhum cliente encontrado</p>
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
                        ? "ring-2 ring-emerald-500 border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "hover:border-emerald-200 dark:hover:border-emerald-800"
                    }`}
                    onClick={() => handleSelecionarCliente(sistema)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm ${
                          isSelected ? "bg-emerald-600" : "bg-gray-400 dark:bg-gray-600"
                        }`}>
                          {(nomeExibido || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{nomeExibido}</span>
                            <Badge variant="outline" className="text-[10px]">{empresaExibida}</Badge>
                            <Badge className={`text-[10px] ${
                              sistema.status === "ATIVO" ? "bg-emerald-100 text-emerald-700"
                              : sistema.status === "TRIAL" ? "bg-blue-100 text-blue-700"
                              : sistema.status === "EXPIRADO" ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-500"
                            }`}>{sistema.status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{emailLogin}</span>
                            {telExibido && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{telExibido}</span>}
                            {sistema.cidade && <span>{sistema.cidade}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {temTelefone ? (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
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
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                  Enviar Dados de Acesso
                </DialogTitle>
              </DialogHeader>
              {clienteSelecionado && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                        {(clienteSelecionado.dadosRegistro?.usuario || clienteSelecionado.responsavel || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                          {clienteSelecionado.dadosRegistro?.usuario || clienteSelecionado.responsavel}
                        </p>
                        <p className="text-xs text-gray-500">{clienteSelecionado.dadosRegistro?.nomeEmpresa || clienteSelecionado.empresa}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-500">E-mail de login:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {clienteSelecionado.dadosRegistro?.email || clienteSelecionado.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-gray-500">Status:</span>
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700">{clienteSelecionado.status}</Badge>
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
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 whitespace-pre-line leading-relaxed">
                        Ola {clienteSelecionado.dadosRegistro?.usuario || clienteSelecionado.responsavel}! Aqui e o suporte do ZapFacil Pro.

Estamos enviando seus dados de acesso ao sistema da {clienteSelecionado.dadosRegistro?.nomeEmpresa || clienteSelecionado.empresa}.

Link de acesso:
https://j1ewd51wcs60-d.space-z.ai/

Seu e-mail de login: {clienteSelecionado.dadosRegistro?.email || clienteSelecionado.email}

Caso nao lembre a senha, podemos redefinir juntos. Basta responder esta mensagem.

Qualquer duvida, estou a disposicao!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 text-sm" onClick={() => setDialogConfirmarEnvio(false)}>Cancelar</Button>
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-sm" onClick={confirmarEnvioProativo} disabled={!telefoneEnvio.trim()}>
                      <MessageCircle className="h-4 w-4 mr-2" />Abrir WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-700 leading-relaxed">
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
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-amber-700">{pendentes.length}</p>
                <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium">Pendentes</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-emerald-700">
                  {pedidosRecuperacao.filter((p) => p.status === "ENVIADO").length}
                </p>
                <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">Enviados</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-gray-700">{pedidosRecuperacao.length}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Total</p>
              </CardContent>
            </Card>
          </div>

          {listaExibida.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <KeyRound className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Nenhum pedido de recuperacao</p>
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
                            <span className="font-semibold text-sm text-gray-900">{cliente?.nome || pedido.email}</span>
                            {cliente?.empresa && <Badge variant="outline" className="text-[10px]">{cliente.empresa}</Badge>}
                            <Badge className={`text-[10px] ${
                              pedido.status === "PENDENTE" ? "bg-amber-100 text-amber-700"
                              : pedido.status === "ENVIADO" ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                            }`}>
                              {pedido.status === "PENDENTE" ? "Pendente" : pedido.status === "ENVIADO" ? "Enviado" : "Ignorado"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{pedido.email}</span>
                            {pedido.telefoneSolicitado && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{pedido.telefoneSolicitado}</span>}
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatarDataISO(pedido.dataPedido)}</span>
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
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9" onClick={() => enviarCredenciaisWhatsApp(pedido)}>
                              <MessageCircle className="h-3.5 w-3.5 mr-1" />Enviar WhatsApp
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-9 text-gray-500 hover:text-gray-700"
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

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 leading-relaxed">
              <strong>Como funciona:</strong> Quando um cliente clica em "Esqueceu a senha?" na tela de login, ele informa o e-mail e opcionalmente o WhatsApp. O pedido aparece aqui com status "Pendente". Clique em "Enviar WhatsApp" para abrir o WhatsApp com a mensagem contendo o link de acesso e o e-mail do cliente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'''

# Montar o novo conteudo
novo_conteudo = content[:inicio_pos] + NOVA_SECAO + content[fim_pos:]

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(novo_conteudo)

print("SUCESSO: Secao SecaoRecuperacoes substituida com sucesso!")
print(f"Arquivo: {FILE_PATH}")
print(f"Tamanho original: {len(content)} chars")
print(f"Tamanho novo: {len(novo_conteudo)} chars")