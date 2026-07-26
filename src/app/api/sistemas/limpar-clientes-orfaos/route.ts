import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * POST /api/sistemas/limpar-clientes-orfaos
 *
 * Remove todos os registros da tabela `clientes` que NÃO possuem
 * mais um sistema correspondente em `sistemas` (por cliente_id OU email).
 *
 * Cenário: antes da correção do DELETE /api/sistemas, excluir um sistema
 * no admin não removia o cliente da tabela `clientes`, deixando emails
 * "fantasmas" que bloqueavam novos cadastros com a mesma credencial.
 */
export async function POST() {
  try {
    const supabase = getSupabaseServer();

    // 1) Buscar todos os cliente_id e email ainda presentes em sistemas
    const { data: sistemas, error: errSistemas } = await supabase
      .from("sistemas")
      .select("cliente_id, email");

    if (errSistemas) {
      console.error("[limpar-clientes-orfaos] erro ao buscar sistemas:", errSistemas);
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar sistemas." },
        { status: 500 }
      );
    }

    const clienteIdsValidos = new Set(
      (sistemas || [])
        .map((s) => s.cliente_id)
        .filter(Boolean) as string[]
    );
    const emailsValidos = new Set(
      (sistemas || [])
        .map((s) => (s.email ? String(s.email).toLowerCase() : null))
        .filter(Boolean) as string[]
    );

    // 2) Buscar todos os clientes
    const { data: clientes, error: errClientes } = await supabase
      .from("clientes")
      .select("id, email");

    if (errClientes) {
      console.error("[limpar-clientes-orfaos] erro ao buscar clientes:", errClientes);
      return NextResponse.json(
        { ok: false, error: "Erro ao buscar clientes." },
        { status: 500 }
      );
    }

    // 3) Filtrar órfãos: cliente sem cliente_id em sistemas E sem email em sistemas
    const orfaos = (clientes || []).filter((c) => {
      const idValido = clienteIdsValidos.has(c.id);
      const emailValido = emailsValidos.has(
        String(c.email || "").toLowerCase()
      );
      return !idValido && !emailValido;
    });

    if (orfaos.length === 0) {
      return NextResponse.json({
        ok: true,
        mensagem: "Nenhum cliente órfão encontrado.",
        removidos: 0,
      });
    }

    // 4) Deletar órfãos em lote
    const orfaoIds = orfaos.map((c) => c.id);
    const { error: errDelete } = await supabase
      .from("clientes")
      .delete()
      .in("id", orfaoIds);

    if (errDelete) {
      console.error("[limpar-clientes-orfaos] erro ao deletar órfãos:", errDelete);
      return NextResponse.json(
        { ok: false, error: "Erro ao deletar clientes órfãos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensagem: `${orfaos.length} cliente(s) órfão(s) removido(s).`,
      removidos: orfaos.length,
      emailsRemovidos: orfaos.map((c) => c.email),
    });
  } catch (e) {
    console.error("[limpar-clientes-orfaos] erro inesperado:", e);
    return NextResponse.json(
      { ok: false, error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
