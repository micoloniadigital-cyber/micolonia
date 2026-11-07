// components/MobileNav.tsx — barra de navegación inferior
// en celular, EXACTA a la del demo: Inicio, Explorar,
// Promos y Entrar/Mi panel, fija abajo y solo en pantallas
// chicas. Como en el demo, «Entrar» abre el POPUP de login y
// con sesión el botón dice «Mi panel» y lleva a tu panel
// (o al de admin).
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { abrirLogin } from "./LoginModal";
import type { Sesion } from "../lib/sesion";

export default function MobileNav({ sesion }: { sesion: Sesion | null }) {
  const path = usePathname() || "/";
  const items = [
    { icon: "🏠", label: "Inicio", href: "/", active: path === "/" },
    { icon: "🧭", label: "Explorar", href: "/catalogo", active: path === "/catalogo" },
    { icon: "🏷️", label: "Promos", href: "/catalogo?promos=1", active: false },
  ];
  const panelHref = sesion
    ? sesion.rol === "admin"
      ? "/admin"
      : "/panel"
    : "/ingresar";
  const panelActive = path === "/panel" || path === "/admin";
  const cls =
    "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ";
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--surface)] md:hidden"
      aria-label="Navegación principal"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            aria-current={item.active ? "page" : undefined}
            className={cls + (item.active ? "text-[var(--accent)]" : "text-[var(--dim)]")}
          >
            <span className="text-xl" aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        {sesion ? (
          <Link
            href={panelHref}
            aria-label="Mi panel"
            aria-current={panelActive ? "page" : undefined}
            className={cls + (panelActive ? "text-[var(--accent)]" : "text-[var(--dim)]")}
          >
            <span className="text-xl" aria-hidden>👤</span>
            Mi panel
          </Link>
        ) : (
          <button
            type="button"
            onClick={abrirLogin}
            aria-label="Entrar"
            className={cls + "text-[var(--dim)]"}
          >
            <span className="text-xl" aria-hidden>👤</span>
            Entrar
          </button>
        )}
      </div>
    </nav>
  );
}
