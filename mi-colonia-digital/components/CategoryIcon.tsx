// components/CategoryIcon.tsx — un icono dibujado (SVG de
// trazo, en el color de la marca) para cada una de las 10
// categorías. Se usa en la portada, en el catálogo y en la
// tarjeta de cada negocio junto a su categoría.
import type { ReactNode } from "react";

const PATHS: Record<string, ReactNode> = {
  Restaurantes: (
    <>
      <path d="M4 16.5h16" />
      <path d="M5.5 16.5a6.5 6.5 0 0 1 13 0" />
      <path d="M12 10V8.8" />
      <circle cx="12" cy="7.4" r="1.1" />
      <path d="M3 20h18" />
    </>
  ),
  Cafeterías: (
    <>
      <path d="M5 10.5h11V15a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
      <path d="M16 11.5h1.3a2.6 2.6 0 0 1 0 5.2H16" />
      <path d="M8.2 3.6c0 1.1-1.1 1.3-1.1 2.4M12.2 3.6c0 1.1-1.1 1.3-1.1 2.4" />
    </>
  ),
  Abarrotes: (
    <>
      <path d="M5.2 9.2 8.7 4.2M18.8 9.2l-3.5-5" />
      <path d="M3.6 9.2h16.8l-1.5 8.9a2 2 0 0 1-2 1.7H7.1a2 2 0 0 1-2-1.7z" />
      <path d="M9.2 12.8v3.6M12 12.8v3.6M14.8 12.8v3.6" />
    </>
  ),
  "Ropa y accesorios": (
    <path d="M8.2 4 3.6 7.4l2 3.6 2.4-1.2V20h8V9.8l2.4 1.2 2-3.6L15.8 4a4 4 0 0 1-7.6 0z" />
  ),
  Belleza: (
    <>
      <circle cx="6.4" cy="6.8" r="2.3" />
      <circle cx="6.4" cy="17.2" r="2.3" />
      <path d="M8.3 8.5 20 19M8.3 15.5 20 5" />
    </>
  ),
  Farmacias: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <path d="M12 8.4v7.2M8.4 12h7.2" />
    </>
  ),
  Servicios: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  Mascotas: (
    <>
      <circle cx="5.8" cy="10.2" r="1.7" />
      <circle cx="9.8" cy="6.4" r="1.7" />
      <circle cx="14.2" cy="6.4" r="1.7" />
      <circle cx="18.2" cy="10.2" r="1.7" />
      <path d="M12 11.6c2.9 0 5.4 2.3 5.4 4.7 0 1.6-1.2 2.7-2.8 2.7-1 0-1.7-.4-2.6-.4s-1.6.4-2.6.4c-1.6 0-2.8-1.1-2.8-2.7 0-2.4 2.5-4.7 5.4-4.7z" />
    </>
  ),
  Tecnología: (
    <>
      <rect x="7" y="2.6" width="10" height="18.8" rx="2.6" />
      <path d="M10.6 5.2h2.8" />
      <path d="M11 18.4h2" />
    </>
  ),
  Otros: (
    <>
      <path d="M4.6 9.4 6.1 4h11.8l1.5 5.4" />
      <path d="M4.6 9.4a2.55 2.55 0 0 0 5.1 0 2.55 2.55 0 0 0 5.1 0 2.55 2.55 0 0 0 4.6 0" />
      <path d="M5.6 12.2V20h12.8v-7.8" />
      <path d="M10 20v-4.8h4V20" />
    </>
  ),
};

export default function CategoryIcon({
  name,
  className = "categoria-svg",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] ?? PATHS.Otros}
    </svg>
  );
}
