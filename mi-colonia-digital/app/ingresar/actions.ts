// app/ingresar/actions.ts — inicio de sesión (servidor).
// UNA sola entrada, como el popup del demo: correo +
// contraseña, y el servidor decide el rol. Comerciante: se
// verifica contra el hash guardado; si su correo aún no está
// verificado, el popup pide el código de 6 dígitos ahí mismo
// (sin código no hay panel). Administrador: su correo y
// contraseña viven SOLO en las variables del servidor de
// Vercel (ADMIN_EMAIL y ADMIN_PASSWORD).
"use server";

import { redirect } from "next/navigation";
import {
  CODE_MAX_ATTEMPTS,
  CODE_TTL_MINUTES,
  newVerificationCode,
  verifyPassword,
} from "../../lib/auth";
import { enviarCodigoPorCorreo } from "../../lib/correo";
import { crearSesion, cerrarSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

export interface LoginState {
  error?: string;
  // Cuando el comerciante escribió bien su contraseña pero su
  // correo aún no está verificado, el popup pide el código de
  // 6 dígitos ahí mismo (igual que en el demo): sin código no
  // hay panel, porque el registro solo se completa con él.
  needsVerification?: boolean;
  businessId?: number;
  businessName?: string;
  email?: string;
  codeError?: string;
  codeNotice?: string;
}

function campo(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

// UNA sola entrada, como en el demo: el popup pide correo y
// contraseña y el SERVIDOR decide si es el administrador
// (correo de ADMIN_EMAIL + ADMIN_PASSWORD de las variables de
// Vercel) o un comerciante (hash guardado en su negocio).
export async function entrar(
  _prev: LoginState,
  fd: FormData,
): Promise<LoginState> {
  const email = campo(fd, "email").toLowerCase();
  const password = campo(fd, "password");
  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
  if (adminEmail && email === adminEmail) {
    const okPass =
      (process.env.ADMIN_PASSWORD || "").length > 0 &&
      password === process.env.ADMIN_PASSWORD;
    if (!okPass) {
      return {
        error:
          "Contraseña de administrador incorrecta. Escríbela exactamente como está configurada.",
      };
    }
    await crearSesion({ rol: "admin", businessId: null });
    redirect("/admin");
  }
  const db = supabaseServer();
  const fila = await db
    .from("businesses")
    .select("id, name, owner_password_hash, email_verified")
    .eq("owner_email", email)
    .maybeSingle();
  const b = fila.data as {
    id: number;
    name: string;
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
    return { error: "Correo o contraseña incorrectos." };
  }
  if (!b.email_verified) {
    return {
      needsVerification: true,
      businessId: b.id,
      businessName: b.name,
      email,
    };
  }
  await crearSesion({ rol: "comerciante", businessId: b.id });
  redirect("/panel");
}

// Segundo paso del popup cuando falta verificar el correo:
// mismas reglas del registro (vence en 30 minutos, máximo 5
// intentos). Al acertar, el correo queda verificado, se crea
// la sesión y se entra directo al panel.
export async function verificarCodigoLogin(
  prev: LoginState,
  fd: FormData,
): Promise<LoginState> {
  const businessId = Number(campo(fd, "businessId"));
  const code = campo(fd, "code");
  const base: LoginState = {
    needsVerification: true,
    businessId,
    businessName: prev.businessName,
    email: prev.email,
  };
  if (!businessId || !code) {
    return { ...base, codeError: "Escribe el código de 6 dígitos que llegó a tu correo." };
  }
  const db = supabaseServer();
  const fila = await db
    .from("email_verifications")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const v = fila.data as {
    id: number;
    code: string;
    attempts: number;
    expires_at: string;
  } | null;
  if (!v) return { ...base, codeError: "No encontramos un código vigente. Pide uno nuevo." };
  if (new Date(v.expires_at).getTime() < Date.now()) {
    return { ...base, codeError: "Tu código venció (dura 30 minutos). Pide uno nuevo." };
  }
  if (v.attempts >= CODE_MAX_ATTEMPTS) {
    return { ...base, codeError: "Demasiados intentos. Pide un código nuevo." };
  }
  if (v.code !== code) {
    await db
      .from("email_verifications")
      .update({ attempts: v.attempts + 1 })
      .eq("id", v.id);
    return { ...base, codeError: "Ese código no es correcto." };
  }
  await db
    .from("businesses")
    .update({ email_verified: true })
    .eq("id", businessId);
  await crearSesion({ rol: "comerciante", businessId });
  redirect("/panel");
}

// Genera y envía un código nuevo para el paso de verificación
// del popup (mismo envío que el registro).
export async function reenviarCodigoLogin(
  prev: LoginState,
  fd: FormData,
): Promise<LoginState> {
  const businessId = Number(campo(fd, "businessId"));
  const email = (campo(fd, "email") || prev.email || "").toLowerCase();
  const base: LoginState = {
    needsVerification: true,
    businessId,
    businessName: prev.businessName,
    email: prev.email,
  };
  if (!businessId || !email) return base;
  const db = supabaseServer();
  const biz = await db
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .maybeSingle();
  const code = newVerificationCode();
  await db.from("email_verifications").insert({
    business_id: businessId,
    email,
    code,
    attempts: 0,
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
  });
  await enviarCodigoPorCorreo(
    email,
    code,
    biz.data ? String((biz.data as { name: string }).name) : "tu negocio",
  );
  return { ...base, codeNotice: "Te enviamos un código nuevo a " + email + " 📧" };
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/");
}
