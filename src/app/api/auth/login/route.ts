import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface LoginBody {
  email: string;
  senha: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginBody;

    const email = (body.email || "").trim().toLowerCase();
    const senha = body.senha || "";

    if (!email || !senha) {
      return NextResponse.json(
        { ok: false, error: "Preencha e-mail e senha." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Buscar cliente pelo email
    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("id, email, senha_hash, nome_empresa, nome_responsavel, telefone")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[login] erro query:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao validar credenciais." },
        { status: 500 }
      );
    }

    if (!cliente) {
      return NextResponse.json(
        { ok: false, error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Validar senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaValida) {
      return NextResponse.json(
        { ok: false, error: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Login OK — retornar dados do cliente (sem senha_hash)
    return NextResponse.json({
      ok: true,
      cliente: {
        id: cliente.id,
        email: cliente.email,
        nomeEmpresa: cliente.nome_empresa,
        nomeResponsavel: cliente.nome_responsavel,
        telefone: cliente.telefone || "",
      },
    });
  } catch (e) {
    console.error("[login] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
