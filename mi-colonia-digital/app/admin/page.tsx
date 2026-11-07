// app/admin/page.tsx — panel del administrador (Mario).
// Esta página (servidor) solo valida la sesión de admin y
// trae los datos; el DISEÑO y el funcionamiento son los del
// demo, en components/AdminPanel.tsx: estadísticas, Lugares
// destacados (máximo 5), filtros, tarjetas de cada local con
// todos sus botones, gracia de 7 días con aviso por WhatsApp,
// códigos de correo vigentes, historial de pagos y eliminar
// locales. Salir de la sesión se hace con «Salir» del
// encabezado, igual que en el demo.
import { redirect } from "next/navigation";
import AdminPanel, {
  type AdminBiz,
  type AdminPayment,
  type CodigoPendiente,
} from "../../components/AdminPanel";
import { mapBusiness } from "../../lib/catalogo";
import { leerSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

export const dynamic = "force-dynamic";

type Fila = Record<string, unknown>;

export default async function AdminPage() {
  const sesion = await leerSesion();
  if (!sesion || sesion.rol !== "admin") redirect("/ingresar");
  const db = supabaseServer();
  const filas = await db
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });
  const rows = (filas.data || []) as Fila[];
  const prods = await db.from("products").select("business_id");
  const conteo = new Map<number, number>();
  for (const p of (prods.data || []) as Fila[]) {
    const id = Number(p["business_id"]);
    conteo.set(id, (conteo.get(id) ?? 0) + 1);
  }
  const businesses: AdminBiz[] = rows.map((f) => ({
    ...mapBusiness(f),
    productCount: conteo.get(Number(f["id"])) ?? 0,
  }));
  const porId = new Map(businesses.map((b) => [b.id, b]));
  const pagos = await db
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const payments: AdminPayment[] = ((pagos.data || []) as Fila[]).map((p) => ({
    id: Number(p["id"]),
    businessId: Number(p["business_id"]),
    businessName: porId.get(Number(p["business_id"]))?.name ?? "Negocio eliminado",
    amount: Number(p["amount"] || 0),
    concept: String(p["concept"] || ""),
    status: (String(p["status"] || "pendiente") || "pendiente") as AdminPayment["status"],
    method: String(p["method"] || ""),
    paidAt: p["paid_at"] ? String(p["paid_at"]) : null,
    createdAt: String(p["created_at"] || ""),
  }));
  const codigosRes = await db
    .from("email_verifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const codigos: Record<number, CodigoPendiente> = {};
  for (const v of (codigosRes.data || []) as Fila[]) {
    const bid = Number(v["business_id"]);
    const biz = porId.get(bid);
    if (!biz || biz.emailVerified || codigos[bid]) continue;
    codigos[bid] = {
      code: String(v["code"] || ""),
      expiresAt: String(v["expires_at"] || ""),
    };
  }
  const categorias = [...new Set(businesses.map((b) => b.category))].sort();
  const totalProducts = [...conteo.values()].reduce((s, n) => s + n, 0);
  return (
    <AdminPanel
      businesses={businesses}
      payments={payments}
      codigos={codigos}
      totalProducts={totalProducts}
      categorias={categorias}
    />
  );
}
