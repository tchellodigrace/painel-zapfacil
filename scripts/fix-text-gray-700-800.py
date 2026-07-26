#!/usr/bin/env python3
"""
Substitui text-gray-700/800 por text-foreground ou text-muted-foreground,
exceto em cupom-fiscal (recibo impresso em fundo branco, mantem cor escura).
"""
import re
import os
import subprocess

ROOT = "/home/z/my-project/src"

# Exceto cupom-fiscal (sempre fundo branco para impressao)
EXCLUDE = ["components/erp/cupom-fiscal.tsx", "components/erp/acoes-cupom.tsx"]

result = subprocess.run(
    ["grep", "-rl", "--include=*.tsx", "text-gray-700\\|text-gray-800", ROOT],
    capture_output=True, text=True
)
TARGETS = []
for f in result.stdout.strip().split('\n'):
    if not f:
        continue
    rel = os.path.relpath(f, ROOT)
    if any(rel == ex or rel.endswith(ex) for ex in EXCLUDE):
        print(f"[skip] {rel} (excluido - fundo branco intencional)")
        continue
    TARGETS.append(f)

REPLACEMENTS = [
    # Combos com dark variant primeiro
    (r'text-gray-700 dark:text-gray-300', 'text-muted-foreground'),
    (r'text-gray-700 dark:text-gray-200', 'text-muted-foreground'),
    (r'text-gray-800 dark:text-gray-200', 'text-foreground'),
    (r'text-gray-800 dark:text-gray-100', 'text-foreground'),
    # plain
    (r'(?<![:\w-])text-gray-700\b', 'text-muted-foreground'),
    (r'(?<![:\w-])text-gray-800\b', 'text-foreground'),
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
