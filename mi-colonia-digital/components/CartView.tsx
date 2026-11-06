// components/CartView.tsx — carrito del visitante: cantidades,
// subtotal por negocio y botón «Pedir por WhatsApp» que manda
// el pedido directo al comerciante (sin registro).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <p>
        Tu carrito está vacío. <Link href="/catalogo">Explora los negocios</Link>{" "}
        de tu colonia y agrega lo que necesites.
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
          <section key={bid} className="panel-seccion" aria-label={"Pedido para " + (grupo[0]?.businessName || "")}>
            <h2>{grupo[0]?.businessName}</h2>
            <ul className="lista-carrito">
              {grupo.map((i) => (
                <li key={i.productId}>
                  <span>{i.name}</span>
                  <span className="carrito-controles">
                    <button
                      type="button"
                      aria-label={"Quitar uno de " + i.name}
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
                    <strong>{i.qty}</strong>
                    <button
                      type="button"
                      aria-label={"Agregar uno más de " + i.name}
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
                  </span>
                  <strong>{money(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>
            <p className="carrito-subtotal">Subtotal: {money(subtotal)}</p>
            <a
              className="boton boton-whatsapp"
              href={whatsappOrderLink(grupo)}
              target="_blank"
              rel="noreferrer"
            >
              Pedir por WhatsApp
            </a>
          </section>
        );
      })}
      <button
        type="button"
        className="boton boton-tenue"
        onClick={() => cambiar([])}
      >
        Vaciar carrito
      </button>
    </div>
  );
}
