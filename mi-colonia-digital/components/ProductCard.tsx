// components/ProductCard.tsx — tarjeta de producto
// EXACTA a la del demo: foto (subida o de la galería),
// descuento en rojo cuando la promo está activa, precio en
// naranja con el anterior tachado, botón «+ Agregar» y
// controles − / + con la cantidad del carrito.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fotoDeProducto } from "../lib/fotos";
import {
  CART_EVENT,
  addToCart,
  cartQtyOf,
  removeFromCart,
} from "../lib/carrito";
import {
  effectivePrice,
  money,
  type Business,
  type Product,
} from "../lib/plataforma";

export default function ProductCard({
  p,
  b,
}: {
  p: Product;
  b: Business;
}) {
  const [qty, setQty] = useState(0);
  useEffect(() => {
    const leer = () => setQty(cartQtyOf(p.id));
    leer();
    window.addEventListener(CART_EVENT, leer);
    window.addEventListener("storage", leer);
    return () => {
      window.removeEventListener(CART_EVENT, leer);
      window.removeEventListener("storage", leer);
    };
  }, [p.id]);

  const promoActive =
    b.promotionsActive && p.promoPrice != null && p.promoPrice < p.price;
  const price = effectivePrice(p, b);

  const agregar = () => {
    addToCart({
      productId: p.id,
      businessId: b.id,
      businessName: b.name,
      businessWhatsapp: b.whatsapp,
      name: p.name,
      price,
    });
  };

  return (
    <article className="fade-up flex gap-3 rounded-3xl bg-[var(--surface)] p-3 shadow-sm ring-1 ring-[var(--border)]">
      <Link
        href={"/negocio/" + b.slug}
        className="shrink-0"
        aria-label={"Ver " + p.name + " en " + b.name}
      >
        <img
          src={fotoDeProducto(p, b)}
          alt={"Foto de " + p.name}
          className="h-24 w-24 rounded-2xl object-cover"
          loading="lazy"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-bold leading-snug">{p.name}</h3>
          {promoActive ? (
            <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              −{Math.round((1 - (p.promoPrice as number) / p.price) * 100)}%
            </span>
          ) : null}
        </div>
        {p.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--dim)]">
            {p.description}
          </p>
        ) : null}
        <p className="mt-0.5 text-xs font-medium text-[var(--blue)]">{b.name}</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="font-display">
            <span className="text-base font-extrabold text-[var(--accent)]">
              {money(price)}
            </span>{" "}
            {promoActive ? (
              <span className="text-sm text-[var(--dim)] line-through">
                {money(p.price)}
              </span>
            ) : null}
          </p>
          {!p.available ? (
            <span className="text-xs font-semibold text-stone-400">Agotado</span>
          ) : qty === 0 ? (
            <button
              type="button"
              onClick={agregar}
              aria-label={"Agregar " + p.name + " al carrito"}
              className="rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-sm font-bold text-white shadow-sm transition active:scale-95"
            >
              + Agregar
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => removeFromCart(p.id)}
                aria-label={"Quitar uno de " + p.name}
                className="h-8 w-8 rounded-full bg-[var(--surface-alt)] text-base font-bold"
              >
                −
              </button>
              <span
                className="w-6 text-center font-display text-sm font-bold"
                aria-label={"Cantidad de " + p.name + ": " + qty}
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={agregar}
                aria-label={"Agregar uno más de " + p.name}
                className="h-8 w-8 rounded-full bg-[var(--accent)] text-base font-bold text-white"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
