// lib/catalogo.ts — consultas del catálogo público.
// La base guarda columnas con guion bajo (business_id, promo_price,
// cover_path...): aquí se convierten a los tipos de lib/plataforma.
import { supabaseServer } from "./supabase-server";
import { publicPhotoUrl } from "./supabase";
import {
  MAX_FEATURED,
  parseSchedule,
  type Business,
  type Product,
} from "./plataforma";

type Fila = Record<string, unknown>;

function texto(f: Fila, k: string): string {
  const v = f[k];
  return typeof v === "string" ? v : v == null ? "" : String(v);
}
function numero(f: Fila, k: string): number {
  const v = f[k];
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}
function hora(f: Fila, k: string, def: string): string {
  const v = texto(f, k);
  return v ? v.slice(0, 5) : def;
}
function fecha(f: Fila, k: string): string {
  const v = f[k];
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export function mapBusiness(f: Fila): Business {
  return {
    id: numero(f, "id"),
    slug: texto(f, "slug"),
    name: texto(f, "name"),
    ownerName: texto(f, "owner_name"),
    ownerEmail: texto(f, "owner_email"),
    category: texto(f, "category"),
    description: texto(f, "description"),
    colonia: texto(f, "colonia"),
    address: texto(f, "address"),
    mapsUrl: texto(f, "maps_url"),
    phone: texto(f, "phone"),
    whatsapp: texto(f, "whatsapp"),
    email: texto(f, "email"),
    facebook: texto(f, "facebook"),
    instagram: texto(f, "instagram"),
    tiktok: texto(f, "tiktok"),
    openTime: hora(f, "open_time", "09:00"),
    closeTime: hora(f, "close_time", "21:00"),
    daysLabel: texto(f, "days_label") || "Lunes a domingo",
    schedule: parseSchedule(f["schedule"]),
    coverUrl: publicPhotoUrl(texto(f, "cover_path")),
    coverKey: texto(f, "cover_key"),
    logoUrl: publicPhotoUrl(texto(f, "logo_path")),
    emailVerified: f["email_verified"] === true,
    accent: texto(f, "accent") || "#EA580C",
    rating: numero(f, "rating"),
    featured: f["featured"] === true,
    promotionsActive: f["promotions_active"] !== false,
    status: (texto(f, "status") || "pendiente") as Business["status"],
    subscriptionStatus: (texto(f, "subscription_status") ||
      "pendiente_pago") as Business["subscriptionStatus"],
    nextPaymentDate: fecha(f, "next_payment_date"),
    views: numero(f, "views"),
    whatsappClicks: numero(f, "whatsapp_clicks"),
    createdAt: texto(f, "created_at"),
  };
}

export function mapProduct(f: Fila): Product {
  const promo = f["promo_price"];
  return {
    id: numero(f, "id"),
    businessId: numero(f, "business_id"),
    name: texto(f, "name"),
    description: texto(f, "description"),
    price: numero(f, "price"),
    promoPrice: promo == null ? null : numero(f, "promo_price"),
    category: texto(f, "category") || "General",
    imageUrl: publicPhotoUrl(texto(f, "image_path")),
    imageKey: texto(f, "image_key"),
    available: f["available"] !== false,
    featured: f["featured"] === true,
    views: numero(f, "views"),
  };
}

// Catálogo público: solo negocios ACTIVOS con sus productos
// disponibles. El servidor usa la clave secreta, pero filtra
// igual que las políticas RLS para no publicar nada de más.
export async function getCatalog(): Promise<{
  businesses: Business[];
  products: Product[];
}> {
  const db = supabaseServer();
  const biz = await db
    .from("businesses")
    .select("*")
    .eq("status", "activo")
    .order("featured", { ascending: false })
    .order("views", { ascending: false });
  const prod = await db
    .from("products")
    .select("*")
    .eq("available", true)
    .order("sort_order", { ascending: true });
  return {
    businesses: ((biz.data || []) as Fila[]).map(mapBusiness),
    products: ((prod.data || []) as Fila[]).map(mapProduct),
  };
}

export async function getBusinessBySlug(
  slug: string,
): Promise<Business | null> {
  const db = supabaseServer();
  const res = await db
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "activo")
    .single();
  return res.data ? mapBusiness(res.data as Fila) : null;
}

// Secciones de la portada, derivadas de banderas reales:
export function featuredPlaces(list: Business[]): Business[] {
  return list.filter((b) => b.featured).slice(0, MAX_FEATURED);
}
export function activePromotions(
  businesses: Business[],
  products: Product[],
): { product: Product; business: Business }[] {
  const byId = new Map(businesses.map((b) => [b.id, b]));
  const out: { product: Product; business: Business }[] = [];
  for (const p of products) {
    const b = byId.get(p.businessId);
    if (b && b.promotionsActive && p.promoPrice != null && p.promoPrice < p.price) {
      out.push({ product: p, business: b });
    }
  }
  return out;
}
export function recentBusinesses(list: Business[]): Business[] {
  return [...list]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);
}
