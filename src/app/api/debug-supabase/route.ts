import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Rota TEMPORÁRIA de diagnóstico.
 * Retorna o estado das env vars + tenta um SELECT simples.
 * NUNCA expõe o valor das keys, apenas se estão setadas (true/false).
 *
 * DELETE este arquivo após o problema ser resolvido.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const diag: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: url ? `OK (${url.length} chars)` : "AUSENTE",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anon
        ? `OK (${anon.length} chars, prefix: ${anon.slice(0, 12)}...)`
        : "AUSENTE",
      SUPABASE_SERVICE_ROLE_KEY: secret
        ? `OK (${secret.length} chars, prefix: ${secret.slice(0, 12)}...)`
        : "AUSENTE",
    },
    tests: {} as Record<string, unknown>,
  };

  // Teste 1: Tenta instanciar o client
  try {
    const supabase = getSupabaseServer();
    (diag.tests as Record<string, unknown>).clientInit = "OK";
  } catch (e: any) {
    (diag.tests as Record<string, unknown>).clientInit = `ERRO: ${e?.message || String(e)}`;
    return NextResponse.json(diag, { status: 500 });
  }

  // Teste 2: SELECT simples na tabela sistemas
  try {
    const supabase = getSupabaseServer();
    const { data, error, count } = await supabase
      .from("sistemas")
      .select("*", { count: "exact" })
      .limit(1);

    (diag.tests as Record<string, unknown>).selectSistemas = {
      ok: !error,
      count: count ?? null,
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          }
        : null,
      dataSample: data && data.length > 0 ? "tem dados" : "tabela vazia",
    };
  } catch (e: any) {
    (diag.tests as Record<string, unknown>).selectSistemas = {
      ok: false,
      error: e?.message || String(e),
      stack: e?.stack?.split("\n").slice(0, 5),
    };
  }

  // Teste 3: SELECT na tabela clientes
  try {
    const supabase = getSupabaseServer();
    const { data, error, count } = await supabase
      .from("clientes")
      .select("*", { count: "exact" })
      .limit(1);

    (diag.tests as Record<string, unknown>).selectClientes = {
      ok: !error,
      count: count ?? null,
      error: error
        ? {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          }
        : null,
    };
  } catch (e: any) {
    (diag.tests as Record<string, unknown>).selectClientes = {
      ok: false,
      error: e?.message || String(e),
    };
  }

  // Teste 4: INSERT de teste em sistemas (e deleta em seguida)
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("sistemas")
      .insert({
        empresa: "__DEBUG_TEST__",
        responsavel: "test",
        email: "debug-test@example.com",
        cidade: "",
        status: "DEBUG",
        plano: "PRO",
        tipo_licenca: "ALUGUEL",
        valor_mensal: 0,
        valor_aquisicao: 0,
        taxa_instalacao: 0,
        observacoes: "debug",
        zapbot_ativo: false,
        disparo_ativo: false,
        funil_ativo: false,
        fluxos_ativo: false,
      })
      .select("id")
      .single();

    if (error) {
      (diag.tests as Record<string, unknown>).insertSistema = {
        ok: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
      };
    } else if (data?.id) {
      // Limpar o registro de teste
      await supabase.from("sistemas").delete().eq("id", data.id);
      (diag.tests as Record<string, unknown>).insertSistema = {
        ok: true,
        insertedId: data.id,
        cleanedUp: true,
      };
    }
  } catch (e: any) {
    (diag.tests as Record<string, unknown>).insertSistema = {
      ok: false,
      error: e?.message || String(e),
    };
  }

  const allOk = Object.values(diag.tests as Record<string, unknown>).every(
    (v) =>
      typeof v === "object" &&
      v !== null &&
      (v as any).ok !== false
  );

  return NextResponse.json(diag, { status: allOk ? 200 : 500 });
}
