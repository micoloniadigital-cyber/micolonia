// app/negocio/[slug]/page.tsx — escaparate individual
// EXACTO al del demo: portada grande (la subida o la de la
// galería), logo de perfil, insignias, descripción,
// tarjetas de horario/dirección/contacto, «Cómo llegar»,
// compartir, redes oficiales del negocio en círculos, QR
// para compartir, productos con foto y botón flotante de
// WhatsApp.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessLogoImg, OpenBadge } from "../../../components/BusinessCard";
import {
  ProductosNegocio,
  ShareButton,
} from "../../../components/NegocioCliente";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "../../../components/SocialIcons";
import { getBusinessBySlug, getCatalog } from "../../../lib/catalogo";
import { businessWhatsappLink } from "../../../lib/carrito";
import { fotoDeNegocio } from "../../../lib/fotos";
import { SITE_URL, type Business } from "../../../lib/plataforma";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusinessBySlug(slug);
  if (!b) return { title: "Negocio no encontrado — Mi Colonia Digital" };
  return {
    title: b.name + " — Mi Colonia Digital",
    description: b.description || b.name + " en " + b.colonia,
    openGraph: {
      title: b.name,
      url: SITE_URL + "/negocio/" + b.slug,
      images: [fotoDeNegocio(b)],
    },
  };
}

export default async function NegocioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b: Business | null = await getBusinessBySlug(slug);
  if (!b) notFound();
  const negocio = b as Business;
  const { products } = await getCatalog();
  const mine = products.filter((p) => p.businessId === negocio.id);
  const pageUrl = SITE_URL + "/negocio/" + negocio.slug;
  const mapsHref =
    negocio.mapsUrl ||
    "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(negocio.name + ", " + negocio.address);
  const tienePromos =
    negocio.promotionsActive && mine.some((p) => p.promoPrice != null);
  const waHref =
    businessWhatsappLink(negocio) +
    "?text=" +
    encodeURIComponent(
      "Hola " + negocio.name + ", vi su escaparate en Mi Colonia Digital y quiero más información.",
    );

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28">
      <Link href="/catalogo" className="mt-4 inline-block text-sm font-bold text-[var(--blue)]">
        ← Volver al catálogo
      </Link>

      <section className="fade-up mt-3 overflow-hidden rounded-[28px] bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)]">
        <img
          src={fotoDeNegocio(negocio)}
          alt={"Foto de " + negocio.name}
          className="h-52 w-full object-cover sm:h-72"
        />
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <BusinessLogoImg b={negocio} size="lg" />
              <div>
                <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
                  {negocio.name}
                </h1>
                <p className="text-sm text-[var(--dim)]">
                  {negocio.category} · {negocio.colonia}
                </p>
                {negocio.logoUrl ? (
                  <p className="text-xs font-semibold text-green-700">
                    Logo de perfil activo
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {negocio.rating > 0 ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                  ★ {negocio.rating.toFixed(1)}
                </span>
              ) : null}
              <OpenBadge b={negocio} />
              {negocio.featured ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                  ⭐ Lugar destacado
                </span>
              ) : null}
              {tienePromos ? (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-200">
                  🏷️ Promociones activas
                </span>
              ) : null}
            </div>
          </div>

          {negocio.description ? (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-700">
              {negocio.description}
            </p>
          ) : null}

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-3">
              <dt className="font-bold">🕐 Horario</dt>
              <dd className="text-stone-600">
                {negocio.daysLabel}: {negocio.openTime}–{negocio.closeTime}
              </dd>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-3">
              <dt className="font-bold">📍 Dirección</dt>
              <dd className="text-stone-600">
                {negocio.address || "Sin dirección registrada"}
              </dd>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-3">
              <dt className="font-bold">📞 Contacto</dt>
              <dd className="text-stone-600">
                {negocio.phone || "—"}
                {negocio.email ? (
                  <>
                    <br />
                    {negocio.email}
                  </>
                ) : null}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[var(--blue)] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
            >
              🧭 Cómo llegar
            </a>
            <ShareButton name={negocio.name} url={pageUrl} />
            {negocio.facebook || negocio.instagram || negocio.tiktok ? (
              <span className="flex items-center gap-2" aria-label="Redes sociales del negocio">
                {negocio.facebook ? (
                  <a href={negocio.facebook} target="_blank" rel="noreferrer" aria-label={"Facebook oficial de " + negocio.name} title="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[var(--border)] transition hover:scale-105">
                    <FacebookIcon className="h-6 w-6" />
                  </a>
                ) : null}
                {negocio.instagram ? (
                  <a href={negocio.instagram} target="_blank" rel="noreferrer" aria-label={"Instagram oficial de " + negocio.name} title="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[var(--border)] transition hover:scale-105">
                    <InstagramIcon className="h-6 w-6" />
                  </a>
                ) : null}
                {negocio.tiktok ? (
                  <a href={negocio.tiktok} target="_blank" rel="noreferrer" aria-label={"TikTok oficial de " + negocio.name} title="TikTok" className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[var(--border)] transition hover:scale-105">
                    <TikTokIcon className="h-6 w-6" />
                  </a>
                ) : null}
              </span>
            ) : null}
            <span className="flex items-center gap-2 rounded-2xl bg-[var(--surface-alt)] px-3 py-1.5 ring-1 ring-[var(--border)]">
              <img
                src={
                  "https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=" +
                  encodeURIComponent(pageUrl)
                }
                alt={"Código QR para compartir el escaparate de " + negocio.name}
                className="h-10 w-10 rounded"
                loading="lazy"
              />
              <span className="text-xs font-semibold leading-tight">
                Escanea para
                <br />
                compartir
              </span>
            </span>
          </div>
        </div>
      </section>

      <ProductosNegocio b={negocio} products={mine} />

      <a
        href={waHref}
        target="_blank"
        rel="noreferrer"
        aria-label={"Contactar a " + negocio.name + " por WhatsApp"}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3.5 font-display text-sm font-bold text-white shadow-lg transition active:scale-95 sm:right-6 md:bottom-5"
      >
        <WhatsAppIcon className="h-5 w-5 [&_path]:fill-white" /> WhatsApp
      </a>
    </main>
  );
}
