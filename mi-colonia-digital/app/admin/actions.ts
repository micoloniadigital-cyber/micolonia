// app/admin/actions.ts — acciones del administrador (Mario).
// Todas validan la sesión de admin en el servidor: activar/
// suspender locales, destacar hasta 10 lugares, registrar el
// cobro personal de $259 (activa y mueve el vencimiento),
// eliminar locales y salir.
"use server";

import { revalidatePath } from "next/cache";
import { MAX_FEATURED, MONTHLY_PRICE } from "../../lib/plataforma";
import { leerSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

async function soloAdmin(): Promise<void> {
  const s = await leerSesion();
  if (!s || s.rol !== "admin") throw new Error("Sesión de administrador requerida.");
}

function campo(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

export async function adminSetEstado(fd: FormData): Promise<void> {
  await soloAdmin();
  const db = supabaseServer();
  const cambios: Record<string, string> = { status: campo(fd, "estado") };
  // El botón grande «Activar/Desactivar local» del panel manda
  // también la suscripción, como en el demo: al desactivar
  // queda «vencida» y al activar queda «activa».
  const suscripcion = campo(fd, "suscripcion");
  if (suscripcion) cambios.subscription_status = suscripcion;
  await db
    .from("businesses")
    .update(cambios)
    .eq("id", Number(campo(fd, "id")));
  revalidatePath("/admin");
}

export async function adminSetSuscripcion(fd: FormData): Promise<void> {
  await soloAdmin();
  const db = supabaseServer();
  await db
    .from("businesses")
    .update({ subscription_status: campo(fd, "suscripcion") })
    .eq("id", Number(campo(fd, "id")));
  revalidatePath("/admin");
}

export async function adminSetVencimiento(fd: FormData): Promise<void> {
  await soloAdmin();
  const fecha = campo(fd, "fecha");
  if (!fecha) return;
  const db = supabaseServer();
  await db
    .from("businesses")
    .update({ next_payment_date: fecha })
    .eq("id", Number(campo(fd, "id")));
  revalidatePath("/admin");
}

export async function adminSetDestacado(fd: FormData): Promise<void> {
  await soloAdmin();
  const id = Number(campo(fd, "id"));
  const destacar = campo(fd, "destacar") === "1";
  const db = supabaseServer();
  if (destacar) {
    const todos = await db.from("businesses").select("id, featured");
    const filas = (todos.data || []) as { id: number; featured: boolean }[];
    const cuenta = filas.filter((r) => r.featured).length;
    const ya = filas.some((r) => r.id === id && r.featured);
    if (!ya && cuenta >= MAX_FEATURED) {
      throw new Error(
        "Solo puede haber " + MAX_FEATURED + " lugares destacados. Quita uno primero.",
      );
    }
  }
  await db.from("businesses").update({ featured: destacar }).eq("id", id);
  revalidatePath("/admin");
}

export async function adminRegistrarPago(fd: FormData): Promise<void> {
  await soloAdmin();
  const id = Number(campo(fd, "id"));
  const db = supabaseServer();
  const fechaTxt = campo(fd, "fecha");
  let base = new Date();
  const actual = await db
    .from("businesses")
    .select("next_payment_date")
    .eq("id", id)
    .maybeSingle();
  const vigente = actual.data
    ? String(
        (actual.data as { next_payment_date: string | null })
          .next_payment_date || "",
      )
    : "";
  if (vigente && new Date(vigente + "T12:00:00") > base) {
    base = new Date(vigente + "T12:00:00");
  }
  const siguiente = fechaTxt
    ? fechaTxt
    : new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
  await db.from("payments").insert({
    business_id: id,
    amount: MONTHLY_PRICE,
    concept: "Suscripción mensual — Mi Colonia Digital",
    status: "confirmado",
    method: "Cobro personal",
    paid_at: new Date().toISOString(),
  });
  await db
    .from("businesses")
    .update({
      status: "activo",
      subscription_status: "activa",
      next_payment_date: siguiente,
    })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function adminEliminarNegocio(fd: FormData): Promise<void> {
  await soloAdmin();
  const id = Number(campo(fd, "id"));
  // La confirmación es la de dos pasos del panel, igual que en
  // el demo: «Eliminar local» abre el aviso rojo y solo el
  // botón «Sí, eliminar definitivamente» manda esta acción.
  const db = supabaseServer();
  await db.from("products").delete().eq("business_id", id);
  await db.from("payments").delete().eq("business_id", id);
  await db.from("email_verifications").delete().eq("business_id", id);
  await db.from("businesses").delete().eq("id", id);
  revalidatePath("/admin");
}
