// lib/supabase.ts — cliente del NAVEGADOR: solo la URL y la
// clave PUBLICABLE. Las tablas tienen RLS: el público solo lee
// negocios activos. Este archivo SÍ puede ir al navegador.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { STORAGE_BUCKET } from "./plataforma";

export function supabaseBrowser(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  );
}

// Convierte la ruta guardada en la base (bucket fotos-negocios)
// en la URL pública de la foto.
export function publicPhotoUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return (
    (process.env.NEXT_PUBLIC_SUPABASE_URL as string) +
    "/storage/v1/object/public/" +
    STORAGE_BUCKET +
    "/" +
    path
  );
}
