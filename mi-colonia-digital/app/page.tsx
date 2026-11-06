// app/page.tsx — portada: héroe con buscador y selector de
// colonia, categorías, Lugares destacados (máx. 5, solo el
// admin los elige), Promociones activas (solo de locales con
// sus promos prendidas), recién agregados, cómo funciona y la
// invitación a registrarse por $259/mes cobrados en persona.
import type { Metadata } from "next";
import Link from "next/link";
import BusinessCard from "../components/BusinessCard";
import {
  activePromotions,
  featuredPlaces,
  getCatalog,
  recentBusinesses,
} from "../lib/catalogo";
import {
  CATEGORIES,
  COLONIAS,
  MAX_FEATURED,
  MONTHLY_PRICE,
  SITE_URL,
  money,
} from "../lib/plataforma";

// Siempre datos frescos de la base (nada pre-renderizado).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi Colonia Digital — Todo lo que necesitas, cerca de ti",
  description:
    "Descubre los mejores negocios de tu colonia, consulta sus productos y compra directamente con ellos. Parques de Tesistán, Molinos, Valle Imperial, La Cuchilla y Tesistán.",
  metadataBase: new URL(SITE_URL),
  openGraph: { title: "Mi Colonia Digital", url: SITE_URL, type: "website" },
};

export default async function HomePage() {
  const { businesses, products } = await getCatalog();
  const featured = featuredPlaces(businesses);
  const promos = activePromotions(businesses, products);
  const recent = recentBusinesses(businesses);
  return (
    <main>
      <section className="hero">
        <h1>Todo lo que necesitas, cerca de ti</h1>
        <p>
          Descubre los mejores negocios de tu colonia, consulta sus
          productos y compra directamente con ellos.
        </p>
        <form action="/catalogo" method="get">
          <input name="q" placeholder="Busca negocios o productos" aria-label="Buscar negocios o productos" />
          <select name="colonia" aria-label="Elige tu colonia" defaultValue="">
            <option value="">Todas las colonias</option>
            {COLONIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="boton">Explorar negocios</button>
        </form>
        <Link className="boton boton-azul" href="/registro">
          Publica tu negocio — {money(MONTHLY_PRICE)}/mes
        </Link>
      </section>

      <section aria-label="Categorías">
        <h2>Categorías</h2>
        <ul className="grid-categorias">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <Link href={"/catalogo?categoria=" + encodeURIComponent(c)}>{c}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Lugares destacados">
        <h2>Lugares destacados ({featured.length}/{MAX_FEATURED})</h2>
        <p className="tenue">Solo el administrador elige estos lugares.</p>
        {featured.length === 0 ? (
          <p>Todavía no hay lugares destacados.</p>
        ) : (
          <ul className="grid-tarjetas">
            {featured.map((b) => (
              <li key={b.id}><BusinessCard b={b} /></li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Promociones activas">
        <h2>Promociones activas</h2>
        {promos.length === 0 ? (
          <p>Por ahora ningún local tiene promociones prendidas.</p>
        ) : (
          <ul className="grid-tarjetas">
            {promos.map(({ product, business }) => (
              <li key={product.id} className="tarjeta">
                <div className="tarjeta-cuerpo">
                  <p><strong>{product.name}</strong> — {business.name}</p>
                  <p>
                    <s>{money(product.price)}</s>{" "}
                    <strong>{money(product.promoPrice || product.price)}</strong>
                  </p>
                  <Link href={"/negocio/" + business.slug}>Ver negocio</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Negocios recién agregados">
        <h2>Recién agregados</h2>
        {recent.length === 0 ? (
          <p>Aún no hay negocios publicados. ¡Sé el primero de tu colonia!</p>
        ) : (
          <ul className="grid-tarjetas">
            {recent.map((b) => (
              <li key={b.id}><BusinessCard b={b} /></li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Cómo funciona">
        <h2>¿Cómo funciona?</h2>
        <ol>
          <li>Busca un negocio de tu colonia y revisa sus productos.</li>
          <li>Arma tu carrito y pide por WhatsApp directo al comerciante.</li>
          <li>
            Si tienes un negocio, regístrate: Mario te cobra en persona{" "}
            {money(MONTHLY_PRICE)} al mes, sin intermediarios.
          </li>
        </ol>
      </section>
    </main>
  );
}
