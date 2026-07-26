#!/usr/bin/env python3
"""
Substitui todas as referencias a cores 'emerald' (verde) por 'primary' (azul Bitrix24)
em todos os arquivos .tsx/.ts do projeto, mantendo contexto semantico onde faz sentido.
"""
import re
import sys
from pathlib import Path

# Lista de substituicoes (regex, replacement) - mais especificas primeiro
SUBS = [
    # Casos especificos (combinacoes)
    (r"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
     "bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary/80"),
    (r"bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
     "bg-primary/10 text-primary dark:bg-primary/30 dark:text-primary/80"),
    (r"bg-emerald-100 text-emerald-700",
     "bg-primary/10 text-primary"),
    (r"bg-emerald-50 border border-emerald-200 rounded-xl p-4",
     "bg-primary/5 border border-primary/20 rounded-xl p-4"),
    (r"bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3",
     "bg-primary/5 dark:bg-primary/15 border border-primary/20 dark:border-primary/40 rounded-lg p-3"),
    (r"bg-emerald-50/50 dark:bg-emerald-950/20",
     "bg-primary/5 dark:bg-primary/15"),
    (r"bg-emerald-50/50",
     "bg-primary/5"),
    (r"bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
     "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"),
    (r"bg-emerald-50 border-emerald-200",
     "bg-primary/5 border-primary/20"),
    (r"bg-emerald-50 border border-emerald-200",
     "bg-primary/5 border border-primary/20"),
    (r"bg-emerald-50",
     "bg-primary/5"),
    (r"ring-2 ring-emerald-500 border-emerald-300 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20",
     "ring-2 ring-primary border-primary/30 dark:border-primary/50 bg-primary/5 dark:bg-primary/15"),
    (r"ring-2 ring-emerald-500",
     "ring-2 ring-primary"),
    (r"hover:border-emerald-200 dark:hover:border-emerald-800",
     "hover:border-primary/30 dark:hover:border-primary/40"),
    (r"hover:border-emerald-200",
     "hover:border-primary/30"),
    (r"border-dashed border-emerald-300 dark:border-emerald-700",
     "border-dashed border-primary/30 dark:border-primary/40"),
    (r"border-emerald-300 dark:border-emerald-700",
     "border-primary/30 dark:border-primary/40"),
    (r"border-emerald-300 dark:border-emerald-600",
     "border-primary/30 dark:border-primary/50"),
    (r"border-emerald-300",
     "border-primary/30"),
    (r"border-emerald-200 dark:border-emerald-800",
     "border-primary/20 dark:border-primary/40"),
    (r"border-emerald-200",
     "border-primary/20"),
    (r"border-emerald-100",
     "border-primary/15"),
    (r"border-emerald-700",
     "border-primary/30"),
    # Texto e icones
    (r"text-emerald-700 dark:text-emerald-400",
     "text-primary dark:text-primary/80"),
    (r"text-emerald-700 dark:text-emerald-300",
     "text-primary dark:text-primary/80"),
    (r"text-emerald-700 dark:text-white/80",
     "text-primary dark:text-white/80"),
    (r"text-emerald-700",
     "text-primary"),
    (r"text-emerald-800 dark:text-emerald-300",
     "text-primary dark:text-white/80"),
    (r"text-emerald-800 dark:text-white/80",
     "text-primary dark:text-white/80"),
    (r"text-emerald-800",
     "text-primary"),
    (r"text-emerald-600 hover:text-emerald-800",
     "text-primary hover:text-primary/90"),
    (r"text-emerald-600 dark:text-emerald-400",
     "text-primary dark:text-primary/80"),
    (r"text-emerald-600",
     "text-primary"),
    (r"text-emerald-500 hover:text-emerald-700",
     "text-primary hover:text-primary/80"),
    (r"text-emerald-500",
     "text-primary"),
    (r"text-emerald-300",
     "text-white/80"),
    (r"text-emerald-400",
     "text-primary/80"),
    # Backgrounds de icones/circulos
    (r"bg-emerald-600 text-white shadow-sm",
     "bg-primary text-primary-foreground shadow-sm"),
    (r"bg-emerald-600 hover:bg-emerald-700",
     "bg-primary hover:bg-primary/90"),
    (r"bg-emerald-600",
     "bg-primary"),
    (r"bg-emerald-500/30",
     "bg-white/10"),
    (r"bg-emerald-500",
     "bg-primary"),
    (r"bg-emerald-100 dark:bg-emerald-900/40",
     "bg-primary/10 dark:bg-primary/30"),
    (r"bg-emerald-100 dark:bg-emerald-900",
     "bg-primary/10 dark:bg-primary/30"),
    (r"bg-emerald-900/40",
     "bg-primary/30"),
    (r"bg-emerald-900",
     "bg-primary/30"),
    (r"bg-emerald-100",
     "bg-primary/10"),
    (r"bg-emerald-50/10",
     "bg-primary/5"),
    # Ring isolado
    (r"ring-emerald-500",
     "ring-primary"),
    (r"ring-emerald-400",
     "ring-primary/60"),
    # Hover states
    (r"hover:bg-emerald-100",
     "hover:bg-primary/10"),
    (r"hover:bg-emerald-700",
     "hover:bg-primary/90"),
    (r"hover:bg-emerald-600",
     "hover:bg-primary/90"),
    (r"hover:text-emerald-700",
     "hover:text-primary/80"),
    (r"hover:text-emerald-800",
     "hover:text-primary/90"),
    # Decorativos
    (r"from-emerald-500",
     "from-primary"),
    (r"to-emerald-500",
     "to-primary"),
    (r"via-emerald-500",
     "via-primary"),
]

def process_file(filepath: Path) -> tuple[int, list[str]]:
    """Retorna (num_substituicoes, lista_de_refs_restantes)."""
    content = filepath.read_text(encoding="utf-8")
    total = 0
    for pattern, replacement in SUBS:
        new_content, n = re.subn(pattern, replacement, content)
        if n > 0:
            total += n
            content = new_content
    if total > 0:
        filepath.write_text(content, encoding="utf-8")
    remaining = sorted(set(re.findall(r"emerald-\w+", content)))
    return total, remaining

def main():
    base = Path("/home/z/my-project/src")
    files = list(base.rglob("*.tsx")) + list(base.rglob("*.ts"))
    files = [f for f in files if "node_modules" not in str(f)]
    
    total_all = 0
    files_modified = 0
    remaining_all: dict[str, list[str]] = {}
    
    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue
        if "emerald" not in content:
            continue
        n, remaining = process_file(f)
        if n > 0:
            print(f"  [{n:>3}x] {f.relative_to(base)}")
            total_all += n
            files_modified += 1
        if remaining:
            remaining_all[str(f.relative_to(base))] = remaining
    
    print(f"\n=== TOTAL: {total_all} substituicoes em {files_modified} arquivos ===")
    if remaining_all:
        print(f"\n⚠ Restam referencias 'emerald' em {len(remaining_all)} arquivos:")
        for fname, refs in remaining_all.items():
            print(f"  {fname}: {refs}")
    else:
        print("\n✓ Nenhuma referencia 'emerald' restante")

if __name__ == "__main__":
    main()
