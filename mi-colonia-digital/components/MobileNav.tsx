// components/MobileNav.tsx — barra de navegación inferior
// en celular, EXACTA a la del demo: Inicio, Explorar,
// Promos y Entrar, fija abajo y solo en pantallas chicas.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const path = usePathname() || "/";
  const items = [
    { icon: "🏠", label: "Inicio", href: "/", active: path === "/" },
    { icon: "🧭", label: "Explorar", href: "/catalogo", active: path === "/catalogo" },
    { icon: "🏷️", label: "Promos", href: "/catalogo?promos=1", active: false },
    { icon: "👤", label: "Entrar", href: "/ingresar", active: path === "/ingresar" || path === "/panel" || path === "/admin" },
  ];
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
            className={
              "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold " +
              (item.active ? "text-[var(--accent)]" : "text-[var(--dim)]")
            }
          >
            <span className="text-xl" aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
