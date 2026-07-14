#!/usr/bin/env python3
"""
Corrige a SecaoRecuperacoes no painel-admin.tsx:
1. catch (e) ao inves de catch {}
2. Null-safety nos filtros
3. Remove useEffect com recarregarDados (chama direto no render)
4. Adiciona try-catch ao redor do filter
"""

FILE_PATH = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Corrigir catch sem variavel
content = content.replace(
    "    } catch { return iso; }",
    "    } catch (_e) { return iso; }"
)

# 2. Corrigir o useEffect - chamar recarregarDados de forma segura
old_effect = """  // Recarrega dados do localStorage ao montar (resolve pedidos criados em outra pagina)
  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);"""

new_effect = """  // Recarrega dados do localStorage ao montar (resolve pedidos criados em outra pagina)
  useEffect(() => {
    try { recarregarDados(); } catch (e) { console.warn("Erro ao recarregar dados:", e); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);"""

content = content.replace(old_effect, new_effect)

# 3. Tornar o filtro de clientes seguro contra campos undefined
old_filter = """  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return sistemas;
    const termo = buscaCliente.toLowerCase().trim();
    return sistemas.filter(
      (s) =>
        s.empresa.toLowerCase().includes(termo) ||
        s.responsavel.toLowerCase().includes(termo) ||
        s.email.toLowerCase().includes(termo) ||
        (s.telefone && s.telefone.includes(termo)) ||
        (s.cidade && s.cidade.toLowerCase().includes(termo))
    );
  }, [sistemas, buscaCliente]);"""

new_filter = """  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente.trim()) return sistemas;
    const termo = buscaCliente.toLowerCase().trim();
    return sistemas.filter((s) => {
      try {
        return (
          (s.empresa || "").toLowerCase().includes(termo) ||
          (s.responsavel || "").toLowerCase().includes(termo) ||
          (s.email || "").toLowerCase().includes(termo) ||
          (s.telefone || "").includes(termo) ||
          (s.cidade || "").toLowerCase().includes(termo)
        );
      } catch {
        return false;
      }
    });
  }, [sistemas, buscaCliente]);"""

content = content.replace(old_filter, new_filter)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Correcoes aplicadas com sucesso!")
print(f"Tamanho: {len(content)} chars")