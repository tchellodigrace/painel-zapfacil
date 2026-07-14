#!/usr/bin/env python3
"""
Script para adicionar sistema de recuperacao de senha do painel admin.
1. Atualiza o admin store com emailRecuperacao e resetarSenhaAdmin
2. Atualiza a TelaLoginAdmin com fluxo de recuperacao
3. Adiciona secao de config de email nas opcoes do admin
"""
import re

# ============================================
# 1. ATUALIZAR O ADMIN STORE
# ============================================
store_path = "/home/z/my-project/src/hooks/use-admin-store.ts"
with open(store_path, "r", encoding="utf-8") as f:
    store_content = f.read()

# 1a. Adicionar emailRecuperacao ao estado
old_state = """  adminCredenciais: { usuario: string; senha: string } | null;
  sistemas: SistemaCliente[];
  cobrancas: Cobranca[];
  pedidosRecuperacao: PedidoRecuperacao[];"""

new_state = """  adminCredenciais: { usuario: string; senha: string } | null;
  emailRecuperacao: string;
  sistemas: SistemaCliente[];
  cobrancas: Cobranca[];
  pedidosRecuperacao: PedidoRecuperacao[];"""

store_content = store_content.replace(old_state, new_state)

# 1b. Adicionar metodos na interface
old_methods = """  alterarSenha: (senhaAtual: string, novaSenha: string) => boolean;
  recarregarDados: () => void;"""

new_methods = """  alterarSenha: (senhaAtual: string, novaSenha: string) => boolean;
  resetarSenhaAdmin: (novaSenha: string) => void;
  configurarEmailRecuperacao: (email: string) => void;
  recarregarDados: () => void;"""

store_content = store_content.replace(old_methods, new_methods)

# 1c. Adicionar o create do store - emailRecuperacao
old_create = """  adminCredenciais: carregarCredenciais(),
  sistemas: migrarSistemas(carregar<SistemaCliente[]>("sistemas", [])),"""

new_create = """  adminCredenciais: carregarCredenciais(),
  emailRecuperacao: carregar<string>("email_recuperacao", ""),
  sistemas: migrarSistemas(carregar<SistemaCliente[]>("sistemas", [])),"""

store_content = store_content.replace(old_create, new_create)

# 1d. Adicionar as acoes depois de alterarSenha
old_alterar = """  alterarSenha: (senhaAtual, novaSenha) => {
    const cred = get().adminCredenciais;
    if (!cred) return false;
    if (cred.senha !== senhaAtual) return false;
 const novaCred = { usuario: cred.usuario, senha: novaSenha };
    salvar("credenciais", novaCred);
    set({ adminCredenciais: novaCred });
    return true;
  },"""

new_alterar = """  alterarSenha: (senhaAtual, novaSenha) => {
    const cred = get().adminCredenciais;
    if (!cred) return false;
    if (cred.senha !== senhaAtual) return false;
    const novaCred = { usuario: cred.usuario, senha: novaSenha };
    salvar("credenciais", novaCred);
    set({ adminCredenciais: novaCred });
    return true;
  },

  resetarSenhaAdmin: (novaSenha) => {
    const cred = get().adminCredenciais;
    const usuario = cred?.usuario || CREDENCIAIS_PADRAO.usuario;
    const novaCred = { usuario, senha: novaSenha };
    salvar("credenciais", novaCred);
    set({ adminCredenciais: novaCred });
  },

  configurarEmailRecuperacao: (email) => {
    salvar("email_recuperacao", email.trim().toLowerCase());
    set({ emailRecuperacao: email.trim().toLowerCase() });
  },"""

store_content = store_content.replace(old_alterar, new_alterar)

# 1e. Adicionar emailRecuperacao ao recarregarDados
old_rec = """  recarregarDados: () => {
    set({
      sistemas: migrarSistemas(carregar<SistemaCliente[]>("sistemas", [])),
      cobrancas: atualizarAtrasados(carregar<Cobranca[]>("cobrancas", [])),
      pedidosRecuperacao: carregar<PedidoRecuperacao[]>("pedidos_recuperacao", []),
    });
  },"""

new_rec = """  recarregarDados: () => {
    set({
      emailRecuperacao: carregar<string>("email_recuperacao", ""),
      sistemas: migrarSistemas(carregar<SistemaCliente[]>("sistemas", [])),
      cobrancas: atualizarAtrasados(carregar<Cobranca[]>("cobrancas", [])),
      pedidosRecuperacao: carregar<PedidoRecuperacao[]>("pedidos_recuperacao", []),
    });
  },"""

store_content = store_content.replace(old_rec, new_rec)

with open(store_path, "w", encoding="utf-8") as f:
    f.write(store_content)

print("OK: Admin store atualizado")

# ============================================
# 2. ATUALIZAR TELA LOGIN ADMIN COM RECUPERACAO
# ============================================
admin_path = "/home/z/my-project/src/components/erp/painel-admin.tsx"
with open(admin_path, "r", encoding="utf-8") as f:
    admin_content = f.read()

# 2a. Substituir toda a funcao TelaLoginAdmin pela versao com recuperacao
old_login = '''function TelaLoginAdmin({
  onAutenticado,
}: {
  onAutenticado: () => void;
}) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleLogin = () => {
    if (!usuario.trim() || !senha.trim()) {
      toast.error("Preencha usuario e senha.");
      return;
    }
    setCarregando(true);
    setTimeout(() => {
      // Garante credenciais padrão antes de verificar
      const store = useAdminStore.getState();
      if (!store.adminCredenciais) {
        store.configurarAdmin(CREDENCIAIS_PADRAO.usuario, CREDENCIAIS_PADRAO.senha);
      }
      const cred = useAdminStore.getState().adminCredenciais;
      if (
        cred &&
        cred.usuario === usuario.trim().toLowerCase() &&
        cred.senha === senha
      ) {
        sessionStorage.setItem("zapfacil_admin_session", "autenticado");
        toast.success("Bem-vindo, Admin!");
        onAutenticado();
      } else {
        toast.error("Usuario ou senha incorretos.");
      }
      setCarregando(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado esquerdo */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <img src="/logo-empresa.png" alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Painel do Gestor.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Gerencie todos os sistemas vendidos, acompanhe clientes, controle licencas e receita em um so lugar.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 text-[11px]">Acesso restrito ao administrador</span>
        </div>
      </div>

      {/* Lado direito */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center space-y-4">
            <img src="/logo-empresa.png" alt="Logo" className="h-20 w-auto mx-auto object-contain" />
            <h2 className="text-xl font-bold text-gray-900">Painel Admin</h2>
          </div>

          <div className="hidden lg:block space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-500">Acesso exclusivo do gestor do sistema</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Usuario</Label>
              <Input
                placeholder="admin"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-gray-400"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Senha</Label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="pr-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-gray-400"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-sm font-semibold rounded-xl"
              onClick={handleLogin}
              disabled={carregando}
            >
              {carregando ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                "Entrar no painel"
              )}
            </Button>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">Credenciais padrao</p>
            <p className="text-center text-sm">
              <span className="font-mono font-semibold text-gray-700">admin</span>
              <span className="text-gray-300 mx-2">/</span>
              <span className="font-mono font-semibold text-gray-700">zapfacil123</span>
            </p>
            <p className="text-[10px] text-gray-400 text-center">Troque a senha apos o primeiro acesso pelo icone de chave no painel</p>
          </div>
        </div>
      </div>
    </div>
  );
}'''

new_login = '''function TelaLoginAdmin({
  onAutenticado,
}: {
  onAutenticado: () => void;
}) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Estado de recuperacao
  const [dialogRecuperar, setDialogRecuperar] = useState(false);
  const [recuperarEmail, setRecuperarEmail] = useState("");
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<"email" | "redefinir">("email");
  const [novaSenhaRecuperacao, setNovaSenhaRecuperacao] = useState("");
  const [confirmarSenhaRecuperacao, setConfirmarSenhaRecuperacao] = useState("");
  const [carregandoRecuperacao, setCarregandoRecuperacao] = useState(false);

  const handleLogin = () => {
    if (!usuario.trim() || !senha.trim()) {
      toast.error("Preencha usuario e senha.");
      return;
    }
    setCarregando(true);
    setTimeout(() => {
      const store = useAdminStore.getState();
      if (!store.adminCredenciais) {
        store.configurarAdmin(CREDENCIAIS_PADRAO.usuario, CREDENCIAIS_PADRAO.senha);
      }
      const cred = useAdminStore.getState().adminCredenciais;
      if (
        cred &&
        cred.usuario === usuario.trim().toLowerCase() &&
        cred.senha === senha
      ) {
        sessionStorage.setItem("zapfacil_admin_session", "autenticado");
        toast.success("Bem-vindo, Admin!");
        onAutenticado();
      } else {
        toast.error("Usuario ou senha incorretos.");
      }
      setCarregando(false);
    }, 600);
  };

  const handleVerificarEmail = () => {
    if (!recuperarEmail.trim() || !recuperarEmail.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    setCarregandoRecuperacao(true);
    setTimeout(() => {
      const store = useAdminStore.getState();
      const emailCadastrado = store.emailRecuperacao || "";
      if (emailCadastrado && emailCadastrado === recuperarEmail.trim().toLowerCase()) {
        setEtapaRecuperacao("redefinir");
        toast.success("E-mail verificado! Defina sua nova senha.");
      } else if (!emailCadastrado) {
        toast.error("Nenhum e-mail de recuperacao configurado. Contate o suporte.");
      } else {
        toast.error("E-mail nao corresponde ao cadastrado para recuperacao.");
      }
      setCarregandoRecuperacao(false);
    }, 800);
  };

  const handleRedefinirSenha = () => {
    if (!novaSenhaRecuperacao.trim() || novaSenhaRecuperacao.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenhaRecuperacao !== confirmarSenhaRecuperacao) {
      toast.error("As senhas nao conferem.");
      return;
    }
    setCarregandoRecuperacao(true);
    setTimeout(() => {
      useAdminStore.getState().resetarSenhaAdmin(novaSenhaRecuperacao);
      setCarregandoRecuperacao(false);
      setDialogRecuperar(false);
      setEtapaRecuperacao("email");
      setRecuperarEmail("");
      setNovaSenhaRecuperacao("");
      setConfirmarSenhaRecuperacao("");
      toast.success("Senha redefinida com sucesso! Faca login com a nova senha.");
    }, 800);
  };

  const handleEnviarEmailRecuperacao = () => {
    const store = useAdminStore.getState();
    const emailCadastrado = store.emailRecuperacao;
    if (!emailCadastrado) {
      toast.error("Nenhum e-mail de recuperacao configurado.");
      return;
    }
    const assunto = encodeURIComponent("Recuperacao de Senha - Painel Admin ZapFacil Pro");
    const corpo = encodeURIComponent(
      "Voce solicitou a recuperacao de senha do Painel Admin ZapFacil Pro.\\n\\n" +
      "Para redefinir sua senha:\\n" +
      "1. Acesse o painel admin\\n" +
      "2. Clique em \\"Esqueceu a senha?\\"\\n" +
      "3. Informe este e-mail: " + emailCadastrado + "\\n" +
      "4. Defina sua nova senha\\n\\n" +
      "Se nao foi voce, ignore este e-mail.\\n\\n" +
      "Equipe ZapFacil Pro"
    );
    window.open("mailto:" + emailCadastrado + "?subject=" + assunto + "&body=" + corpo, "_self");
  };

  const fecharDialogRecuperar = () => {
    setDialogRecuperar(false);
    setEtapaRecuperacao("email");
    setRecuperarEmail("");
    setNovaSenhaRecuperacao("");
    setConfirmarSenhaRecuperacao("");
  };

  return (
    <>
      <div className="min-h-screen bg-white flex">
        {/* Lado esquerdo */}
        <div className="hidden lg:flex lg:w-[45%] bg-gray-900 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl" />
          </div>
          <div className="relative z-10">
            <img src="/logo-empresa.png" alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
          </div>
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Painel do Gestor.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Gerencie todos os sistemas vendidos, acompanhe clientes, controle licencas e receita em um so lugar.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 text-[11px]">Acesso restrito ao administrador</span>
          </div>
        </div>

        {/* Lado direito */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm space-y-8">
            <div className="lg:hidden text-center space-y-4">
              <img src="/logo-empresa.png" alt="Logo" className="h-20 w-auto mx-auto object-contain" />
              <h2 className="text-xl font-bold text-gray-900">Painel Admin</h2>
            </div>

            <div className="hidden lg:block space-y-1">
              <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
              <p className="text-sm text-gray-500">Acesso exclusivo do gestor do sistema</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Usuario</Label>
                <Input
                  placeholder="admin"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-gray-400"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Senha</Label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pr-11 h-12 text-sm rounded-xl border-gray-200 focus-visible:ring-gray-400"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-sm font-semibold rounded-xl"
                onClick={handleLogin}
                disabled={carregando}
              >
                {carregando ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Entrar no painel"
                )}
              </Button>
            </div>

            {/* Link de recuperacao */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setDialogRecuperar(true)}
                className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-4 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">Credenciais padrao</p>
              <p className="text-center text-sm">
                <span className="font-mono font-semibold text-gray-700">admin</span>
                <span className="text-gray-300 mx-2">/</span>
                <span className="font-mono font-semibold text-gray-700">zapfacil123</span>
              </p>
              <p className="text-[10px] text-gray-400 text-center">Troque a senha apos o primeiro acesso pelo icone de chave no painel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de recuperacao de senha */}
      <Dialog open={dialogRecuperar} onOpenChange={(v) => { if (!v) fecharDialogRecuperar(); else setDialogRecuperar(true); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-amber-500" />
              {etapaRecuperacao === "email" ? "Recuperar Senha" : "Redefinir Senha"}
            </DialogTitle>
          </DialogHeader>

          {etapaRecuperacao === "email" ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 leading-relaxed">
                  Informe o e-mail de recuperacao cadastrado nas configuracoes do painel admin. Se o e-mail corresponder, voce podera definir uma nova senha.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">E-mail de recuperacao</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={recuperarEmail}
                  onChange={(e) => setRecuperarEmail(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleVerificarEmail()}
                />
              </div>

              <Button
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-sm font-semibold rounded-xl"
                onClick={handleVerificarEmail}
                disabled={carregandoRecuperacao}
              >
                {carregandoRecuperacao ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Verificar E-mail"
                )}
              </Button>

              <div className="flex items-center gap-2 pt-1">
                <Separator className="flex-1" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">ou</span>
                <Separator className="flex-1" />
              </div>

              <Button
                variant="outline"
                className="w-full h-10 text-sm rounded-xl"
                onClick={handleEnviarEmailRecuperacao}
              >
                <Mail className="h-4 w-4 mr-2" />
                Receber instrucoes por e-mail
              </Button>
              <p className="text-[11px] text-gray-400 text-center">
                Abre seu cliente de e-mail com as instrucoes de recuperacao.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700">
                  E-mail verificado com sucesso! Defina sua nova senha abaixo.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Nova senha</Label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Minimo 6 caracteres"
                    value={novaSenhaRecuperacao}
                    onChange={(e) => setNovaSenhaRecuperacao(e.target.value)}
                    className="h-11 text-sm rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirmar nova senha</Label>
                <Input
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmarSenhaRecuperacao}
                  onChange={(e) => setConfirmarSenhaRecuperacao(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleRedefinirSenha()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-11 text-sm rounded-xl" onClick={fecharDialogRecuperar}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
                  onClick={handleRedefinirSenha}
                  disabled={carregandoRecuperacao}
                >
                  {carregandoRecuperacao ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redefinindo...
                    </span>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}'''

admin_content = admin_content.replace(old_login, new_login)

with open(admin_path, "w", encoding="utf-8") as f:
    f.write(admin_content)

print("OK: TelaLoginAdmin atualizada com recuperacao")

# ============================================
# 3. ADICIONAR CONFIGURACAO DE EMAIL NAS OPCOES DO ADMIN
# ============================================

with open(admin_path, "r", encoding="utf-8") as f:
    admin_content = f.read()

# Encontrar o DialogTrocarSenha e adicionar a secao de email de recuperacao depois dele
# Vou inserir um novo componente DialogConfiguracoesRecuperacao apos o DialogTrocarSenha

old_dialog_senha_end = '''    </Dialog>
  );
}


// =============================================
// TELA DE LOGIN DO ADMIN (CLARO)
// ============================================='''

new_dialog_senha_end = '''    </Dialog>
  );
}


// =============================================
// DIALOG CONFIGURAR EMAIL DE RECUPERACAO
// =============================================
function DialogEmailRecuperacao({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { emailRecuperacao, configurarEmailRecuperacao } = useAdminStore();
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(emailRecuperacao || "");
    }
  }, [open, emailRecuperacao]);

  const handleSalvar = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    setSalvando(true);
    setTimeout(() => {
      configurarEmailRecuperacao(email.trim());
      setSalvando(false);
      onOpenChange(false);
      toast.success("E-mail de recuperacao configurado com sucesso!");
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-500" />
            E-mail de Recuperacao
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              Configure um e-mail para recuperacao de senha do painel admin. Caso esqueca sua senha, voce podera redefini-la informando este e-mail na tela de login.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">E-mail de recuperacao</Label>
            <Input
              type="email"
              placeholder="admin@seuemail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 text-sm rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
            />
            <p className="text-[11px] text-gray-400">
              Este e-mail sera usado para verificar sua identidade ao recuperar a senha.
            </p>
          </div>

          {emailRecuperacao && (
            <div className="bg-gray-50 rounded-lg p-2.5 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-gray-600">
                E-mail atual: <span className="font-medium text-gray-900">{emailRecuperacao}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 text-sm h-10 rounded-xl" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm font-semibold h-10 rounded-xl"
              onClick={handleSalvar}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar E-mail"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// =============================================
// TELA DE LOGIN DO ADMIN (CLARO)
// ============================================='''

admin_content = admin_content.replace(old_dialog_senha_end, new_dialog_senha_end)

with open(admin_path, "w", encoding="utf-8") as f:
    f.write(admin_content)

print("OK: DialogEmailRecuperacao adicionado")

# ============================================
# 4. ADICIONAR BOTAO DE EMAIL NAS OPCOES DO PAINEL ADMIN
# ============================================

with open(admin_path, "r", encoding="utf-8") as f:
    admin_content = f.read()

# Adicionar estado para o dialog de email
old_state_admin = '  const [dialogTrocarSenha, setDialogTrocarSenha] = useState(false);'
new_state_admin = '  const [dialogTrocarSenha, setDialogTrocarSenha] = useState(false);\n  const [dialogEmailRecuperacao, setDialogEmailRecuperacao] = useState(false);'

admin_content = admin_content.replace(old_state_admin, new_state_admin)

# Adicionar botao de email recuperacao ao lado do botao de trocar senha no header
old_header_btns = '''            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                    onClick={() => setDialogTrocarSenha(true)}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Alterar Senha</TooltipContent>
              </Tooltip>
            </TooltipProvider>'''

new_header_btns = '''            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                    onClick={() => setDialogTrocarSenha(true)}
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Alterar Senha</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                    onClick={() => setDialogEmailRecuperacao(true)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>E-mail de Recuperacao</TooltipContent>
              </Tooltip>
            </TooltipProvider>'''

admin_content = admin_content.replace(old_header_btns, new_header_btns)

# Adicionar o DialogEmailRecuperacao no JSX (procurar pelo DialogTrocarSenha no PainelAdminConteudo)
# Preciso encontrar onde o DialogTrocarSenha e renderizado dentro de PainelAdminConteudo
old_dialog_render = '''          <DialogTrocarSenha open={dialogTrocarSenha} onOpenChange={setDialogTrocarSenha} />'''

new_dialog_render = '''          <DialogTrocarSenha open={dialogTrocarSenha} onOpenChange={setDialogTrocarSenha} />
          <DialogEmailRecuperacao open={dialogEmailRecuperacao} onOpenChange={setDialogEmailRecuperacao} />'''

admin_content = admin_content.replace(old_dialog_render, new_dialog_render)

with open(admin_path, "w", encoding="utf-8") as f:
    f.write(admin_content)

print("OK: Botao e dialog de email de recuperacao adicionados ao painel admin")
print("\nTodas as alteracoes foram aplicadas com sucesso!")