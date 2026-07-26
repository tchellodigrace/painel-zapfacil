import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface RecuperarBody {
  email: string;
  telefone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RecuperarBody;

    const email = (body.email || "").trim().toLowerCase();
    const telefone = (body.telefone || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "E-mail inválido." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Verificar se o email existe na base
    const { data: cliente } = await supabase
      .from("clientes")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (!cliente) {
      // Não revelar se o email existe ou não (segurança)
      // Mas registramos mesmo assim para auditoria
    }

    // Registrar pedido de recuperação
    const { error } = await supabase.from("recuperacoes_senha").insert({
      email,
      telefone: telefone || null,
      resolvido: false,
    });

    if (error) {
      console.error("[recuperar] erro insert:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao registrar pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensagem:
        "Pedido enviado. Você receberá seus dados de acesso pelo WhatsApp.",
    });
  } catch (e) {
    console.error("[recuperar] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
