// components/CartView.tsx — carrito del visitante: cantidades,
// subtotal por negocio y botón «Pedir por WhatsApp» que manda
// el pedido directo al comerciante (sin registro).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "./SocialIcons";
import { money } from "../lib/plataforma";
import {
  CART_EVENT,
  loadCart,
  saveCart,
  whatsappOrderLink,
  type CartItem,
} from "../lib/carrito";

export default function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const leer = () => setItems(loadCart());
    leer();
    window.addEventListener(CART_EVENT, leer);
    window.addEventListener("storage", leer);
    return () => {
      window.removeEventListener(CART_EVENT, leer);
      window.removeEventListener("storage", leer);
    };
  }, []);

  const cambiar = (next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  };

  if (items.length === 0) {
    return (
      <p className="rounded-3xl bg-[var(--surface)] p-8 text-center text-[var(--dim)] ring-1 ring-[var(--border)]">
        Tu carrito está vacío.{" "}
        <Link href="/catalogo" className="font-bold text-[var(--blue)]">
          Explora los negocios
        </Link>{" "}
        de tu colonia y agrega lo que necesites. 🛒
      </p>
    );
  }

  const porNegocio = new Map<number, CartItem[]>();
  for (const i of items) {
    const arr = porNegocio.get(i.businessId) || [];
    arr.push(i);
    porNegocio.set(i.businessId, arr);
  }

  return (
    <div>
      {[...porNegocio.entries()].map(([bid, grupo]) => {
        const subtotal = grupo.reduce((s, i) => s + i.price * i.qty, 0);
        return (
          <section
            key={bid}
            className="mb-5 rounded-[28px] bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border)]"
            aria-label={"Pedido para " + (grupo[0]?.businessName || "")}
          >
            <h2 className="font-display text-xl font-extrabold">Tu pedido</h2>
            <p className="text-sm text-[var(--dim)]">en {grupo[0]?.businessName}</p>
            <ul className="mt-4 space-y-3">
              {grupo.map((i) => (
                <li
                  key={i.productId}
                  className="flex items-center gap-3 rounded-2xl bg-[var(--surface-alt)] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{i.name}</p>
                    <p className="text-sm font-semibold text-[var(--accent)]">
                      {money(i.price * i.qty)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={"Quitar uno de " + i.name}
                      className="h-8 w-8 rounded-full bg-[var(--surface)] font-bold ring-1 ring-[var(--border)]"
                      onClick={() =>
                        cambiar(
                          items
                            .map((x) =>
                              x.productId === i.productId
                                ? { ...x, qty: x.qty - 1 }
                                : x,
                            )
                            .filter((x) => x.qty > 0),
                        )
                      }
                    >
                      −
                    </button>
                    <span
                      className="w-6 text-center font-display text-sm font-bold"
                      aria-label={"Cantidad: " + i.qty}
                    >
                      {i.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={"Agregar uno más de " + i.name}
                      className="h-8 w-8 rounded-full bg-[var(--accent)] font-bold text-white"
                      onClick={() =>
                        cambiar(
                          items.map((x) =>
                            x.productId === i.productId
                              ? { ...x, qty: x.qty + 1 }
                              : x,
                          ),
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span className="font-display font-bold">Subtotal</span>
              <span className="font-display text-xl font-extrabold text-[var(--accent)]">
                {money(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--dim)]">
              El pago y la entrega se acuerdan directamente con el negocio. Mi
              Colonia Digital no procesa pagos de productos.
            </p>
            <a
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25d366] py-3.5 font-display text-base font-bold text-white shadow transition active:scale-[0.98]"
              href={whatsappOrderLink(grupo)}
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon className="h-5 w-5 [&_path]:fill-white" />
              Pedir por WhatsApp
            </a>
          </section>
        );
      })}
      <button
        type="button"
        className="w-full rounded-full py-2.5 text-sm font-semibold text-[var(--dim)]"
        onClick={() => cambiar([])}
      >
        Vaciar carrito
      </button>
    </div>
  );
}
