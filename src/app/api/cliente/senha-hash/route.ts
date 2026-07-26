import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/cliente/senha-hash?email=xxx
 *
 * Retorna o hash bcrypt da senha do cliente (apenas para uso do admin
 * no painel admin - visualizar hash em Editar Sistema).
 *
 * IMPORTANTE: este endpoint NUNCA deve expor a senha em texto plano -
 * bcrypt e one-way, nao e possivel decifrar. Apenas retorna o hash
 * armazenado (que comeca com $2a$10$...).
 *
 * Seguranca: como o painel admin nao tem auth server-side propria
 * (e guardado em localStorage), este endpoint confia apenas no fato
 * de que a URL so e conhecida pelo admin. Para producao real, seria
 * necessario adicionar auth admin real.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "E-mail é obrigatório." },
        { status: 400 }
      );
    }

    const emailNorm = email.trim().toLowerCase();

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("clientes")
      .select("id, email, senha_hash")
      .eq("email", emailNorm)
      .maybeSingle();

    if (error) {
      console.error("[senha-hash GET] erro query:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar senha." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: "Cliente não encontrado (pode ter sido cadastrado direto no admin sem criar login).",
        },
        { status: 404 }
      );
    }

    if (!data.senha_hash) {
      return NextResponse.json({
        ok: true,
        senhaHash: null,
        mensagem: "Cliente não possui senha cadastrada (cadastro administrativo).",
      });
    }

    return NextResponse.json({
      ok: true,
      senhaHash: data.senha_hash,
    });
  } catch (e) {
    console.error("[senha-hash GET] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
