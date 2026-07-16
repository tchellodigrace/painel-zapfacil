#!/usr/bin/env python3
"""
1. Adiciona campo 'senha' ao DadosRegistroCliente no store
2. Atualiza tela-login para enviar a senha ao cadastrar
3. Mostra login/senha do cliente nos detalhes do admin
"""
import json

# ============================================
# 1. STORE - adicionar senha ao DadosRegistroCliente
# ============================================
store_path = "/home/z/my-project/src/hooks/use-admin-store.ts"
with open(store_path, "r", encoding="utf-8") as f:
    store = f.read()

store = store.replace(
    '''export interface DadosRegistroCliente {
  usuario: string;
  nomeEmpresa: string;
  telefone: string;
  email: string;
  registradoEm: string;
}''',
    '''export interface DadosRegistroCliente {
  usuario: string;
  nomeEmpresa: string;
  telefone: string;
  email: string;
  senha: string;
  registradoEm: string;
}'''
)

with open(store_path, "w", encoding="utf-8") as f:
    f.write(store)
print("OK: Store atualizado com campo senha")

# ============================================
# 2. TELA-LOGIN - enviar senha no cadastro
# ============================================
login_path = "/home/z/my-project/src/components/erp/tela-login.tsx"
with open(login_path, "r", encoding="utf-8") as f:
    login = f.read()

login = login.replace(
    '''      useAdminStore.getState().salvarRegistroCliente({
        usuario: nomeResponsavel.trim(),
        nomeEmpresa: nomeEmpresa.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        registradoEm: new Date().toISOString(),
      });''',
    '''      useAdminStore.getState().salvarRegistroCliente({
        usuario: nomeResponsavel.trim(),
        nomeEmpresa: nomeEmpresa.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        senha: senha,
        registradoEm: new Date().toISOString(),
      });'''
)

with open(login_path, "w", encoding="utf-8") as f:
    f.write(login)
print("OK: Tela login envia senha ao cadastrar")

# ============================================
# 3. PAINEL-ADMIN - mostrar credenciais nos detalhes
# ============================================
admin_path = "/home/z/my-project/src/components/erp/painel-admin.tsx"
with open(admin_path, "r", encoding="utf-8") as f:
    admin = f.read()

# Substituir a secao de "Dados do Cadastro do Cliente" por versao com credenciais de acesso
old_dados = '''                {dialogDetalhe.dadosRegistro && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[10px] text-emerald-600 uppercase font-semibold mb-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Dados do Cadastro do Cliente
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                        <div>
                          <p className="text-[10px] text-gray-400">Usuario criado</p>
                          <p className="text-gray-700 font-medium">{dialogDetalhe.dadosRegistro.usuario}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Empresa cadastrada</p>
                          <p className="text-gray-700 font-medium">{dialogDetalhe.dadosRegistro.nomeEmpresa}</p>
                        </div>
                        {dialogDetalhe.dadosRegistro.telefone && (
                          <div>
                            <p className="text-[10px] text-gray-400">Telefone</p>
                            <p className="text-gray-700">{dialogDetalhe.dadosRegistro.telefone}</p>
                          </div>
                        )}
                        {dialogDetalhe.dadosRegistro.email && (
                          <div>
                            <p className="text-[10px] text-gray-400">E-mail</p>
                            <p className="text-gray-700">{dialogDetalhe.dadosRegistro.email}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-400">Registrado em</p>
                          <p className="text-gray-700 text-xs">
                            {new Date(dialogDetalhe.dadosRegistro.registradoEm).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}'''

new_dados = '''                {dialogDetalhe.dadosRegistro && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-[10px] text-emerald-600 uppercase font-semibold mb-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Dados do Cadastro do Cliente
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                        <div>
                          <p className="text-[10px] text-gray-400">Usuario criado</p>
                          <p className="text-gray-700 font-medium">{dialogDetalhe.dadosRegistro.usuario}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400">Empresa cadastrada</p>
                          <p className="text-gray-700 font-medium">{dialogDetalhe.dadosRegistro.nomeEmpresa}</p>
                        </div>
                        {dialogDetalhe.dadosRegistro.telefone && (
                          <div>
                            <p className="text-[10px] text-gray-400">Telefone</p>
                            <p className="text-gray-700">{dialogDetalhe.dadosRegistro.telefone}</p>
                          </div>
                        )}
                        {dialogDetalhe.dadosRegistro.email && (
                          <div>
                            <p className="text-[10px] text-gray-400">E-mail</p>
                            <p className="text-gray-700">{dialogDetalhe.dadosRegistro.email}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-[10px] text-gray-400">Registrado em</p>
                          <p className="text-gray-700 text-xs">
                            {new Date(dialogDetalhe.dadosRegistro.registradoEm).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Credenciais de Acesso do Cliente */}
                <div className="bg-gray-900 rounded-xl p-4 text-white">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mb-3 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    Credenciais de Acesso do Cliente
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">E-mail de login (usuario)</p>
                      <div className="bg-white/10 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
                        <p className="text-sm font-mono font-semibold text-white truncate">
                          {dialogDetalhe.dadosRegistro?.email || dialogDetalhe.email || "-"}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const emailCopiar = dialogDetalhe.dadosRegistro?.email || dialogDetalhe.email || "";
                            navigator.clipboard.writeText(emailCopiar);
                            toast.success("E-mail copiado!");
                          }}
                          className="shrink-0 text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">Senha</p>
                      <div className="bg-white/10 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2">
                        <p className="text-sm font-mono font-semibold text-white">
                          {dialogDetalhe.dadosRegistro?.senha || "Nao registrada (cadastro antigo)"}
                        </p>
                        {dialogDetalhe.dadosRegistro?.senha && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(dialogDetalhe.dadosRegistro!.senha);
                              toast.success("Senha copiada!");
                            }}
                            className="shrink-0 text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                      <span className="text-[10px] text-gray-500">Link de acesso:</span>
                      <span className="text-[11px] text-gray-300 font-mono truncate flex-1">https://j1ewd51wcs60-d.space-z.ai/</span>
                    </div>
                    {dialogDetalhe.dadosRegistro?.senha && (
                      <Button
                        className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-xs font-medium rounded-lg"
                        onClick={() => {
                          const emailLogin = dialogDetalhe.dadosRegistro?.email || dialogDetalhe.email || "";
                          const senhaCliente = dialogDetalhe.dadosRegistro?.senha || "";
                          const tel = dialogDetalhe.dadosRegistro?.telefone || dialogDetalhe.telefone || "";
                          if (!tel) { toast.error("Sem telefone cadastrado."); return; }
                          const telLimpo = tel.replace(/\\D/g, "");
                          const numero = telLimpo.startsWith("55") ? telLimpo : "55" + telLimpo;
                          const nomeCliente = dialogDetalhe.dadosRegistro?.usuario || dialogDetalhe.responsavel;
                          const msg = encodeURIComponent(
                            "Ola " + nomeCliente + "! Aqui e o suporte do ZapFacil Pro.\\n\\n" +
                            "Segue seus dados de acesso ao sistema:\\n\\n" +
                            "Link: https://j1ewd51wcs60-d.space-z.ai/\\n" +
                            "Login (e-mail): " + emailLogin + "\\n" +
                            "Senha: " + senhaCliente + "\\n\\n" +
                            "Salve esses dados! Qualquer duvida, estou a disposicao."
                          );
                          window.open("https://wa.me/" + numero + "?text=" + msg, "_blank");
                        }}
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Enviar credenciais por WhatsApp
                      </Button>
                    )}
                    {!dialogDetalhe.dadosRegistro?.senha && (
                      <p className="text-[10px] text-amber-400 text-center">
                        A senha nao foi salva no cadastro. Clientes cadastrados antes da atualizacao nao tem a senha registrada.
                      </p>
                    )}
                  </div>
                </div>'''

admin = admin.replace(old_dados, new_dados)

# Adicionar import Copy se necessario
if "Copy" not in admin.split("from \"lucide-react\"")[0]:
    admin = admin.replace(
        "  ArrowRight,\n} from \"lucide-react\";",
        "  ArrowRight,\n  Copy,\n} from \"lucide-react\";"
    )

with open(admin_path, "w", encoding="utf-8") as f:
    f.write(admin)
print("OK: Credenciais do cliente nos detalhes do admin")
print("\nTodas as alteracoes aplicadas!")