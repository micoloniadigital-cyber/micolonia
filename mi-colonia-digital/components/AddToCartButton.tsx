// components/AddToCartButton.tsx — botón cliente que agrega
// el producto al carrito con su precio efectivo (respeta las
// promociones activas del local).
"use client";

import { useState } from "react";
import { effectivePrice, money, type Business, type Product } from "../lib/plataforma";
import { addToCart } from "../lib/carrito";

export default function AddToCartButton({
  product,
  business,
}: {
  product: Product;
  business: Business;
}) {
  const [ok, setOk] = useState(false);
  const price = effectivePrice(product, business);
  return (
    <button
      type="button"
      className="boton"
      aria-label={"Agregar " + product.name + " al carrito"}
      onClick={() => {
        addToCart({
          productId: product.id,
          businessId: business.id,
          businessName: business.name,
          businessWhatsapp: business.whatsapp,
          name: product.name,
          price,
        });
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
    >
      {ok ? "Agregado ✓" : "Agregar — " + money(price)}
    </button>
  );
}
