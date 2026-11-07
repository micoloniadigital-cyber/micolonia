// app/panel/actions.ts — acciones del panel del comerciante.
// Todas validan la sesión: un comerciante solo toca SU negocio
// y SUS productos. La clave secreta jamás sale del servidor.
"use server";

import { revalidatePath } from "next/cache";
import { hashPassword } from "../../lib/auth";
import { STORAGE_BUCKET, validarScheduleJson } from "../../lib/plataforma";
import { leerSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

async function miNegocioId(): Promise<number> {
  const s = await leerSesion();
  if (!s || s.rol !== "comerciante" || !s.businessId) {
    throw new Error("Sesión de comerciante requerida.");
  }
  return s.businessId;
}

function campo(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

export async function actualizarNegocio(fd: FormData): Promise<void> {
  const id = await miNegocioId();
  const db = supabaseServer();
  // Horario por día: el checklist del panel manda el campo oculto
  // «schedule» (JSON). Si es válido se guarda el JSON y se derivan
  // days_label/open_time/close_time; si no, se conservan los
  // campos clásicos que traiga el formulario (o los actuales).
  const sched = validarScheduleJson(campo(fd, "schedule"));
  await db
    .from("businesses")
    .update({
      name: campo(fd, "name"),
      owner_name: campo(fd, "ownerName"),
      category: campo(fd, "category"),
      description: campo(fd, "description"),
      colonia: campo(fd, "colonia"),
      address: campo(fd, "address"),
      maps_url: campo(fd, "mapsUrl"),
      phone: campo(fd, "phone"),
      whatsapp: campo(fd, "whatsapp"),
      facebook: campo(fd, "facebook"),
      instagram: campo(fd, "instagram"),
      tiktok: campo(fd, "tiktok"),
      open_time: sched ? sched.openTime : campo(fd, "openTime") || "09:00",
      close_time: sched ? sched.closeTime : campo(fd, "closeTime") || "21:00",
      days_label: sched ? sched.daysLabel : campo(fd, "daysLabel") || "Lunes a domingo",
      // Sin schedule válido NO se toca la columna: se conserva el
      // horario por día que el negocio ya tuviera guardado.
      ...(sched ? { schedule: sched.schedule } : {}),
      accent: campo(fd, "accent") || "#EA580C",
    })
    .eq("id", id);
  revalidatePath("/panel");
}

export async function guardarProducto(fd: FormData): Promise<void> {
  const businessId = await miNegocioId();
  const db = supabaseServer();
  const idTxt = campo(fd, "id");
  const promoTxt = campo(fd, "promoPrice");
  const datos = {
    business_id: businessId,
    name: campo(fd, "name"),
    description: campo(fd, "description"),
    price: Number(campo(fd, "price")) || 0,
    promo_price: promoTxt ? Number(promoTxt) : null,
    category: campo(fd, "category") || "General",
    available: fd.get("available") === "on",
    featured: fd.get("featured") === "on",
  };
  if (idTxt) {
    await db
      .from("products")
      .update(datos)
      .eq("id", Number(idTxt))
      .eq("business_id", businessId);
  } else {
    await db.from("products").insert(datos);
  }
  revalidatePath("/panel");
}

export async function eliminarProducto(fd: FormData): Promise<void> {
  const businessId = await miNegocioId();
  const db = supabaseServer();
  await db
    .from("products")
    .delete()
    .eq("id", Number(campo(fd, "id")))
    .eq("business_id", businessId);
  revalidatePath("/panel");
}

export async function cambiarPromociones(fd: FormData): Promise<void> {
  const businessId = await miNegocioId();
  const db = supabaseServer();
  await db
    .from("businesses")
    .update({ promotions_active: fd.get("activas") === "on" })
    .eq("id", businessId);
  revalidatePath("/panel");
}

// Sube logo, portada o foto de producto al bucket
// «fotos-negocios» (carpeta de SU negocio) y guarda la ruta.
export async function subirFoto(fd: FormData): Promise<void> {
  const businessId = await miNegocioId();
  const tipo = campo(fd, "tipo"); // logo | portada | producto
  const archivo = fd.get("foto");
  if (!(archivo instanceof File) || archivo.size === 0) return;
  if (archivo.size > 2 * 1024 * 1024) {
    throw new Error("La foto pesa más de 2 MB. Usa una más ligera.");
  }
  const ext = (archivo.name.split(".").pop() || "jpg").toLowerCase();
  const ruta =
    "negocios/" + businessId + "/" + tipo + "-" + Date.now() + "." + ext;
  const db = supabaseServer();
  const up = await db.storage
    .from(STORAGE_BUCKET)
    .upload(ruta, archivo, { upsert: true, contentType: archivo.type });
  if (up.error) throw new Error("No pudimos subir la foto. Inténtalo de nuevo.");
  if (tipo === "logo") {
    await db.from("businesses").update({ logo_path: ruta }).eq("id", businessId);
  } else if (tipo === "portada") {
    await db.from("businesses").update({ cover_path: ruta }).eq("id", businessId);
  } else if (tipo === "producto") {
    await db
      .from("products")
      .update({ image_path: ruta })
      .eq("id", Number(campo(fd, "productoId")))
      .eq("business_id", businessId);
  }
  revalidatePath("/panel");
}

export async function cambiarContrasena(fd: FormData): Promise<void> {
  const businessId = await miNegocioId();
  const nueva = campo(fd, "nueva");
  if (nueva.length < 8) {
    throw new Error("La contraseña nueva debe tener mínimo 8 caracteres.");
  }
  const db = supabaseServer();
  await db
    .from("businesses")
    .update({ owner_password_hash: await hashPassword(nueva) })
    .eq("id", businessId);
  revalidatePath("/panel");
}
