#!/usr/bin/env python3
"""
Substituir /logo-admin.png por /logo-cliente.png nas telas do CLIENTE
(login + painel do cliente), mantendo painel-admin.tsx intacto.

A nova logo-cliente.png e quadrada 180x180, entao os containers precisam
ser quadrados (altura = largura) para a logo nao cortar com object-contain.

Arquivos afetados:
- src/app/page.tsx (sistema do cliente logado em /)
- src/components/erp/portal-cliente.tsx (header busca + header detalhe)
- src/components/erp/tela-login.tsx (5 pontos: loading + branding desktop + mobile)
- src/lib/utils-erp.ts (LOGO_URL usada em canvas/PDF - contexto cliente)

NAO afeta:
- src/components/erp/painel-admin.tsx (continua usando /logo-admin.png)
"""
import re

# Container quadrado para logo 180x180 - mesma altura em todos os breakpoints
CONTAINER_QUADRADO = (
    'h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] md:h-[70px] md:w-[70px] '
    'lg:h-[80px] lg:w-[80px] xl:h-[100px] xl:w-[100px] object-contain shrink-0'
)

files = [
    "/home/z/my-project/src/app/page.tsx",
    "/home/z/my-project/src/components/erp/portal-cliente.tsx",
    "/home/z/my-project/src/components/erp/tela-login.tsx",
    "/home/z/my-project/src/lib/utils-erp.ts",
]

total_subs = 0

for path in files:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    original = content

    # 1) Trocar /logo-admin.png -> /logo-cliente.png (somente nestes arquivos)
    content = content.replace('/logo-admin.png', '/logo-cliente.png')

    # 2) Atualizar dimensoes HTML para quadrado 180x180
    content = content.replace('width={400} height={100}', 'width={180} height={180}')
    content = re.sub(r'width=\{400\}\s+height=\{100\}', 'width={180} height={180}', content)

    # 3) Container header principal (retangular wide -> quadrado)
    content = content.replace(
        'h-[50px] w-[200px] sm:h-[60px] sm:w-[240px] md:h-[70px] md:w-[280px] lg:h-[80px] lg:w-[320px] xl:h-[100px] xl:w-[400px] object-contain',
        CONTAINER_QUADRADO,
    )

    # 4) Branding desktop (tela-login): h-[60px] w-[240px] -> h-[60px] w-[60px]
    content = content.replace(
        'h-[60px] w-[240px] object-contain drop-shadow-lg',
        'h-[60px] w-[60px] object-contain drop-shadow-lg',
    )

    # 5) Logo mobile mb-6: h-[60px] w-[240px] -> h-[60px] w-[60px]
    content = content.replace(
        'h-[60px] w-[240px] mx-auto object-contain mb-6',
        'h-[60px] w-[60px] mx-auto object-contain mb-6',
    )

    # 6) Logo mobile mb-4: h-[60px] w-[240px] -> h-[60px] w-[60px]
    content = content.replace(
        'h-[60px] w-[240px] mx-auto object-contain mb-4',
        'h-[60px] w-[60px] mx-auto object-contain mb-4',
    )

    # 7) Loading screen: h-[80px] w-[320px] -> h-[80px] w-[80px]
    content = content.replace(
        'h-[80px] w-[320px] object-contain animate-pulse opacity-60',
        'h-[80px] w-[80px] object-contain animate-pulse opacity-60',
    )

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        subs = original.count('/logo-admin.png') - content.count('/logo-admin.png')
        total_subs += subs
        print(f"[OK] {path}: {subs} substituicoes /logo-admin.png -> /logo-cliente.png")
    else:
        print(f"[--] {path}: nenhuma alteracao")

print(f"\nTotal: {total_subs} referencias atualizadas para /logo-cliente.png")
