#!/usr/bin/env python3
"""
Adiciona os dados de login e senha do admin no header do painel.
"""
path = "/home/z/my-project/src/components/erp/painel-admin.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Adicionar adminCredenciais e dadosGestor ao useAdminStore do PainelAdminConteudo
c = c.replace(
    "const { sistemas, cobrancas, pedidosRecuperacao, adicionarSistema, editarSistema, removerSistema, getCobrancasBySistema, resolverPedidoRecuperacao, limparPedidosResolvidos } =\n    useAdminStore();",
    "const { sistemas, cobrancas, pedidosRecuperacao, adminCredenciais, dadosGestor, adicionarSistema, editarSistema, removerSistema, getCobrancasBySistema, resolverPedidoRecuperacao, limparPedidosResolvidos } =\n    useAdminStore();"
)

# 2. Adicionar estado para mostrar/ocultar senha
c = c.replace(
    "  const [dialogEmailRecuperacao, setDialogEmailRecuperacao] = useState(false);",
    "  const [dialogEmailRecuperacao, setDialogEmailRecuperacao] = useState(false);\n  const [mostrarCredenciaisAdmin, setMostrarCredenciaisAdmin] = useState(false);"
)

# 3. Substituir o bloco do header para incluir dados do admin
old_header_content = """          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Painel Admin</h1>
              <p className="text-[10px] text-gray-400">Controle de Sistemas</p>
            </div>
          </div>"""

new_header_content = """          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-900">Painel Admin</h1>
              <p className="text-[10px] text-gray-400">Controle de Sistemas</p>
            </div>
          </div>

          {/* Dados do admin logado */}
          <button
            type="button"
            onClick={() => setMostrarCredenciaisAdmin(!mostrarCredenciaisAdmin)}
            className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
              {(dadosGestor?.nome || adminCredenciais?.usuario || "A").charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {dadosGestor?.nome || adminCredenciais?.usuario || "Admin"}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                {mostrarCredenciaisAdmin ? (
                  <span className="font-mono text-gray-600">
                    {adminCredenciais?.usuario} / {adminCredenciais?.senha}
                  </span>
                ) : (
                  "Clique para ver credenciais"
                )}
              </p>
            </div>
            <KeyRound className="h-3.5 w-3.5 text-gray-400 hidden md:block" />
          </button>"""

c = c.replace(old_header_content, new_header_content)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("OK: Dados do admin adicionados ao header do painel")