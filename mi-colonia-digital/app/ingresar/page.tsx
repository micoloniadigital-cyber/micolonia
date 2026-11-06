// app/ingresar/page.tsx — inicio de sesión de comerciantes
// y del administrador.
"use client";

import { useActionState } from "react";
import {
  entrarAdmin,
  entrarComerciante,
  type LoginState,
} from "./actions";

const inicial: LoginState = {};

export default function IngresarPage() {
  const [com, formCom] = useActionState(entrarComerciante, inicial);
  const [adm, formAdm] = useActionState(entrarAdmin, inicial);
  return (
    <main>
      <h1>Iniciar sesión</h1>
      <section className="panel-seccion">
        <h2>Soy comerciante</h2>
        <p className="tenue">Entra con el correo y la contraseña de tu negocio.</p>
        {com.error ? <p className="error" role="alert">{com.error}</p> : null}
        <form action={formCom} className="formulario">
          <label>
            Correo de tu negocio
            <input name="email" type="email" required autoComplete="email" aria-label="Correo del negocio" />
          </label>
          <label>
            Contraseña
            <input name="password" type="password" required autoComplete="current-password" aria-label="Contraseña" />
          </label>
          <button type="submit" className="boton">Entrar a mi panel</button>
        </form>
      </section>
      <section className="panel-seccion">
        <h2>Soy el administrador</h2>
        {adm.error ? <p className="error" role="alert">{adm.error}</p> : null}
        <form action={formAdm} className="formulario">
          <label>
            Correo del administrador
            <input name="email" type="email" required autoComplete="email" aria-label="Correo del administrador" />
          </label>
          <label>
            Contraseña del administrador
            <input name="password" type="password" required autoComplete="current-password" aria-label="Contraseña del administrador" />
          </label>
          <button type="submit" className="boton boton-azul">Entrar al panel de admin</button>
        </form>
      </section>
    </main>
  );
}
