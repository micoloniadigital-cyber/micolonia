// app/sitemap.ts — mapa del sitio para Google: portada,
// catálogo, registro y el escaparate de cada negocio activo.
import type { MetadataRoute } from "next";
import { getCatalog } from "../lib/catalogo";
import { SITE_URL } from "../lib/plataforma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { businesses } = await getCatalog();
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date() },
    { url: SITE_URL + "/catalogo", lastModified: new Date() },
    { url: SITE_URL + "/registro", lastModified: new Date() },
  ];
  return base.concat(
    businesses.map((b) => ({
      url: SITE_URL + "/negocio/" + b.slug,
      lastModified: new Date(b.createdAt),
    })),
  );
}
