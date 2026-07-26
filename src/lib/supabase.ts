import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase SERVER-SIDE (usa service_role key).
 * Tem acesso total às tabelas, bypass de RLS.
 *
 * USO: apenas em API routes / server components / server actions.
 * NUNCA importar isso num componente client (vazaria a secret key).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let _client: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (_client) return _client;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase env vars ausentes. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _client;
}

/**
 * Cliente Supabase CLIENT-SIDE (usa publishable/anon key).
 * Sujeito a RLS policies.
 *
 * USO: componentes client quando precisarem ler dados públicos.
 */
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _clientAnon: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_clientAnon) return _clientAnon;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  _clientAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _clientAnon;
}
