#!/usr/bin/env python3
"""Fix logo-empresa.png dimensions in tela-login.tsx to match square 180x180 logo."""
import re

path = "/home/z/my-project/src/components/erp/tela-login.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Substituir todos os width={400} height={100} que aparecem em tags img com logo-empresa
# Padrão: src="/logo-empresa.png" alt="..." width={400} height={100} className="h-[60px] w-[240px]..."

# Pattern 1: h-[60px] w-[240px] object-contain drop-shadow-lg (multi-line tag)
content = re.sub(
    r'(src="/logo-empresa\.png"\s+alt="Logo"\s+)width=\{400\}\s+height=\{100\}(\s+className=")h-\[60px\] w-\[240px\] object-contain drop-shadow-lg"',
    r'\1width={180} height={180}\2h-[60px] w-[60px] object-contain drop-shadow-lg"',
    content,
)

# Pattern 2: h-[60px] w-[240px] mx-auto object-contain mb-6
content = re.sub(
    r'(src="/logo-empresa\.png"\s+alt="Logo"\s+)width=\{400\}\s+height=\{100\}(\s+className=")h-\[60px\] w-\[240px\] mx-auto object-contain mb-6"',
    r'\1width={180} height={180}\2h-[60px] w-[60px] mx-auto object-contain mb-6"',
    content,
)

# Pattern 3: h-[60px] w-[240px] mx-auto object-contain mb-4
content = re.sub(
    r'(src="/logo-empresa\.png"\s+alt="Logo"\s+)width=\{400\}\s+height=\{100\}(\s+className=")h-\[60px\] w-\[240px\] mx-auto object-contain mb-4"',
    r'\1width={180} height={180}\2h-[60px] w-[60px] mx-auto object-contain mb-4"',
    content,
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

# Verify
with open(path, "r", encoding="utf-8") as f:
    new_content = f.read()

print("Remaining width={400} height={100} occurrences:", new_content.count("width={400} height={100}"))
print("logo-empresa.png occurrences:", new_content.count('logo-empresa.png'))
print("New width={180} height={180} occurrences:", new_content.count("width={180} height={180}"))
