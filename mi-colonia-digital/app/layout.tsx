// app/layout.tsx — marco de todas las páginas: encabezado con
// navegación y pie con las redes oficiales de la plataforma.
import type { Metadata } from "next";
import Link from "next/link";
import {
  OFFICIAL_FACEBOOK,
  OFFICIAL_INSTAGRAM,
  SITE_URL,
} from "../lib/plataforma";
import "./globals.css";
import { FacebookIcon, InstagramIcon, LogoIcon } from "../lib/iconos";

export const metadata: Metadata = {
  title: "Mi Colonia Digital — Todo lo que necesitas, cerca de ti",
  description:
    "Descubre los mejores negocios de tu colonia, consulta sus productos y compra directamente con ellos.",
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <header className="encabezado">
          <Link href="/" className="marca" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <LogoIcon size={30} />
            Mi Colonia Digital
          </Link>
          <nav aria-label="Navegación principal">
            <Link href="/catalogo">Explorar negocios</Link>
            <Link href="/carrito">Mi carrito</Link>
            <Link href="/registro">Publica tu negocio</Link>
            <Link href="/ingresar">Iniciar sesión</Link>
          </nav>
        </header>
        {children}
        <footer className="pie">
          <p>Redes oficiales de Mi Colonia Digital</p>
          <p>
            <a href={OFFICIAL_FACEBOOK} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FacebookIcon size={18} /> Facebook
            </a>{" "}
            ·{" "}
            <a href={OFFICIAL_INSTAGRAM} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <InstagramIcon size={18} /> Instagram — @micoloniadigital2026
            </a>
          </p>
          <p className="tenue">
            Los pedidos se hacen directo con cada negocio por WhatsApp.
          </p>
        </footer>
      </body>
    </html>
  );
}
