#!/usr/bin/env python3
"""
Substitui classes Tailwind blue-* por tokens semanticos Bitrix24.

Estrategia:
- text-blue-*     -> text-info (mantem tom informativo azul)
- bg-blue-100     -> bg-info/15
- bg-blue-200     -> bg-info/25
- bg-blue-50      -> bg-info/10
- bg-blue-500     -> bg-info
- bg-blue-600     -> bg-info (raro, geralmente botoes)
- bg-blue-950/900 -> dark:bg-info/20
- border-blue-*   -> border-info/30
- dark:text-blue-*-> dark:text-info/80
- dark:bg-blue-*  -> dark:bg-info/20

Excecoes:
- funil-leads.tsx: BLUE eh a cor semantica do status "Novo Lead", manter como accent.
- deploy-guide.tsx: bloco <pre> com bg-gray-900 text-green-400 nao toca (terminal).
"""
import re
import os

ROOT = "/home/z/my-project/src"
TARGETS = [
    "components/zapbot/fluxos-automacao.tsx",
    "components/zapbot/deploy-guide.tsx",
    "components/zapbot/mensagens-log.tsx",
    "components/zapbot/dashboard.tsx",
    "components/erp/dashboard-grafico.tsx",
    "hooks/use-admin-store.ts",
    "components/erp/crm-clientes.tsx",
    "components/erp/cupom-fiscal.tsx",
    "components/erp/admin-cobrancas.tsx",
    "components/erp/painel-agendamento.tsx",
    "app/admin/migrar/page.tsx",
    "components/erp/painel-zapbot.tsx",
    "components/erp/lancamento-form.tsx",
    "components/erp/painel-admin.tsx",
    "app/page.tsx",
]

# Ordem importa: sequencias mais longas primeiro
REPLACEMENTS = [
    # dark: variants primeiro
    (r'(?<![:\w-])dark:bg-blue-950/20\b', 'dark:bg-info/20'),
    (r'(?<![:\w-])dark:bg-blue-950/30\b', 'dark:bg-info/25'),
    (r'(?<![:\w-])dark:bg-blue-900/30\b', 'dark:bg-info/20'),
    (r'(?<![:\w-])dark:bg-blue-900/40\b', 'dark:bg-info/25'),
    (r'(?<![:\w-])dark:bg-blue-900\b', 'dark:bg-info/25'),
    (r'(?<![:\w-])dark:bg-blue-950\b', 'dark:bg-info/20'),
    (r'(?<![:\w-])dark:bg-blue-800\b', 'dark:bg-info/30'),
    (r'(?<![:\w-])dark:text-blue-200\b', 'dark:text-info/70'),
    (r'(?<![:\w-])dark:text-blue-300\b', 'dark:text-info/80'),
    (r'(?<![:\w-])dark:text-blue-400\b', 'dark:text-info/80'),
    (r'(?<![:\w-])dark:border-blue-800\b', 'dark:border-info/30'),
    (r'(?<![:\w-])dark:border-blue-900\b', 'dark:border-info/30'),

    # hover: variants
    (r'(?<![:\w-])hover:bg-blue-700\b', 'hover:bg-info/90'),
    (r'(?<![:\w-])hover:bg-blue-600\b', 'hover:bg-info/90'),
    (r'(?<![:\w-])hover:bg-blue-50\b', 'hover:bg-info/10'),
    (r'(?<![:\w-])hover:text-blue-700\b', 'hover:text-info'),

    # data-[state=active]: (tabs)
    (r'data-\[state=active\]:bg-blue-600\b', 'data-[state=active]:bg-primary'),

    # bg-* com opacidade (ex: bg-blue-500/15)
    (r'(?<![:\w-])bg-blue-500/15\b', 'bg-info/15'),
    (r'(?<![:\w-])bg-blue-500/10\b', 'bg-info/10'),
    (r'(?<![:\w-])bg-blue-50/50\b', 'bg-info/10'),

    # plain classes (opacidade 1)
    (r'(?<![:\w-])bg-blue-50\b', 'bg-info/10'),
    (r'(?<![:\w-])bg-blue-100\b', 'bg-info/15'),
    (r'(?<![:\w-])bg-blue-200\b', 'bg-info/25'),
    (r'(?<![:\w-])bg-blue-500\b', 'bg-info'),
    (r'(?<![:\w-])bg-blue-600\b', 'bg-info'),
    (r'(?<![:\w-])bg-blue-700\b', 'bg-info'),
    (r'(?<![:\w-])bg-blue-950\b', 'bg-info/20'),

    (r'(?<![:\w-])text-blue-500\b', 'text-info'),
    (r'(?<![:\w-])text-blue-600\b', 'text-info'),
    (r'(?<![:\w-])text-blue-700\b', 'text-info'),
    (r'(?<![:\w-])text-blue-800\b', 'text-info'),

    (r'(?<![:\w-])border-blue-100\b', 'border-info/20'),
    (r'(?<![:\w-])border-blue-200\b', 'border-info/30'),
    (r'(?<![:\w-])border-blue-500/30\b', 'border-info/30'),
    (r'(?<![:\w-])border-blue-500\b', 'border-info'),
]

total_subs = 0
for relpath in TARGETS:
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

print(f"\nTotal: {total_subs} substituicoes em {len(TARGETS)} arquivos")
