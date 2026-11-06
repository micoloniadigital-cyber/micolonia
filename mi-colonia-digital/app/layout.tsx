// app/layout.tsx — marco de todas las páginas, IGUAL al
// demo: encabezado fijo con logo, buscador y carrito
// (components/Header), pie con las redes oficiales
// (components/Footer) y barra inferior en celular
// (components/MobileNav).
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";
import { SITE_URL } from "../lib/plataforma";
import "./globals.css";

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
        <Header />
        {children}
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
