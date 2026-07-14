#!/usr/bin/env python3
"""
Extract inline Sistemas tab content into a SecaoSistemas component,
making ALL 4 tabs use the same pattern: a component that returns <div className="space-y-6">.
This guarantees identical React reconciliation and rendering.
"""
import re

FILE = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# The inline Sistemas content starts after ") : (" and ends with the closing </div> and ")}"
# Let's find the exact boundaries

# Find the start of the Sistemas inline content
start_marker = ') : (\n          <div className="space-y-6">'
end_marker = '          </div>\n        )}\n      </main>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print(f"ERROR: Could not find markers. start={start_idx}, end={end_idx}")
    exit(1)

# Extract the content between the markers (the inner content of the div)
inner_start = start_idx + len(') : (\n          <div className="space-y-6">\n')
inner_end = end_idx  # up to but not including the closing </div>

sistemas_content = content[inner_start:inner_end]
sistemas_content = sistemas_content.rstrip('\n')

# Now create the SecaoSistemas component
# It needs access to: stats, sistemasFiltrados, busca, setBusca, filtroStatus, setFiltroStatus,
# filtroPlano, setFiltroPlano, setDialogNovo, setDialogDetalhe, setDialogForm, setConfirmaRemover,
# setAbaAtiva, handleWhatsApp, getStatusInfo, getPlanoInfo, getTipoLicencaInfo, getCobrancasBySistema

# Instead of passing all those as props, we'll use the store directly (like SecaoRecuperacoes does)
# and pass callbacks via props

secao_sistemas = '''
// =============================================
// SECAO SISTEMAS (aba principal)
// =============================================
function SecaoSistemas({
  onNovo,
  onVerDetalhe,
  onEditar,
  onRemover,
  onMudarAba,
  onWhatsApp,
}: {
  onNovo: () => void;
  onVerDetalhe: (s: SistemaCliente) => void;
  onEditar: (s: SistemaCliente) => void;
  onRemover: (id: string) => void;
  onMudarAba: (aba: AbaAdmin) => void;
  onWhatsApp: (tel: string) => void;
}) {
  const { sistemas, getCobrancasBySistema } = useAdminStore();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPlano, setFiltroPlano] = useState<string>("TODOS");

  const stats = useMemo(() => {
    const ativos = sistemas.filter((s) => s.status === "ATIVO").length;
    const trials = sistemas.filter((s) => s.status === "TRIAL").length;
    const expirados = sistemas.filter((s) => s.status === "EXPIRADO").length;
    const receitaMensal = sistemas
      .filter((s) => (s.status === "ATIVO" || s.status === "TRIAL") && s.tipoLicenca === "ALUGUEL")
      .reduce((s, v) => s + v.valorMensal, 0);
    const vencendo = sistemas.filter(
      (s) => s.status === "ATIVO" && diasRestantes(s.dataVencimento) <= 7 && diasRestantes(s.dataVencimento) > 0
    ).length;
    return { ativos, trials, expirados, receitaMensal, vencendo, total: sistemas.length };
  }, [sistemas]);

  const sistemasFiltrados = useMemo(() => {
    let lista = sistemas;
    if (filtroStatus !== "TODOS") lista = lista.filter((s) => s.status === filtroStatus);
    if (filtroPlano !== "TODOS") lista = lista.filter((s) => s.plano === filtroPlano);
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      lista = lista.filter(
        (s) =>
          s.empresa.toLowerCase().includes(termo) ||
          s.responsavel.toLowerCase().includes(termo) ||
          s.cidade.toLowerCase().includes(termo) ||
          s.telefone.includes(termo) ||
          s.email.toLowerCase().includes(termo)
      );
    }
    return lista;
  }, [sistemas, filtroStatus, filtroPlano, busca]);

  return (
    <div className="space-y-6">
''' + sistemas_content + '''
    </div>
  );
}

'''

# Insert SecaoSistemas before the PAINEL ADMIN PRINCIPAL COM ABAS comment
insert_point = content.find('// =============================================\n// PAINEL ADMIN PRINCIPAL COM ABAS')
if insert_point == -1:
    print("ERROR: Could not find insert point")
    exit(1)

content = content[:insert_point] + secao_sistemas + content[insert_point:]

# Now replace the inline Sistemas content in the tab conditional with <SecaoSistemas />
old_tab_content = '''        {abaAtiva === "cobrancas" ? (
          <PainelCobranças />
        ) : abaAtiva === "recuperacoes" ? (
          <SecaoRecuperacoes />
        ) : abaAtiva === "zapbot" ? (
          <PainelZapBot />
        ) : ('''

new_tab_content = '''        {abaAtiva === "cobrancas" ? (
          <PainelCobranças />
        ) : abaAtiva === "recuperacoes" ? (
          <SecaoRecuperacoes />
        ) : abaAtiva === "zapbot" ? (
          <PainelZapBot />
        ) : (
          <SecaoSistemas
            onNovo={() => setDialogNovo(true)}
            onVerDetalhe={setDialogDetalhe}
            onEditar={setDialogForm}
            onRemover={setConfirmaRemover}
            onMudarAba={setAbaAtiva}
            onWhatsApp={handleWhatsApp}
          />'''

content = content.replace(old_tab_content, new_tab_content)

# Now remove the old inline Sistemas div and its content (between the new SecaoSistemas /> and </main>)
# The pattern is: />
# followed by the old <div className="space-y-6"> content
# followed by </div>\n        )}\n      </main>

# Find the SecaoSistemas /> in the tab conditional
sec_sistemas_end = content.find('<SecaoSistemas')
# Find the end of the self-closing tag
sec_tag_end = content.find('/>', sec_sistemas_end) + 2

# Find </main> after that
main_tag = content.find('\n      </main>', sec_tag_end)

# Everything between sec_tag_end and main_tag should be removed (it's the old inline content)
old_inline = content[sec_tag_end:main_tag]

# Verify it starts with the old inline content
if '<div className="space-y-6">' in old_inline[:50]:
    content = content[:sec_tag_end] + '\n      </main>' + content[main_tag + len('\n      </main>'):]
    print("Successfully extracted Sistemas to SecaoSistemas component")
else:
    print(f"WARNING: Unexpected content after SecaoSistemas: {old_inline[:100]}")
    # Try a different approach - just keep it and see
    print("Leaving as-is, manual fix needed")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")