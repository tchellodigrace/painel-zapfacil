#!/usr/bin/env python3
"""
Substitui classes Tailwind green-* por tokens semânticos da paleta Bitrix24.

Convencao:
- bg-green-*      -> bg-success (ou hover:bg-success/90)
- text-green-*    -> text-success
- border-green-*  -> border-success
- ring-green-*    -> ring-success

Mantem verde para indicadores de status (online, sucesso, conectado) - faz parte
do semantic system, mas usa o token --success que e mais escuro/alinhado.
"""
import re
import os
import sys

ROOT = "/home/z/my-project/src"
FILES = [
    "components/zapbot/zapbot-layout.tsx",
    "components/zapbot/deploy-guide.tsx",
    "components/zapbot/disparo-massa.tsx",
    "components/erp/admin-cobrancas.tsx",
    "components/erp/painel-admin.tsx",
]

# Mapeamentos diretos (substring -> replacement)
# Ordem importa: classes hover: precisam vir antes das plain
REPLACEMENTS = [
    # hover: variants primeiro
    (r'hover:bg-green-(?:500|600|700)\b', 'hover:bg-success/90'),
    (r'hover:text-green-(?:500|600|700)\b', 'hover:text-success/80'),
    (r'hover:border-green-(?:500|600|700)\b', 'hover:border-success/80'),
    # dark: variants
    (r'dark:text-green-(?:400|500)\b', 'dark:text-success/80'),
    (r'dark:bg-green-(?:950|900)\b', 'dark:bg-success/20'),
    # plain
    (r'bg-green-(?:500|600|700)\b', 'bg-success'),
    (r'text-green-(?:500|600|700)\b', 'text-success'),
    (r'border-green-(?:500|600|700)\b', 'border-success'),
    (r'ring-green-(?:500|600)\b', 'ring-success'),
]

total_subs = 0
for relpath in FILES:
    full = os.path.join(ROOT, relpath)
    if not os.path.exists(full):
        print(f"[skip] {relpath} (nao existe)")
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
        print(f"[ok] {relpath}: {file_subs} substituicoes")
        total_subs += file_subs
    else:
        print(f"[--] {relpath}: 0 substituicoes")

print(f"\nTotal: {total_subs} substituicoes em {len(FILES)} arquivos")
