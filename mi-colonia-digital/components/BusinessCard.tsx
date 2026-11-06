// components/BusinessCard.tsx — tarjeta de negocio del
// catálogo y de las secciones de la portada.
import Link from "next/link";
import { isOpenNow, type Business } from "../lib/plataforma";

export default function BusinessCard({ b }: { b: Business }) {
  const open = isOpenNow(b);
  return (
    <article className="tarjeta">
      {b.coverUrl ? (
        <img className="tarjeta-foto" src={b.coverUrl} alt={"Portada de " + b.name} />
      ) : null}
      <div className="tarjeta-cuerpo">
        {b.logoUrl ? (
          <img className="tarjeta-logo" src={b.logoUrl} alt={"Logo de " + b.name} width={56} height={56} />
        ) : (
          <span className="tarjeta-inicial" aria-hidden style={{ background: b.accent }}>
            {b.name.slice(0, 1)}
          </span>
        )}
        <h3>
          <Link href={"/negocio/" + b.slug}>{b.name}</Link>
        </h3>
        <p className="tenue">{b.category} · {b.colonia}</p>
        <p className={open ? "abierto" : "cerrado"}>
          {open ? "Abierto ahora" : "Cerrado"} · {b.openTime} a {b.closeTime}
        </p>
        {b.featured ? <p className="insignia">Lugar destacado</p> : null}
        {b.promotionsActive ? <p className="insignia">Promociones activas</p> : null}
      </div>
    </article>
  );
}
