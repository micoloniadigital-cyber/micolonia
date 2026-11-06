// lib/supabase-server.ts — cliente del SERVIDOR: usa la clave
// SECRETA (SUPABASE_SECRET_KEY), que salta el RLS. Por eso cada
// ruta que lo usa valida primero la sesión y el rol (lib/sesion).
// NUNCA importar este archivo en un componente del navegador.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseServer(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SECRET_KEY as string,
    { auth: { persistSession: false } },
  );
}
