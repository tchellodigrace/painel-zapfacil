#!/usr/bin/env python3
"""
Ajusta font-sizes de metricas com .font-display para serem responsivos em mobile.

Regras:
- text-2xl -> text-xl sm:text-2xl  (cards de stats em grid de 2-3 colunas)
- text-3xl -> text-2xl sm:text-3xl
- text-4xl -> text-3xl sm:text-4xl
- text-lg -> text-base sm:text-lg (se acompanhar font-display)

So aplica em elementos que ja tem .font-display (identificamos como metricas/valores).
"""
import re
from pathlib import Path

# Mapeamento de substituicoes de tamanho
SIZE_SUBS = [
    (r'\btext-2xl\b', 'text-xl sm:text-2xl'),
    (r'\btext-3xl\b', 'text-2xl sm:text-3xl'),
    (r'\btext-4xl\b', 'text-3xl sm:text-4xl'),
    (r'\btext-5xl\b', 'text-4xl sm:text-5xl'),
    (r'\btext-lg\b', 'text-base sm:text-lg'),
]

def process_file(filepath: Path) -> int:
    content = filepath.read_text(encoding="utf-8")
    
    # Encontrar todos os <p ... className="... font-display ..."> 
    # Padrao: <p ...>...</p>
    # So mexer no className dos <p> que tem font-display
    
    def process_p_tag(match):
        full_match = match.group(0)
        # Verificar se tem font-display
        if 'font-display' not in full_match:
            return full_match
        # Verificar se tem text-X que queremos tornar responsivo
        if not re.search(r'\btext-(2xl|3xl|4xl|5xl|lg)\b', full_match):
            return full_match
        # Aplicar substituicoes apenas dentro deste match
        result = full_match
        for pattern, replacement in SIZE_SUBS:
            # Evitar duplicar sm:text-X se ja existir
            if re.search(r'sm:text-', result):
                # Ja tem responsivo, pular
                continue
            result = re.sub(pattern, replacement, result, count=1)
        return result
    
    # Regex para capturar tag <p ...> completa (ate o >)
    # Precisamos pegar o className inteiro
    P_PATTERN = re.compile(r'<p\s+[^>]*?className\s*=\s*"[^"]*"[^>]*?>', re.DOTALL)
    
    new_content = P_PATTERN.sub(process_p_tag, content)
    
    if new_content != content:
        # Contar quantos elementos foram alterados
        old_count = content.count('font-display')
        # Calcular diferencas
        n = sum(1 for _ in re.finditer(r'<p\s+[^>]*?font-display[^>]*?>', content)
                if re.search(r'\btext-(2xl|3xl|4xl|5xl|lg)\b', _.group(0)) 
                and 'sm:text-' not in _.group(0))
        filepath.write_text(new_content, encoding="utf-8")
        return n
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
        if 'font-display' not in content:
            continue
        n = process_file(f)
        if n > 0:
            print(f"  [{n:>3}x] {f.relative_to(base)}")
            total += n
            files_modified += 1
    
    print(f"\n=== TOTAL: {total} metricas com font-size responsivo em {files_modified} arquivos ===")

if __name__ == "__main__":
    main()
