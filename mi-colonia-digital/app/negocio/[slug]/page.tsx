// app/negocio/[slug]/page.tsx — escaparate individual:
// portada, logo, horarios con estado abierto/cerrado,
// productos con precio efectivo, redes, botón «Cómo llegar»,
// compartir, código QR y botón flotante de WhatsApp.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AddToCartButton from "../../../components/AddToCartButton";
import { getBusinessBySlug, getCatalog } from "../../../lib/catalogo";
import { businessWhatsappLink } from "../../../lib/carrito";
import {
  SITE_URL,
  effectivePrice,
  isOpenNow,
  money,
  type Business,
} from "../../../lib/plataforma";

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
      images: b.coverUrl ? [b.coverUrl] : [],
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
  const shareUrl = SITE_URL + "/negocio/" + negocio.slug;
  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" +
    encodeURIComponent(shareUrl);
  const abierto = isOpenNow(negocio);
  return (
    <main>
      {negocio.coverUrl ? (
        <img className="portada-negocio" src={negocio.coverUrl} alt={"Portada de " + negocio.name} />
      ) : null}
      <h1>{negocio.name}</h1>
      <p>{negocio.description}</p>
      <p className={abierto ? "abierto" : "cerrado"}>
        {abierto ? "Abierto ahora" : "Cerrado"} · {negocio.daysLabel} ·{" "}
        {negocio.openTime} a {negocio.closeTime}
      </p>
      <p>{negocio.address} — {negocio.colonia}</p>
      <p>
        {negocio.mapsUrl ? (
          <a href={negocio.mapsUrl} target="_blank" rel="noreferrer">Cómo llegar</a>
        ) : null}{" "}
        {negocio.facebook ? (
          <a href={negocio.facebook} target="_blank" rel="noreferrer">Facebook</a>
        ) : null}{" "}
        {negocio.instagram ? (
          <a href={negocio.instagram} target="_blank" rel="noreferrer">Instagram</a>
        ) : null}{" "}
        {negocio.tiktok ? (
          <a href={negocio.tiktok} target="_blank" rel="noreferrer">TikTok</a>
        ) : null}
      </p>
      <img src={qrUrl} alt={"Código QR del escaparate de " + negocio.name} width={120} height={120} />
      <h2>Productos</h2>
      {mine.length === 0 ? (
        <p>Este negocio todavía no publica productos.</p>
      ) : (
        <ul className="lista-productos">
          {mine.map((p) => (
            <li key={p.id}>
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : null}
              <span>
                <strong>{p.name}</strong>
                {p.description ? <><br />{p.description}</> : null}
                <br />
                {p.promoPrice != null && negocio.promotionsActive ? (
                  <s>{money(p.price)}</s>
                ) : null}{" "}
                <strong>{money(effectivePrice(p, negocio))}</strong>
              </span>
              <AddToCartButton product={p} business={negocio} />
            </li>
          ))}
        </ul>
      )}
      <a
        className="whatsapp-flotante"
        href={businessWhatsappLink(negocio)}
        target="_blank"
        rel="noreferrer"
      >
        Pedir por WhatsApp
      </a>
    </main>
  );
}
