#!/usr/bin/env python3
"""
Adiciona aba ZapBot no painel admin:
1. Import do PainelZapBot e Bot
2. Botao da aba
3. Conteudo da aba
"""

FILE_PATH = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Adicionar import do PainelZapBot
import_painel_cobrancas = 'import { PainelCobranças } from "./admin-cobrancas";'
novo_import = import_painel_cobrancas + '\nimport { PainelZapBot } from "./painel-zapbot";'
if import_painel_cobrancas in content and "import { PainelZapBot }" not in content:
    content = content.replace(import_painel_cobrancas, novo_import)
    print("1. Import PainelZapBot adicionado")
else:
    print("1. Import PainelZapBot ja existe ou nao encontrou marcador")

# 2. Adicionar Bot no import do lucide-react
lucide_import_end = "} from \"lucide-react\";"
if "Bot," not in content.split(lucide_import_end)[0]:
    # Adicionar Bot antes do fechamento
    content = content.replace(
        "  Users,\n} from \"lucide-react\";",
        "  Users,\n  Bot,\n} from \"lucide-react\";"
    )
    print("2. Icone Bot adicionado ao import")
else:
    print("2. Icone Bot ja existe no import")

# 3. Adicionar botao da aba ZapBot (antes do </button>\n        </div> que fecha as abas)
# Vamos encontrar o padrao exato do fim dos botoes
marcador_fim_botoes = "          </button>\n        </div>\n\n        {/* Conte"
if "abaAtiva === \"zapbot\"" not in content:
    botao_zapbot = """          </button>
          <button
            onClick={() => setAbaAtiva("zapbot")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "zapbot"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Bot className="h-4 w-4" />
            ZapBot
          </button>
        </div>

        {/* Conte"""
    # Procurar o ultimo </button> antes de </div>\n\n        {/* Conteudo
    # Vamos usar uma abordagem mais robusta
    idx = content.find("        </div>\n\n        {/* Conteudo da aba ativa */}")
    if idx == -1:
        # Tentar outra abordagem - encontrar o fim dos botoes
        idx = content.find("        </div>\n\n        {/* Conte")
    if idx > 0:
        # Inserir o botao zapbot antes do </div> que fecha os botoes
        insert_pos = idx
        botao = """
          <button
            onClick={() => setAbaAtiva("zapbot")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              abaAtiva === "zapbot"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Bot className="h-4 w-4" />
            ZapBot
          </button>"""
        content = content[:insert_pos] + botao + content[insert_pos:]
        print("3. Botao aba ZapBot adicionado")
    else:
        print("3. ERRO: Nao encontrou marcador de fim dos botoes")
else:
    print("3. Botao aba ZapBot ja existe")

# 4. Adicionar conteudo da aba ZapBot
# Encontrar: ) : abaAtiva === "recuperacoes" ? (\n          <SecaoRecuperacoes />
marcador_conteudo = ') : abaAtiva === "recuperacoes" ? (\n          <SecaoRecuperacoes />'
if 'abaAtiva === "zapbot"' not in content.split("SecaoRecuperacoes")[0][-200:] if "SecaoRecuperacoes" in content else True:
    # Procurar o padrao exato
    idx = content.find(marcador_conteudo)
    if idx > 0:
        # Encontrar o fim deste bloco para inserir apos ele
        # O padrao e: ) : abaAtiva === "recuperacoes" ? (\n          <SecaoRecuperacoes />\n        ) : (
        # Precisamos encontrar ate o ) : ( que vem depois de SecaoRecuperacoes
        trecho = content[idx:idx+200]
        # Encontrar o " ) : (" ou " ) : (" que fecha o ternario
        fim_idx = content.find("\n        ) : (", idx + len(marcador_conteudo))
        if fim_idx > 0:
            # Inserir antes do ) : (
            novo_conteudo = '\n        ) : abaAtiva === "zapbot" ? (\n          <PainelZapBot />'
            content = content[:fim_idx] + novo_conteudo + content[fim_idx:]
            print("4. Conteudo aba ZapBot adicionado")
        else:
            print(f"4. ERRO: Nao encontrou fechamento do ternario. Trecho: {repr(trecho[:100])}")
    else:
        print("4. ERRO: Nao encontrou marcador de conteudo recuperacoes")
else:
    print("4. Conteudo aba ZapBot ja existe")

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nArquivo atualizado: {FILE_PATH}")
print(f"Tamanho final: {len(content)} chars")