#!/usr/bin/env python3
"""
Adiciona fluxo de "Primeiro Acesso" ao painel admin.
Quando o sistema e atualizado e o localStorage e limpo, aparece
uma tela de configuracao inicial ao inves do login padrao.
"""
import re

# ============================================
# 1. ATUALIZAR O ADMIN STORE
# ============================================
store_path = "/home/z/my-project/src/hooks/use-admin-store.ts"
with open(store_path, "r", encoding="utf-8") as f:
    store = f.read()

# 1a. Adicionar campo ao estado
store = store.replace(
    "  emailRecuperacao: string;",
    "  emailRecuperacao: string;\n  primeiroAcesso: boolean;\n  dadosGestor: { nome: string; email: string; telefone: string } | null;"
)

# 1b. Adicionar metodos na interface (depois de configurarEmailRecuperacao)
store = store.replace(
    "  configurarEmailRecuperacao: (email: string) => void;\n  recarregarDados: () => void;",
    "  configurarEmailRecuperacao: (email: string) => void;\n  configurarPrimeiroAcesso: (dados: { usuario: string; senha: string; nome: string; email: string; telefone: string; emailRecuperacao: string }) => void;\n  resetarPrimeiroAcesso: () => void;\n  recarregarDados: () => void;"
)

# 1c. Adicionar ao create
store = store.replace(
    '  emailRecuperacao: carregar<string>("email_recuperacao", ""),',
    '  emailRecuperacao: carregar<string>("email_recuperacao", ""),\n  primeiroAcesso: carregar<boolean>("primeiro_acesso", false),\n  dadosGestor: carregar<{ nome: string; email: string; telefone: string } | null>("dados_gestor", null),'
)

# 1d. Adicionar acoes (depois de configurarEmailRecuperacao)
old_email_config = '''  configurarEmailRecuperacao: (email) => {
    salvar("email_recuperacao", email.trim().toLowerCase());
    set({ emailRecuperacao: email.trim().toLowerCase() });
  },'''

new_email_config = '''  configurarEmailRecuperacao: (email) => {
    salvar("email_recuperacao", email.trim().toLowerCase());
    set({ emailRecuperacao: email.trim().toLowerCase() });
  },

  configurarPrimeiroAcesso: (dados) => {
    const cred = { usuario: dados.usuario.trim().toLowerCase(), senha: dados.senha };
    salvar("credenciais", cred);
    salvar("email_recuperacao", dados.emailRecuperacao.trim().toLowerCase());
    salvar("primeiro_acesso", true);
    salvar("dados_gestor", { nome: dados.nome.trim(), email: dados.email.trim().toLowerCase(), telefone: dados.telefone.trim() });
    set({
      adminCredenciais: cred,
      emailRecuperacao: dados.emailRecuperacao.trim().toLowerCase(),
      primeiroAcesso: true,
      dadosGestor: { nome: dados.nome.trim(), email: dados.email.trim().toLowerCase(), telefone: dados.telefone.trim() },
    });
  },

  resetarPrimeiroAcesso: () => {
    salvar("primeiro_acesso", false);
    set({ primeiroAcesso: false });
  },'''

store = store.replace(old_email_config, new_email_config)

# 1e. Adicionar ao recarregarDados
store = store.replace(
    '      emailRecuperacao: carregar<string>("email_recuperacao", ""),',
    '      emailRecuperacao: carregar<string>("email_recuperacao", ""),\n      primeiroAcesso: carregar<boolean>("primeiro_acesso", false),\n      dadosGestor: carregar<{ nome: string; email: string; telefone: string } | null>("dados_gestor", null),'
)

with open(store_path, "w", encoding="utf-8") as f:
    f.write(store)
print("OK: Store atualizado")

# ============================================
# 2. ADICIONAR TELA PRIMEIRO ACESSO + ATUALIZAR LOGICAS NO PAINEL-ADMIN
# ============================================
admin_path = "/home/z/my-project/src/components/erp/painel-admin.tsx"
with open(admin_path, "r", encoding="utf-8") as f:
    admin = f.read()

# 2a. Criar componente TelaPrimeiroAcesso (antes do CREDENCIAIS_PADRAO)
old_const = '''// =============================================
// TELA DE LOGIN DO ADMIN (CLARO)
// =============================================
const CREDENCIAIS_PADRAO = { usuario: "admin", senha: "zapfacil123" };'''

new_const = '''// =============================================
// TELA PRIMEIRO ACESSO ADMIN
// =============================================
function TelaPrimeiroAcesso({
  onConcluido,
}: {
  onConcluido: () => void;
}) {
  const { configurarPrimeiroAcesso } = useAdminStore();
  const [etapa, setEtapa] = useState(0);
  const [carregando, setCarregando] = useState(false);

  // Etapa 0: Dados pessoais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Etapa 1: Credenciais de acesso
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Etapa 2: E-mail de recuperacao
  const [emailRecuperacao, setEmailRecuperacao] = useState("");

  const podeAvancarEtapa0 = nome.trim().length >= 2 && email.trim().includes("@") && telefone.trim().length >= 10;
  const podeAvancarEtapa1 = usuario.trim().length >= 3 && senha.length >= 6 && senha === confirmarSenha;
  const podeConcluir = emailRecuperacao.trim().includes("@");

  const handleConcluir = () => {
    if (!podeConcluir) return;
    setCarregando(true);
    setTimeout(() => {
      configurarPrimeiroAcesso({
        usuario: usuario.trim(),
        senha,
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        emailRecuperacao: emailRecuperacao.trim(),
      });
      sessionStorage.setItem("zapfacil_admin_session", "autenticado");
      setCarregando(false);
      toast.success("Configuracao concluida! Bem-vindo ao painel admin.");
      onConcluido();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Lado esquerdo - branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-500/30 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <img src="/logo-empresa.png" alt="Logo" className="h-16 w-auto object-contain brightness-0 invert" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">Primeiro Acesso</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Configure seu painel<br />de gestao.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Preencha seus dados para personalizar o acesso ao painel administrativo. Essa configuracao sera necessaria apenas na primeira vez ou apos atualizacoes do sistema.
          </p>
        </div>
        <div className="relative z-10">
          {/* Steps indicator */}
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  etapa > i
                    ? "bg-emerald-500 text-white"
                    : etapa === i
                      ? "bg-white text-gray-900 ring-2 ring-emerald-400"
                      : "bg-white/10 text-gray-500"
                }`}>
                  {etapa > i ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < 2 && (
                  <div className={`w-8 h-0.5 rounded ${etapa > i ? "bg-emerald-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
            <div className="ml-3 text-[11px] text-gray-400">
              {etapa === 0 && "Dados pessoais"}
              {etapa === 1 && "Credenciais"}
              {etapa === 2 && "Seguranca"}
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header mobile */}
          <div className="lg:hidden text-center space-y-4">
            <img src="/logo-empresa.png" alt="Logo" className="h-20 w-auto mx-auto object-contain" />
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 rounded-full px-3 py-1 mb-2">
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Primeiro Acesso</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Configure seu painel</h2>
              <p className="text-sm text-gray-500 mt-1">Etapa {etapa + 1} de 3</p>
            </div>
            {/* Mobile steps */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    etapa > i
                      ? "bg-emerald-500 text-white"
                      : etapa === i
                        ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500"
                        : "bg-gray-100 text-gray-400"
                  }`}>
                    {etapa > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  {i < 2 && <div className={`w-6 h-0.5 rounded ${etapa > i ? "bg-emerald-500" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Etapa 0: Dados pessoais */}
          {etapa === 0 && (
            <div className="space-y-5">
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Seus dados</h2>
                <p className="text-sm text-gray-500">Informe seus dados de gestor</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Nome completo</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Seu nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="pl-10 h-12 text-sm rounded-xl border-gray-200"
                    autoFocus
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="gestor@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-sm rounded-xl border-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="11999999999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 h-12 text-sm rounded-xl border-gray-200"
                  />
                </div>
                <p className="text-[11px] text-gray-400">Apenas numeros, com DDD</p>
              </div>
              <Button
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-sm font-semibold rounded-xl"
                onClick={() => setEtapa(1)}
                disabled={!podeAvancarEtapa0}
              >
                Prosseguir
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Etapa 1: Credenciais */}
          {etapa === 1 && (
            <div className="space-y-5">
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Credenciais de acesso</h2>
                <p className="text-sm text-gray-500">Defina usuario e senha para o painel</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Usuario de acesso</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="admin"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value.trim().toLowerCase())}
                    className="pl-10 h-12 text-sm rounded-xl border-gray-200"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-400">Minimo 3 caracteres. Sera usado para login.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Minimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 pr-10 h-12 text-sm rounded-xl border-gray-200"
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
                <Label className="text-sm font-medium text-gray-700">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className={`pl-10 h-12 text-sm rounded-xl border-gray-200 ${
                      confirmarSenha && senha !== confirmarSenha ? "border-red-300 focus-visible:ring-red-400" : ""
                    }`}
                  />
                </div>
                {confirmarSenha && senha !== confirmarSenha && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> As senhas nao conferem
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 text-sm rounded-xl" onClick={() => setEtapa(0)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-12 bg-gray-900 hover:bg-gray-800 text-sm font-semibold rounded-xl"
                  onClick={() => setEtapa(2)}
                  disabled={!podeAvancarEtapa1}
                >
                  Prosseguir
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Etapa 2: Email de recuperacao */}
          {etapa === 2 && (
            <div className="space-y-5">
              <div className="hidden lg:block space-y-1">
                <h2 className="text-2xl font-bold text-gray-900">Seguranca</h2>
                <p className="text-sm text-gray-500">Configure a recuperacao de senha</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">E-mail de recuperacao</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Caso esqueca sua senha, voce podera redefini-la informando este e-mail na tela de login. Recomendamos usar um e-mail diferente do pessoal para maior seguranca.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">E-mail de recuperacao</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="recuperacao@seuemail.com"
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    className="pl-10 h-12 text-sm rounded-xl border-gray-200"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEmailRecuperacao(email)}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Usar o mesmo e-mail ({email})
                </button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 text-sm rounded-xl" onClick={() => setEtapa(1)}>
                  Voltar
                </Button>
                <Button
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold rounded-xl"
                  onClick={handleConcluir}
                  disabled={carregando || !podeConcluir}
                >
                  {carregando ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Configurando...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Concluir configuracao
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Info footer */}
          <div className="text-center">
            <p className="text-[11px] text-gray-400">
              Essa configuracao sera necessaria apenas na primeira vez.
              <br />Apos atualizacoes do sistema, basta refazer este passo rapidamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// =============================================
// TELA DE LOGIN DO ADMIN (CLARO)
// =============================================
const CREDENCIAIS_PADRAO = { usuario: "admin", senha: "zapfacil123" };'''

admin = admin.replace(old_const, new_const)

# 2b. Adicionar import ArrowRight
admin = admin.replace(
    "  Mail,\n} from \"lucide-react\";",
    "  Mail,\n  ArrowRight,\n} from \"lucide-react\";"
)

# 2c. Adicionar link "Primeiro acesso?" na tela de login, antes do div de credenciais padrao
old_credenciais_box = '''          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">Credenciais padrao</p>
            <p className="text-center text-sm">
              <span className="font-mono font-semibold text-gray-700">admin</span>
              <span className="text-gray-300 mx-2">/</span>
              <span className="font-mono font-semibold text-gray-700">zapfacil123</span>
            </p>
            <p className="text-[10px] text-gray-400 text-center">Troque a senha apos o primeiro acesso pelo icone de chave no painel</p>
          </div>'''

new_credenciais_box = '''          <div className="bg-gray-50 rounded-xl p-3 space-y-1">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-center">Credenciais padrao</p>
            <p className="text-center text-sm">
              <span className="font-mono font-semibold text-gray-700">admin</span>
              <span className="text-gray-300 mx-2">/</span>
              <span className="font-mono font-semibold text-gray-700">zapfacil123</span>
            </p>
            <p className="text-[10px] text-gray-400 text-center">Troque a senha apos o primeiro acesso pelo icone de chave no painel</p>
          </div>

          {/* Link primeiro acesso */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                useAdminStore.getState().resetarPrimeiroAcesso();
                window.location.reload();
              }}
              className="text-[12px] text-gray-400 hover:text-emerald-600 transition-colors"
            >
              Primeiro acesso? Configurar o painel
            </button>
          </div>'''

admin = admin.replace(old_credenciais_box, new_credenciais_box)

# 2d. Atualizar PainelAdmin para checar primeiro acesso
old_painel = '''export function PainelAdmin() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    // Garante que as credenciais padrão sempre existam
    const store = useAdminStore.getState();
    if (!store.adminCredenciais) {
      store.configurarAdmin(CREDENCIAIS_PADRAO.usuario, CREDENCIAIS_PADRAO.senha);
    }

    const session = sessionStorage.getItem("zapfacil_admin_session");
    setAutenticado(session === "autenticado");
  }, []);

  if (autenticado === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!autenticado) {
    return <TelaLoginAdmin onAutenticado={() => setAutenticado(true)} />;
  }

  return <PainelAdminConteudo />;
}'''

new_painel = '''type EtapaAdmin = "loading" | "primeiro_acesso" | "login" | "autenticado";

export function PainelAdmin() {
  const [etapa, setEtapa] = useState<EtapaAdmin>("loading");

  useEffect(() => {
    const store = useAdminStore.getState();
    // Garante credenciais padrao se nao existir nada
    if (!store.adminCredenciais) {
      store.configurarAdmin(CREDENCIAIS_PADRAO.usuario, CREDENCIAIS_PADRAO.senha);
    }

    // Verifica se ja esta autenticado nesta sessao
    const session = sessionStorage.getItem("zapfacil_admin_session");
    if (session === "autenticado") {
      setEtapa("autenticado");
      return;
    }

    // Verifica se e primeiro acesso
    if (!store.primeiroAcesso) {
      setEtapa("primeiro_acesso");
    } else {
      setEtapa("login");
    }
  }, []);

  if (etapa === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (etapa === "primeiro_acesso") {
    return <TelaPrimeiroAcesso onConcluido={() => setEtapa("autenticado")} />;
  }

  if (etapa === "login") {
    return <TelaLoginAdmin onAutenticado={() => setEtapa("autenticado")} />;
  }

  return <PainelAdminConteudo />;
}'''

admin = admin.replace(old_painel, new_painel)

with open(admin_path, "w", encoding="utf-8") as f:
    f.write(admin)
print("OK: Painel admin atualizado com Primeiro Acesso")
print("\nTodas as alteracoes aplicadas!")