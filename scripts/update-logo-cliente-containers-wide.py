#!/usr/bin/env python3
"""
Atualizar containers da logo-cliente para retangulares wide (2:1)
ja que a logo agora e 400x200 apos o trim.

Antes: h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] ... (quadrado)
Agora: h-[50px] w-[100px] sm:h-[60px] sm:w-[120px] ... (wide 2:1)
"""
import re

CONTAINER_WIDE = (
    'h-[50px] w-[100px] sm:h-[60px] sm:w-[120px] md:h-[70px] md:w-[140px] '
    'lg:h-[80px] lg:w-[160px] xl:h-[100px] xl:w-[200px] object-contain shrink-0'
)

CONTAINER_QUADRADO_ANTIGO = (
    'h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] md:h-[70px] md:w-[70px] '
    'lg:h-[80px] lg:w-[80px] xl:h-[100px] xl:w-[100px] object-contain shrink-0'
)

# variantes sem shrink-0
CONTAINER_QUADRADO_ANTIGO_V2 = (
    'h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] md:h-[70px] md:w-[70px] '
    'lg:h-[80px] lg:w-[80px] xl:h-[100px] xl:w-[100px] object-contain'
)

files = [
    "/home/z/my-project/src/app/page.tsx",
    "/home/z/my-project/src/components/erp/portal-cliente.tsx",
    "/home/z/my-project/src/components/erp/tela-login.tsx",
]

# Atualizar tambem HTML attrs width/height: 180x180 -> 400x200
total = 0
for path in files:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    original = content

    content = content.replace(CONTAINER_QUADRADO_ANTIGO, CONTAINER_WIDE)
    content = content.replace(CONTAINER_QUADRADO_ANTIGO_V2, CONTAINER_WIDE)

    # Atualizar dimensoes HTML da logo: 180x180 -> 400x200
    content = content.replace('width={180} height={180}', 'width={400} height={200}')
    content = re.sub(r'width=\{180\}\s+height=\{180\}', 'width={400} height={200}', content)

    # Branding desktop (tela-login): h-[60px] w-[60px] -> h-[60px] w-[120px]
    content = content.replace(
        'h-[60px] w-[60px] object-contain drop-shadow-lg',
        'h-[60px] w-[120px] object-contain drop-shadow-lg',
    )

    # Logo mobile mb-6
    content = content.replace(
        'h-[60px] w-[60px] mx-auto object-contain mb-6',
        'h-[60px] w-[120px] mx-auto object-contain mb-6',
    )

    # Logo mobile mb-4
    content = content.replace(
        'h-[60px] w-[60px] mx-auto object-contain mb-4',
        'h-[60px] w-[120px] mx-auto object-contain mb-4',
    )

    # Loading screen: h-[80px] w-[80px] -> h-[80px] w-[160px]
    content = content.replace(
        'h-[80px] w-[80px] object-contain animate-pulse opacity-60',
        'h-[80px] w-[160px] object-contain animate-pulse opacity-60',
    )

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        total += 1
        print(f"[OK] {path}")
    else:
        print(f"[--] {path}: sem alteracoes")

print(f"\n{total} arquivos atualizados")
