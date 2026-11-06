// lib/carrito.ts — el carrito vive en el navegador
// (localStorage), agrupado por negocio. Al pedir, se arma UN
// mensaje con negocio, productos, cantidades y subtotal y se
// abre el WhatsApp oficial del comerciante. La plataforma NO
// cobra los productos: el pago se arregla con el negocio.
import { money, type Business } from "./plataforma";

export interface CartItem {
  productId: number;
  businessId: number;
  businessName: string;
  businessWhatsapp: string;
  name: string;
  price: number;
  qty: number;
}

const CART_KEY = "mcd-cart-v1";
export const CART_EVENT = "mcd-cart-cambio";

export function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(
  item: Omit<CartItem, "qty">,
  qty: number = 1,
): CartItem[] {
  const items = loadCart();
  const found = items.find(
    (i) => i.productId === item.productId && i.businessId === item.businessId,
  );
  if (found) found.qty += qty;
  else items.push({ ...item, qty });
  saveCart(items);
  return items;
}

export function cartQtyOf(productId: number): number {
  const found = loadCart().find((i) => i.productId === productId);
  return found ? found.qty : 0;
}

export function cartCount(): number {
  return loadCart().reduce((s, i) => s + i.qty, 0);
}

export function removeFromCart(productId: number): CartItem[] {
  const items = loadCart()
    .map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i))
    .filter((i) => i.qty > 0);
  saveCart(items);
  return items;
}

export function whatsappOrderLink(items: CartItem[]): string {
  const first = items[0];
  if (!first) return "#";
  const lines = items.map(
    (i) => "· " + i.qty + " x " + i.name + " — " + money(i.price * i.qty),
  );
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const msg =
    "Hola, " + first.businessName + ". Quiero pedir:\n" +
    lines.join("\n") +
    "\nSubtotal: " + money(subtotal) +
    "\n(Pedido hecho desde Mi Colonia Digital)";
  return (
    "https://wa.me/52" + first.businessWhatsapp.replace(/[^0-9]/g, "") +
    "?text=" + encodeURIComponent(msg)
  );
}

export function businessWhatsappLink(b: Business): string {
  return "https://wa.me/52" + b.whatsapp.replace(/[^0-9]/g, "");
}
