import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { promocao, tipoNegocio, tomEstilo, plataforma } = await req.json();

    if (!promocao || !tipoNegocio) {
      return NextResponse.json(
        { erro: "Informe a promocao e o tipo de negocio." },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { erro: "Chave da API Gemini nao configurada. Adicione GEMINI_API_KEY no arquivo .env" },
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
        { erro: "Erro ao gerar a imagem. Tente novamente." },
        { status: 500 }
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
        { status: 500 }
      );
    }

    return NextResponse.json({
      imagem: imagemBase64,
      mimeType,
      texto: textoResposta,
    });
  } catch (error) {
    console.error("Erro ao gerar story:", error);
    return NextResponse.json(
      { erro: "Erro interno ao gerar a imagem." },
      { status: 500 }
    );
  }
}
