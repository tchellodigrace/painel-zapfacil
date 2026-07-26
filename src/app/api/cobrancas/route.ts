import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/cobrancas?sistema_id=xxx
 * Lista cobranças (opcionalmente filtradas por sistema).
 *
 * POST /api/cobrancas
 * Cria nova cobrança.
 *
 * PATCH /api/cobrancas?id=xxx
 * Atualiza cobrança (ex: registrar pagamento).
 *
 * DELETE /api/cobrancas?id=xxx
 * Remove cobrança.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sistema_id = searchParams.get("sistema_id");

    const supabase = getSupabaseServer();

    let query = supabase
      .from("cobrancas")
      .select("*")
      .order("criado_em", { ascending: false });

    if (sistema_id) {
      query = query.eq("sistema_id", sistema_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[cobrancas GET] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar cobranças." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, cobrancas: data || [] });
  } catch (e) {
    console.error("[cobrancas GET] erro inesperado:", e);
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

    const nova = {
      sistema_id: body.sistemaId || null,
      descricao: body.descricao || "",
      tipo: body.tipo || "MENSALIDADE",
      status: body.status || "PENDENTE",
      forma_pagamento: body.formaPagamento || "",
      valor: body.valor || 0,
      vencimento: body.vencimento || null,
      pago_em: body.pagoEm || null,
      observacoes: body.observacoes || "",
    };

    const { data, error } = await supabase
      .from("cobrancas")
      .insert(nova)
      .select("*")
      .single();

    if (error) {
      console.error("[cobrancas POST] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao criar cobrança." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, cobranca: data });
  } catch (e) {
    console.error("[cobrancas POST] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID da cobrança é obrigatório." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const supabase = getSupabaseServer();

    const update: Record<string, unknown> = {};
    const fields: Record<string, string> = {
      descricao: "descricao",
      tipo: "tipo",
      status: "status",
      formaPagamento: "forma_pagamento",
      valor: "valor",
      vencimento: "vencimento",
      pagoEm: "pago_em",
      observacoes: "observacoes",
    };

    for (const [k, dbField] of Object.entries(fields)) {
      if (k in body) update[dbField] = body[k];
    }

    const { data, error } = await supabase
      .from("cobrancas")
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("[cobrancas PATCH] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao atualizar cobrança." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, cobranca: data });
  } catch (e) {
    console.error("[cobrancas PATCH] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID da cobrança é obrigatório." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    const { error } = await supabase.from("cobrancas").delete().eq("id", id);

    if (error) {
      console.error("[cobrancas DELETE] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao remover cobrança." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[cobrancas DELETE] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
