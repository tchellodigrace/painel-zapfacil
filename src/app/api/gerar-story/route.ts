import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const LIMITE_MENSAL = 50;

// Modelos para tentar em ordem de preferencia (para geracao de imagem)
const MODELOS_IMAGEM = [
  "gemini-2.0-flash-exp",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

// --- Funcoes auxiliares de cota ---

function mesAtual(): string {
  return new Date().toISOString().slice(0, 7);
}

// Mapa em memoria para cotas (reseta ao reiniciar o servidor - em prod usaria banco)
const cotasPorCliente: Record<string, number> = {};

function obterUsadas(email: string): number {
  const chave = `${email}_${mesAtual()}`;
  return cotasPorCliente[chave] || 0;
}

function incrementarUsadas(email: string): number {
  const chave = `${email}_${mesAtual()}`;
  cotasPorCliente[chave] = (cotasPorCliente[chave] || 0) + 1;
  return cotasPorCliente[chave];
}

// --- Funcao auxiliar para chamar a API do Gemini ---

async function chamarGeminiParaImagem(promptImagem: string): Promise<{
  imagemBase64: string;
  mimeType: string;
  textoResposta: string;
} | { erro: string; detalhe: string }> {
  for (const modelo of MODELOS_IMAGEM) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptImagem }] }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        }
      );

      // Modelo nao encontrado, tentar o proximo
      if (response.status === 404) {
        console.warn(`Modelo ${modelo} nao encontrado, tentando proximo...`);
        continue;
      }

      // Cota esgotada ou erro de quota
      if (response.status === 429) {
        const errData = await response.text();
        return {
          erro: "quota_api",
          detalhe: `A cota da API Gemini esta esgotada. Verifique o plano e faturamento em ai.google.dev. Detalhes: ${errData.slice(0, 300)}`,
        };
      }

      // Modelo nao suporta geracao de imagem
      if (response.status === 400) {
        const errText = await response.text();
        if (errText.includes("response modalities")) {
          console.warn(`Modelo ${modelo} nao suporta geracao de imagem, tentando proximo...`);
          continue;
        }
        return {
          erro: "parametros_invalidos",
          detalhe: errText.slice(0, 300),
        };
      }

      // Erro de autenticacao
      if (response.status === 401 || response.status === 403) {
        const errText = await response.text();
        return {
          erro: "chave_invalida",
          detalhe: `Chave da API invalida ou sem permissao. ${errText.slice(0, 200)}`,
        };
      }

      // Outro erro
      if (!response.ok) {
        const errText = await response.text();
        return {
          erro: "erro_api",
          detalhe: `Erro da API Gemini (modelo ${modelo}): ${errText.slice(0, 300)}`,
        };
      }

      // Sucesso - processar resposta
      const data = await response.json();
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
        // Modelo respondeu mas sem imagem, tentar proximo modelo
        console.warn(`Modelo ${modelo} nao retornou imagem, tentando proximo...`);
        continue;
      }

      return { imagemBase64, mimeType, textoResposta };
    } catch (err) {
      console.error(`Erro ao chamar modelo ${modelo}:`, err);
      continue;
    }
  }

  // Nenhum modelo funcionou
  return {
    erro: "nenhum_modelo",
    detalhe:
      "Nenhum modelo Gemini disponivel conseguiu gerar a imagem. Verifique se sua chave API tem cota disponivel e se o plano inclui geracao de imagem.",
  };
}

// --- POST: Gerar story ---

export async function POST(req: NextRequest) {
  try {
    const { promocao, tipoNegocio, tomEstilo, plataforma, emailCliente } =
      await req.json();

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
          mensagem:
            "Voce atingiu o limite de 50 imagens deste mes do seu plano. Seu limite sera renovado no proximo ciclo.",
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

    const nomePlataforma =
      plataforma === "facebook" ? "Facebook" : "Instagram";

    const promptImagem =
      `Crie um design profissional de story para ${nomePlataforma} no formato 9:16 (1080x1920 pixels). ` +
      `Tipo de negocio: ${tipoNegocio}. ` +
      `Promocao: ${promocao}. ` +
      `Estilo visual: ${tomEstilo || "moderno e atrativo"}. ` +
      `O design deve ser chamativo, com cores vibrantes, tipografia legivel e layout adequado para story de rede social. ` +
      `Inclua elementos visuais relacionados ao tipo de negocio. ` +
      `Nao inclua texto excessivo, apenas o essencial para a promocao. ` +
      `O resultado deve ser uma imagem pronta para publicar.`;

    // Chamar Gemini com fallback de modelos
    const resultado = await chamarGeminiParaImagem(promptImagem);

    if ("erro" in resultado) {
      console.error("Falha na geracao de imagem:", resultado.detalhe);

      // Erro especifico de cota da API
      if (resultado.erro === "quota_api") {
        return NextResponse.json(
          {
            erro: "quota_api_esgotada",
            mensagem:
              "A cota da API de IA esta esgotada no momento. Entre em contato com o suporte para renovar o acesso.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          erro: resultado.erro,
          mensagem:
            resultado.erro === "chave_invalida"
              ? "Chave da API invalida ou sem permissao. Contate o suporte."
              : "Nao foi possivel gerar a imagem. Tente novamente mais tarde.",
          detalhe: resultado.detalhe,
        },
        { status: 502 }
      );
    }

    // Sucesso! Incrementar cota
    const novasUsadas = incrementarUsadas(emailCliente);

    return NextResponse.json({
      imagem: resultado.imagemBase64,
      mimeType: resultado.mimeType,
      texto: resultado.textoResposta,
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
