// components/Header.tsx — encabezado EXACTO al del demo:
// barra fija con el logo oficial (foto), buscador con
// selector de colonia, botón de carrito con contador y la
// navegación principal; en celular, segunda fila con la
// colonia y los botones. Como en el demo, «Iniciar sesión»
// abre el POPUP de login (components/LoginModal) y, cuando
// hay sesión (la lee el layout en el servidor y la pasa como
// prop), a la derecha se ve «Panel admin» o «Mi panel» más
// «Salir» — la sesión persiste al navegar porque vive en la
// cookie firmada, y «Salir» la cierra en el servidor.
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOGO_URL } from "../lib/fotos";
import { CART_EVENT, cartCount } from "../lib/carrito";
import { COLONIAS } from "../lib/plataforma";
import { abrirLogin } from "./LoginModal";
import { salir } from "../app/ingresar/actions";
import type { Sesion } from "../lib/sesion";

export default function Header({ sesion }: { sesion: Sesion | null }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [colonia, setColonia] = useState("");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const leer = () => setCount(cartCount());
    leer();
    window.addEventListener(CART_EVENT, leer);
    window.addEventListener("storage", leer);
    return () => {
      window.removeEventListener(CART_EVENT, leer);
      window.removeEventListener("storage", leer);
    };
  }, []);

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (colonia) params.set("colonia", colonia);
    const qs = params.toString();
    router.push(qs ? "/catalogo?" + qs : "/catalogo");
  };

  const irColonia = (c: string) => {
    setColonia(c);
    router.push(c ? "/catalogo?colonia=" + encodeURIComponent(c) : "/catalogo");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Ir al inicio de Mi Colonia Digital">
          <img
            src={LOGO_URL}
            alt="Logo de Mi Colonia Digital"
            className="h-10 w-10 rounded-2xl object-cover shadow-sm ring-1 ring-black/5"
          />
          <span className="hidden text-left font-display text-base font-extrabold leading-tight min-[420px]:block">
            Mi Colonia
            <span className="block text-[var(--accent)]">Digital</span>
          </span>
        </Link>

        <form className="flex min-w-0 flex-1 items-center gap-1.5" onSubmit={buscar} role="search">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm" aria-hidden>
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca tacos, farmacias, productos…"
              aria-label="Buscar negocios o productos"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <label className="hidden shrink-0 sm:block">
            <span className="sr-only">Seleccionar colonia</span>
            <select
              value={colonia}
              onChange={(e) => irColonia(e.target.value)}
              aria-label="Seleccionar colonia"
              className="max-w-[150px] rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none"
            >
              <option value="">Todas las colonias</option>
              {COLONIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </form>

        <Link
          href="/carrito"
          aria-label={"Abrir carrito, " + count + " productos"}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-lg ring-1 ring-[var(--border)]"
        >
          🛒
          {count > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[11px] font-bold text-white">
              {count}
            </span>
          ) : null}
        </Link>

        <nav className="hidden shrink-0 items-center gap-1.5 md:flex" aria-label="Acciones principales">
          <Link href="/catalogo" className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--blue)] hover:bg-[var(--accent-soft)]">
            Explorar negocios
          </Link>
          <Link href="/registro" className="rounded-full bg-[var(--accent)] px-3.5 py-2 text-sm font-bold text-white shadow-sm">
            Publica tu negocio
          </Link>
          {sesion ? (
            <>
              <Link
                href={sesion.rol === "admin" ? "/admin" : "/panel"}
                className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-[var(--accent-soft)]"
              >
                {sesion.rol === "admin" ? "Panel admin" : "Mi panel"}
              </Link>
              <form action={salir}>
                <button type="submit" className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--dim)] hover:bg-[var(--surface-alt)]">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <button
              type="button"
              onClick={abrirLogin}
              className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-[var(--accent-soft)]"
            >
              Iniciar sesión
            </button>
          )}
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 pb-3 md:hidden">
        <label className="min-w-[150px] flex-1">
          <span className="sr-only">Seleccionar colonia</span>
          <select
            value={colonia}
            onChange={(e) => irColonia(e.target.value)}
            aria-label="Seleccionar colonia"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
          >
            <option value="">📍 Todas las colonias</option>
            {COLONIAS.map((c) => (
              <option key={c} value={c}>📍 {c}</option>
            ))}
          </select>
        </label>
        <Link href="/catalogo" className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--blue)] ring-1 ring-[var(--border)]">
          Explorar
        </Link>
        <Link href="/registro" className="rounded-full bg-[var(--accent)] px-3 py-2 text-sm font-bold text-white">
          Publica tu negocio
        </Link>
        {sesion ? (
          <Link
            href={sesion.rol === "admin" ? "/admin" : "/panel"}
            className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm font-semibold ring-1 ring-[var(--border)]"
          >
            {sesion.rol === "admin" ? "Admin" : "Mi panel"}
          </Link>
        ) : (
          <button
            type="button"
            onClick={abrirLogin}
            className="rounded-full bg-[var(--surface)] px-3 py-2 text-sm font-semibold ring-1 ring-[var(--border)]"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
