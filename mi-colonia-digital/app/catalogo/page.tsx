// app/catalogo/page.tsx — trae el catálogo del servidor
// y lo entrega al catálogo interactivo (components/
// CatalogoClient), idéntico al del demo. Acepta ?q=,
// ?categoria=, ?colonia= y ?promos=1.
import CatalogoClient from "../../components/CatalogoClient";
import { getCatalog } from "../../lib/catalogo";

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
  return (
    <CatalogoClient
      businesses={businesses}
      products={products}
      initial={{
        category: sp.categoria || "",
        colonia: sp.colonia || "",
        query: sp.q || "",
        promos: sp.promos === "1",
      }}
    />
  );
}
