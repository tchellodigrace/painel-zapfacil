"""
Corrige as referencias a logo-cliente.png na tela-login.tsx:
- width={400} height={200} -> width={400} height={100} (proporcao 4:1 correta)
"""
import re

PATH = '/home/z/my-project/src/components/erp/tela-login.tsx'

with open(PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Padrão que cobre:
#   width={400} height={200}         (na mesma linha)
#   width={400}\n   height={200}     (em linhas separadas, com espaços)
padrao = re.compile(r'width=\{400\}\s+height=\{200\}')

novo_content, n_subst = padrao.subn('width={400} height={100}', content)

if n_subst == 0:
    print('AVISO: nenhuma substituicao feita - padrao nao encontrado')
else:
    with open(PATH, 'w', encoding='utf-8') as f:
        f.write(novo_content)
    print(f'Substituicoes feitas: {n_subst}')
    print(f'Arquivo salvo: {PATH}')

# Verificacao
with open(PATH, 'r', encoding='utf-8') as f:
    final = f.read()
old_count = final.count('height={200}')
new_count = final.count('height={100}')
print(f'\nVerificacao:')
print(f'  height={{200}} restantes: {old_count}')
print(f'  height={{100}} presentes: {new_count}')
