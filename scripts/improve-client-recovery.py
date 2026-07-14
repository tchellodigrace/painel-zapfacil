#!/usr/bin/env python3
"""
Melhora a recuperacao de senha do CLIENTE na tela de login.
Adiciona 3 opcoes: auto-recuperacao, email, e pedir ao admin.
"""
login_path = "/home/z/my-project/src/components/erp/tela-login.tsx"
with open(login_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Adicionar estados novos de recuperacao
old_states = """  const [dialogRecuperar, setDialogRecuperar] = useState(false);
  const [recuperarEmail, setRecuperarEmail] = useState("");
  const [recuperarTelefone, setRecuperarTelefone] = useState("");
  const [enviandoPedido, setEnviandoPedido] = useState(false);"""

new_states = """  // Estados de recuperacao
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
  const [credenciaisEncontradas, setCredenciaisEncontradas] = useState<{ email: string; nome: string } | null>(null);"""

content = content.replace(old_states, new_states)

# 2. Substituir handleRecuperarSenha por versoes novas
old_handler = """  const handleRecuperarSenha = useCallback(() => {
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
      setDialogRecuperar(false);
      setRecuperarEmail("");
      setRecuperarTelefone("");
      toast.success(
        "Pedido enviado ao administrador! Voce recebera seus dados de acesso pelo WhatsApp."
      );
    }, 800);
  }, [recuperarEmail, recuperarTelefone]);"""

new_handler = """  // === RECUPERACAO DE SENHA ===

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
      "Ol\\u00e1 " + cred.nomeResponsavel + "!\\n\\n" +
      "Aqui est\\u00e3o seus dados de acesso ao sistema ZapFacil Pro:\\n\\n" +
      "Link de acesso: https://j1ewd51wcs60-d.space-z.ai/\\n" +
      "E-mail de login: " + cred.email + "\\n" +
      "Empresa: " + cred.nomeEmpresa + "\\n\\n" +
      "Caso tenha esquecido a senha, entre em contato com o suporte.\\n\\n" +
      "Equipe ZapFacil Pro"
    );
    window.open("mailto:" + cred.email + "?subject=" + assunto + "&body=" + corpo, "_self");
  }, []);"""

content = content.replace(old_handler, new_handler)

# 3. Substituir o Dialog de recuperacao inteiro
old_dialog = '''      {/* Dialog Esqueceu a Senha */}
      <Dialog open={dialogRecuperar} onOpenChange={setDialogRecuperar}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Lock className="h-5 w-5 text-emerald-600" />
              Recuperar acesso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Informe o e-mail usado no cadastro. O administrador enviara seus dados de acesso pelo WhatsApp.
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">E-mail cadastrado</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={recuperarEmail}
                  onChange={(e) => setRecuperarEmail(e.target.value)}
                  className="pl-11 h-11 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                  onKeyDown={(e) => e.key === "Enter" && handleRecuperarSenha()}
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
                  className="pl-11 h-11 text-sm rounded-xl border-gray-200 focus-visible:ring-emerald-500"
                  onKeyDown={(e) => e.key === "Enter" && handleRecuperarSenha()}
                />
              </div>
              <p className="text-[11px] text-gray-400">Se informado, o admin usara este numero para contato</p>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-xl text-sm"
                onClick={() => setDialogRecuperar(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
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
      </Dialog>'''

new_dialog = '''      {/* Dialog Recuperar Acesso */}
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
      </Dialog>'''

content = content.replace(old_dialog, new_dialog)

# 4. Adicionar MessageCircle e ShieldCheck aos imports (se nao existirem)
# Verificar se MessageCircle ja esta importado
if "MessageCircle" not in content:
    # Adicionar apos uma import existente do lucide
    content = content.replace(
        'import {\n  Eye,\n  EyeOff,\n  Lock,',
        'import {\n  Eye,\n  EyeOff,\n  Lock,\n  MessageCircle,'
    )

if "ShieldCheck" not in content:
    content = content.replace(
        'import {\n  Eye,\n  EyeOff,\n  Lock,',
        'import {\n  Eye,\n  EyeOff,\n  Lock,\n  ShieldCheck,'
    )

# Verificar se User esta importado (usado como Users)
# Na verdade so precisamos dos que ja estao importados

with open(login_path, "w", encoding="utf-8") as f:
    f.write(content)

print("OK: Tela de login do cliente atualizada com 3 opcoes de recuperacao")