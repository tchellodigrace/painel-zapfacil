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

// ============================================
// WhatsApp com Logomarca (arquivo de imagem)
// ============================================

const LOGO_URL = "https://j1ewd51wcs60-d.space-z.ai/logo-empresa.png";

/**
 * Gera imagem PNG branca com a logomarca no topo e mensagem de texto formatada.
 * Retorna um Blob PNG pronto para compartilhar.
 */
async function gerarImagemMensagem(textoMensagem: string): Promise<Blob | null> {
  try {
    // Carregar a logo
    const logoResp = await fetch(LOGO_URL);
    const logoBlob = await logoResp.blob();
    const logoImg = await criarImagem(logoBlob);

    // Configurar canvas
    const LARGURA = 800;
    const LOGO_H = 200;
    const PADDING = 40;
    const LINHA_H = 28;
    const FONTE = "16px sans-serif";

    // Quebrar texto em linhas
    const linhas: string[] = [];
    const paragrafos = textoMensagem.split("\n");
    for (const p of paragrafos) {
      if (p.trim() === "") {
        linhas.push("");
        continue;
      }
      // Remover formatação WhatsApp (*bold*, _italic_)
      const limpo = p.replace(/\*/g, "").replace(/_/g, "");
      // Wrap simples
      const maxChars = Math.floor((LARGURA - PADDING * 2) / 8);
      if (limpo.length <= maxChars) {
        linhas.push(limpo);
      } else {
        const palavras = limpo.split(" ");
        let linhaAtual = "";
        for (const palavra of palavras) {
          if ((linhaAtual + " " + palavra).trim().length > maxChars) {
            linhas.push(linhaAtual.trim());
            linhaAtual = palavra;
          } else {
            linhaAtual += " " + palavra;
          }
        }
        if (linhaAtual.trim()) linhas.push(linhaAtual.trim());
      }
    }

    const textoH = linhas.length * LINHA_H + PADDING * 2;
    const ALTURA = LOGO_H + textoH;

    const canvas = document.createElement("canvas");
    canvas.width = LARGURA;
    canvas.height = ALTURA;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fundo branco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    // Logo centralizada no topo
    const logoW = 160;
    const logoX = (LARGURA - logoW) / 2;
    ctx.drawImage(logoImg, logoX, 20, logoW, logoW);

    // Linha separadora
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(PADDING, LOGO_H + 10);
    ctx.lineTo(LARGURA - PADDING, LOGO_H + 10);
    ctx.stroke();

    // Texto da mensagem
    ctx.fillStyle = "#1f2937";
    ctx.font = FONTE;
    let y = LOGO_H + 30;
    for (const linha of linhas) {
      if (linha.trim() === "") {
        y += LINHA_H * 0.6;
        continue;
      }
      ctx.fillText(linha, PADDING, y);
      y += LINHA_H;
    }

    // Rodapé
    ctx.fillStyle = "#9ca3af";
    ctx.font = "italic 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Powered by ZapFacil Pro", LARGURA / 2, ALTURA - 15);
    ctx.textAlign = "start";

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
    });
  } catch {
    return null;
  }
}

function criarImagem(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

/** Resultado do envio WhatsApp */
export type ResultadoWhatsApp = "imagem_enviada" | "imagem_baixada" | "texto_apenas";

/**
 * Abre o WhatsApp com a logomarca como imagem anexada + mensagem como legenda.
 * No mobile: usa Web Share API (imagem + texto).
 * No desktop: baixa a imagem + copia o texto + abre WhatsApp Web.
 * Retorna o resultado para o componente mostrar toast adequado.
 */
export async function abrirWhatsApp(telefone: string, mensagem: string): Promise<ResultadoWhatsApp> {
  const telLimpo = telefone.replace(/\D/g, "");
  const numero = telLimpo.startsWith("55") ? telLimpo : `55${telLimpo}`;

  // Tentar enviar imagem via Web Share API (mobile)
  const imagemBlob = await gerarImagemMensagem(mensagem);
  if (imagemBlob) {
    const file = new File([imagemBlob], "zapfacil_mensagem.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: mensagem });
        return "imagem_enviada";
      } catch {
        // Usuário cancelou ou erro — segue para fallback
      }
    }

    // Desktop fallback: baixar imagem + copiar texto + abrir WhatsApp
    try {
      const urlImagem = URL.createObjectURL(imagemBlob);
      const a = document.createElement("a");
      a.download = "zapfacil_mensagem.png";
      a.href = urlImagem;
      a.click();
      setTimeout(() => URL.revokeObjectURL(urlImagem), 5000);

      await navigator.clipboard.writeText(mensagem);
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");
      return "imagem_baixada";
    } catch {
      // Falha no clipboard/download — segue para texto puro
    }
  }

  // Fallback final: texto puro sem imagem
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");
  return "texto_apenas";
}

/**
 * Versão sem número de telefone — abre o seletor de contatos do WhatsApp.
 */
export async function compartilharWhatsApp(mensagem: string): Promise<ResultadoWhatsApp> {
  const imagemBlob = await gerarImagemMensagem(mensagem);
  if (imagemBlob) {
    const file = new File([imagemBlob], "zapfacil_mensagem.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: mensagem });
        return "imagem_enviada";
      } catch {
        // Usuário cancelou
      }
    }

    // Desktop fallback
    try {
      const urlImagem = URL.createObjectURL(imagemBlob);
      const a = document.createElement("a");
      a.download = "zapfacil_mensagem.png";
      a.href = urlImagem;
      a.click();
      setTimeout(() => URL.revokeObjectURL(urlImagem), 5000);

      await navigator.clipboard.writeText(mensagem);
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, "_blank");
      return "imagem_baixada";
    } catch {
      // segue
    }
  }

  // Fallback: texto puro
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, "_blank");
  return "texto_apenas";
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