#!/usr/bin/env python3
"""Fix Sistemas tab: replace fragment <> with <div className="space-y-6"> to match other tabs."""

FILE = "/home/z/my-project/src/components/erp/painel-admin.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the opening fragment with a div
content = content.replace(
    '        ) : (\n          <>\n            {/* Cards de estatísticas - Sistemas */}',
    '        ) : (\n          <div className="space-y-6">\n            {/* Cards de estatísticas - Sistemas */}'
)

# Replace the closing fragment with the div close
content = content.replace(
    '          </>\n        )}\n        </div>\n      </main>',
    '          </div>\n        )}\n        </div>\n      </main>'
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed: Sistemas tab now uses <div className='space-y-6'> instead of fragment")