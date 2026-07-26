"""
Substitui todas as ocorrencias do link antigo pelo novo no painel-admin.tsx.
"""
PATH = '/home/z/my-project/src/components/erp/painel-admin.tsx'
OLD = 'https://j1ewd51wcs60-d.space-z.ai/'
NEW = 'https://my-project-rho-sooty.vercel.app/'

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

count = content.count(OLD)
new_content = content.replace(OLD, NEW)

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Substituicoes: {count}')
print(f'Link antigo: {OLD}')
print(f'Link novo:   {NEW}')

# Verificacao
with open(PATH, 'r', encoding='utf-8') as f:
    final = f.read()
remaining = final.count(OLD)
new_count = final.count(NEW)
print(f'\nVerificacao:')
print(f'  Link antigo restante: {remaining} (esperado: 0)')
print(f'  Link novo presente:   {new_count}')
