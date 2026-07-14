import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiUrl, instanceName, apiKey } = body;

    // Em producao:
    // const res = await fetch(`${apiUrl}/instance/logout/${instanceName}`, {
    //   method: "DELETE",
    //   headers: { apikey: apiKey },
    // });

    return NextResponse.json({
      disconnected: true,
      message: "Desconectado com sucesso",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao desconectar" },
      { status: 500 }
    );
  }
}