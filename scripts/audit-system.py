"""Auditoria geral dos logos e referencias."""
import os
import subprocess
from PIL import Image

print('=== LOGOS no /public ===')
logos = ['public/logo-admin.png', 'public/logo-cliente.png', 'public/logo-empresa.png', 'public/favicon.png']
for f in logos:
    if os.path.exists(f):
        img = Image.open(f).convert('RGBA')
        w, h = img.size
        pixels = list(img.getdata())
        total = len(pixels)
        transparent = sum(1 for p in pixels if p[3] == 0)
        white_opaque = sum(1 for p in pixels if p[3] == 255 and p[0] > 240 and p[1] > 240 and p[2] > 240)
        print(f'  {f}: {w}x{h} ({w/h:.2f}:1) - transp={100*transparent/total:.1f}% - white_opaque={100*white_opaque/total:.1f}%')
    else:
        print(f'  {f}: NAO EXISTE')

print()
print('=== Referencias a logos no codigo ===')
for logo in ['logo-empresa', 'logo-admin', 'logo-cliente']:
    result = subprocess.run(['grep', '-rln', f'{logo}', 'src/'], capture_output=True, text=True)
    files = [f for f in result.stdout.strip().split('\n') if f]
    print(f'  {logo}: {files}')

print()
print('=== Componentes ERP ===')
erp_dir = 'src/components/erp'
if os.path.exists(erp_dir):
    files = sorted(os.listdir(erp_dir))
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            size = os.path.getsize(os.path.join(erp_dir, f))
            print(f'  {f}: {size:,} bytes')
