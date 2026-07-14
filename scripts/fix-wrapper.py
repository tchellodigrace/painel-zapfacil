#!/usr/bin/env python3
"""Remove the redundant w-full wrapper and make all tab content direct children of main."""

FILE = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the opening wrapper div
content = content.replace(
    '        {/* Conteúdo da aba ativa */}\n        <div className="w-full">\n        {abaAtiva',
    '        {/* Conteúdo da aba ativa */}\n        {abaAtiva'
)

# Remove the closing wrapper div - it's right before </main>
# The pattern is: )}\n        </div>\n      </main>
# We need to remove just the </div> that closes the w-full wrapper
content = content.replace(
    '        )}\n        </div>\n      </main>',
    '        )}\n      </main>'
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Removed w-full wrapper - tab content is now direct child of main")