import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/cliente/sistema?email=xxx
 * Retorna o sistema (e feature flags) do cliente logado.
 * Usado pelo painel cliente para descobrir quais recursos Premium tem acesso.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email é obrigatório." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("sistemas")
      .select(
        "id, empresa, responsavel, email, status, plano, zapbot_ativo, disparo_ativo, funil_ativo, fluxos_ativo"
      )
      .eq("email", email)
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[cliente/sistema GET] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar sistema." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({
        ok: true,
        sistema: null,
        mensagem: "Sistema não encontrado. Cadastre-se primeiro.",
      });
    }

    return NextResponse.json({
      ok: true,
      sistema: {
        id: data.id,
        empresa: data.empresa,
        responsavel: data.responsavel,
        email: data.email,
        status: data.status,
        plano: data.plano,
        zapbotAtivo: !!data.zapbot_ativo,
        disparoAtivo: !!data.disparo_ativo,
        funilAtivo: !!data.funil_ativo,
        fluxosAtivo: !!data.fluxos_ativo,
      },
    });
  } catch (e) {
    console.error("[cliente/sistema GET] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
