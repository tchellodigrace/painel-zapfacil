#!/usr/bin/env python3
"""
Substitui dark:text-white/80 e dark:text-white/60 por dark:text-foreground/80
e dark:text-foreground/60 para usar token semantico em vez de hardcoded white.

Com o novo tema dark (#2b2b2e bg, #353539 card, #f3f4f6 foreground) isso garante
que os textos sempre usem o foreground definido no tema, mantendo legibilidade.
"""
import re
import os

ROOT = "/home/z/my-project/src"
TARGETS = [
    "components/crm/funil-leads.tsx",
    "components/zapbot/disparo-massa.tsx",
    "components/erp/portal-cliente.tsx",
    "components/erp/crm-clientes.tsx",
    "components/erp/historico.tsx",
    "components/erp/painel-colaboradores.tsx",
    "components/erp/painel-agendamento.tsx",
    "components/erp/painel-zapbot.tsx",
    "components/erp/lancamento-form.tsx",
    "components/erp/painel-admin.tsx",
    "components/erp/painel-despesas.tsx",
    "app/admin/migrar/page.tsx",
]

REPLACEMENTS = [
    (r'(?<![:\w-])dark:text-white/80\b', 'dark:text-foreground/80'),
    (r'(?<![:\w-])dark:text-white/60\b', 'dark:text-foreground/60'),
    (r'(?<![:\w-])dark:text-white\b', 'dark:text-foreground'),
    # Tambem converte text-gray-900 dark:text-white (combos comuns) para text-foreground direto
    (r'text-gray-900 dark:text-foreground', 'text-foreground'),
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
    for pattern, repl in REPLACEMENTS:
        new_content, n = re.subn(pattern, repl, content)
        if n > 0:
            content = new_content
            file_subs += n
    if file_subs > 0:
        with open(full, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[ok] {relpath}: {file_subs} substituicoes")
        total += file_subs

print(f"\nTotal: {total} substituicoes")
