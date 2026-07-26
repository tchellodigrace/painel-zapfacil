#!/usr/bin/env python3
"""
Refina consistencia visual Bitrix24:
1. Substitui hardcoded gray-50/100/200/800/900 nos tabs/containers por tokens semanticos
2. Mantem primary (azul) como cor ativa das tabs
3. Padroniza hover states para usar muted-foreground/secondary

Apenas em arquivos do painel admin (alta confianca).
"""
import re
import os

ROOT = "/home/z/my-project/src"
TARGETS = [
    "components/erp/painel-admin.tsx",
]

# Pares de substituicao (substring literal -> replacement)
# Ordem importa: sequencias mais longas primeiro
REPLACEMENTS = [
    # Container das tabs
    (
        "grid grid-cols-2 sm:grid-cols-4 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 shadow-sm",
        "grid grid-cols-2 sm:grid-cols-4 bg-card rounded-xl p-1 border border-border shadow-card"
    ),
    # Hover state das tabs inativas (mesmo padrao repetido 4x)
    (
        "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800",
        "text-muted-foreground hover:text-foreground hover:bg-secondary"
    ),
    # Badge de count quando tab inativa
    (
        "bg-gray-100 text-gray-500",
        "bg-secondary text-muted-foreground"
    ),
]

total = 0
for relpath in TARGETS:
    full = os.path.join(ROOT, relpath)
    if not os.path.exists(full):
        continue
    with open(full, 'r', encoding='utf-8') as f:
        original = f.read()
    content = original
    file_subs = 0
    for old, new in REPLACEMENTS:
        n = content.count(old)
        if n > 0:
            content = content.replace(old, new)
            file_subs += n
    if file_subs > 0:
        with open(full, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[ok] {relpath}: {file_subs} substituicoes")
        total += file_subs
    else:
        print(f"[--] {relpath}: 0 substituicoes")

print(f"\nTotal: {total} substituicoes")
