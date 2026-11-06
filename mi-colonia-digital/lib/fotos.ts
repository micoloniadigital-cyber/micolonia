// lib/fotos.ts — LA GALERÍA DE FOTOS DEL DEMO, idéntica a la
// del prototipo que Mario aprobó: las fotos reales viven en
// public/fotos/ (van dentro del proyecto, no dependen de
// ningún servicio externo). Cada negocio y producto trae una
// clave de galería (cover_key / image_key); si el negocio
// SUBIÓ su propia portada o foto, esa manda (coverUrl /
// imageUrl del bucket). Si no hay clave, se usa la foto de
// su categoría y al final la del barrio: en Mi Colonia
// Digital NINGUNA tarjeta se ve sin foto, igual que el demo.
import type { Business, Product } from "./plataforma";

export const FOTOS: Record<string, string> = {
  barrio: "/fotos/barrio.jpg",
  pizzeria: "/fotos/pizzeria.jpg",
  tacos: "/fotos/tacos.jpg",
  "tacos-alt": "/fotos/tacos-alt.jpg",
  hamburguesa: "/fotos/hamburguesa.jpg",
  cafe: "/fotos/cafe.webp",
  panaderia: "/fotos/panaderia.jpg",
  pandulce: "/fotos/pandulce.jpg",
  belleza: "/fotos/belleza.webp",
  farmacia: "/fotos/farmacia.jpg",
  ferreteria: "/fotos/ferreteria.webp",
  papeleria: "/fotos/papeleria.jpg",
  mascotas: "/fotos/mascotas.jpg",
  ropa: "/fotos/ropa.jpg",
  abarrotes: "/fotos/abarrotes.jpg",
  tecnologia: "/fotos/tecnologia.jpg",
};

// Foto de respaldo por categoría (la misma elección del demo).
export const FOTO_POR_CATEGORIA: Record<string, string> = {
  Restaurantes: "tacos",
  Cafeterías: "cafe",
  Abarrotes: "abarrotes",
  "Ropa y accesorios": "ropa",
  Belleza: "belleza",
  Farmacias: "farmacia",
  Servicios: "ferreteria",
  Mascotas: "mascotas",
  Tecnología: "tecnologia",
  Otros: "barrio",
};

export function fotoDeNegocio(b: Business): string {
  if (b.coverUrl) return b.coverUrl;
  if (b.coverKey && FOTOS[b.coverKey]) return FOTOS[b.coverKey] as string;
  const porCategoria = FOTO_POR_CATEGORIA[b.category] || "barrio";
  return FOTOS[porCategoria] as string;
}

export function fotoDeProducto(p: Product, b: Business): string {
  if (p.imageUrl) return p.imageUrl;
  if (p.imageKey && FOTOS[p.imageKey]) return FOTOS[p.imageKey] as string;
  return fotoDeNegocio(b);
}

// El logo oficial de la plataforma (public/logo.webp): el
// mismo archivo del demo, usado en el encabezado y el pie.
export const LOGO_URL = "/logo.webp";
