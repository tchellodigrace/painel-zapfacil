import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/zapbot/config-global
 * Retorna a config global do servidor Evolution API (admin).
 * NÃO retorna a api_key completa por segurança — apenas os 4 últimos chars.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    // Tolerante: se a tabela ainda não existe, retorna config=null
    let data: any = null;
    try {
      const result = await supabase
        .from("zapbot_global_config")
        .select("id, api_url, instance_name, api_key, ativo, criado_em, atualizado_em")
        .eq("id", 1)
        .maybeSingle();
      data = result.data;
      if (result.error) throw result.error;
    } catch (e) {
      console.warn("[zapbot/config-global GET] tabela indisponível:", e);
      return NextResponse.json({
        ok: true,
        config: null,
        mensagem: "Tabela zapbot_global_config ainda não existe. Execute o schema-zapbot.sql no Supabase.",
      });
    }

    if (!data) {
      return NextResponse.json({
        ok: true,
        config: null,
        mensagem: "Configuração global não definida ainda.",
      });
    }

    // Mascarar a API key antes de enviar ao front
    const apiKey = data.api_key || "";
    const apiKeyMascarada =
      apiKey.length > 8
        ? `${"•".repeat(Math.min(apiKey.length - 4, 20))}${apiKey.slice(-4)}`
        : apiKey
        ? "••••"
        : "";

    return NextResponse.json({
      ok: true,
      config: {
        apiUrl: data.api_url,
        instanceName: data.instance_name,
        apiKeyMascarada,
        temApiKey: !!data.api_key,
        ativo: !!data.ativo,
        criadoEm: data.criado_em,
        atualizadoEm: data.atualizado_em,
      },
    });
  } catch (e) {
    console.error("[zapbot/config-global GET] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/zapbot/config-global
 * Salva (ou atualiza) a config global do servidor Evolution API.
 *
 * Body:
 *  - apiUrl: string (URL do servidor, ex: https://evolution.suaempresa.com)
 *  - instanceName: string (nome da instância criada na Evolution API)
 *  - apiKey: string (API key da Evolution API)
 *  - ativo: boolean (liga/desliga o ZapBot globalmente)
 *
 * Usa UPSERT no id=1 (sempre uma única linha de config global).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseServer();

    const apiUrl = (body.apiUrl || "").trim().replace(/\/$/, "");
    const instanceName = (body.instanceName || "").trim();
    const apiKey = (body.apiKey || "").trim();
    const ativo = body.ativo !== false; // default true se não enviado

    if (!apiUrl || !instanceName) {
      return NextResponse.json(
        { ok: false, error: "URL da API e nome da instância são obrigatórios." },
        { status: 400 }
      );
    }

    if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
      return NextResponse.json(
        { ok: false, error: "URL da API deve começar com http:// ou https://" },
        { status: 400 }
      );
    }

    // Montar objeto para upsert
    const dadosUpsert: Record<string, unknown> = {
      id: 1,
      api_url: apiUrl,
      instance_name: instanceName,
      ativo,
      atualizado_em: new Date().toISOString(),
    };

    // Só atualiza a api_key se foi enviada (não permite limpar por acidente)
    if (apiKey) {
      dadosUpsert.api_key = apiKey;
    }

    const { data, error } = await supabase
      .from("zapbot_global_config")
      .upsert(dadosUpsert)
      .select("id, api_url, instance_name, ativo")
      .single();

    if (error) {
      console.error("[zapbot/config-global POST] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao salvar config global." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      config: data,
      mensagem: "Configuração global salva com sucesso.",
    });
  } catch (e) {
    console.error("[zapbot/config-global POST] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/zapbot/config-global
 * Remove a config global (zera o servidor Evolution API).
 */
export async function DELETE() {
  try {
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("zapbot_global_config")
      .delete()
      .eq("id", 1);

    if (error) {
      console.error("[zapbot/config-global DELETE] erro:", error);
      return NextResponse.json(
        { ok: false, error: "Erro ao remover config global." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensagem: "Configuração global removida.",
    });
  } catch (e) {
    console.error("[zapbot/config-global DELETE] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
