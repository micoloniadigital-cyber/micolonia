// lib/sesion.ts — sesión con cookie firmada (HMAC-SHA256 con
// la clave secreta de Supabase, que solo vive en el servidor).
// Roles: "admin" (Mario) y "comerciante" (su propio negocio).
// Cada acción del servidor revisa la sesión antes de escribir:
// un comerciante jamás toca otro negocio.
import { cookies } from "next/headers";

export interface Sesion {
  rol: "admin" | "comerciante";
  businessId: number | null;
}

const COOKIE = "mcd_sesion";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function clave(): string {
  return process.env.SUPABASE_SECRET_KEY || "";
}

async function firmar(datos: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(clave()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(datos),
  );
  return Array.from(new Uint8Array(sig))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

export async function crearSesion(s: Sesion): Promise<void> {
  const datos = Buffer.from(JSON.stringify(s), "utf8").toString("base64url");
  const valor = datos + "." + (await firmar(datos));
  const jar = await cookies();
  jar.set(COOKIE, valor, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function leerSesion(): Promise<Sesion | null> {
  const jar = await cookies();
  const valor = jar.get(COOKIE)?.value;
  if (!valor) return null;
  const partes = valor.split(".");
  if (partes.length !== 2) return null;
  const datos = partes[0] as string;
  if ((await firmar(datos)) !== partes[1]) return null;
  try {
    const s = JSON.parse(
      Buffer.from(datos, "base64url").toString("utf8"),
    ) as Sesion;
    if (s.rol !== "admin" && s.rol !== "comerciante") return null;
    return s;
  } catch {
    return null;
  }
}

export async function cerrarSesion(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
