import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface RegistrarBody {
  email: string;
  senha: string;
  nomeEmpresa: string;
  nomeResponsavel: string;
  telefone?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegistrarBody;

    const email = (body.email || "").trim().toLowerCase();
    const senha = body.senha || "";
    const nomeEmpresa = (body.nomeEmpresa || "").trim();
    const nomeResponsavel = (body.nomeResponsavel || "").trim();
    const telefone = (body.telefone || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "E-mail inválido." },
        { status: 400 }
      );
    }
    if (!senha || senha.length < 6) {
      return NextResponse.json(
        { ok: false, error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }
    if (!nomeEmpresa) {
      return NextResponse.json(
        { ok: false, error: "Informe o nome da empresa." },
        { status: 400 }
      );
    }
    if (!nomeResponsavel) {
      return NextResponse.json(
        { ok: false, error: "Informe o nome do responsável." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Verificar se já existe
    const { data: existente } = await supabase
      .from("clientes")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existente) {
      return NextResponse.json(
        { ok: false, error: "Já existe uma conta com este e-mail." },
        { status: 409 }
      );
    }

    // Hash da senha (10 rounds = balanceado entre segurança e velocidade)
    const senha_hash = await bcrypt.hash(senha, 10);

    // Inserir cliente
    const { data: novoCliente, error: errInsert } = await supabase
      .from("clientes")
      .insert({
        email,
        senha_hash,
        nome_empresa: nomeEmpresa,
        nome_responsavel: nomeResponsavel,
        telefone: telefone || null,
      })
      .select("id, email, nome_empresa, nome_responsavel, telefone")
      .single();

    if (errInsert || !novoCliente) {
      console.error("[registrar] erro insert:", errInsert);
      return NextResponse.json(
        { ok: false, error: "Erro ao criar conta. Tente novamente." },
        { status: 500 }
      );
    }

    // Criar sistema inicial (TRIAL PRO) para o cliente aparecer no admin
    const hoje = new Date().toISOString().split("T")[0];
    const trialFim = new Date();
    trialFim.setDate(trialFim.getDate() + 7); // 7 dias de trial
    const trialFimStr = trialFim.toISOString().split("T")[0];

    await supabase.from("sistemas").insert({
      cliente_id: novoCliente.id,
      empresa: nomeEmpresa,
      responsavel: nomeResponsavel,
      telefone: telefone || null,
      email,
      cidade: "",
      data_instalacao: hoje,
      data_vencimento: trialFimStr,
      status: "TRIAL",
      plano: "PRO",
      tipo_licenca: "ALUGUEL",
      valor_mensal: 0,
      valor_aquisicao: 0,
      taxa_instalacao: 0,
      observacoes: "Registro automático via painel cliente",
      // Trial não tem Premium ativo por padrão
      zapbot_ativo: false,
      disparo_ativo: false,
      funil_ativo: false,
      fluxos_ativo: false,
    });

    return NextResponse.json({
      ok: true,
      cliente: {
        id: novoCliente.id,
        email: novoCliente.email,
        nomeEmpresa: novoCliente.nome_empresa,
        nomeResponsavel: novoCliente.nome_responsavel,
        telefone: novoCliente.telefone || "",
      },
    });
  } catch (e) {
    console.error("[registrar] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
