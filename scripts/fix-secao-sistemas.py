#!/usr/bin/env python3
"""Fix SecaoSistemas: add missing state, helpers, and fix prop references."""

import re

PATH = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(PATH, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 1. Add missing state variables and helper functions after the useAdminStore() line in SecaoSistemas
# Find the line with "const { sistemas, getCobrancasBySistema } = useAdminStore();" inside SecaoSistemas
for i, line in enumerate(lines):
    if i > 1760 and "const { sistemas, getCobrancasBySistema } = useAdminStore();" in line:
        insert_idx = i + 1
        new_code = """\
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroPlano, setFiltroPlano] = useState<string>("TODOS");

  const getStatusInfo = (status: StatusSistema) =>
    STATUS_SISTEMA.find((s) => s.valor === status) || STATUS_SISTEMA[3];
  const getPlanoInfo = (plano: PlanoSistema) =>
    PLANOS.find((p) => p.valor === plano) || PLANOS[0];
  const getTipoLicencaInfo = (tipo: TipoLicenca) =>
    TIPOS_LICENCA.find((t) => t.valor === tipo) || TIPOS_LICENCA[0];

"""
        lines.insert(insert_idx, new_code)
        break

with open(PATH, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("Step 1 done: Added state and helpers")

# 2. Fix references to parent-scoped variables inside SecaoSistemas
with open(PATH, "r", encoding="utf-8") as f:
    content = f.read()

# Find the SecaoSistemas function boundaries
start_match = re.search(r'function SecaoSistemas\(', content)
end_match = re.search(r'\n// =+\n// PAINEL ADMIN PRINCIPAL COM ABAS\n// =+\n', content)

if start_match and end_match:
    # Work only within SecaoSistemas
    before = content[:start_match.start()]
    secao = content[start_match.start():end_match.start()]
    after = content[end_match.start():]

    # Fix: setDialogNovo(true) -> onNovo()
    secao = secao.replace('() => setDialogNovo(true)', 'onNovo')

    # Fix: setDialogDetalhe(s) -> onVerDetalhe(s)
    secao = secao.replace('() => setDialogDetalhe(s)', '() => onVerDetalhe(s)')

    # Fix: setDialogForm(s) -> onEditar(s)
    secao = secao.replace('() => setDialogForm(s)', '() => onEditar(s)')

    # Fix: setAbaAtiva("cobrancas") -> onMudarAba("cobrancas")
    secao = secao.replace('() => setAbaAtiva("cobrancas")', '() => onMudarAba("cobrancas")')

    # Fix: handleWhatsApp(s.telefone) -> onWhatsApp(s.telefone)
    secao = secao.replace('() => handleWhatsApp(s.telefone)', '() => onWhatsApp(s.telefone)')

    # Fix: setConfirmaRemover(s.id) -> onRemover(s.id)
    secao = secao.replace('() => setConfirmaRemover(s.id)', '() => onRemover(s.id)')

    content = before + secao + after

    with open(PATH, "w", encoding="utf-8") as f:
        f.write(content)

    print("Step 2 done: Fixed prop references")
else:
    print("ERROR: Could not find SecaoSistemas boundaries")
    print(f"start: {start_match}")
    print(f"end: {end_match}")