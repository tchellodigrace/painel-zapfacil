#!/usr/bin/env python3
"""
Corrige classes invalidas geradas pelas substituicoes em massa.
Ex: 'bg-primary/50/10' deve virar 'bg-primary/10'.
A regra: quando ha dois modificadores de opacidade (primary/X/Y), manter apenas o ultimo (Y).
"""
import re
from pathlib import Path

# Padrao: (prefixo-Tailwind)-(primary)/NUMERO/NUMERO
# Substituir por: (prefixo)-(primary)/ULTIMO_NUMERO
PATTERN = re.compile(
    r"(bg|text|border|ring|from|to|via|fill|stroke|outline|divide|accent|caret|decoration|shadow|ring-offset)-(primary)/(?:\d+)/(10|20|25|30|40|50|60|70|80|90|95|100|5|15)\b"
)

def main():
    base = Path("/home/z/my-project/src")
    files = list(base.rglob("*.tsx")) + list(base.rglob("*.ts"))
    
    total = 0
    files_modified = 0
    
    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue
        if "primary/" not in content:
            continue
        # Conta quantas correcoes serao feitas
        matches = PATTERN.findall(content)
        if not matches:
            continue
        new_content = PATTERN.sub(lambda m: f"{m.group(1)}-{m.group(2)}/{m.group(3)}", content)
        n = len(matches)
        f.write_text(new_content, encoding="utf-8")
        print(f"  [{n:>3}x] {f.relative_to(base)}")
        total += n
        files_modified += 1
    
    print(f"\n=== TOTAL: {total} correcoes em {files_modified} arquivos ===")
    
    # Verificar sobras
    remaining = 0
    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue
        matches = re.findall(r"\b(?:bg|text|border|ring|from|to|via)-primary/\d+/\d+", content)
        if matches:
            print(f"  ⚠ {f.relative_to(base)}: {matches}")
            remaining += len(matches)
    
    if remaining == 0:
        print("\n✓ Nenhuma classe invalida 'primary/X/Y' restante")
    else:
        print(f"\n⚠ Restam {remaining} classes invalidas")

if __name__ == "__main__":
    main()
