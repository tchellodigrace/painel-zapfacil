import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/sistemas
 * Lista todos os sistemas (admin).
 *
 * POST /api/sistemas
 * Cria um novo sistema (admin).
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("sistemas")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("[sistemas GET] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar sistemas." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, sistemas: data || [] });
  } catch (e) {
    console.error("[sistemas GET] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseServer();

    const novoSistema = {
      empresa: body.empresa || "",
      responsavel: body.responsavel || "",
      telefone: body.telefone || null,
      email: body.email || null,
      cidade: body.cidade || "",
      data_instalacao: body.dataInstalacao || null,
      data_vencimento: body.dataVencimento || null,
      status: body.status || "TRIAL",
      plano: body.plano || "PRO",
      tipo_licenca: body.tipoLicenca || "ALUGUEL",
      valor_mensal: body.valorMensal || 0,
      valor_aquisicao: body.valorAquisicao || 0,
      taxa_instalacao: body.taxaInstalacao || 0,
      observacoes: body.observacoes || "",
      zapbot_ativo: !!body.zapbotAtivo,
      disparo_ativo: !!body.disparoAtivo,
      funil_ativo: !!body.funilAtivo,
      fluxos_ativo: !!body.fluxosAtivo,
      dados_extra: body.dadosExtra || {},
    };

    const { data, error } = await supabase
      .from("sistemas")
      .insert(novoSistema)
      .select("*")
      .single();

    if (error) {
      console.error("[sistemas POST] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao criar sistema." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, sistema: data });
  } catch (e) {
    console.error("[sistemas POST] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sistemas?id=xxx
 * Atualiza um sistema (admin).
 */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID do sistema é obrigatório." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const supabase = getSupabaseServer();

    const update: Record<string, unknown> = {};
    const fields: Record<string, string> = {
      empresa: "empresa",
      responsavel: "responsavel",
      telefone: "telefone",
      email: "email",
      cidade: "cidade",
      dataInstalacao: "data_instalacao",
      dataVencimento: "data_vencimento",
      status: "status",
      plano: "plano",
      tipoLicenca: "tipo_licenca",
      valorMensal: "valor_mensal",
      valorAquisicao: "valor_aquisicao",
      taxaInstalacao: "taxa_instalacao",
      observacoes: "observacoes",
      zapbotAtivo: "zapbot_ativo",
      disparoAtivo: "disparo_ativo",
      funilAtivo: "funil_ativo",
      fluxosAtivo: "fluxos_ativo",
    };

    for (const [k, dbField] of Object.entries(fields)) {
      if (k in body) update[dbField] = body[k];
    }
    if ("dadosExtra" in body) update.dados_extra = body.dadosExtra;

    const { data, error } = await supabase
      .from("sistemas")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[sistemas PATCH] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao atualizar sistema." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, sistema: data });
  } catch (e) {
    console.error("[sistemas PATCH] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sistemas?id=xxx
 * Remove um sistema (admin).
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID do sistema é obrigatório." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { error } = await supabase.from("sistemas").delete().eq("id", id);

    if (error) {
      console.error("[sistemas DELETE] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao remover sistema." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sistemas DELETE] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
