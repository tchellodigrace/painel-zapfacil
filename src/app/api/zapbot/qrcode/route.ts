import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiUrl, instanceName, apiKey } = body;

    // Em producao:
    // const res = await fetch(
    //   `${apiUrl}/instance/fetchQR/${instanceName}`,
    //   {
    //     headers: { apikey: apiKey },
    //   }
    // );
    // const data = await res.json();

    return NextResponse.json({
      qrCode: null,
      message: "Em producao, o QR Code viria da Evolution API",
      instance: instanceName,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao gerar QR" },
      { status: 500 }
    );
  }
}