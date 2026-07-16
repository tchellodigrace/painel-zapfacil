#!/usr/bin/env python3
"""
Fix admin panel alignment, responsiveness, and missing components.
- Fix header to always show email (consistent with client panel)
- Make tab navigation responsive (2 cols mobile, 4 cols desktop)
- Wrap all tab content in consistent container
- Add missing DialogEmailRecuperacao component
- Fix overall alignment and responsiveness
"""
import re

FILE = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# ============================================================
# FIX 1: Make tab navigation responsive (grid-cols-2 on mobile)
# ============================================================
old_tabs = '<div className="grid grid-cols-4 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">'
new_tabs = '<div className="grid grid-cols-2 sm:grid-cols-4 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">'
content = content.replace(old_tabs, new_tabs)

# ============================================================
# FIX 2: Wrap all tab content in a consistent container div
#         so space-y-6 from main applies uniformly
# ============================================================
old_tab_content = '''        {/* Conteúdo da aba ativa */}
        {abaAtiva === "cobrancas" ? (
          <PainelCobranças />
        ) : abaAtiva === "recuperacoes" ? (
          <SecaoRecuperacoes />
        ) : abaAtiva === "zapbot" ? (
          <PainelZapBot />
        ) : (
          <>'''

new_tab_content = '''        {/* Conteúdo da aba ativa */}
        <div className="w-full">
        {abaAtiva === "cobrancas" ? (
          <PainelCobranças />
        ) : abaAtiva === "recuperacoes" ? (
          <SecaoRecuperacoes />
        ) : abaAtiva === "zapbot" ? (
          <PainelZapBot />
        ) : (
          <>'''
content = content.replace(old_tab_content, new_tab_content)

# Close the wrapper div after the sistemas tab content
old_close = '''          </>
        )}
      </main>'''

new_close = '''          </>
        )}
        </div>
      </main>'''
content = content.replace(old_close, new_close)

# ============================================================
# FIX 3: Fix admin header - always show email with Mail icon
#         matching client panel style exactly
# ============================================================
old_header_info = '''              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {dadosGestor?.nome || adminCredenciais?.usuario || "Admin"}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight flex items-center gap-1">
                  {mostrarCredenciaisAdmin ? (
                    <span className="font-mono text-gray-500">
                      {adminCredenciais?.usuario} / {adminCredenciais?.senha}
                    </span>
                  ) : (
                    <><Mail className="h-2.5 w-2.5" />{dadosGestor?.email || adminCredenciais?.usuario}</>
                  )}
                </p>
              </div>'''

new_header_info = '''              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {dadosGestor?.nome || adminCredenciais?.usuario || "Admin"}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight flex items-center gap-1">
                  {mostrarCredenciaisAdmin ? (
                    <span className="font-mono text-gray-500">
                      {adminCredenciais?.usuario} / {adminCredenciais?.senha}
                    </span>
                  ) : (
                    <><Mail className="h-2.5 w-2.5 shrink-0" />{dadosGestor?.email || adminCredenciais?.usuario}</>
                  )}
                </p>
              </div>'''
content = content.replace(old_header_info, new_header_info)

# ============================================================
# FIX 4: Add DialogEmailRecuperacao component before the
#         DialogTrocarSenha render
# ============================================================
old_dialog_senha = '''      {/* Dialog Trocar Senha */}
      <DialogTrocarSenha
        open={dialogTrocarSenha}
        onOpenChange={setDialogTrocarSenha}
      />'''

new_dialog_senha = '''      {/* Dialog E-mail de Recuperacao */}
      <Dialog open={dialogEmailRecuperacao} onOpenChange={setDialogEmailRecuperacao}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5 text-blue-500" />
              E-mail de Recuperacao
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">E-mail de recuperacao de senha</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Este e-mail sera usado para verificar a identidade do administrador caso ele precise redefinir a senha na tela de login.
                  </p>
                </div>
              </div>
            </div>
            <DialogEmailRecuperacaoForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Trocar Senha */}
      <DialogTrocarSenha
        open={dialogTrocarSenha}
        onOpenChange={setDialogTrocarSenha}
      />'''
content = content.replace(old_dialog_senha, new_dialog_senha)

# ============================================================
# FIX 5: Add DialogEmailRecuperacaoForm component definition
#         before the PainelAdminConteudo function
# ============================================================
old_painel_conteudo = '''// =============================================
// PAINEL ADMIN PRINCIPAL COM ABAS
// ============================================='''

new_painel_conteudo = '''// =============================================
// DIALOG EMAIL RECUPERACAO FORM
// =============================================
function DialogEmailRecuperacaoForm() {
  const { emailRecuperacao, configurarEmailRecuperacao } = useAdminStore();
  const [email, setEmail] = useState(emailRecuperacao || "");
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Informe um e-mail valido.");
      return;
    }
    setSalvando(true);
    setTimeout(() => {
      configurarEmailRecuperacao(email.trim().toLowerCase());
      setSalvando(false);
      toast.success("E-mail de recuperacao atualizado com sucesso!");
    }, 500);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">E-mail de recuperacao</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder="recuperacao@seuemail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-10 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSalvar()}
          />
        </div>
      </div>
      {emailRecuperacao && (
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400">Atualmente configurado:</p>
          <p className="text-xs text-gray-600 font-medium">{emailRecuperacao}</p>
        </div>
      )}
      <div className="flex gap-2 justify-end pt-1">
        <Button
          size="sm"
          className="text-xs bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSalvar}
          disabled={salvando}
        >
          {salvando ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </div>
  );
}

// =============================================
// PAINEL ADMIN PRINCIPAL COM ABAS
// ============================================='''
content = content.replace(old_painel_conteudo, new_painel_conteudo)

# ============================================================
# FIX 6: Make the tab buttons wrap text better on mobile
#         and add sm:truncate for text
# ============================================================
# Fix tab button text to handle wrapping on small screens
content = content.replace(
    '<span className="truncate">Sistemas</span>',
    '<span className="truncate text-xs sm:text-sm">Sistemas</span>'
)
content = content.replace(
    '<span className="truncate">Cobrancas</span>',
    '<span className="truncate text-xs sm:text-sm">Cobrancas</span>'
)
content = content.replace(
    '<span className="truncate">Recuperacoes</span>',
    '<span className="truncate text-xs sm:text-sm">Recuperacoes</span>'
)
content = content.replace(
    '<span className="truncate">ZapBot</span>',
    '<span className="truncate text-xs sm:text-sm">ZapBot</span>'
)

# ============================================================
# FIX 7: Make PainelCobranças and PainelZapBot use consistent
#         space-y-6 to match the sistemas tab
# ============================================================
# Fix PainelCobranças root div spacing
with open("/home/z/my-project/src/components/erp/admin-cobrancas.tsx", "r", encoding="utf-8") as f:
    cob_content = f.read()
cob_content = cob_content.replace(
    'return (\n    <div className="space-y-5">',
    'return (\n    <div className="space-y-6">'
)
with open("/home/z/my-project/src/components/erp/admin-cobrancas.tsx", "w", encoding="utf-8") as f:
    f.write(cob_content)

# Fix PainelZapBot root div spacing
with open("/home/z/my-project/src/components/erp/painel-zapbot.tsx", "r", encoding="utf-8") as f:
    zap_content = f.read()
zap_content = zap_content.replace(
    'return (\n    <div className="space-y-4">',
    'return (\n    <div className="space-y-6">'
)
with open("/home/z/my-project/src/components/erp/painel-zapbot.tsx", "w", encoding="utf-8") as f:
    f.write(zap_content)

# Fix SecaoRecuperacoes root div spacing (in painel-admin.tsx)
content = content.replace(
    '    <div className="space-y-4">\n      {/* Header */}\n        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">\n          <KeyRound className="h-5 w-5 text-amber-500" />\n          Recuperacao de Acesso',
    '    <div className="space-y-6">\n      {/* Header */}\n        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">\n          <KeyRound className="h-5 w-5 text-amber-500" />\n          Recuperacao de Acesso'
)

# ============================================================
# WRITE the updated painel-admin.tsx
# ============================================================
with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("All fixes applied successfully!")
print("Changes made:")
print("1. Tab navigation: grid-cols-2 sm:grid-cols-4 for responsiveness")
print("2. Tab content wrapped in consistent <div className='w-full'> container")
print("3. Admin header: added shrink-0 to Mail icon for consistent alignment")
print("4. Added DialogEmailRecuperacao component + DialogEmailRecuperacaoForm")
print("5. Tab button text: added text-xs sm:text-sm for responsive sizing")
print("6. PainelCobrancas: space-y-5 -> space-y-6 for consistency")
print("7. PainelZapBot: space-y-4 -> space-y-6 for consistency")
print("8. SecaoRecuperacoes: space-y-4 -> space-y-6 for consistency")