import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/recuperacoes
 * Lista pedidos de recuperação de senha (admin).
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("recuperacoes_senha")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("[recuperacoes GET] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar pedidos." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, pedidos: data || [] });
  } catch (e) {
    console.error("[recuperacoes GET] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/recuperacoes?id=xxx
 * Marca pedido como resolvido (admin enviou/ignorou).
 */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID do pedido é obrigatório." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("recuperacoes_senha")
      .update({ resolvido: !!body.resolvido })
      .eq("id", id);

    if (error) {
      console.error("[recuperacoes PATCH] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao atualizar pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[recuperacoes PATCH] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
