#!/usr/bin/env python3
"""
Refina portal-cliente.tsx para padrao Bitrix24:
1. Substitui gray-* hardcode por tokens semanticos (muted, muted-foreground, etc.)
2. Adiciona font-display tabular-nums nos valores monetarios e contagens
3. Adiciona hover:shadow-card-hover nos cards de metrica
4. Substitui text-blue-500 -> text-info (token semantico)
5. Padroniza responsividade nos cards de metrica (text-xl sm:text-2xl)
"""
import re

FILE = "/home/z/my-project/src/components/erp/portal-cliente.tsx"

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Mapa de substituicoes (literal -> replacement)
# Ordem importa: as mais especificas primeiro
SUBS = [
    # === Hero gradient background ===
    (
        "bg-gradient-to-br from-slate-50 via-white to-primary/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950",
        "bg-gradient-to-br from-background via-background to-primary/10 dark:from-background dark:via-background dark:to-primary/5"
    ),

    # === Header bar ===
    (
        "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50",
        "bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 glass"
    ),

    # === Text colors: gray-900 / white (high emphasis) -> foreground ===
    ("text-gray-900 dark:text-white", "text-foreground"),
    ("text-gray-900 dark:text-gray-100", "text-foreground"),

    # === Text colors: gray-500 / gray-400 (medium emphasis) -> muted-foreground ===
    ("text-gray-500 dark:text-gray-400", "text-muted-foreground"),
    ("text-gray-400 dark:text-gray-500", "text-muted-foreground"),
    ("text-gray-400 dark:text-gray-400", "text-muted-foreground"),
    ("text-gray-400", "text-muted-foreground"),

    # === Text colors: gray-300 / gray-600 / gray-700 (low emphasis) ===
    ("text-gray-300 dark:text-gray-600", "text-muted-foreground/60"),
    ("text-gray-200 dark:text-gray-700", "text-muted-foreground/40"),
    ("text-gray-300", "text-muted-foreground/60"),
    ("text-gray-300 dark:text-gray-600", "text-muted-foreground/60"),
    ("text-gray-200 dark:text-gray-700", "text-muted-foreground/40"),

    # === Borders gray-200/700 -> border ===
    ("border-gray-200 dark:border-gray-700", "border-border"),
    ("border-gray-200 dark:border-gray-800", "border-border"),

    # === Backgrounds ===
    ("bg-white dark:bg-gray-900", "bg-card"),

    # === Specific: text-blue-500 -> text-info (token semantico) ===
    ("text-blue-500", "text-info"),

    # === Cards de metrica: adiciona hover e font-display ===
    # Card 1: Total Pago
    (
        '''<Card className="border-0 shadow-sm bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Total Pago
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {formatarMoeda(dadosCliente.totalGasto)}
                </p>
              </CardContent>
            </Card>''',
        '''<Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Total Pago
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-display tabular-nums text-foreground">
                  {formatarMoeda(dadosCliente.totalGasto)}
                </p>
              </CardContent>
            </Card>'''
    ),

    # Card 2: Pedidos
    (
        '''<Card className="border-0 shadow-sm bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 text-info" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Pedidos
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {dadosCliente.totalVendas}
                </p>
              </CardContent>
            </Card>''',
        '''<Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="w-4 h-4 text-info shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Pedidos
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-display tabular-nums text-foreground">
                  {dadosCliente.totalVendas}
                </p>
              </CardContent>
            </Card>'''
    ),

    # Card 3: Pendente
    (
        '''<Card className="border-0 shadow-sm bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Pendente
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {formatarMoeda(dadosCliente.totalPendente)}
                </p>
              </CardContent>
            </Card>''',
        '''<Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Pendente
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-display tabular-nums text-foreground">
                  {formatarMoeda(dadosCliente.totalPendente)}
                </p>
              </CardContent>
            </Card>'''
    ),

    # Card 4: Agendamentos
    (
        '''<Card className="border-0 shadow-sm bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarCheck className="w-4 h-4 text-purple-500" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Agendamentos
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {dadosCliente.agendamentos.length}
                </p>
              </CardContent>
            </Card>''',
        '''<Card className="border-0 shadow-card hover:shadow-card-hover transition-shadow bg-card min-w-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarCheck className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    Agendamentos
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-display tabular-nums text-foreground">
                  {dadosCliente.agendamentos.length}
                </p>
              </CardContent>
            </Card>'''
    ),

    # === Botao de lista de clientes: bg-white/gray-900 -> bg-card, gray-200/700 -> border ===
    (
        "w-full flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-sm transition-all text-left group",
        "w-full flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-card-hover transition-all text-left group"
    ),

    # === Botao de venda individual ===
    (
        "w-full bg-card border border-border rounded-xl p-4 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-sm transition-all text-left group",
        "w-full bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-card-hover transition-all text-left group"
    ),

    # === Search input: padroniza border e focus ===
    (
        "pl-10 h-12 text-base rounded-xl border-gray-200 dark:border-gray-700 bg-card focus-visible:ring-primary",
        "pl-10 h-12 text-base rounded-xl border-border bg-card focus-visible:ring-primary focus-visible:border-primary"
    ),

    # === Font-bold em valores de venda -> font-display tabular-nums ===
    (
        '<p className="text-sm font-bold text-foreground">\n                            {formatarMoeda(venda.total)}\n                          </p>',
        '<p className="text-sm font-display tabular-nums text-foreground">\n                            {formatarMoeda(venda.total)}\n                          </p>'
    ),

    # === Total no dialog detalhe: font-bold -> font-display tabular-nums ===
    (
        '<div className="flex justify-between text-base font-bold">\n                    <span className="text-foreground">\n                      Total\n                    </span>\n                    <span className="text-primary dark:text-primary/80">\n                      {formatarMoeda(vendaDetalhe.total)}\n                    </span>\n                  </div>',
        '<div className="flex justify-between text-base font-display">\n                    <span className="text-foreground">\n                      Total\n                    </span>\n                    <span className="text-primary dark:text-primary/80 tabular-nums">\n                      {formatarMoeda(vendaDetalhe.total)}\n                    </span>\n                  </div>'
    ),

    # === Subtotal e acrescimo: tabular-nums ===
    (
        '<span className="text-foreground">\n                      {formatarMoeda(vendaDetalhe.valor)}\n                    </span>',
        '<span className="text-foreground tabular-nums">\n                      {formatarMoeda(vendaDetalhe.valor)}\n                    </span>'
    ),
    (
        '<span className="text-foreground">\n                      +{formatarMoeda(vendaDetalhe.acrescimo)}\n                    </span>',
        '<span className="text-foreground tabular-nums">\n                      +{formatarMoeda(vendaDetalhe.acrescimo)}\n                    </span>'
    ),

    # === Item de valor: tabular-nums ===
    (
        '<p className="text-sm font-semibold text-foreground">\n                        {formatarMoeda(item.valorTotal)}\n                      </p>',
        '<p className="text-sm font-semibold text-foreground tabular-nums">\n                        {formatarMoeda(item.valorTotal)}\n                      </p>'
    ),

    # === Valores pequenos (3x preco unit) -> tabular-nums ===
    (
        '<p className="text-xs text-muted-foreground">\n                          {item.quantidade}x{" "}\n                          {formatarMoeda(item.valorUnitario)}\n                        </p>',
        '<p className="text-xs text-muted-foreground tabular-nums">\n                          {item.quantidade}x{" "}\n                          {formatarMoeda(item.valorUnitario)}\n                        </p>'
    ),

    # === Desconto (red-500) -> destructive ===
    (
        '<span className="text-red-500">Desconto</span>\n                      <span className="text-red-500">\n                        -{formatarMoeda(vendaDetalhe.desconto)}\n                      </span>',
        '<span className="text-destructive">Desconto</span>\n                      <span className="text-destructive tabular-nums">\n                        -{formatarMoeda(vendaDetalhe.desconto)}\n                      </span>'
    ),

    # === Status agendamento default: gray-100/700/800/300 -> secondary tokens ===
    (
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        "bg-secondary text-secondary-foreground"
    ),

    # === Valor de agendamento (CreditCard) -> tabular-nums ===
    (
        '<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">\n                                <CreditCard className="w-3 h-3" />\n                                {formatarMoeda(ag.valor)}\n                              </span>',
        '<span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">\n                                <CreditCard className="w-3 h-3 shrink-0" />\n                                {formatarMoeda(ag.valor)}\n                              </span>'
    ),
]

total_subs = 0
for old, new in SUBS:
    n = content.count(old)
    if n > 0:
        content = content.replace(old, new)
        total_subs += n
        if n > 1:
            print(f"[ok] {n}x: {old[:60]}...")

if content != original:
    with open(FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"\n[done] {total_subs} substituicoes aplicadas")
else:
    print("\n[done] nenhuma substituicao aplicada")
