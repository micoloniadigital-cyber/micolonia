// components/LoginModal.tsx — el inicio de sesión COMO
// POPUP, exactamente igual al del demo: una ventana que se
// abre sobre la página (no una página aparte) con UN solo
// formulario de correo + contraseña para comerciantes y
// administración; el servidor decide el rol. Si el
// comerciante aún no verificó su correo, el mismo popup pide
// el código de 6 dígitos ahí dentro. El encabezado y la barra
// de celular abren el popup disparando el evento
// «mcd:open-login»; LoginModalHost (montado en el layout) lo
// escucha y muestra la ventana. La página /ingresar usa el
// mismo LoginForm dentro de una tarjeta con el mismo diseño,
// por si alguien llega por enlace directo.
"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import {
  entrar,
  reenviarCodigoLogin,
  verificarCodigoLogin,
  type LoginState,
} from "../app/ingresar/actions";

const inputCls =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)]";

export function abrirLogin(): void {
  window.dispatchEvent(new Event("mcd:open-login"));
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}

function CodigoLogin({ inicial }: { inicial: LoginState }) {
  const [ver, formVer, verBusy] = useActionState(verificarCodigoLogin, inicial);
  const [re, formRe, reBusy] = useActionState(reenviarCodigoLogin, inicial);
  const [code, setCode] = useState("");
  const state = ver;
  return (
    <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900 ring-1 ring-blue-200">
      <p className="font-bold">
        📧 Tu registro aún no está completo: falta verificar tu correo.
      </p>
      <p className="mt-1">
        Te enviamos un código de 6 dígitos a <strong>{state.email}</strong>{" "}
        cuando registraste <strong>{state.businessName}</strong>. Escríbelo
        para finalizar tu registro y entrar a tu panel:
      </p>
      <form action={formVer} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="businessId" value={state.businessId || ""} />
        <input
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          aria-label="Código de verificación de tu correo para entrar"
          className="w-36 rounded-2xl border border-blue-200 bg-white px-3 py-2.5 text-center font-display text-lg font-extrabold tracking-[0.3em] outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={verBusy || code.length !== 6}
          className="rounded-full bg-[var(--accent)] px-4 py-2.5 font-display text-sm font-bold text-white shadow-sm disabled:opacity-60"
        >
          {verBusy ? "Verificando…" : "Verificar y entrar"}
        </button>
        <button
          type="submit"
          formAction={formRe}
          disabled={reBusy}
          className="rounded-full bg-white px-3.5 py-2.5 text-sm font-bold ring-1 ring-blue-200 disabled:opacity-60"
        >
          {reBusy ? "Enviando…" : "↻ Código nuevo"}
        </button>
        <input type="hidden" name="email" value={state.email || ""} />
      </form>
      {state.codeError ? (
        <p className="mt-2 font-semibold text-red-700" role="alert">{state.codeError}</p>
      ) : null}
      {re.codeNotice ? (
        <p className="mt-2 font-semibold text-blue-900" role="status">{re.codeNotice}</p>
      ) : null}
      <p className="mt-2 text-xs">
        ¿No te llegó? Revisa spam. Si sigue sin llegar, Mario puede ver tu
        código en su panel de administrador y dictártelo.
      </p>
    </div>
  );
}

export function LoginForm({ onClose }: { onClose?: () => void }) {
  const [state, formAction, busy] = useActionState(entrar, {} as LoginState);
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold">Iniciar sesión</h2>
          <p className="mt-0.5 text-sm text-[var(--dim)]">
            Para comerciantes y administración.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar inicio de sesión"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-alt)]"
          >
            ✕
          </button>
        ) : null}
      </div>
      <form action={formAction} className="mt-4 grid gap-3">
        <Field label="Correo electrónico">
          <input
            required
            type="email"
            name="email"
            className={inputCls}
            placeholder="tucorreo@ejemplo.com"
            aria-label="Correo electrónico"
            autoComplete="email"
          />
        </Field>
        <Field label="Contraseña">
          <input
            required
            type="password"
            name="password"
            className={inputCls}
            placeholder="••••••••"
            aria-label="Contraseña"
            autoComplete="current-password"
          />
        </Field>
        {state.error ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-1 rounded-full bg-[var(--accent)] py-3 font-display text-base font-bold text-white shadow disabled:opacity-60"
        >
          {busy ? "Verificando…" : "Entrar"}
        </button>
      </form>
      {state.needsVerification ? <CodigoLogin inicial={state} /> : null}
      <div className="mt-4 rounded-2xl bg-[var(--surface-alt)] p-3 text-xs leading-relaxed text-stone-600">
        <p className="font-bold text-[var(--text)]">¿Cómo entro?</p>
        <p>
          Comerciante: escribe el <strong>correo y la contraseña</strong> que
          creaste al registrar tu negocio. Ambos se verifican en el servidor;
          ya no se puede entrar solo con el correo.
        </p>
        <p>
          Administrador: entra con el correo de administración de la
          plataforma y su contraseña.
        </p>
        <p>
          ¿Olvidaste tu contraseña? Contacta a Mario para que te ayude a
          recuperarla.
        </p>
      </div>
    </div>
  );
}

export default function LoginModalHost() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const abrir = () => setOpen(true);
    window.addEventListener("mcd:open-login", abrir);
    return () => window.removeEventListener("mcd:open-login", abrir);
  }, []);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Iniciar sesión"
    >
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-[var(--surface)] p-6 shadow-xl sm:rounded-[28px]">
        <LoginForm onClose={() => setOpen(false)} />
      </div>
    </div>
  );
}
