// ============================================
// ZapFácil Pro - Utilitários
// ============================================

export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarDataHora(): { data: string; hora: string } {
  const agora = new Date();
  return {
    data: agora.toLocaleDateString("pt-BR"),
    hora: agora.toLocaleTimeString("pt-BR"),
  };
}

export function sanitizarTexto(texto: string): string {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

export function validarCPF(cpf: string): boolean {
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpfLimpo[i]) * (10 - i);
  let resto = 11 - (soma % 11);
  if (resto >= 10) resto = 0;
  if (resto !== parseInt(cpfLimpo[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpfLimpo[i]) * (11 - i);
  resto = 11 - (soma % 11);
  if (resto >= 10) resto = 0;
  return resto === parseInt(cpfLimpo[10]);
}

export function validarCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  let digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  tamanho += 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}

export function validarChavePix(tipo: string, chave: string): boolean {
  if (!chave.trim()) return false;
  switch (tipo) {
    case "CPF":
      return validarCPF(chave);
    case "CNPJ":
      return validarCNPJ(chave);
    case "Celular":
      return /^\+?\d{10,11}$/.test(chave.replace(/\D/g, "")) || /^\d{10,11}$/.test(chave.replace(/\D/g, ""));
    case "E-mail":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chave);
    case "Aleatória":
      return chave.length >= 32;
    default:
      return true;
  }
}

export function obterChavePixLimpa(chaveFormatada: string): string {
  if (!chaveFormatada) return "";
  return chaveFormatada.includes(": ")
    ? chaveFormatada.split(": ")[1]
    : chaveFormatada;
}

export function obterPeriodoLabel(periodo: string): string {
  switch (periodo) {
    case "hoje": return "Hoje";
    case "semana": return "Esta Semana";
    case "mes": return "Este Mês";
    case "todos": return "Todo Período";
    default: return "Todo Período";
  }
}

export function filtrarVendasPorPeriodo(
  vendas: { timestamp: number; total: number }[],
  periodo: string
): { timestamp: number; total: number }[] {
  const agora = new Date();
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - agora.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).getTime();

  switch (periodo) {
    case "hoje":
      return vendas.filter((v) => v.timestamp >= inicioHoje);
    case "semana":
      return vendas.filter((v) => v.timestamp >= inicioSemana.getTime());
    case "mes":
      return vendas.filter((v) => v.timestamp >= inicioMes);
    default:
      return vendas;
  }
}

export function exportarParaCSV(vendas: Array<Record<string, unknown>>): void {
  if (!vendas.length) return;
  const cabecalhos = Object.keys(vendas[0]);
  const csv = [
    cabecalhos.join(","),
    ...vendas.map((v) =>
      cabecalhos
        .map((h) => {
          const val = String(v[h] ?? "");
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zapfacil_relatorio_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}