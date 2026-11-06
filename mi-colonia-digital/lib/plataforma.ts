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
  const parts = b.openTime.split(":").map(Number);
  const open = (parts[0] || 9) * 60 + (parts[1] || 0);
  const parts2 = b.closeTime.split(":").map(Number);
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
