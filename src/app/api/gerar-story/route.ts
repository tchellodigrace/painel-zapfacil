import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const LIMITE_MENSAL = 50;

// --- Funcoes auxiliares de cota ---

function chaveCota(email: string) {
  const mes = new Date().toISOString().slice(0, 7); // "2026-07"
  return `zapfacil_cota_stories_${email}_${mes}`;
}

function obterCota(email: string): { usadas: number; limite: number; mes: string } {
  // Como estamos no server-side, simulamos via um mapa em memoria
  // Em producao real, seria banco de dados. Aqui usamos o body da requisicao.
  const mes = new Date().toISOString().slice(0, 7);
  return { usadas: 0, limite: LIMITE_MENSAL, mes };
}

// Mapa em memoria para cotas (reseta ao reiniciar o servidor - em prod usaria banco)
const cotasPorCliente: Record<string, number> = {};

function mesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

function obterUsadas(email: string): number {
 const chave = `${email}_${mesAtual()}`;
  return cotasPorCliente[chave] || 0;
}

function incrementarUsadas(email: string): number {
  const chave = `${email}_${mesAtual()}`;
  cotasPorCliente[chave] = (cotasPorCliente[chave] || 0) + 1;
  return cotasPorCliente[chave];
}

// --- POST: Gerar story ---

export async function POST(req: NextRequest) {
  try {
    const { promocao, tipoNegocio, tomEstilo, plataforma, emailCliente } = await req.json();

    if (!promocao || !tipoNegocio) {
      return NextResponse.json(
        { erro: "Informe a promocao e o tipo de negocio." },
        { status: 400 }
      );
    }

    if (!emailCliente) {
      return NextResponse.json(
        { erro: "Email do cliente nao identificado. Faca login novamente." },
        { status: 401 }
      );
    }

    // Verificar cota
    const usadas = obterUsadas(emailCliente);
    if (usadas >= LIMITE_MENSAL) {
      return NextResponse.json(
        {
          erro: "limite_alcancado",
          mensagem: "Voce atingiu o limite de 50 imagens deste mes do seu plano. Seu limite sera renovado no proximo ciclo.",
          usadas,
          limite: LIMITE_MENSAL,
        },
        { status: 429 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { erro: "Chave da API Gemini nao configurada no servidor." },
        { status: 500 }
      );
    }

    const nomePlataforma = plataforma === "facebook" ? "Facebook" : "Instagram";

    const promptImagem =
      `Crie um design profissional de story para ${nomePlataforma} no formato 9:16 (1080x1920 pixels). ` +
      `Tipo de negocio: ${tipoNegocio}. ` +
      `Promocao: ${promocao}. ` +
      `Estilo visual: ${tomEstilo || "moderno e atrativo"}. ` +
      `O design deve ser chamativo, com cores vibrantes, tipografia legivel e layout adequado para story de rede social. ` +
      `Inclua elementos visuais relacionados ao tipo de negocio. ` +
      `Nao inclua texto excessivo, apenas o essencial para a promocao. ` +
      `O resultado deve ser uma imagem pronta para publicar.`;

    // Chamar Gemini 2.5 Flash com geracao de imagem nativa
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptImagem }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.text();
      console.error("Gemini API error:", errData);
      return NextResponse.json(
        { erro: "Erro ao gerar a imagem via IA. Tente novamente." },
        { status: 502 }
      );
    }

    const data = await response.json();

    // Extrair imagem da resposta
    let imagemBase64 = "";
    let mimeType = "image/png";
    let textoResposta = "";
    const parts = data?.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData) {
        imagemBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
      } else if (part.text) {
        textoResposta += part.text;
      }
    }

    if (!imagemBase64) {
      return NextResponse.json(
        { erro: "A API nao retornou uma imagem. Tente reformular a promocao.", texto: textoResposta },
        { status: 502 }
      );
    }

    // Sucesso! Incrementar cota
    const novasUsadas = incrementarUsadas(emailCliente);

    return NextResponse.json({
      imagem: imagemBase64,
      mimeType,
      texto: textoResposta,
      cota: {
        usadas: novasUsadas,
        limite: LIMITE_MENSAL,
        restantes: LIMITE_MENSAL - novasUsadas,
      },
    });
  } catch (error) {
    console.error("Erro ao gerar story:", error);
    return NextResponse.json(
      { erro: "Erro interno ao gerar a imagem." },
      { status: 500 }
    );
  }
}

// --- GET: Consultar cota do cliente ---

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { erro: "Email nao informado." },
      { status: 400 }
    );
  }

  const usadas = obterUsadas(email);
  return NextResponse.json({
    usadas,
    limite: LIMITE_MENSAL,
    restantes: LIMITE_MENSAL - usadas,
    mes: mesAtual(),
  });
}
