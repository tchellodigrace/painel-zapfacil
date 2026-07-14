#!/usr/bin/env python3
"""
Substitui logo e alinha header do admin no mesmo padrao do painel do cliente.
"""
path = "/home/z/my-project/src/components/erp/painel-admin.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Substituir logo nas telas de login/primeiro acesso
c = c.replace('src="/logo-empresa.png"', 'src="/logo-admin.png"')

# 2. Refazer o header do PainelAdminConteudo - logo + info estilo cliente + botoes
old_header = """      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="flex items-center gap-3">
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
          </button>
          <div className="flex items-center gap-1">
            <TooltipProvider>
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
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>"""

new_header = """      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <img
              src="/logo-admin.png"
              alt="Logo Admin"
              className="h-11 w-auto object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Dados do admin logado - estilo cliente */}
            <button
              type="button"
              onClick={() => setMostrarCredenciaisAdmin(!mostrarCredenciaisAdmin)}
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                {(dadosGestor?.nome || adminCredenciais?.usuario || "A").charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {dadosGestor?.nome || adminCredenciais?.usuario || "Admin"}
                </p>
                <p className="text-[10px] text-gray-400 leading-tight flex items-center gap-1">
                  {mostrarCredenciaisAdmin ? (
                    <span className="font-mono text-gray-500">
                      {adminCredenciais?.usuario} / {adminCredenciais?.senha}
                    </span>
                  ) : (
                    <><Mail className="h-2.5 w-2.5" />{adminCredenciais?.usuario}</>
                  )}
                </p>
              </div>
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 hover:bg-gray-100"
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
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>"""

c = c.replace(old_header, new_header)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("OK: Header do admin alinhado com logo e info estilo cliente")