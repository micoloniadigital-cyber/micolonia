// components/SubirFotoForm.tsx — formulario de subida de foto
// (logo, portada o foto de producto) del panel del comerciante.
// Revisa el peso de la foto EN EL NAVEGADOR apenas se elige el
// archivo y otra vez al enviar: si pesa más de 2 MB muestra
// «Tu foto pesa más de 2 MB, elige una más ligera.» junto al
// botón y NO envía nada. Antes la foto viajaba tal cual, Next.js
// la cortaba a 1 MB (su límite de fábrica para acciones) y el
// comerciante terminaba en la pantalla «Application error» sin
// saber por qué. La acción subirFoto también valida en el
// servidor y devuelve el mismo mensaje como estado, sin lanzar.
"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import { subirFoto } from "../app/panel/actions";

const MAX_FOTO_BYTES = 2 * 1024 * 1024; // 2 MB
const MENSAJE_FOTO_PESADA = "Tu foto pesa más de 2 MB, elige una más ligera.";

export default function SubirFotoForm({
  tipo,
  productoId,
  etiqueta,
  nombreAccesible,
  textoBoton,
  requerido = false,
  enLinea = false,
}: {
  tipo: "logo" | "portada" | "producto";
  productoId?: number;
  etiqueta?: string;
  nombreAccesible: string;
  textoBoton: string;
  requerido?: boolean;
  enLinea?: boolean;
}) {
  const [estado, formAction, enviando] = useActionState(subirFoto, null);
  const [errorPeso, setErrorPeso] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pesaDemasiado = (): boolean => {
    const f = inputRef.current?.files?.[0];
    return !!f && f.size > MAX_FOTO_BYTES;
  };

  const alElegir = () => {
    setErrorPeso(pesaDemasiado() ? MENSAJE_FOTO_PESADA : null);
  };

  const alEnviar = (e: FormEvent<HTMLFormElement>) => {
    if (pesaDemasiado()) {
      e.preventDefault();
      setErrorPeso(MENSAJE_FOTO_PESADA);
    }
  };

  const error = errorPeso || estado?.error || null;
  const boton = (
    <button
      type="submit"
      className={enLinea ? "boton boton-tenue" : "boton"}
      disabled={enviando}
    >
      {enviando ? "Subiendo…" : textoBoton}
    </button>
  );
  const entrada = (
    <input
      ref={inputRef}
      type="file"
      name="foto"
      accept="image/*"
      required={requerido}
      aria-label={nombreAccesible}
      onChange={alElegir}
    />
  );

  if (enLinea) {
    return (
      <span>
        <form
          action={formAction}
          onSubmit={alEnviar}
          style={{ display: "inline" }}
          encType="multipart/form-data"
        >
          <input type="hidden" name="tipo" value={tipo} />
          {productoId != null ? (
            <input type="hidden" name="productoId" value={productoId} />
          ) : null}
          {entrada}{" "}
          {boton}
        </form>
        {error ? (
          <span className="error" role="alert" style={{ display: "block", marginTop: 8 }}>
            {error}
          </span>
        ) : estado?.ok ? (
          <span className="ok" role="status" style={{ display: "block", marginTop: 8 }}>
            ✓ Foto actualizada.
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <form action={formAction} onSubmit={alEnviar} className="formulario">
      <input type="hidden" name="tipo" value={tipo} />
      {etiqueta ? <label>{etiqueta}{entrada}</label> : entrada}
      {boton}
      {error ? (
        <p className="error" role="alert">{error}</p>
      ) : estado?.ok ? (
        <p className="ok" role="status">✓ Foto actualizada.</p>
      ) : null}
    </form>
  );
}
