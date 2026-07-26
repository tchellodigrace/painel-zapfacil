#!/usr/bin/env python3
"""
Trocar todas as referencias de logo-empresa.png por logo-admin.png
e restaurar dimensoes retangulares wide (iguais ao painel admin).

Razao: a logo-empresa.png e quadrada 180x180 e fica cortada em containers
retangulares. A logo-admin.png e wide 1536x1024 e funciona perfeitamente
com o padrao do painel admin: h-[50px] w-[200px] sm:h-[60px] sm:w-[240px] etc.
"""
import re

# Configuracao do padrao do painel admin (identico ao header do painel-admin.tsx)
ADMIN_HEADER_LOGO = (
    'h-[50px] w-[200px] sm:h-[60px] sm:w-[240px] md:h-[70px] md:w-[280px] '
    'lg:h-[80px] lg:w-[320px] xl:h-[100px] xl:w-[400px] object-contain'
)

# Dimensoes do header do painel admin (branding desktop e mobile usam h-[60px] w-[240px])
ADMIN_BRANDING_LOGO = 'h-[60px] w-[240px] object-contain drop-shadow-lg'
ADMIN_MOBILE_LOGO = 'h-[60px] w-[240px] mx-auto object-contain mb-6'
ADMIN_MOBILE_LOGO_MB4 = 'h-[60px] w-[240px] mx-auto object-contain mb-4'
ADMIN_LOADING_LOGO = 'h-[80px] w-[320px] object-contain animate-pulse opacity-60'

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

    # 1) Trocar todas as referencias de logo-empresa.png -> logo-admin.png
    content = content.replace('/logo-empresa.png', '/logo-admin.png')

    # 2) Restaurar dimensoes retangulares wide (width/height attrs HTML)
    content = content.replace('width={180} height={180}', 'width={400} height={100}')

    # 3) Atualizar classNames para o padrao do painel admin

    # a) Header principal (sistema cliente / portal-cliente busca)
    #    h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] md:h-[70px] md:w-[70px] lg:h-[80px] lg:w-[80px] xl:h-[100px] xl:w-[100px] object-contain shrink-0
    content = re.sub(
        r'h-\[50px\] w-\[50px\] sm:h-\[60px\] sm:w-\[60px\] md:h-\[70px\] md:w-\[70px\] lg:h-\[80px\] lg:w-\[80px\] xl:h-\[100px\] xl:w-\[100px\] object-contain shrink-0',
        ADMIN_HEADER_LOGO,
        content,
    )
    # variante sem shrink-0
    content = re.sub(
        r'h-\[50px\] w-\[50px\] sm:h-\[60px\] sm:w-\[60px\] md:h-\[70px\] md:w-\[70px\] lg:h-\[80px\] lg:w-\[80px\] xl:h-\[100px\] xl:w-\[100px\] object-contain',
        ADMIN_HEADER_LOGO,
        content,
    )

    # b) Loading screen: h-[80px] w-[80px] -> h-[80px] w-[320px]
    content = content.replace(
        'h-[80px] w-[80px] object-contain animate-pulse opacity-60',
        ADMIN_LOADING_LOGO,
    )

    # c) Branding desktop (tela-login): h-[60px] w-[60px] object-contain drop-shadow-lg -> h-[60px] w-[240px]
    content = content.replace(
        'h-[60px] w-[60px] object-contain drop-shadow-lg',
        ADMIN_BRANDING_LOGO,
    )

    # d) Logo mobile (tela-login): h-[60px] w-[60px] mx-auto object-contain mb-6
    content = content.replace(
        'h-[60px] w-[60px] mx-auto object-contain mb-6',
        ADMIN_MOBILE_LOGO,
    )

    # e) Logo mobile variante mb-4: h-[60px] w-[60px] mx-auto object-contain mb-4
    content = content.replace(
        'h-[60px] w-[60px] mx-auto object-contain mb-4',
        ADMIN_MOBILE_LOGO_MB4,
    )

    if content != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        subs = original.count('/logo-empresa.png') - content.count('/logo-empresa.png')
        total_subs += subs
        print(f"[OK] {path}: {subs} substituicoes de logo-empresa -> logo-admin")
    else:
        print(f"[--] {path}: nenhuma alteracao necessaria")

print(f"\nTotal: {total_subs} referencias atualizadas para /logo-admin.png")
