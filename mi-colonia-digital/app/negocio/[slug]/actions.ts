// app/negocio/[slug]/actions.ts — pedir una cita (público).
// La cita nace «pendiente»: NO aparta la hora hasta que el dueño
// la acepta en su panel. TODO se valida en el servidor: negocio
// activo de Belleza con citas prendidas, fecha de hoy en
// adelante y hasta 30 días (hora de México), hora de 1 hora
// dentro del horario de ese día y sin otra cita ya aceptada en
// esa fecha y hora. Como en subirFoto, los errores vuelven como
// estado para mostrarlos junto al formulario, nunca como throw.
"use server";

import { revalidatePath } from "next/cache";
import { getCitasAceptadas, mapBusiness } from "../../../lib/catalogo";
import {
  CITA_ANTICIPACION_DIAS,
  CITA_CATEGORIA,
  horasDisponibles,
  hoyEnColonia,
  sumarDiasISO,
} from "../../../lib/plataforma";
import { supabaseServer } from "../../../lib/supabase-server";

export type CrearCitaState = { error?: string; ok?: boolean } | null;

function campo(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
}

export async function crearCita(
  _prev: CrearCitaState,
  fd: FormData,
): Promise<CrearCitaState> {
  const businessId = Number(campo(fd, "businessId"));
  const nombre = campo(fd, "nombre");
  const telefono = campo(fd, "telefono");
  const fecha = campo(fd, "fecha");
  const hora = campo(fd, "hora");
  if (!businessId) return { error: "No sabemos de qué negocio es la cita." };
  if (nombre.length < 2) {
    return { error: "Escribe tu nombre para que el negocio sepa quién viene." };
  }
  if (telefono.length < 7) {
    return {
      error: "Escribe tu teléfono: el negocio te contactará por ahí para confirmar.",
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
    return { error: "Elige una fecha y una hora del calendario." };
  }
  const db = supabaseServer();
  const fila = await db
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle();
  if (!fila.data) return { error: "Ese negocio no está disponible para citas." };
  const b = mapBusiness(fila.data as Record<string, unknown>);
  if (b.status !== "activo") {
    return { error: "Ese negocio no está disponible para citas." };
  }
  if (b.category !== CITA_CATEGORIA || !b.aceptaCitas) {
    return {
      error: "Este negocio no está aceptando citas por la página en este momento.",
    };
  }
  const today = hoyEnColonia();
  if (fecha < today) {
    return { error: "Esa fecha ya pasó. Elige un día de hoy en adelante." };
  }
  if (fecha > sumarDiasISO(today, CITA_ANTICIPACION_DIAS)) {
    return {
      error:
        "Solo puedes pedir cita hasta con " +
        CITA_ANTICIPACION_DIAS +
        " días de anticipación.",
    };
  }
  const aceptadas = await getCitasAceptadas(b.id);
  if (aceptadas.some((c) => c.fecha === fecha && c.hora === hora)) {
    return { error: "Esa hora ya está apartada. Elige otra hora, por favor." };
  }
  if (!horasDisponibles(b, fecha, aceptadas).includes(hora)) {
    return {
      error: "Esa hora no está dentro del horario del negocio ese día. Elige otra hora.",
    };
  }
  const ins = await db.from("citas").insert({
    business_id: b.id,
    nombre,
    telefono,
    fecha,
    hora: hora + ":00",
    estado: "pendiente",
  });
  if (ins.error) {
    return { error: "No pudimos guardar tu solicitud. Inténtalo de nuevo." };
  }
  revalidatePath("/negocio/" + b.slug);
  return { ok: true };
}
