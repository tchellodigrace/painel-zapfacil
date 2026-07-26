import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/zapbot/status-cliente?email=xxx
 *
 * Retorna o status do ZapBot para o painel do CLIENTE:
 *  - Se o servidor Evolution API global está configurado
 *  - Se o WhatsApp do cliente está conectado
 *  - Qual número está conectado
 *  - Mensagem de boas-vindas, menu ativo, respostas ativas
 *  - Última mensagem recebida
 *
 * O cliente apenas VÊ o status. Não configura nada.
 * Configuração é feita pelo admin via /api/zapbot/config-global.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email é obrigatório." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // 1) Buscar config global do ZapBot (servidor Evolution API)
    // Tolerante: se a tabela ainda não existe (antes de rodar schema-zapbot.sql),
    // retorna servidorConfigurado=false sem quebrar a tela do cliente.
    let servidorConfigurado = false;
    try {
      const { data: globalConfig } = await supabase
        .from("zapbot_global_config")
        .select("api_url, instance_name, api_key, ativo")
        .eq("id", 1)
        .maybeSingle();

      servidorConfigurado = !!(
        globalConfig?.api_url &&
        globalConfig?.instance_name &&
        globalConfig?.ativo
      );
    } catch (e) {
      console.warn("[zapbot/status-cliente] tabela global_config indisponível:", e);
    }

    // Se o servidor não está configurado, retorna status "quase pronto"
    if (!servidorConfigurado) {
      return NextResponse.json({
        ok: true,
        status: {
          servidorConfigurado: false,
          conectado: false,
          numeroConectado: null,
          ultimaMensagem: null,
          ultimaMensagemData: null,
          boasVindas: null,
          menuAtivo: false,
          respostasAtivas: 0,
        },
      });
    }

    // 2) Buscar o sistema do cliente (por email)
    const { data: sistema } = await supabase
      .from("sistemas")
      .select("id, cliente_id")
      .eq("email", String(email).toLowerCase())
      .maybeSingle();

    if (!sistema) {
      return NextResponse.json({
        ok: true,
        status: {
          servidorConfigurado: true,
          conectado: false,
          numeroConectado: null,
          ultimaMensagem: null,
          ultimaMensagemData: null,
          boasVindas: null,
          menuAtivo: false,
          respostasAtivas: 0,
        },
      });
    }

    // 3) Buscar config do ZapBot deste cliente específico
    const { data: clienteConfig } = await supabase
      .from("zapbot_clientes")
      .select("id, conectado, numero_conectado, mensagem_boas_vindas, menu_ativo, ultima_mensagem, ultima_mensagem_data")
      .eq("sistema_id", sistema.id)
      .maybeSingle();

    // 4) Contar respostas automáticas ativas deste cliente
    let respostasAtivas = 0;
    if (clienteConfig?.id) {
      const { count } = await supabase
        .from("zapbot_respostas")
        .select("id", { count: "exact", head: true })
        .eq("zapbot_cliente_id", clienteConfig.id)
        .eq("ativo", true);
      respostasAtivas = count || 0;
    }

    return NextResponse.json({
      ok: true,
      status: {
        servidorConfigurado: true,
        conectado: !!clienteConfig?.conectado,
        numeroConectado: clienteConfig?.numero_conectado || null,
        ultimaMensagem: clienteConfig?.ultima_mensagem || null,
        ultimaMensagemData: clienteConfig?.ultima_mensagem_data || null,
        boasVindas: clienteConfig?.mensagem_boas_vindas || null,
        menuAtivo: !!clienteConfig?.menu_ativo,
        respostasAtivas,
      },
    });
  } catch (e) {
    console.error("[zapbot/status-cliente] erro:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
