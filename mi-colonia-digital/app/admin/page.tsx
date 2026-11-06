// app/admin/page.tsx — panel del administrador (Mario):
// todos los negocios, activar/suspender, Lugares destacados
// (máximo 5), registrar el cobro personal de $259, gracia de
// 7 días con aviso por WhatsApp, códigos de correo vigentes,
// historial de pagos y eliminar locales.
import Link from "next/link";
import { redirect } from "next/navigation";
import { salir } from "../ingresar/actions";
import {
  adminEliminarNegocio,
  adminRegistrarPago,
  adminSetDestacado,
  adminSetEstado,
} from "./actions";
import { mapBusiness } from "../../lib/catalogo";
import {
  GRACE_DAYS,
  MAX_FEATURED,
  MONTHLY_PRICE,
  graceEndDate,
  graceReminderLink,
  money,
  subscriptionState,
} from "../../lib/plataforma";
import { leerSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

export default async function AdminPage() {
  const sesion = await leerSesion();
  if (!sesion || sesion.rol !== "admin") redirect("/ingresar");
  const db = supabaseServer();
  const filas = await db
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: false });
  const businesses = ((filas.data || []) as Record<string, unknown>[]).map(mapBusiness);
  const destacados = businesses.filter((b) => b.featured);
  const activas = businesses.filter(
    (b) => b.status === "activo" && b.subscriptionStatus === "activa",
  );
  const pagos = await db
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const payments = (pagos.data || []) as Record<string, unknown>[];
  const codigos = await db
    .from("email_verifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const verifs = (codigos.data || []) as Record<string, unknown>[];
  const codigoDe = (bid: number) =>
    verifs.find((v) => Number(v["business_id"]) === bid);

  return (
    <main>
      <h1>Panel del administrador</h1>
      <p>
        Negocios: <strong>{businesses.length}</strong> · Suscripciones
        activas: <strong>{activas.length}</strong> · Ingreso mensual
        estimado (MRR): <strong>{money(activas.length * MONTHLY_PRICE)}</strong>
      </p>
      <form action={salir}>
        <button type="submit" className="boton boton-tenue">Cerrar sesión</button>
      </form>

      <section className="panel-seccion" aria-label="Lugares destacados">
        <h2>Lugares destacados ({destacados.length}/{MAX_FEATURED})</h2>
        <p className="tenue">Solo tú eliges estos lugares. Máximo {MAX_FEATURED}.</p>
        {destacados.length === 0 ? (
          <p>Todavía no destacas ningún lugar.</p>
        ) : (
          <ul>
            {destacados.map((b) => (
              <li key={b.id}>
                {b.name} — {b.colonia}{" "}
                <form action={adminSetDestacado} style={{ display: "inline" }}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="destacar" value="0" />
                  <button type="submit" className="boton boton-tenue">Quitar de destacados</button>
                </form>
              </li>
            ))}
          </ul>
        )}
        {destacados.length >= MAX_FEATURED ? (
          <p className="aviso">Cupo lleno: quita uno para poder destacar otro.</p>
        ) : null}
      </section>

      {businesses.map((b) => {
        const estado = subscriptionState(b);
        const gracia = graceEndDate(b);
        const codigo = !b.emailVerified ? codigoDe(b.id) : undefined;
        return (
          <section key={b.id} className="panel-seccion" aria-label={"Negocio " + b.name}>
            <h3>
              {b.name} <span className="tenue">· {b.category} · {b.colonia}</span>
            </h3>
            <p>
              Estado: <strong>{b.status}</strong> · Suscripción:{" "}
              <strong>{b.subscriptionStatus}</strong> · Vencimiento:{" "}
              <strong>{b.nextPaymentDate || "sin fecha"}</strong> · Promos:{" "}
              {b.promotionsActive ? "prendidas" : "apagadas"} · Correo:{" "}
              {b.emailVerified ? "verificado" : "SIN verificar"}
            </p>
            {estado === "en_gracia" && gracia ? (
              <p className="aviso">
                En periodo de gracia hasta el {gracia.toISOString().slice(0, 10)}{" "}
                (vencimiento + {GRACE_DAYS} días).{" "}
                <a href={graceReminderLink(b)} target="_blank" rel="noreferrer">
                  Avisar por WhatsApp
                </a>
              </p>
            ) : null}
            {estado === "gracia_terminada" ? (
              <p className="error">
                Gracia terminada: ya puedes suspenderlo. Conserva sus
                productos y se reactiva al registrar el pago.{" "}
                <a href={graceReminderLink(b)} target="_blank" rel="noreferrer">
                  Avisar por WhatsApp
                </a>
              </p>
            ) : null}
            {codigo ? (
              <p className="aviso">
                Código de correo vigente de este local:{" "}
                <strong>{String(codigo["code"] || "")}</strong> (vence{" "}
                {String(codigo["expires_at"] || "").slice(0, 16)}). Dícaselo
                solo si el correo no le llegó.
              </p>
            ) : null}
            <p>
              <Link href={"/negocio/" + b.slug}>Ver escaparate</Link>
            </p>
            <form action={adminSetEstado} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="estado" value={b.status === "activo" ? "suspendido" : "activo"} />
              <button type="submit" className="boton">
                {b.status === "activo" ? "Desactivar local" : "Activar local"}
              </button>
            </form>{" "}
            <form action={adminSetDestacado} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={b.id} />
              <input type="hidden" name="destacar" value={b.featured ? "0" : "1"} />
              <button
                type="submit"
                className="boton boton-azul"
                disabled={!b.featured && destacados.length >= MAX_FEATURED}
              >
                {b.featured
                  ? "Quitar de destacados"
                  : destacados.length >= MAX_FEATURED
                    ? "Destacar (cupo lleno)"
                    : "Destacar"}
              </button>
            </form>
            <form action={adminRegistrarPago} className="formulario">
              <input type="hidden" name="id" value={b.id} />
              <label>
                Registrar cobro personal de {money(MONTHLY_PRICE)} — nueva
                fecha de vencimiento (vacío = +30 días)
                <input type="date" name="fecha" aria-label={"Fecha de vencimiento para " + b.name} />
              </label>
              <button type="submit" className="boton">Registrar pago y activar</button>
            </form>
            <form action={adminEliminarNegocio} className="formulario">
              <input type="hidden" name="id" value={b.id} />
              <label>
                Para eliminar este local con sus productos y pagos, escribe
                ELIMINAR
                <input name="confirmar" aria-label={"Confirmación para eliminar " + b.name} />
              </label>
              <button type="submit" className="boton boton-tenue">Eliminar local</button>
            </form>
          </section>
        );
      })}

      <section className="panel-seccion" aria-label="Historial de pagos">
        <h2>Historial de pagos</h2>
        {payments.length === 0 ? (
          <p>Aún no hay pagos registrados.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Negocio</th><th>Concepto</th><th>Monto</th><th>Estado</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {payments.map((p, i) => {
                const negocio = businesses.find(
                  (x) => x.id === Number(p["business_id"]),
                );
                return (
                  <tr key={i}>
                    <td>{negocio ? negocio.name : "#" + String(p["business_id"])}</td>
                    <td>{String(p["concept"] || "")}</td>
                    <td>{money(Number(p["amount"] || 0))}</td>
                    <td>{String(p["status"] || "")}</td>
                    <td>{String(p["created_at"] || "").slice(0, 10)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
