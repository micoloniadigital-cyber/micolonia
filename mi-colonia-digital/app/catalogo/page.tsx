// app/catalogo/page.tsx — buscador con filtros: texto,
// categoría, colonia y «solo promociones activas». Las promos
// apagadas por un local no aparecen ni bajan el precio.
import BusinessCard from "../../components/BusinessCard";
import { getCatalog } from "../../lib/catalogo";
import { CATEGORIES, COLONIAS, money } from "../../lib/plataforma";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    colonia?: string;
    promos?: string;
  }>;
}) {
  const sp = await searchParams;
  const { businesses, products } = await getCatalog();
  const q = (sp.q || "").toLowerCase();
  const biz = businesses.filter((b) => {
    if (sp.categoria && b.category !== sp.categoria) return false;
    if (sp.colonia && b.colonia !== sp.colonia) return false;
    if (!q) return true;
    const inProducts = products.some(
      (p) => p.businessId === b.id && p.name.toLowerCase().includes(q),
    );
    return b.name.toLowerCase().includes(q) || inProducts;
  });
  const prods = products.filter((p) => {
    const b = businesses.find((x) => x.id === p.businessId);
    if (!b) return false;
    if (sp.promos === "1" && !(b.promotionsActive && p.promoPrice != null)) return false;
    return !q || p.name.toLowerCase().includes(q);
  });
  return (
    <main>
      <h1>Catálogo de tu colonia</h1>
      <form action="/catalogo" method="get" className="formulario">
        <label>
          Buscar
          <input name="q" defaultValue={sp.q || ""} placeholder="Negocio o producto" aria-label="Buscar negocio o producto" />
        </label>
        <label>
          Categoría
          <select name="categoria" defaultValue={sp.categoria || ""} aria-label="Filtrar por categoría">
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Colonia
          <select name="colonia" defaultValue={sp.colonia || ""} aria-label="Filtrar por colonia">
            <option value="">Todas</option>
            {COLONIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" name="promos" value="1" defaultChecked={sp.promos === "1"} />{" "}
          Solo promociones activas
        </label>
        <button type="submit" className="boton">Filtrar</button>
      </form>
      <p>{biz.length} negocios y {prods.length} productos</p>
      <ul className="grid-tarjetas">
        {biz.map((b) => (
          <li key={b.id}><BusinessCard b={b} /></li>
        ))}
      </ul>
      {prods.length > 0 ? (
        <>
          <h2>Productos</h2>
          <ul className="lista-productos">
            {prods.map((p) => {
              const b = businesses.find((x) => x.id === p.businessId);
              if (!b) return null;
              return (
                <li key={p.id}>
                  <span>
                    <strong>{p.name}</strong> — {b.name}
                    <br />
                    {p.promoPrice != null && b.promotionsActive ? (
                      <>
                        <s>{money(p.price)}</s>{" "}
                        <strong>{money(p.promoPrice)}</strong>
                      </>
                    ) : (
                      <strong>{money(p.price)}</strong>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </main>
  );
}
