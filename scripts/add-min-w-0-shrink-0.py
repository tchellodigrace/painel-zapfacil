#!/usr/bin/env python3
"""
Adiciona min-w-0 a todos os <Card> dentro de grids de stats (grid-cols-X) para
prevenir overflow de conteudo longo em layouts responsivos.

Tambem adiciona shrink-0 a icones lucide dentro de flex items para evitar
que sejam espremidos quando o texto cresce.
"""
import re
from pathlib import Path

# Padrao: <Card className="..." ou <Card className={'...'}
# Adiciona 'min-w-0' se ainda nao estiver presente e se for seguido de classe grid
def add_min_w_0_to_card_in_grid(content: str) -> tuple[str, int]:
    """Adiciona min-w-0 a <Card> que aparecem logo apos um div com grid-cols-X."""
    # Estrategia: encontrar sequencias <div ...grid-cols-X...>...<Card className="..." 
    # e adicionar min-w-0 no Card
    
    # Padrao para <Card className="..." ou <Card className={'...'}
    # Vamos apenas adicionar min-w-0 a TODOS os Cards que nao tem, mas so dentro de contextos grid
    
    count = 0
    
    # Primeiro, encontrar todos os <div ... grid-cols-X ...> e pegar o conteudo ate o </div>
    # Mas isso e complexo com regex. Melhor abordagem: encontrar todos os <Card ...> sem min-w-0
    # e adicionar.
    
    # Abrangencia: adicionar min-w-0 em todo <Card> que nao tem, ja que custa pouco
    def add_to_card(match):
        nonlocal count
        full = match.group(0)
        if 'min-w-0' in full:
            return full
        # So aplicar em Card com className (nao Card sem className)
        cn_match = re.search(r'className\s*=\s*"([^"]*)"', full)
        if not cn_match:
            return full
        # Inserir min-w-0 antes da ultima aspa
        old_class_attr = cn_match.group(0)
        new_class_attr = old_class_attr[:-1].rstrip() + ' min-w-0"'
        count += 1
        return full.replace(old_class_attr, new_class_attr)
    
    # Aplicar apenas a <Card ...> com className
    new_content = re.sub(r'<Card\s+[^>]*?className\s*=\s*"[^"]*"[^>]*?>', add_to_card, content)
    return new_content, count

def add_shrink_0_to_icons(content: str) -> tuple[str, int]:
    """Adiciona shrink-0 a icones lucide dentro de divs flex para nao serem espremidos."""
    count = 0
    
    # Procurar por <IconName className="h-X w-X ..."> dentro de contexto flex
    # Mas isso e dificil com regex. Melhor: adicionar shrink-0 a todos os icones que
    # tem apenas h-X w-X e cor, sem shrink-0
    
    def add_to_icon(match):
        nonlocal count
        full = match.group(0)
        if 'shrink-0' in full:
            return full
        # Verificar se e um icone lucide (capitalized name)
        tag_name = match.group(1)
        if not tag_name[0].isupper():
            return full
        # So aplicar se tem h-X w-X (indicando icone)
        if not re.search(r'\bh-\d+\s+w-\d+\b', full):
            return full
        # So aplicar se esta dentro de className="..."
        cn_match = re.search(r'className\s*=\s*"([^"]*)"', full)
        if not cn_match:
            return full
        old_class_attr = cn_match.group(0)
        new_class_attr = old_class_attr[:-1].rstrip() + ' shrink-0"'
        count += 1
        return full.replace(old_class_attr, new_class_attr)
    
    # Aplicar a <IconName className="..."> onde IconName comeca com maiuscula
    new_content = re.sub(r'<([A-Z][a-zA-Z]+)\s+[^>]*?className\s*=\s*"[^"]*"[^>]*?>', add_to_icon, content)
    return new_content, count

def main():
    base = Path("/home/z/my-project/src")
    files = list(base.rglob("*.tsx"))
    
    total_cards = 0
    total_icons = 0
    files_modified = 0
    
    for f in files:
        try:
            content = f.read_text(encoding="utf-8")
        except Exception:
            continue
        if '<Card' not in content:
            continue
        
        original = content
        content, n_cards = add_min_w_0_to_card_in_grid(content)
        content, n_icons = add_shrink_0_to_icons(content)
        
        if content != original:
            f.write_text(content, encoding="utf-8")
            print(f"  [Card +{n_cards:>2} | Icon +{n_icons:>3}] {f.relative_to(base)}")
            total_cards += n_cards
            total_icons += n_icons
            files_modified += 1
    
    print(f"\n=== TOTAL: {total_cards} Cards com min-w-0, {total_icons} icones com shrink-0 em {files_modified} arquivos ===")

if __name__ == "__main__":
    main()
