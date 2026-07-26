#!/usr/bin/env python3
"""
Substitui combos bg-white dark:bg-gray-* por bg-card (token semantico).
Tambem substitui border-gray-100/200/300 dark:border-gray-700/800 por border-border.

Isso garante consistencia total no dark mode (cards sempre usam bg-card que agora
e #353539 - cinza claro legivel).
"""
import re
import os
import subprocess

ROOT = "/home/z/my-project/src"
EXCLUDE = ["cupom-fiscal.tsx", "acoes-cupom.tsx"]

result = subprocess.run(
    ["grep", "-rl", "--include=*.tsx", "bg-white dark:bg-gray-", ROOT],
    capture_output=True, text=True
)
TARGETS = []
for f in result.stdout.strip().split('\n'):
    if not f:
        continue
    base = os.path.basename(f)
    if base in EXCLUDE:
        continue
    TARGETS.append(f)

REPLACEMENTS = [
    # bg-white dark:bg-gray-X combos -> bg-card
    (r'bg-white dark:bg-gray-900', 'bg-card'),
    (r'bg-white dark:bg-gray-800', 'bg-card'),
    (r'bg-white dark:bg-gray-700', 'bg-card'),

    # border-gray-X dark:border-gray-Y combos -> border-border
    (r'border-gray-100 dark:border-gray-800', 'border-border'),
    (r'border-gray-200 dark:border-gray-700', 'border-border'),
    (r'border-gray-200 dark:border-gray-800', 'border-border'),
    (r'border-gray-300 dark:border-gray-700', 'border-border'),

    # plain border-gray-100/200/300 (sem dark) -> border-border
    (r'(?<![:\w-])border-gray-100\b', 'border-border'),
    (r'(?<![:\w-])border-gray-200\b', 'border-border'),
    (r'(?<![:\w-])border-gray-300\b', 'border-border'),
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
