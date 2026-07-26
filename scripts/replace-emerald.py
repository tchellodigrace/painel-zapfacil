#!/usr/bin/env python3
"""
Substitui todas as referencias a cores 'emerald' (verde) por 'primary' (azul Bitrix24)
no painel-admin.tsx, mantendo o contexto semantico onde faz sentido.
"""
import re
from pathlib import Path

FILE = Path("/home/z/my-project/src/components/erp/painel-admin.tsx")

# Lista de substituicoes (regex, replacement)
# Ordem importa - substituicoes mais especificas primeiro
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
    # Backgrounds de icones/circulos
    (r"bg-emerald-600 text-white shadow-sm",
     "bg-primary text-primary-foreground shadow-sm"),
    (r"bg-emerald-600",
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
    # Ring isolado
    (r"ring-emerald-500",
     "ring-primary"),
    (r"ring-emerald-400",
     "ring-primary/60"),
    # Sombra/blur decorativo
    (r"bg-emerald-500/30",
     "bg-white/10"),
    # Hover states
    (r"hover:bg-emerald-100",
     "hover:bg-primary/10"),
    (r"hover:bg-emerald-700",
     "hover:bg-primary/90"),
    (r"hover:text-emerald-700",
     "hover:text-primary/80"),
    (r"hover:text-emerald-800",
     "hover:text-primary/90"),
]

def main():
    content = FILE.read_text(encoding="utf-8")
    original_len = len(content)
    total_subs = 0
    
    for pattern, replacement in SUBS:
        new_content, n = re.subn(pattern, replacement, content)
        if n > 0:
            total_subs += n
            content = new_content
            print(f"  [{n:>3}x] {pattern[:70]}")
    
    FILE.write_text(content, encoding="utf-8")
    print(f"\nTotal: {total_subs} substituicoes realizadas")
    print(f"Tamanho: {original_len} -> {len(content)} bytes")
    
    # Verificar se ainda ha emerald
    remaining = re.findall(r"emerald-\w+", content)
    if remaining:
        print(f"\n⚠ Ainda restam {len(remaining)} referencias 'emerald':")
        for ref in set(remaining):
            print(f"  - {ref}")
    else:
        print("\n✓ Nenhuma referencia 'emerald' restante")

if __name__ == "__main__":
    main()
