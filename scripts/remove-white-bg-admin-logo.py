"""
Remove o fundo branco da logo-admin.png, mantendo apenas a logo (azul/marinho).
Converte pixels brancos opacos (R>240, G>240, B>240, alpha=255) em transparentes.
"""
from PIL import Image
import os

INPUT = '/home/z/my-project/public/logo-admin.png'
OUTPUT = '/home/z/my-project/public/logo-admin.png'  # sobrescreve
BACKUP = '/tmp/logo-admin-before-bg-removal.png'

# Backup
img = Image.open(INPUT)
img.save(BACKUP)
print(f'Backup salvo em: {BACKUP}')
print(f'Antes: {img.size[0]}x{img.size[1]} mode={img.mode}')

# Garante RGBA
if img.mode != 'RGBA':
    img = img.convert('RGBA')

pixels = list(img.getdata())
total = len(pixels)
removed = 0
kept_logo = 0
kept_other = 0

new_pixels = []
for p in pixels:
    r, g, b, a = p
    if a == 255 and r > 240 and g > 240 and b > 240:
        # Branco opaco -> transparente
        new_pixels.append((0, 0, 0, 0))
        removed += 1
    elif a == 255:
        # Pixel da logo (não-branco) -> mantém
        new_pixels.append(p)
        kept_logo += 1
    else:
        # Já é transparente ou semi-transparente -> mantém
        new_pixels.append(p)
        kept_other += 1

# Atualiza imagem
img.putdata(new_pixels)
img.save(OUTPUT, optimize=True)

print(f'\nDepois: {img.size[0]}x{img.size[1]} mode={img.mode}')
print(f'Tamanho arquivo: {os.path.getsize(OUTPUT)/1024:.1f} KB')
print(f'\nEstatísticas:')
print(f'  Total pixels: {total}')
print(f'  Brancos removidos (agora transparentes): {removed} ({100*removed/total:.1f}%)')
print(f'  Pixels da logo mantidos: {kept_logo} ({100*kept_logo/total:.1f}%)')
print(f'  Outros mantidos (semi-transp.): {kept_other} ({100*kept_other/total:.1f}%)')
print(f'  Total transparentes agora: {removed + sum(1 for p in new_pixels if p[3]==0 and p not in [(0,0,0,0)]*0) - 0}')

# Verifica transparência final
final = Image.open(OUTPUT)
final_pixels = list(final.getdata())
transparent = sum(1 for p in final_pixels if p[3] == 0)
white_opaque_remaining = sum(1 for p in final_pixels if p[3] == 255 and p[0] > 240 and p[1] > 240 and p[2] > 240)
print(f'\nVerificação final:')
print(f'  Pixels transparentes: {transparent}/{total} ({100*transparent/total:.1f}%)')
print(f'  Pixels brancos opacos restantes: {white_opaque_remaining} ({100*white_opaque_remaining/total:.2f}%)')
