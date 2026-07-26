#!/usr/bin/env python3
"""
Substitui text-gray-900 por text-foreground (token semantico).
Tambem substitui combos text-gray-900 dark:text-gray-100 (ou /50) por text-foreground.

Isso resolve o problema de textos invisiveis no dark mode (text-gray-900 em fundo
dark fica praticamente preto sobre cinza escuro).
"""
import re
import os

ROOT = "/home/z/my-project/src"

# Lista todos os .tsx recursivamente
import subprocess
result = subprocess.run(
    ["grep", "-rl", "--include=*.tsx", "text-gray-900", ROOT],
    capture_output=True, text=True
)
TARGETS = [f for f in result.stdout.strip().split('\n') if f]

REPLACEMENTS = [
    # Combos com dark variant primeiro
    (r'text-gray-900 dark:text-gray-100', 'text-foreground'),
    (r'text-gray-900 dark:text-gray-50', 'text-foreground'),
    (r'text-gray-900 dark:text-gray-200', 'text-foreground'),
    # text-gray-900 hover:text-gray-900 -> foreground
    (r'text-gray-400 hover:text-gray-900 dark:hover:text-white', 'text-muted-foreground hover:text-foreground'),
    (r'hover:text-gray-900 dark:hover:text-white', 'hover:text-foreground'),
    # plain text-gray-900 -> text-foreground
    (r'(?<![:\w-])text-gray-900\b', 'text-foreground'),
]

total = 0
for full in TARGETS:
    if not os.path.exists(full):
        continue
    with open(full, 'r', encoding='utf-8') as f:
        original = f.read()
    content = original
    file_subs = 0
    for pattern, repl in REPLACEMENTS:
        new_content, n = re.subn(pattern, repl, content)
        if n > 0:
            content = new_content
            file_subs += n
    if file_subs > 0:
        with open(full, 'w', encoding='utf-8') as f:
            f.write(content)
        # rel path para exibicao
        rel = os.path.relpath(full, ROOT)
        print(f"[ok] {rel}: {file_subs} substituicoes")
        total += file_subs

print(f"\nTotal: {total} substituicoes em {len(TARGETS)} arquivos")
