import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiUrl, instanceName, apiKey, numero, mensagem } = body;

    // Em producao:
    // const res = await fetch(
    //   `${apiUrl}/message/sendText/${instanceName}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       apikey: apiKey,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       number: numero,
    //       text: mensagem,
    //     }),
    //   }
    // );

    return NextResponse.json({
      sent: true,
      number: numero,
      message: "Mensagem enviada (modo demonstracao)",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao enviar" },
      { status: 500 }
    );
  }
}