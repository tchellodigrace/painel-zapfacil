#!/usr/bin/env python3
"""
Segunda rodada - tons faltantes (200, 400, 500, 800, 900, 950).
"""
import re
from pathlib import Path

SUBS = [
    # Tons restantes - mapeamento direto para tons correspondentes de primary
    (r"bg-emerald-950/20", "bg-primary/15"),
    (r"bg-emerald-950/30", "bg-primary/20"),
    (r"bg-emerald-950/40", "bg-primary/25"),
    (r"bg-emerald-950", "bg-primary/25"),
    (r"bg-emerald-900/40", "bg-primary/30"),
    (r"bg-emerald-900/50", "bg-primary/30"),
    (r"bg-emerald-900", "bg-primary/30"),
    (r"bg-emerald-800/40", "bg-primary/40"),
    (r"bg-emerald-800", "bg-primary/40"),
    (r"bg-emerald-500/30", "bg-white/10"),
    (r"bg-emerald-500/20", "bg-primary/20"),
    (r"bg-emerald-500/10", "bg-primary/10"),
    (r"bg-emerald-500", "bg-primary"),
    (r"bg-emerald-400", "bg-primary/60"),
    (r"bg-emerald-200", "bg-primary/15"),
    
    (r"text-emerald-950", "text-primary"),
    (r"text-emerald-900", "text-primary"),
    (r"text-emerald-800", "text-primary"),
    (r"text-emerald-700", "text-primary"),
    (r"text-emerald-600", "text-primary"),
    (r"text-emerald-500", "text-primary"),
    (r"text-emerald-400", "text-primary/80"),
    (r"text-emerald-300", "text-white/80"),
    (r"text-emerald-200", "text-white/60"),
    
    (r"border-emerald-950", "border-primary/40"),
    (r"border-emerald-900", "border-primary/40"),
    (r"border-emerald-800", "border-primary/40"),
    (r"border-emerald-700", "border-primary/30"),
    (r"border-emerald-600", "border-primary/30"),
    (r"border-emerald-500", "border-primary/30"),
    (r"border-emerald-400", "border-primary/20"),
    (r"border-emerald-300", "border-primary/30"),
    (r"border-emerald-200", "border-primary/20"),
    (r"border-emerald-100", "border-primary/15"),
    
    (r"ring-emerald-500", "ring-primary"),
    (r"ring-emerald-400", "ring-primary/60"),
    
    (r"hover:bg-emerald-950", "hover:bg-primary/30"),
    (r"hover:bg-emerald-900", "hover:bg-primary/30"),
    (r"hover:bg-emerald-800", "hover:bg-primary/40"),
    (r"hover:bg-emerald-700", "hover:bg-primary/90"),
    (r"hover:bg-emerald-600", "hover:bg-primary/90"),
    (r"hover:bg-emerald-500", "hover:bg-primary"),
    (r"hover:bg-emerald-200", "hover:bg-primary/20"),
    (r"hover:bg-emerald-100", "hover:bg-primary/10"),
    
    (r"hover:text-emerald-900", "hover:text-primary"),
    (r"hover:text-emerald-800", "hover:text-primary/90"),
    (r"hover:text-emerald-700", "hover:text-primary/80"),
    (r"hover:text-emerald-600", "hover:text-primary/80"),
    (r"hover:text-emerald-500", "hover:text-primary/80"),
    
    (r"hover:border-emerald-700", "hover:border-primary/30"),
    (r"hover:border-emerald-600", "hover:border-primary/30"),
    (r"hover:border-emerald-500", "hover:border-primary/30"),
    (r"hover:border-emerald-400", "hover:border-primary/30"),
    (r"hover:border-emerald-300", "hover:border-primary/30"),
    (r"hover:border-emerald-200", "hover:border-primary/20"),
    
    (r"from-emerald-500", "from-primary"),
    (r"from-emerald-400", "from-primary"),
    (r"to-emerald-500", "to-primary"),
    (r"to-emerald-400", "to-primary"),
    (r"via-emerald-500", "via-primary"),
    (r"via-emerald-400", "via-primary"),
    
    # Caso geral de fallback - qualquer emerald-X que tenha sobrado
    (r"emerald-950", "primary"),
    (r"emerald-900", "primary"),
    (r"emerald-800", "primary"),
    (r"emerald-700", "primary"),
    (r"emerald-600", "primary"),
    (r"emerald-500", "primary"),
    (r"emerald-400", "primary"),
    (r"emerald-300", "primary"),
    (r"emerald-200", "primary"),
    (r"emerald-100", "primary"),
    (r"emerald-50", "primary"),
]

def main():
    base = Path("/home/z/my-project/src")
    files = list(base.rglob("*.tsx")) + list(base.rglob("*.ts"))
    
    total_all = 0
    files_modified = 0
    
    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue
        if "emerald" not in content:
            continue
        n_in_file = 0
        for pattern, replacement in SUBS:
            new_content, n = re.subn(pattern, replacement, content)
            if n > 0:
                n_in_file += n
                content = new_content
        if n_in_file > 0:
            f.write_text(content, encoding="utf-8")
            print(f"  [{n_in_file:>3}x] {f.relative_to(base)}")
            total_all += n_in_file
            files_modified += 1
    
    print(f"\n=== TOTAL: {total_all} substituicoes em {files_modified} arquivos ===")
    
    # Verificar sobras
    remaining = 0
    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue
        if "emerald" in content:
            matches = re.findall(r"emerald-\w+", content)
            print(f"  ⚠ {f.relative_to(base)}: {sorted(set(matches))}")
            remaining += len(matches)
    
    if remaining == 0:
        print("\n✓ Nenhuma referencia 'emerald' restante em todo o projeto")
    else:
        print(f"\n⚠ Restam {remaining} referencias 'emerald'")

if __name__ == "__main__":
    main()
