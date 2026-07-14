import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiUrl, instanceName, apiKey } = body;

    // Em producao, isso conectaria a Evolution API real:
    // const res = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
    //   method: "POST",
    //   headers: { apikey: apiKey },
    // });

    // Modo demonstracao: retorna sucesso apos delay
    return NextResponse.json({
      connected: true,
      instance: instanceName,
      message: "Conectado com sucesso (modo demonstracao)",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao conectar" },
      { status: 500 }
    );
  }
}