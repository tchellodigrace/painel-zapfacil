#!/usr/bin/env python3
"""
Aplica classe utilitaria .font-display em elementos <p> que contem numeros/valores grandes
em cards de metricas (dashboards, stats, KPIs).

Criterio:
- Tag <p> (nao <h1>-<h6>, pois headings ja tem hierarquia propria)
- Contem className com:
  - text-(2xl|3xl|4xl|5xl) OU text-lg
  - E font-(black|bold|extrabold)
- Adiciona 'font-display' ao className se ainda nao estiver presente

Excecoes (NAO aplicar):
- Texto literal nao-numerico ("Online", "Offline", "ON", "OFF") - mantem sem font-display
  (mas a regra de tnum no CSS ja nao causa problema visual)
"""
import re
from pathlib import Path

# Padrao: <p ... className="... text-(2xl|3xl|4xl|5xl|lg) ... font-(black|bold|extrabold) ..."> 
# Precisa ser <p> e conter tanto text-X quanto font-Y
# Vamos capturar o className inteiro para inspecao

P_OPEN = re.compile(
    r'<p\s+([^>]*?)>'
)

def has_metric_classes(class_attr: str) -> bool:
    """Verifica se o className contem text-(2xl|3xl|4xl|5xl|lg) e font-(black|bold|extrabold)."""
    has_size = bool(re.search(r'\btext-(?:2xl|3xl|4xl|5xl|lg)\b', class_attr))
    has_weight = bool(re.search(r'\bfont-(?:black|bold|extrabold)\b', class_attr))
    return has_size and has_weight

def has_font_display(class_attr: str) -> bool:
    return bool(re.search(r'\bfont-display\b', class_attr))

def add_font_display(class_attr: str) -> str:
    """Adiciona 'font-display' ao className, antes da ultima aspa."""
    # Garantir que ha espaco antes
    stripped = class_attr.rstrip()
    if not stripped.endswith('"'):
        # Situacao estranha, nao mexer
        return class_attr
    return stripped[:-1].rstrip() + ' font-display"'

def process_file(filepath: Path) -> int:
    content = filepath.read_text(encoding="utf-8")
    
    def replace_p(match):
        attrs = match.group(1)
        # Procurar className="..." ou className={'...'}
        cn_match = re.search(r'className\s*=\s*"([^"]*)"', attrs)
        if not cn_match:
            return match.group(0)
        class_attr = cn_match.group(1)
        # Pular se ja tem font-display
        if has_font_display(class_attr):
            return match.group(0)
        # Pular se nao tem classes de metrica
        if not has_metric_classes(class_attr):
            return match.group(0)
        # Adicionar font-display
        new_class = add_font_display(cn_match.group(0))
        new_attrs = attrs[:cn_match.start()] + new_class + attrs[cn_match.end():]
        return f'<p {new_attrs}>'
    
    new_content, n = P_OPEN.subn(replace_p, content)
    if n > 0:
        # n conta todas as substituicoes avaliadas, precisamos contar so as que mudaram
        # Vamos recontar comparando
        before_count = content.count('font-display')
        after_count = new_content.count('font-display')
        actual = after_count - before_count
        if actual > 0:
            filepath.write_text(new_content, encoding="utf-8")
            return actual
    return 0

def main():
    base = Path("/home/z/my-project/src")
    files = list(base.rglob("*.tsx")) + list(base.rglob("*.ts"))
    
    total = 0
    files_modified = 0
    
    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue
        if "<p " not in content and "<p>" not in content:
            continue
        n = process_file(f)
        if n > 0:
            print(f"  [{n:>3}x] {f.relative_to(base)}")
            total += n
            files_modified += 1
    
    print(f"\n=== TOTAL: {total} elementos com .font-display adicionado em {files_modified} arquivos ===")

if __name__ == "__main__":
    main()
