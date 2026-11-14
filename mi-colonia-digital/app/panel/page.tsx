// app/panel/page.tsx — panel del comerciante: resumen
// (suscripción, vencimiento, gracia de 7 días, visitas, clics
// de WhatsApp), datos del negocio, logo y portada, productos
// ilimitados con precio promocional, el interruptor «Mis
// promociones activas» y cambio de contraseña.
import { redirect } from "next/navigation";
import { salir } from "../ingresar/actions";
import {
  actualizarNegocio,
  cambiarContrasena,
  cambiarPromociones,
  eliminarProducto,
  guardarProducto,
} from "./actions";
import HorarioChecklist from "../../components/HorarioChecklist";
import SubirFotoForm from "../../components/SubirFotoForm";
import { mapBusiness, mapProduct } from "../../lib/catalogo";
import {
  CATEGORIES,
  COLONIAS,
  GRACE_DAYS,
  MONTHLY_PRICE,
  SITE_URL,
  graceEndDate,
  money,
  subscriptionState,
} from "../../lib/plataforma";
import { leerSesion } from "../../lib/sesion";
import { supabaseServer } from "../../lib/supabase-server";

export default async function PanelPage() {
  const sesion = await leerSesion();
  if (!sesion || sesion.rol !== "comerciante" || !sesion.businessId) {
    redirect("/ingresar");
  }
  const db = supabaseServer();
  const fila = await db
    .from("businesses")
    .select("*")
    .eq("id", sesion.businessId)
    .maybeSingle();
  if (!fila.data) redirect("/ingresar");
  const b = mapBusiness(fila.data as Record<string, unknown>);
  const prods = await db
    .from("products")
    .select("*")
    .eq("business_id", b.id)
    .order("sort_order", { ascending: true });
  const products = ((prods.data || []) as Record<string, unknown>[]).map(mapProduct);
  const estado = subscriptionState(b);
  const gracia = graceEndDate(b);
  const promos = products.filter((p) => p.promoPrice != null);

  return (
    <main>
      <h1>Mi panel — {b.name}</h1>
      <p className="tenue">
        Tu escaparate: {SITE_URL}/negocio/{b.slug} · Estado:{" "}
        <strong>{b.status}</strong>
      </p>

      <section className="panel-seccion" aria-label="Resumen">
        <h2>Resumen</h2>
        <p>Productos publicados: <strong>{products.length}</strong></p>
        <p>Visitas a tu perfil: <strong>{b.views}</strong> · Clics en WhatsApp: <strong>{b.whatsappClicks}</strong></p>
        <p>
          Suscripción: <strong>{money(MONTHLY_PRICE)}/mes</strong>, cobro
          personal de Mario. Próximo pago / vencimiento:{" "}
          <strong>{b.nextPaymentDate || "sin fecha"}</strong>
        </p>
        {estado === "en_gracia" && gracia ? (
          <p className="aviso">
            Estás en tu periodo de gracia de {GRACE_DAYS} días (hasta el{" "}
            {gracia.toISOString().slice(0, 10)}). Tu negocio sigue publicado
            y conserva todo; al pagar se reactiva al momento.
          </p>
        ) : null}
        {estado === "gracia_terminada" ? (
          <p className="error">
            Tu periodo de gracia terminó. Habla con Mario para reactivar tu
            negocio: tus productos y tu configuración se conservan.
          </p>
        ) : null}
        <form action={salir}>
          <button type="submit" className="boton boton-tenue">Cerrar sesión</button>
        </form>
      </section>

      <section className="panel-seccion" aria-label="Mis promociones activas">
        <h2>Mis promociones activas</h2>
        <p>
          Con el interruptor prendido, tus {promos.length} producto(s) con
          precio promocional se ven con descuento en la portada, el catálogo,
          tu escaparate y el carrito. Apagado, tus promos se ocultan pero los
          precios quedan guardados.
        </p>
        <form action={cambiarPromociones}>
          <label>
            <input type="checkbox" name="activas" defaultChecked={b.promotionsActive} />{" "}
            Promociones {b.promotionsActive ? "ACTIVAS" : "APAGADAS"}
          </label>{" "}
          <button type="submit" className="boton">Guardar</button>
        </form>
        {promos.length > 0 ? (
          <ul>
            {promos.map((p) => (
              <li key={p.id}>
                {p.name}: <s>{money(p.price)}</s> <strong>{money(p.promoPrice || p.price)}</strong>
                {!b.promotionsActive ? " (oculta mientras estén apagadas)" : ""}
              </li>
            ))}
          </ul>
        ) : (
          <p className="tenue">
            Todavía no tienes promos: edita un producto y ponle precio
            promocional.
          </p>
        )}
      </section>

      <section className="panel-seccion" aria-label="Datos de mi negocio">
        <h2>Datos de mi negocio</h2>
        <form action={actualizarNegocio} className="formulario">
          <label>Nombre comercial<input name="name" defaultValue={b.name} required aria-label="Nombre comercial" /></label>
          <label>Tu nombre<input name="ownerName" defaultValue={b.ownerName} aria-label="Nombre del propietario" /></label>
          <label>
            Categoría
            <select name="category" defaultValue={b.category} aria-label="Categoría">
              {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <label>
            Colonia
            <select name="colonia" defaultValue={b.colonia} aria-label="Colonia">
              {COLONIAS.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <label>Descripción<textarea name="description" defaultValue={b.description} aria-label="Descripción" /></label>
          <label>Dirección<input name="address" defaultValue={b.address} aria-label="Dirección" /></label>
          <label>Enlace de Google Maps<input name="mapsUrl" defaultValue={b.mapsUrl} aria-label="Enlace de Google Maps" /></label>
          <label>WhatsApp para pedidos<input name="whatsapp" defaultValue={b.whatsapp} aria-label="WhatsApp" /></label>
          <label>Teléfono<input name="phone" defaultValue={b.phone} aria-label="Teléfono" /></label>
          <HorarioChecklist inicial={b.schedule} apertura={b.openTime} cierre={b.closeTime} />
          <label>Facebook<input name="facebook" defaultValue={b.facebook} aria-label="Facebook" /></label>
          <label>Instagram<input name="instagram" defaultValue={b.instagram} aria-label="Instagram" /></label>
          <label>TikTok<input name="tiktok" defaultValue={b.tiktok} aria-label="TikTok" /></label>
          <label>Color de tu escaparate<input name="accent" type="color" defaultValue={b.accent} aria-label="Color del escaparate" /></label>
          <button type="submit" className="boton">Guardar datos</button>
        </form>
      </section>

      <section className="panel-seccion" aria-label="Logo y portada">
        <h2>Logo y portada</h2>
        {b.logoUrl ? <p>Logo actual: <img src={b.logoUrl} alt="Logo actual" width={56} height={56} /></p> : null}
        <SubirFotoForm tipo="logo" etiqueta="Nuevo logo" nombreAccesible="Subir logo" textoBoton="Subir logo" requerido />
        <p className="tenue">Foto de hasta 2 MB. Si pesa más, el formulario te avisa ahí mismo para que elijas una más ligera.</p>
        {b.coverUrl ? <p>Portada actual: <img src={b.coverUrl} alt="Portada actual" width={240} /></p> : null}
        <SubirFotoForm tipo="portada" etiqueta="Nueva portada" nombreAccesible="Subir portada" textoBoton="Subir portada" requerido />
        <p className="tenue">Foto de hasta 2 MB. Si pesa más, el formulario te avisa ahí mismo para que elijas una más ligera.</p>
      </section>

      <section className="panel-seccion" aria-label="Mis productos">
        <h2>Mis productos</h2>
        {products.map((p) => (
          <form key={p.id} action={guardarProducto} className="formulario">
            <input type="hidden" name="id" value={p.id} />
            <label>Nombre<input name="name" defaultValue={p.name} required aria-label="Nombre del producto" /></label>
            <label>Descripción<input name="description" defaultValue={p.description} aria-label="Descripción del producto" /></label>
            <label>Precio<input name="price" type="number" step="0.01" min="0" defaultValue={p.price} required aria-label="Precio" /></label>
            <label>Precio promocional (vacío = sin promo)<input name="promoPrice" type="number" step="0.01" min="0" defaultValue={p.promoPrice ?? ""} aria-label="Precio promocional" /></label>
            <label>Categoría<input name="category" defaultValue={p.category} aria-label="Categoría del producto" /></label>
            <label><input type="checkbox" name="available" defaultChecked={p.available} /> Disponible</label>
            <label><input type="checkbox" name="featured" defaultChecked={p.featured} /> Destacado</label>
            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} width={72} height={72} /> : null}
            <span>
              <button type="submit" className="boton">Guardar</button>{" "}
            </span>
          </form>
        ))}
        {products.map((p) => (
          <div key={"del" + p.id}>
            {p.name}{" "}
            <form action={eliminarProducto} style={{ display: "inline" }}>
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className="boton boton-tenue">Eliminar {p.name}</button>
            </form>{" "}
            <SubirFotoForm tipo="producto" productoId={p.id} nombreAccesible={"Foto de " + p.name} textoBoton="Subir foto" enLinea />
          </div>
        ))}
        <h3>Agregar producto</h3>
        <form action={guardarProducto} className="formulario">
          <label>Nombre<input name="name" required aria-label="Nombre del producto nuevo" /></label>
          <label>Descripción<input name="description" aria-label="Descripción del producto nuevo" /></label>
          <label>Precio<input name="price" type="number" step="0.01" min="0" required aria-label="Precio del producto nuevo" /></label>
          <label>Precio promocional (opcional)<input name="promoPrice" type="number" step="0.01" min="0" aria-label="Precio promocional del producto nuevo" /></label>
          <label>Categoría<input name="category" defaultValue="General" aria-label="Categoría del producto nuevo" /></label>
          <label><input type="checkbox" name="available" defaultChecked /> Disponible</label>
          <label><input type="checkbox" name="featured" /> Destacado</label>
          <button type="submit" className="boton">Agregar producto</button>
        </form>
      </section>

      <section className="panel-seccion" aria-label="Cambiar mi contraseña">
        <h2>Cambiar mi contraseña</h2>
        <form action={cambiarContrasena} className="formulario">
          <label>
            Contraseña nueva (mínimo 8)
            <input name="nueva" type="password" required minLength={8} autoComplete="new-password" aria-label="Contraseña nueva" />
          </label>
          <button type="submit" className="boton">Cambiar contraseña</button>
        </form>
      </section>
    </main>
  );
}
