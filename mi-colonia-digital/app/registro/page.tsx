// app/registro/page.tsx — registro de negocios en 2 pasos:
// datos + contraseña, y código de 6 dígitos por correo.
"use client";

import { useActionState } from "react";
import {
  reenviarCodigo,
  registrarNegocio,
  verificarCodigo,
  type RegistroState,
} from "./actions";
import { CATEGORIES, COLONIAS, MONTHLY_PRICE, money } from "../../lib/plataforma";

const inicial: RegistroState = { paso: "datos" };

export default function RegistroPage() {
  const [reg, formReg] = useActionState(registrarNegocio, inicial);
  const [ver, formVer] = useActionState(verificarCodigo, inicial);
  const estado = ver.paso === "codigo" ? ver : reg;

  if (estado.paso === "codigo" && estado.businessId) {
    return (
      <main>
        <h1>Escribe tu código</h1>
        <p>
          Te mandamos un código de 6 dígitos a <strong>{estado.email}</strong>.
          Vence en 30 minutos. Sin este código no puedes entrar a tu panel:
          así nadie registra un negocio con el correo de otro.
        </p>
        {estado.error ? <p className="error" role="alert">{estado.error}</p> : null}
        <form action={formVer} className="formulario">
          <input type="hidden" name="businessId" value={estado.businessId} />
          <input type="hidden" name="email" value={estado.email || ""} />
          <label>
            Código de 6 dígitos
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              aria-label="Código de verificación de 6 dígitos"
              required
            />
          </label>
          <button type="submit" className="boton">Confirmar mi registro</button>
        </form>
        <form action={reenviarCodigo}>
          <input type="hidden" name="businessId" value={estado.businessId} />
          <input type="hidden" name="email" value={estado.email || ""} />
          <button type="submit" className="boton boton-tenue">
            No me llegó: mándame otro código
          </button>
        </form>
        <p className="aviso">
          ¿No te llega el correo? Mario puede ver tu código vigente en su
          panel de administrador y dictártelo.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Registra tu negocio</h1>
      <p>
        Tu escaparate digital por <strong>{money(MONTHLY_PRICE)} al mes</strong>.
        Sin Mercado Pago ni Stripe: Mario te cobra en persona y activa tu
        negocio. Primero creas tu cuenta y confirmas tu correo con un código.
      </p>
      {reg.error ? <p className="error" role="alert">{reg.error}</p> : null}
      <form action={formReg} className="formulario">
        <h2>1. Crea la contraseña de tu cuenta</h2>
        <label>
          Correo electrónico (con este entras a tu panel)
          <input name="ownerEmail" type="email" required autoComplete="email" aria-label="Correo electrónico del propietario" />
        </label>
        <label>
          Contraseña (mínimo 8 caracteres)
          <input name="password" type="password" required minLength={8} autoComplete="new-password" aria-label="Contraseña de tu cuenta" />
        </label>
        <label>
          Escribe tu contraseña otra vez
          <input name="password2" type="password" required minLength={8} autoComplete="new-password" aria-label="Confirmar contraseña" />
        </label>
        <h2>2. Datos de tu negocio</h2>
        <label>
          Nombre comercial
          <input name="name" required aria-label="Nombre comercial" />
        </label>
        <label>
          Tu nombre (propietario)
          <input name="ownerName" aria-label="Nombre del propietario" />
        </label>
        <label>
          Categoría
          <select name="category" aria-label="Categoría del negocio">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Colonia
          <select name="colonia" required aria-label="Colonia del negocio">
            {COLONIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Descripción corta
          <textarea name="description" aria-label="Descripción del negocio" />
        </label>
        <label>
          Dirección
          <input name="address" aria-label="Dirección del negocio" />
        </label>
        <label>
          Enlace de Google Maps (Cómo llegar)
          <input name="mapsUrl" type="url" aria-label="Enlace de Google Maps" />
        </label>
        <label>
          WhatsApp para pedidos (10 dígitos)
          <input name="whatsapp" inputMode="tel" required aria-label="WhatsApp para pedidos" />
        </label>
        <label>
          Teléfono
          <input name="phone" inputMode="tel" aria-label="Teléfono del negocio" />
        </label>
        <label>
          Horario de apertura
          <input name="openTime" type="time" defaultValue="09:00" aria-label="Hora de apertura" />
        </label>
        <label>
          Horario de cierre
          <input name="closeTime" type="time" defaultValue="21:00" aria-label="Hora de cierre" />
        </label>
        <label>
          Días que abres
          <input name="daysLabel" defaultValue="Lunes a domingo" aria-label="Días de atención" />
        </label>
        <label>
          Facebook (enlace completo)
          <input name="facebook" type="url" aria-label="Facebook del negocio" />
        </label>
        <label>
          Instagram (enlace completo)
          <input name="instagram" type="url" aria-label="Instagram del negocio" />
        </label>
        <label>
          TikTok (enlace completo)
          <input name="tiktok" type="url" aria-label="TikTok del negocio" />
        </label>
        <button type="submit" className="boton">
          Crear mi cuenta y recibir mi código
        </button>
      </form>
    </main>
  );
}
