// lib/plataforma.ts — constantes, tipos y reglas del negocio.
// Reglas de Mario: $259 MXN/mes con cobro personal (SIN Mercado
// Pago y SIN Stripe), 7 días de gracia, destacados máximo 5 solo
// admin, promociones que cada local prende/apaga, 5 colonias
// fijas y redes oficiales al pie.
export const SITE_URL = "https://micoloniadigital.com";
export const PRODUCTION_DOMAIN = "micoloniadigital.com";
export const MONTHLY_PRICE = 259; // MXN, cobro personal de Mario
export const GRACE_DAYS = 7; // días de gracia tras el vencimiento
export const MAX_FEATURED = 5; // lugares destacados, solo el admin
export const OFFICIAL_FACEBOOK =
  "https://www.facebook.com/profile.php?id=61596053321404";
export const OFFICIAL_INSTAGRAM =
  "https://www.instagram.com/micoloniadigital2026/";
export const ADMIN_EMAIL = "micoloniadigital@gmail.com";
export const STORAGE_BUCKET = "fotos-negocios";

export const COLONIAS = [
  "Parques de Tesistán",
  "Molinos",
  "Valle Imperial",
  "La Cuchilla",
  "Tesistán",
] as const;

export const CATEGORIES = [
  "Restaurantes",
  "Cafeterías",
  "Abarrotes",
  "Ropa y accesorios",
  "Belleza",
  "Farmacias",
  "Servicios",
  "Mascotas",
  "Tecnología",
  "Otros",
] as const;

export type BusinessStatus = "activo" | "pendiente" | "suspendido";
export type SubscriptionStatus =
  | "activa"
  | "pendiente_pago"
  | "vencida"
  | "cancelada";

// Horario por día (checklist): un objeto por día MARCADO.
// La base lo guarda en la columna «schedule» (jsonb) como un
// arreglo de estos objetos; openTime/closeTime/daysLabel se
// derivan de él en el servidor (ver deriveScheduleFields).
export interface ScheduleDay {
  day: string; // "Lunes" | "Martes" | ... | "Domingo"
  open: string; // "09:00"
  close: string; // "21:00"
}

export const WEEK_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

const SCHEDULE_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Normaliza lo que venga de la base (jsonb ya parseado por
// Supabase) o de un texto JSON: devuelve solo entradas válidas,
// ordenadas de Lunes a Domingo. Cualquier otra cosa → [].
export function parseSchedule(value: unknown): ScheduleDay[] {
  let v: unknown = value;
  if (typeof v === "string") {
    if (!v) return [];
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(v)) return [];
  const out: ScheduleDay[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (
      typeof rec.day === "string" &&
      (WEEK_DAYS as readonly string[]).includes(rec.day) &&
      typeof rec.open === "string" &&
      SCHEDULE_TIME_RE.test(rec.open) &&
      typeof rec.close === "string" &&
      SCHEDULE_TIME_RE.test(rec.close) &&
      !out.some((e) => e.day === rec.day)
    ) {
      out.push({ day: rec.day, open: rec.open, close: rec.close });
    }
  }
  out.sort(
    (a, b) =>
      (WEEK_DAYS as readonly string[]).indexOf(a.day) -
      (WEEK_DAYS as readonly string[]).indexOf(b.day),
  );
  return out;
}

// Valida el JSON que manda el formulario (campo oculto
// «schedule»): exige al menos un día y que TODO sea válido.
// Devuelve null si no sirve, para que el servidor conserve los
// campos clásicos en vez de guardar un horario roto.
export function validarScheduleJson(
  raw: string,
): {
  schedule: ScheduleDay[];
  daysLabel: string;
  openTime: string;
  closeTime: string;
} | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const entries = parseSchedule(parsed);
  if (entries.length !== parsed.length) return null;
  return { schedule: entries, ...deriveScheduleFields(entries) };
}

// Deriva los campos de siempre desde el horario por día:
// daysLabel («Lunes a domingo» si son los 7, «Lunes a viernes»
// si es esa corrida, si no la lista de días), openTime (la
// apertura más temprana) y closeTime (el cierre más tardío).
export function deriveScheduleFields(entries: ScheduleDay[]): {
  daysLabel: string;
  openTime: string;
  closeTime: string;
} {
  const days = WEEK_DAYS.filter((d) => entries.some((e) => e.day === d));
  let daysLabel: string;
  if (days.length === 7) {
    daysLabel = "Lunes a domingo";
  } else if (
    days.length === 5 &&
    days.join("|") === "Lunes|Martes|Miércoles|Jueves|Viernes"
  ) {
    daysLabel = "Lunes a viernes";
  } else {
    daysLabel = days.join(", ");
  }
  const openTime = entries.map((e) => e.open).sort()[0] || "09:00";
  const closeTime = entries.map((e) => e.close).sort().slice(-1)[0] || "21:00";
  return { daysLabel, openTime, closeTime };
}

export interface Business {
  id: number;
  slug: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  category: string;
  description: string;
  colonia: string;
  address: string;
  mapsUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  openTime: string; // "09:00"
  closeTime: string; // "21:00"
  daysLabel: string;
  schedule: ScheduleDay[]; // horario por día; [] = usar los campos de arriba
  coverUrl: string; // portada SUBIDA por el negocio (bucket); "" si no subió
  coverKey: string; // clave de la galería del demo (lib/fotos.ts)
  logoUrl: string;
  emailVerified: boolean;
  accent: string;
  rating: number;
  featured: boolean;
  promotionsActive: boolean;
  status: BusinessStatus;
  subscriptionStatus: SubscriptionStatus;
  nextPaymentDate: string; // "2026-12-06" o ""
  views: number;
  whatsappClicks: number;
  createdAt: string;
}

export interface Product {
  id: number;
  businessId: number;
  name: string;
  description: string;
  price: number;
  promoPrice: number | null;
  category: string;
  imageUrl: string; // foto SUBIDA (bucket); "" si no subió
  imageKey: string; // clave de la galería del demo (lib/fotos.ts)
  available: boolean;
  featured: boolean;
  views: number;
}

export interface Payment {
  id: number;
  businessId: number;
  amount: number;
  concept: string;
  status: "confirmado" | "pendiente" | "fallido";
  method: string; // "Cobro personal"
  paidAt: string | null;
  createdAt: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function money(n: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

// Precio que paga el cliente: la promo solo cuenta si el local
// tiene sus promociones activas prendidas.
export function effectivePrice(p: Product, b: Business): number {
  if (b.promotionsActive && p.promoPrice != null && p.promoPrice < p.price) {
    return p.promoPrice;
  }
  return p.price;
}

export function isOpenNow(b: Business, now: Date = new Date()): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  // Con horario por día manda el día de HOY: si hoy no está
  // marcado, está cerrado aunque los demás días abra.
  let openStr = b.openTime;
  let closeStr = b.closeTime;
  if (b.schedule && b.schedule.length > 0) {
    const todayName = WEEK_DAYS[(now.getDay() + 6) % 7];
    const today = b.schedule.find((e) => e.day === todayName);
    if (!today) return false;
    openStr = today.open;
    closeStr = today.close;
  }
  const parts = openStr.split(":").map(Number);
  const open = (parts[0] || 9) * 60 + (parts[1] || 0);
  const parts2 = closeStr.split(":").map(Number);
  const close = (parts2[0] || 21) * 60 + (parts2[1] || 0);
  if (close <= open) return cur >= open || cur < close; // cierra de madrugada
  return cur >= open && cur < close;
}

// Fin del periodo de gracia: vencimiento + 7 días.
export function graceEndDate(b: Business): Date | null {
  if (!b.nextPaymentDate) return null;
  const d = new Date(b.nextPaymentDate + "T12:00:00");
  d.setDate(d.getDate() + GRACE_DAYS);
  return d;
}

export function subscriptionState(
  b: Business,
  today: Date = new Date(),
): "al_corriente" | "en_gracia" | "gracia_terminada" | "sin_fecha" {
  if (!b.nextPaymentDate) return "sin_fecha";
  const due = new Date(b.nextPaymentDate + "T12:00:00");
  if (today <= due) return "al_corriente";
  const end = graceEndDate(b);
  if (end && today <= end) return "en_gracia";
  return "gracia_terminada";
}

// Mensaje de recordatorio que Mario manda por WhatsApp en la gracia.
export function graceReminderLink(b: Business): string {
  const phone = b.whatsapp.replace(/[^0-9]/g, "");
  const msg =
    "Hola, soy Mario de Mi Colonia Digital. Tu suscripción de " +
    money(MONTHLY_PRICE) +
    " venció el " +
    b.nextPaymentDate +
    " y estás en tu periodo de gracia de " +
    GRACE_DAYS +
    " días. Tu negocio sigue publicado y conserva todo. Cuando puedas, " +
    "pásame tu pago y lo reactivamos al momento. ¡Gracias!";
  return "https://wa.me/52" + phone + "?text=" + encodeURIComponent(msg);
}
