// app/ingresar/actions.ts — inicio de sesión (servidor).
// Comerciante: correo + contraseña verificados contra el hash
// guardado; sin correo verificado no hay panel. Administrador:
// su correo y contraseña viven SOLO en las variables del
// servidor de Vercel (ADMIN_EMAIL y ADMIN_PASSWORD).
"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "../../lib/auth";
import { crearSesion, cerrarSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

export interface LoginState {
  error?: string;
}

function campo(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

export async function entrarComerciante(
  _prev: LoginState,
  fd: FormData,
): Promise<LoginState> {
  const email = campo(fd, "email").toLowerCase();
  const password = campo(fd, "password");
  const db = supabaseServer();
  const fila = await db
    .from("businesses")
    .select("id, owner_password_hash, email_verified")
    .eq("owner_email", email)
    .maybeSingle();
  const b = fila.data as {
    id: number;
    owner_password_hash: string;
    email_verified: boolean;
  } | null;
  if (!b || !b.owner_password_hash) {
    return {
      error:
        "No encontramos una cuenta con ese correo. Si tu cuenta es de antes, pide a Mario que te ayude a poner tu contraseña.",
    };
  }
  if (!(await verifyPassword(password, b.owner_password_hash))) {
    return { error: "La contraseña no es correcta. Inténtalo de nuevo." };
  }
  if (!b.email_verified) {
    return {
      error:
        "Tu correo todavía no está verificado. Regístrate de nuevo en /registro para recibir un código nuevo.",
    };
  }
  await crearSesion({ rol: "comerciante", businessId: b.id });
  redirect("/panel");
}

export async function entrarAdmin(
  _prev: LoginState,
  fd: FormData,
): Promise<LoginState> {
  const email = campo(fd, "email").toLowerCase();
  const password = campo(fd, "password");
  const okEmail =
    email === (process.env.ADMIN_EMAIL || "").toLowerCase() && email !== "";
  const okPass =
    (process.env.ADMIN_PASSWORD || "").length > 0 &&
    password === process.env.ADMIN_PASSWORD;
  if (!okEmail || !okPass) {
    return { error: "Correo o contraseña de administrador incorrectos." };
  }
  await crearSesion({ rol: "admin", businessId: null });
  redirect("/admin");
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/");
}
