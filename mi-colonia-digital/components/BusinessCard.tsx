// components/BusinessCard.tsx — tarjeta de negocio EXACTA
// a la del demo: foto de portada (la subida o la de la
// galería), insignia «Lugar destacado», estado abierto/
// cerrado, logo de perfil o inicial con su color, nombre,
// categoría · colonia, descripción y horario.
import Link from "next/link";
import { fotoDeNegocio } from "../lib/fotos";
import { isOpenNow, type Business } from "../lib/plataforma";

export function OpenBadge({ b }: { b: Business }) {
  const open = isOpenNow(b);
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold " +
        (open ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600")
      }
    >
      <span
        className={
          "h-1.5 w-1.5 rounded-full " + (open ? "bg-green-600" : "bg-stone-400")
        }
      />
      {open ? "Abierto ahora" : "Cerrado"}
    </span>
  );
}

export function BusinessLogoImg({
  b,
  size = "md",
}: {
  b: Business;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "sm"
      ? "h-10 w-10 text-lg rounded-xl"
      : size === "lg"
        ? "h-20 w-20 text-3xl rounded-[22px]"
        : "h-14 w-14 text-2xl rounded-2xl";
  if (b.logoUrl) {
    return (
      <img
        src={b.logoUrl}
        alt={"Logo de " + b.name}
        className={sz + " shrink-0 object-cover shadow ring-2 ring-white"}
      />
    );
  }
  return (
    <span
      className={
        sz +
        " flex shrink-0 items-center justify-center font-display font-extrabold text-white shadow ring-2 ring-white"
      }
      style={{ background: b.accent }}
      aria-hidden
    >
      {b.name.charAt(0)}
    </span>
  );
}

export default function BusinessCard({
  b,
  productCount,
}: {
  b: Business;
  productCount?: number;
}) {
  return (
    <article className="fade-up overflow-hidden rounded-3xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] transition hover:shadow-md">
      <Link
        href={"/negocio/" + b.slug}
        className="block w-full text-left"
        aria-label={"Ver " + b.name}
      >
        <div className="relative">
          <img
            src={fotoDeNegocio(b)}
            alt={"Foto de " + b.name}
            className="h-40 w-full object-cover sm:h-44"
            loading="lazy"
          />
          {b.featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-xs font-bold text-white shadow">
              ⭐ Lugar destacado
            </span>
          ) : null}
          <span className="absolute bottom-3 right-3">
            <OpenBadge b={b} />
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <BusinessLogoImg b={b} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-bold leading-snug">
                  {b.name}
                </h3>
                {b.rating > 0 ? (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                    ★ {b.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-[var(--dim)]">
                {b.category} · {b.colonia}
              </p>
            </div>
          </div>
          {b.description ? (
            <p className="mt-1.5 line-clamp-2 text-sm text-stone-600">
              {b.description}
            </p>
          ) : null}
          <p className="mt-2 text-xs font-medium text-[var(--dim)]">
            🕐 {b.openTime}–{b.closeTime}
            {typeof productCount === "number"
              ? " · " + productCount + " productos"
              : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
