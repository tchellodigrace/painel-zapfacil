import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    url_setada: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon_setada: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    secret_setada: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url_valor: process.env.NEXT_PUBLIC_SUPABASE_URL || "(vazio)",
    url_prefixo: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || "(vazio)",
    secret_prefixo: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 15) || "(vazio)",
    timestamp: new Date().toISOString(),
  });
}
