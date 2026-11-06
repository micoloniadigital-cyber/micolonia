// components/Footer.tsx — pie de página EXACTO al del
// demo: marca con el logo oficial, columnas Explora / Para
// negocios / Redes oficiales con los iconos de marca y la
// línea final.
import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "./SocialIcons";
import { LOGO_URL } from "../lib/fotos";
import {
  MONTHLY_PRICE,
  OFFICIAL_FACEBOOK,
  OFFICIAL_INSTAGRAM,
  money,
} from "../lib/plataforma";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] pb-24 md:pb-8">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-2 font-display font-extrabold">
            <img
              src={LOGO_URL}
              alt="Logo de Mi Colonia Digital"
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-black/5"
            />
            Mi Colonia Digital
          </p>
          <p className="mt-2 text-sm text-[var(--dim)]">
            La plaza comercial digital de tu colonia. Compra local, sin intermediarios.
          </p>
        </div>
        <nav aria-label="Enlaces del pie de página">
          <p className="font-display text-sm font-bold">Explora</p>
          <ul className="mt-2 space-y-1.5 text-sm font-medium text-[var(--dim)]">
            <li><Link href="/catalogo">Todos los negocios</Link></li>
            <li><Link href="/catalogo?promos=1">Promociones activas</Link></li>
            <li>
              <Link href={"/catalogo?categoria=" + encodeURIComponent("Restaurantes")}>
                Restaurantes
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Enlaces para negocios">
          <p className="font-display text-sm font-bold">Para negocios</p>
          <ul className="mt-2 space-y-1.5 text-sm font-medium text-[var(--dim)]">
            <li>
              <Link href="/registro">
                Publica tu negocio — {money(MONTHLY_PRICE)} MXN/mes
              </Link>
            </li>
            <li><Link href="/panel">Panel del comerciante</Link></li>
          </ul>
        </nav>
        <div>
          <p className="font-display text-sm font-bold">Redes oficiales</p>
          <p className="mt-1 text-sm text-[var(--dim)]">Sigue a Mi Colonia Digital:</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <a
              href={OFFICIAL_FACEBOOK}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook oficial de Mi Colonia Digital"
              className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold shadow-sm ring-1 ring-[var(--border)] transition hover:scale-[1.02]"
            >
              <FacebookIcon className="h-5 w-5" /> Facebook
            </a>
            <a
              href={OFFICIAL_INSTAGRAM}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram oficial de Mi Colonia Digital"
              className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold shadow-sm ring-1 ring-[var(--border)] transition hover:scale-[1.02]"
            >
              <InstagramIcon className="h-5 w-5" /> Instagram
            </a>
          </div>
          <p className="mt-1.5 text-xs text-[var(--dim)]">@micoloniadigital2026 en Instagram</p>
        </div>
      </div>
      <p className="px-4 pb-4 text-center text-xs text-[var(--dim)]">
        Hecho con 🧡 para los negocios de barrio. Los pedidos y pagos de productos se
        acuerdan directamente con cada negocio por WhatsApp.
      </p>
    </footer>
  );
}
