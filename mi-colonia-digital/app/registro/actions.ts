// app/registro/actions.ts — acciones del registro (servidor).
// Flujo: 1) el comerciante crea su cuenta con contraseña
// (mínimo 8, solo se guarda el hash), 2) el servidor genera el
// código de 6 dígitos y se envía por correo (vence en 30 min,
// 5 intentos), 3) sin escribir el código NO hay acceso al
// panel, 4) el negocio queda «pendiente»: Mario cobra los
// $259 en persona y lo activa desde su panel.
"use server";

import { redirect } from "next/navigation";
import {
  CODE_MAX_ATTEMPTS,
  CODE_TTL_MINUTES,
  hashPassword,
  newVerificationCode,
} from "../../lib/auth";
import { enviarCodigoPorCorreo } from "../../lib/correo";
import { MONTHLY_PRICE, slugify } from "../../lib/plataforma";
import { crearSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

export interface RegistroState {
  error?: string;
  paso?: "datos" | "codigo";
  businessId?: number;
  email?: string;
}

function campo(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

export async function registrarNegocio(
  _prev: RegistroState,
  fd: FormData,
): Promise<RegistroState> {
  const name = campo(fd, "name");
  const ownerName = campo(fd, "ownerName");
  const ownerEmail = campo(fd, "ownerEmail").toLowerCase();
  const password = campo(fd, "password");
  const password2 = campo(fd, "password2");
  if (!name || !ownerEmail) {
    return { paso: "datos", error: "Escribe el nombre de tu negocio y tu correo." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    return { paso: "datos", error: "Ese correo no se ve válido. Revísalo." };
  }
  if (password.length < 8) {
    return { paso: "datos", error: "Tu contraseña debe tener mínimo 8 caracteres." };
  }
  if (password !== password2) {
    return { paso: "datos", error: "Las contraseñas no coinciden." };
  }
  const db = supabaseServer();
  const existe = await db
    .from("businesses")
    .select("id")
    .eq("owner_email", ownerEmail)
    .maybeSingle();
  if (existe.data) {
    return {
      paso: "datos",
      error: "Ya hay un negocio registrado con ese correo. Inicia sesión en /ingresar.",
    };
  }
  let slug = slugify(name) || "negocio";
  const slugOcupado = await db
    .from("businesses")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugOcupado.data) slug = slug + "-" + Math.floor(1000 + Math.random() * 9000);
  const vence = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const ins = await db
    .from("businesses")
    .insert({
      slug,
      name,
      owner_name: ownerName,
      owner_email: ownerEmail,
      owner_password_hash: await hashPassword(password),
      category: campo(fd, "category") || "Otros",
      description: campo(fd, "description"),
      colonia: campo(fd, "colonia"),
      address: campo(fd, "address"),
      maps_url: campo(fd, "mapsUrl"),
      phone: campo(fd, "phone"),
      whatsapp: campo(fd, "whatsapp"),
      email: ownerEmail,
      facebook: campo(fd, "facebook"),
      instagram: campo(fd, "instagram"),
      tiktok: campo(fd, "tiktok"),
      open_time: campo(fd, "openTime") || "09:00",
      close_time: campo(fd, "closeTime") || "21:00",
      days_label: campo(fd, "daysLabel") || "Lunes a domingo",
      status: "pendiente",
      subscription_status: "pendiente_pago",
      next_payment_date: vence,
      email_verified: false,
    })
    .select("id")
    .single();
  if (ins.error || !ins.data) {
    return {
      paso: "datos",
      error: "No pudimos crear tu registro. Inténtalo de nuevo en un momento.",
    };
  }
  const businessId = Number((ins.data as { id: number }).id);
  const code = newVerificationCode();
  await db.from("email_verifications").insert({
    business_id: businessId,
    email: ownerEmail,
    code,
    attempts: 0,
    expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString(),
  });
  await enviarCodigoPorCorreo(ownerEmail, code, name);
  return { paso: "codigo", businessId, email: ownerEmail };
}

export async function verificarCodigo(
  _prev: RegistroState,
  fd: FormData,
): Promise<RegistroState> {
  const businessId = Number(campo(fd, "businessId"));
  const email = campo(fd, "email").toLowerCase();
  const code = campo(fd, "code");
  const base: RegistroState = { paso: "codigo", businessId, email };
  if (!businessId || !code) {
    return { ...base, error: "Escribe el código de 6 dígitos que llegó a tu correo." };
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
  if (!v) return { ...base, error: "No encontramos un código vigente. Pide uno nuevo." };
  if (new Date(v.expires_at).getTime() < Date.now()) {
    return { ...base, error: "Tu código venció (dura 30 minutos). Pide uno nuevo." };
  }
  if (v.attempts >= CODE_MAX_ATTEMPTS) {
    return { ...base, error: "Demasiados intentos. Pide un código nuevo." };
  }
  if (v.code !== code) {
    await db
      .from("email_verifications")
      .update({ attempts: v.attempts + 1 })
      .eq("id", v.id);
    return { ...base, error: "Ese código no es el correcto. Revisa tu correo." };
  }
  await db
    .from("businesses")
    .update({ email_verified: true })
    .eq("id", businessId);
  await crearSesion({ rol: "comerciante", businessId });
  redirect("/panel");
}

export async function reenviarCodigo(fd: FormData): Promise<void> {
  const businessId = Number(campo(fd, "businessId"));
  const email = campo(fd, "email").toLowerCase();
  if (!businessId) return;
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
}

export { MONTHLY_PRICE };
