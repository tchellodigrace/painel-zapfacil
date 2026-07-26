#!/usr/bin/env python3
"""
Substitui gray-500/600 e bg-gray-100/200 (sem dark variant) por tokens semanticos.
Estes sao muito comuns e ficam problematicos no dark mode (text-gray-500 tem
contraste ruim contra fundo cinza escuro).

Excecoes: cupom-fiscal e acoes-cupom (fundo branco para impressao).
"""
import re
import os
import subprocess

ROOT = "/home/z/my-project/src"
EXCLUDE = ["cupom-fiscal.tsx", "acoes-cupom.tsx"]

# Lista arquivos .tsx com qualquer match
result = subprocess.run(
    ["grep", "-rl", "--include=*.tsx", "text-gray-500\\|text-gray-600\\|bg-gray-100\\|bg-gray-200\\|text-gray-300", ROOT],
    capture_output=True, text=True
)
TARGETS = []
for f in result.stdout.strip().split('\n'):
    if not f:
        continue
    base = os.path.basename(f)
    if base in EXCLUDE:
        print(f"[skip] {os.path.relpath(f, ROOT)} (excluido - fundo branco)")
        continue
    TARGETS.append(f)

REPLACEMENTS = [
    # Combos com dark variant - converter para muted-foreground (token)
    (r'text-gray-500 dark:text-gray-400', 'text-muted-foreground'),
    (r'text-gray-500 dark:text-gray-300', 'text-muted-foreground'),
    (r'text-gray-600 dark:text-gray-400', 'text-muted-foreground'),
    (r'text-gray-600 dark:text-gray-300', 'text-muted-foreground'),

    # hover combos
    (r'text-gray-500 hover:text-gray-700', 'text-muted-foreground hover:text-foreground'),
    (r'hover:text-gray-700 dark:hover:text-gray-300', 'hover:text-foreground'),

    # bg-gray-100/200 com dark variant
    (r'bg-gray-100 dark:bg-gray-800', 'bg-secondary'),
    (r'bg-gray-100 dark:bg-gray-900', 'bg-secondary'),
    (r'bg-gray-200 dark:bg-gray-700', 'bg-secondary'),

    # plain classes - sem dark variant
    (r'(?<![:\w-])text-gray-500\b', 'text-muted-foreground'),
    (r'(?<![:\w-])text-gray-600\b', 'text-muted-foreground'),
    (r'(?<![:\w-])text-gray-300\b', 'text-muted-foreground/70'),

    # bg-gray-* plain (sem dark variant) - viram muted (cinza claro sutil)
    (r'(?<![:\w-])bg-gray-100\b', 'bg-muted'),
    (r'(?<![:\w-])bg-gray-200\b', 'bg-muted'),
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
        rel = os.path.relpath(full, ROOT)
        print(f"[ok] {rel}: {file_subs} substituicoes")
        total += file_subs

print(f"\nTotal: {total} substituicoes")
