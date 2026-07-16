#!/usr/bin/env python3
"""Clean up unused state and memos from PainelAdminConteudo after SecaoSistemas extraction."""

FILE = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Remove unused state: busca, filtroStatus, filtroPlano
content = content.replace(
    '  const [busca, setBusca] = useState("");\n  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");\n  const [filtroPlano, setFiltroPlano] = useState<string>("TODOS");\n',
    ''
)

# Remove unused stats useMemo
old_stats = '''  // Estatísticas
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

  // Filtragem
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

  '''

content = content.replace(old_stats, '')

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Cleaned up unused state and memos from PainelAdminConteudo")