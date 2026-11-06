// components/NegocioCliente.tsx — las partes con
// interacción del escaparate, como en el demo: el botón
// «Compartir negocio» (compartir del sistema o copiar el
// enlace) y los productos con sus chips de categorías.
"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import type { Business, Product } from "../lib/plataforma";

export function ShareButton({
  name,
  url,
}: {
  name: string;
  url: string;
}) {
  const [aviso, setAviso] = useState("");
  const share = async () => {
    const text = name + " — en Mi Colonia Digital. " + url;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text });
        return;
      } catch {
        /* el visitante canceló */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setAviso("Enlace del negocio copiado 📋");
    } catch {
      setAviso("Copia este enlace: " + url);
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={share}
        className="rounded-full bg-[var(--surface-alt)] px-4 py-2.5 text-sm font-bold ring-1 ring-[var(--border)]"
      >
        🔗 Compartir negocio
      </button>
      {aviso ? (
        <span className="text-xs font-semibold text-[var(--dim)]" role="status">
          {aviso}
        </span>
      ) : null}
    </>
  );
}

export function ProductosNegocio({
  b,
  products,
}: {
  b: Business;
  products: Product[];
}) {
  const cats = [...new Set(products.map((p) => p.category))];
  const [cat, setCat] = useState("");
  const shown = cat ? products.filter((p) => p.category === cat) : products;
  const chipCls = (activa: boolean) =>
    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 " +
    (activa
      ? "bg-[var(--text)] text-white ring-[var(--text)]"
      : "bg-[var(--surface)] ring-[var(--border)]");
  return (
    <>
      {cats.length > 1 ? (
        <div
          className="mt-6 flex gap-2 overflow-x-auto pb-1"
          aria-label="Categorías de productos del negocio"
        >
          <button type="button" onClick={() => setCat("")} aria-pressed={cat === ""} className={chipCls(cat === "")}>
            Todo
          </button>
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={chipCls(cat === c)}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
      <section className="mt-4" aria-label={"Productos de " + b.name}>
        {shown.length === 0 ? (
          <p className="rounded-3xl bg-[var(--surface)] p-8 text-center text-[var(--dim)] ring-1 ring-[var(--border)]">
            Este negocio aún no publica productos. Escríbele por WhatsApp para
            preguntar por su menú o catálogo. 💬
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <ProductCard key={p.id} p={p} b={b} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
