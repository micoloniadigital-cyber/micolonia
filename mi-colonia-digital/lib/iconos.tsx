// lib/iconos.tsx — iconos de la plataforma: logo, categorías y
// redes sociales oficiales. Todo en SVG en línea, sin archivos
// de imagen, para que el diseño se vea igual en cualquier lado.
import type { JSX } from "react";

type IconoProps = { size?: number };

// Logo de Mi Colonia Digital: local con toldo, en naranja.
export function LogoIcon({ size = 32 }: IconoProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect width="48" height="48" rx="11" fill="#EA580C" />
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 18l2.5-6h23l2.5 6" />
        <path d="M10 18a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0" />
        <path d="M13.5 22.5V34h21V22.5" />
        <path d="M21 34v-7h6v7" />
      </g>
    </svg>
  );
}

// Icono de cada categoría del catálogo.
export function CategoryIcon({
  categoria,
  size = 26,
}: {
  categoria: string;
  size?: number;
}): JSX.Element {
  const trazos = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  let dibujo: JSX.Element;
  switch (categoria) {
    case "Restaurantes":
      dibujo = (
        <>
          <path d="M4 17h16" />
          <path d="M5 17a7 7 0 0 1 14 0" />
          <path d="M12 10V8" />
          <circle cx="12" cy="7" r="1" />
        </>
      );
      break;
    case "Cafeterías":
      dibujo = (
        <>
          <path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
          <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16" />
          <path d="M8 5.5c0-1 .8-1.2.8-2.2M12 5.5c0-1 .8-1.2.8-2.2" />
        </>
      );
      break;
    case "Abarrotes":
      dibujo = (
        <>
          <path d="M4 10h16l-1.4 8.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8L4 10z" />
          <path d="M8.5 10L12 4l3.5 6" />
        </>
      );
      break;
    case "Ropa y accesorios":
      dibujo = (
        <path d="M9 4L4 7.5 6 11l2-1v10h8V10l2 1 2-3.5L15 4a3 3 0 0 1-6 0z" />
      );
      break;
    case "Belleza":
      dibujo = (
        <>
          <path d="M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3z" />
          <path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
        </>
      );
      break;
    case "Farmacias":
      dibujo = (
        <>
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <path d="M12 8.5v7M8.5 12h7" />
        </>
      );
      break;
    case "Servicios":
      dibujo = (
        <>
          <rect x="6" y="4" width="12" height="17" rx="2" />
          <path d="M9.5 4.5v-1a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 3.5v1" />
          <path d="M9 12.5l2 2 4-4.5" />
        </>
      );
      break;
    case "Mascotas":
      dibujo = (
        <>
          <circle cx="7.2" cy="8.6" r="1.7" />
          <circle cx="12" cy="6.6" r="1.7" />
          <circle cx="16.8" cy="8.6" r="1.7" />
          <path d="M12 11.2c-2.9 0-5.6 2.3-5.6 4.7 0 1.6 1.3 2.6 2.8 2.6 1 0 1.8-.5 2.8-.5s1.8.5 2.8.5c1.5 0 2.8-1 2.8-2.6 0-2.4-2.7-4.7-5.6-4.7z" />
        </>
      );
      break;
    case "Tecnología":
      dibujo = (
        <>
          <rect x="4" y="5" width="16" height="11" rx="1.5" />
          <path d="M2 19.5h20" />
        </>
      );
      break;
    case "Otros":
      dibujo = (
        <>
          <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" />
          <path d="M4 7l8 4 8-4" />
          <path d="M12 11v10" />
        </>
      );
      break;
    default:
      dibujo = (
        <>
          <path d="M4 4h7l9 9-7 7-9-9V4z" />
          <circle cx="8.5" cy="8.5" r="1.3" />
        </>
      );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
      {...trazos}
    >
      {dibujo}
    </svg>
  );
}

// Facebook (marca oficial, azul).
export function FacebookIcon({ size = 20 }: IconoProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

// Instagram (marca oficial, contorno rosa).
export function InstagramIcon({ size = 20 }: IconoProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
      fill="none"
      stroke="#E1306C"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="#E1306C" stroke="none" />
    </svg>
  );
}

// TikTok (nota musical, negro).
export function TikTokIcon({ size = 20 }: IconoProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
      fill="none"
      stroke="#000000"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 3.5v10.8a3.7 3.7 0 1 1-2.6-3.55" />
      <path d="M15.5 3.5c.6 2.9 2.3 4.6 5 5" />
    </svg>
  );
}

// WhatsApp (círculo verde con teléfono blanco).
export function WhatsAppIcon({ size = 20 }: IconoProps): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <g
        transform="translate(5.5 5.5) scale(0.54)"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </g>
    </svg>
  );
}
