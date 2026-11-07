// app/layout.tsx — marco de todas las páginas, IGUAL al
// demo: encabezado fijo con logo, buscador y carrito
// (components/Header), pie con las redes oficiales
// (components/Footer) y barra inferior en celular
// (components/MobileNav). La sesión se lee AQUÍ, en el
// servidor, en cada navegación: por eso el encabezado
// siempre muestra lo correcto («Panel admin»/«Mi panel» y
// «Salir» con sesión, «Iniciar sesión» sin ella) y la sesión
// persiste en todo el sitio, como en el demo. También monta
// el popup de login (LoginModalHost), que se abre desde el
// encabezado y la barra de celular.
import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MobileNav from "../components/MobileNav";
import LoginModalHost from "../components/LoginModal";
import { leerSesion } from "../lib/sesion";
import { SITE_URL } from "../lib/plataforma";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Colonia Digital — Todo lo que necesitas, cerca de ti",
  description:
    "Descubre los mejores negocios de tu colonia, consulta sus productos y compra directamente con ellos.",
  metadataBase: new URL(SITE_URL),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await leerSesion();
  return (
    <html lang="es">
      <body>
        <Header sesion={sesion} />
        {children}
        <Footer />
        <MobileNav sesion={sesion} />
        <LoginModalHost />
      </body>
    </html>
  );
}
