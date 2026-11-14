// app/page.tsx — portada EXACTA a la del demo: héroe con
// la foto real del barrio y el logo, chips de colonias con
// conteo, categorías con su icono, Lugares destacados
// (máx. 10, solo el admin), Promociones activas (solo de
// locales con sus promos prendidas), restaurantes
// populares, recién agregados, productos destacados,
// «¿Cómo funciona?», redes oficiales y la invitación
// naranja a registrarse por $259/mes cobrados en persona.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import BusinessCard from "../components/BusinessCard";
import CategoryIcon from "../components/CategoryIcon";
import ProductCard from "../components/ProductCard";
import { FacebookIcon, InstagramIcon } from "../components/SocialIcons";
import { FOTOS, LOGO_URL } from "../lib/fotos";
import {
  activePromotions,
  featuredPlaces,
  getCatalog,
  recentBusinesses,
  registrarVisitaPortada,
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

function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-xl font-bold sm:text-2xl">{children}</h2>
      {action}
    </div>
  );
}

export default async function HomePage() {
  // Contador REAL de visitas: cada carga de la portada suma 1
  // en el servidor (platform_config.site_visits) y el total se
  // muestra en el héroe («Ya somos N vecinos conectados») y en
  // «Redes oficiales», igual que en el demo.
  const visitas = await registrarVisitaPortada();
  const { businesses, products } = await getCatalog();
  const featured = featuredPlaces(businesses);
  const promos = activePromotions(businesses, products);
  const recent = recentBusinesses(businesses);
  const restaurants = businesses
    .filter((b) => b.category === "Restaurantes")
    .sort((a, b) => b.views - a.views);
  const topProducts = products.filter((p) => p.featured).slice(0, 6);
  const byId = new Map(businesses.map((b) => [b.id, b]));
  const countOf = (businessId: number) =>
    products.filter((p) => p.businessId === businessId).length;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <section className="fade-up mt-4 overflow-hidden rounded-[28px] bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] sm:mt-6">
        <div className="grid sm:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] py-1 pl-1 pr-3 text-xs font-bold text-[var(--accent)]">
              <img
                src={LOGO_URL}
                alt=""
                aria-hidden
                className="h-6 w-6 rounded-full object-cover ring-1 ring-white"
              />
              Tu plaza comercial de barrio
            </span>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-[42px] sm:leading-[1.1]">
              Todo lo que necesitas,{" "}
              <span className="text-[var(--accent)]">cerca de ti</span>
            </h1>
            <p className="mt-3 text-base text-stone-600">
              Descubre los mejores negocios de tu colonia, consulta sus
              productos y compra directamente con ellos.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/catalogo"
                className="rounded-full bg-[var(--accent)] px-5 py-3 font-display text-sm font-bold text-white shadow transition active:scale-95"
              >
                Explorar mi colonia
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-[var(--surface-alt)] px-5 py-3 font-display text-sm font-bold text-[var(--text)] ring-1 ring-[var(--border)] transition active:scale-95"
              >
                Registrar mi negocio
              </Link>
            </div>
            <p className="mt-4 text-sm text-[var(--dim)]">
              <strong className="text-[var(--text)]">
                {businesses.length} negocios
              </strong>{" "}
              ya están en la plataforma
            </p>
            <p
              className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3.5 py-1.5 text-sm font-bold text-[var(--accent)]"
              role="status"
              aria-label={
                "Contador de visitas: ya somos " +
                visitas.toLocaleString("es-MX") +
                " vecinos conectados"
              }
            >
              <span aria-hidden>👥</span> Ya somos{" "}
              {visitas.toLocaleString("es-MX")} vecinos conectados
            </p>
          </div>
          <img
            src={FOTOS.barrio}
            alt="Mercado de una colonia mexicana con puestos de frutas, verduras y negocios locales"
            className="h-52 w-full object-cover sm:h-full sm:min-h-[320px]"
          />
        </div>
      </section>

      <section className="mt-8" aria-label="Colonias">
        <SectionTitle>Nuestras colonias</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {COLONIAS.map((c) => {
            const count = businesses.filter((b) => b.colonia === c).length;
            return (
              <Link
                key={c}
                href={"/catalogo?colonia=" + encodeURIComponent(c)}
                aria-label={"Ver negocios en " + c}
                className="rounded-full bg-[var(--surface)] px-4 py-2.5 text-sm font-bold shadow-sm ring-1 ring-[var(--border)] transition hover:ring-[var(--accent)] active:scale-95"
              >
                📍 {c}{" "}
                <span className="font-semibold text-[var(--dim)]">
                  · {count} negocio{count === 1 ? "" : "s"}
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[var(--dim)]">
          Ahora cubrimos Parques de Tesistán, Molinos, Valle Imperial, La
          Cuchilla y Tesistán.
        </p>
      </section>

      <section className="mt-8" aria-label="Categorías">
        <SectionTitle>Categorías</SectionTitle>
        <div className="grid grid-cols-5 gap-2 sm:gap-3 lg:grid-cols-10">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={"/catalogo?categoria=" + encodeURIComponent(c)}
              aria-label={"Ver negocios de " + c}
              className="flex flex-col items-center gap-1.5 rounded-3xl bg-[var(--surface)] px-1 py-3.5 shadow-sm ring-1 ring-[var(--border)] transition hover:ring-[var(--accent)] active:scale-95"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] sm:h-14 sm:w-14">
                <CategoryIcon name={c} className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <span className="text-center text-[11px] font-semibold leading-tight sm:text-xs">
                {c}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-label="Lugares destacados">
        <SectionTitle
          action={
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
              {featured.length} / {MAX_FEATURED} lugares
            </span>
          }
        >
          ⭐ Lugares destacados
        </SectionTitle>
        <p className="-mt-1 mb-3 text-sm text-[var(--dim)]">
          Los {MAX_FEATURED} lugares que el administrador de Mi Colonia Digital elige para
          ti.
        </p>
        {featured.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featured.map((b) => (
              <BusinessCard key={b.id} b={b} productCount={countOf(b.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[var(--surface)] p-5 text-center text-sm text-[var(--dim)] ring-1 ring-[var(--border)]">
            <p className="font-display font-bold text-[var(--text)]">
              Pronto verás aquí los lugares destacados de tu colonia ⭐
            </p>
            <p className="mt-1">
              El administrador está eligiendo los primeros {MAX_FEATURED} lugares destacados.
            </p>
          </div>
        )}
      </section>

      <section className="mt-10" aria-label="Promociones activas">
        <SectionTitle
          action={
            <Link href="/catalogo?promos=1" className="text-sm font-bold text-[var(--blue)]">
              Ver promociones →
            </Link>
          }
        >
          🏷️ Promociones activas
        </SectionTitle>
        <p className="-mt-1 mb-3 text-sm text-[var(--dim)]">
          Ofertas vigentes de los locales de tu colonia.
        </p>
        {promos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {promos.slice(0, 6).map(({ product, business }) => (
              <ProductCard key={product.id} p={product} b={business} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[var(--surface)] p-5 text-center text-sm text-[var(--dim)] ring-1 ring-[var(--border)]">
            <p className="font-display font-bold text-[var(--text)]">
              Hoy no hay promociones activas 🏷️
            </p>
            <p className="mt-1">
              Cuando un local active una promoción, aparecerá aquí al momento.
            </p>
          </div>
        )}
      </section>

      {restaurants.length > 0 ? (
        <section className="mt-10">
          <SectionTitle
            action={
              <Link
                href={"/catalogo?categoria=" + encodeURIComponent("Restaurantes")}
                className="text-sm font-bold text-[var(--blue)]"
              >
                Ver restaurantes →
              </Link>
            }
          >
            Restaurantes populares
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((b) => (
              <BusinessCard key={b.id} b={b} productCount={countOf(b.id)} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <SectionTitle>Recién agregados</SectionTitle>
        {recent.length === 0 ? (
          <div className="rounded-[28px] bg-[var(--surface)] p-8 text-center shadow-sm ring-1 ring-[var(--border)]">
            <p className="text-4xl" aria-hidden>🏪</p>
            <p className="mx-auto mt-2 max-w-md font-display text-lg font-bold">
              Todavía no hay negocios publicados en tu colonia
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-[var(--dim)]">
              Estamos sumando a los primeros comercios de Parques de Tesistán,
              Molinos, Valle Imperial, La Cuchilla y Tesistán. Si tienes un
              negocio, regístralo en minutos y verifica tu correo con el código
              que te enviaremos.
            </p>
            <Link
              href="/registro"
              className="mt-4 inline-block rounded-full bg-[var(--accent)] px-6 py-3 font-display text-sm font-bold text-white shadow transition active:scale-95"
            >
              Registrar mi negocio →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b) => (
              <BusinessCard key={b.id} b={b} productCount={countOf(b.id)} />
            ))}
          </div>
        )}
      </section>

      {topProducts.length > 0 ? (
        <section className="mt-10">
          <SectionTitle>Productos destacados</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topProducts.map((p) => {
              const b = byId.get(p.businessId);
              return b ? <ProductCard key={p.id} p={p} b={b} /> : null;
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-12 rounded-[28px] bg-[var(--surface)] p-6 shadow-sm ring-1 ring-[var(--border)] sm:p-8">
        <SectionTitle>¿Cómo funciona?</SectionTitle>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: "🔎",
              t: "1. Descubre",
              d: "Explora los negocios de tu colonia, revisa sus productos, precios y promociones sin registrarte.",
            },
            {
              icon: "🛒",
              t: "2. Arma tu pedido",
              d: "Agrega productos al carrito y revisa el subtotal. Sin intermediarios ni comisiones escondidas.",
            },
            {
              icon: "💬",
              t: "3. Pide por WhatsApp",
              d: "Tu pedido llega directo al WhatsApp del comerciante. Acuerdas entrega y pago directamente con el negocio.",
            },
          ].map((s) => (
            <div key={s.t} className="rounded-3xl bg-[var(--surface-alt)] p-5">
              <span className="text-3xl" aria-hidden>{s.icon}</span>
              <h3 className="mt-2 font-display text-base font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-stone-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="mt-8 rounded-[28px] bg-[var(--surface)] p-6 shadow-sm ring-1 ring-[var(--border)] sm:p-8"
        aria-label="Redes oficiales de Mi Colonia Digital"
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Redes oficiales de Mi Colonia Digital
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Síguenos para enterarte de los nuevos negocios de tu colonia, los
              lugares destacados y las promociones activas de la semana.
            </p>
            <p
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3.5 py-1.5 text-sm font-bold text-[var(--accent)]"
              role="status"
              aria-label={"Contador de visitas: " + visitas + " visitas a la página"}
            >
              <span aria-hidden>👁️</span>{" "}
              {visitas.toLocaleString("es-MX")} visitas a la página
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61596053321404"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook oficial de Mi Colonia Digital"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#1877F2] px-5 py-3 font-display text-sm font-bold text-white shadow-sm transition active:scale-95"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <FacebookIcon className="h-5 w-5" />
              </span>{" "}
              Facebook oficial
            </a>
            <a
              href="https://www.instagram.com/micoloniadigital2026/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram oficial de Mi Colonia Digital"
              className="inline-flex items-center gap-2.5 rounded-full bg-[var(--text)] px-5 py-3 font-display text-sm font-bold text-white shadow-sm transition active:scale-95"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white p-0.5">
                <InstagramIcon className="h-5 w-5" />
              </span>{" "}
              @micoloniadigital2026
            </a>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[28px] bg-[var(--accent)] p-6 text-white shadow sm:p-10">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            ¿Tienes un negocio en la colonia?
          </h2>
          <p className="mt-2 text-white/90">
            Tu propio escaparate digital con productos, fotos, promociones y
            pedidos por WhatsApp por solo{" "}
            <strong className="font-display text-xl">
              {money(MONTHLY_PRICE)} MXN al mes
            </strong>
            . Sin comisiones por venta. Cobro personal de Mario, sin Mercado
            Pago.
          </p>
          <Link
            href="/registro"
            className="mt-5 inline-block rounded-full bg-white px-6 py-3 font-display text-sm font-bold text-[var(--accent)] shadow transition active:scale-95"
          >
            Registrar mi negocio →
          </Link>
        </div>
      </section>
    </main>
  );
}
