// components/CatalogoClient.tsx — el catálogo EXACTO al
// del demo: título con categoría y colonia, buscador,
// orden, botón «Promociones activas», pestañas Negocios /
// Productos y chips de categorías con su icono. Filtra en
// el navegador sobre el catálogo que trae el servidor.
"use client";

import { useMemo, useState } from "react";
import BusinessCard from "./BusinessCard";
import CategoryIcon from "./CategoryIcon";
import ProductCard from "./ProductCard";
import { CATEGORIES, type Business, type Product } from "../lib/plataforma";

export default function CatalogoClient({
  businesses,
  products,
  initial,
}: {
  businesses: Business[];
  products: Product[];
  initial: { category?: string; colonia?: string; query?: string; promos?: boolean };
}) {
  const [category, setCategory] = useState(initial.category || "");
  const [query, setQuery] = useState(initial.query || "");
  const [promosOnly, setPromosOnly] = useState(initial.promos || false);
  const [sort, setSort] = useState<"relevancia" | "calificacion" | "nombre">("relevancia");
  const [tab, setTab] = useState<"negocios" | "productos">("negocios");
  const col = initial.colonia || "";
  const byId = useMemo(() => new Map(businesses.map((b) => [b.id, b])), [businesses]);
  const q = query.trim().toLowerCase();
  const countOf = (businessId: number) =>
    products.filter((p) => p.businessId === businessId).length;

  const bizResults = useMemo(() => {
    let list = businesses.filter(
      (b) =>
        (!category || b.category === category) &&
        (!col || b.colonia === col) &&
        (!q ||
          (b.name + " " + b.category + " " + b.description)
            .toLowerCase()
            .includes(q)),
    );
    if (promosOnly) {
      const withPromo = new Set(
        products
          .filter((p) => {
            const pb = byId.get(p.businessId);
            return p.promoPrice != null && pb != null && pb.promotionsActive;
          })
          .map((p) => p.businessId),
      );
      list = list.filter((b) => withPromo.has(b.id));
    }
    if (sort === "calificacion") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === "nombre") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured) || b.views - a.views);
    return list;
  }, [businesses, products, byId, category, col, q, promosOnly, sort]);

  const prodResults = useMemo(() => {
    return products.filter((p) => {
      const b = byId.get(p.businessId);
      if (!b) return false;
      if (category && b.category !== category) return false;
      if (col && b.colonia !== col) return false;
      if (promosOnly && (p.promoPrice == null || !b.promotionsActive)) return false;
      if (q && !(p.name + " " + p.description + " " + b.name).toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, byId, category, col, promosOnly, q]);

  const chipCls = (activa: boolean) =>
    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 " +
    (activa
      ? "bg-[var(--text)] text-white ring-[var(--text)]"
      : "bg-[var(--surface)] ring-[var(--border)]");

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <h1 className="mt-5 font-display text-2xl font-extrabold sm:text-3xl">
        {category || "Todos los negocios"}
        {col ? " en " + col : ""}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" aria-hidden>
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el catálogo…"
            aria-label="Buscar en el catálogo"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <label>
          <span className="sr-only">Ordenar resultados</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Ordenar resultados"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none"
          >
            <option value="relevancia">Más relevantes</option>
            <option value="calificacion">Mejor calificados</option>
            <option value="nombre">Nombre A–Z</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => setPromosOnly((v) => !v)}
          aria-pressed={promosOnly}
          className={
            "rounded-full px-4 py-2.5 text-sm font-bold ring-1 transition " +
            (promosOnly
              ? "bg-[var(--accent)] text-white ring-[var(--accent)]"
              : "bg-[var(--surface)] ring-[var(--border)]")
          }
        >
          🏷️ Promociones activas
        </button>
        <div className="flex rounded-full bg-[var(--surface)] p-1 ring-1 ring-[var(--border)]" role="tablist" aria-label="Tipo de resultados">
          {(["negocios", "productos"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={
                "rounded-full px-4 py-1.5 text-sm font-bold capitalize " +
                (tab === t ? "bg-[var(--accent)] text-white" : "text-[var(--dim)]")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por categoría">
        <button type="button" onClick={() => setCategory("")} aria-pressed={category === ""} className={chipCls(category === "")}>
          Todas
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={
              "inline-flex items-center gap-1.5 " + chipCls(category === c)
            }
          >
            <CategoryIcon name={c} className="h-4 w-4" /> {c}
          </button>
        ))}
      </div>

      {tab === "negocios" ? (
        bizResults.length === 0 ? (
          <p className="mt-10 rounded-3xl bg-[var(--surface)] p-8 text-center text-[var(--dim)] ring-1 ring-[var(--border)]">
            No encontramos negocios con esos filtros. Prueba con otra categoría o colonia. 🧭
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm text-[var(--dim)]">
              {bizResults.length} negocio{bizResults.length === 1 ? "" : "s"}
            </p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bizResults.map((b) => (
                <BusinessCard key={b.id} b={b} productCount={countOf(b.id)} />
              ))}
            </div>
          </>
        )
      ) : prodResults.length === 0 ? (
        <p className="mt-10 rounded-3xl bg-[var(--surface)] p-8 text-center text-[var(--dim)] ring-1 ring-[var(--border)]">
          No encontramos productos con esos filtros. 🧭
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-[var(--dim)]">
            {prodResults.length} producto{prodResults.length === 1 ? "" : "s"}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prodResults.map((p) => {
              const b = byId.get(p.businessId);
              return b ? <ProductCard key={p.id} p={p} b={b} /> : null;
            })}
          </div>
        </>
      )}
    </main>
  );
}
