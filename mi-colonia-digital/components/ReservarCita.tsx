// components/ReservarCita.tsx — calendario de reserva del
// escaparate (solo negocios de Belleza con «¿Aceptas citas?»
// prendido). Próximos 30 días en que el negocio abre como
// botones de fecha; al elegir fecha, las horas de 1 hora dentro
// del horario, con las ya ACEPTADAS como «Apartado»
// (deshabilitadas). El vecino deja nombre y teléfono; la cita
// nace PENDIENTE (la acción crearCita valida todo en el
// servidor) y el negocio la confirma desde su panel.
"use client";

import { useActionState, useState } from "react";
import { crearCita, type CrearCitaState } from "../app/negocio/[slug]/actions";
import {
  CITA_ANTICIPACION_DIAS,
  horarioDelDia,
  horasDisponibles,
  hoyEnColonia,
  sumarDiasISO,
  type Business,
} from "../lib/plataforma";

function fechaLarga(fecha: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(fecha + "T12:00:00Z"));
}

function fechaCorta(fecha: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(fecha + "T12:00:00Z"));
}

export default function ReservarCita({
  b,
  aceptadas,
}: {
  b: Business;
  // Solo fecha y hora de las citas aceptadas: es lo único que la
  // página pública recibe. Nombres y teléfonos, jamás.
  aceptadas: { fecha: string; hora: string }[];
}) {
  const [state, formAction, pending] = useActionState<CrearCitaState, FormData>(
    crearCita,
    null,
  );
  const today = hoyEnColonia();
  const days: string[] = [];
  for (let i = 0; i <= CITA_ANTICIPACION_DIAS; i += 1) {
    const fecha = sumarDiasISO(today, i);
    if (horarioDelDia(b, fecha)) days.push(fecha);
  }
  const [fechaSel, setFechaSel] = useState("");
  const fecha = fechaSel && days.includes(fechaSel) ? fechaSel : days[0] || "";
  const [hora, setHora] = useState("");
  const apartadas = aceptadas.filter((c) => c.fecha === fecha).map((c) => c.hora);
  const libres = fecha ? horasDisponibles(b, fecha, aceptadas) : [];
  const todas = [...new Set([...libres, ...apartadas])].sort();

  if (state && state.ok) {
    return (
      <section
        className="mt-6 rounded-[28px] bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border)] sm:p-7"
        aria-label={"Reservar cita en " + b.name}
      >
        <h2 className="font-display text-xl font-extrabold">📅 Reservar cita</h2>
        <div className="mt-4 rounded-3xl bg-green-50 p-5 text-center ring-1 ring-green-200" role="status">
          <span className="text-4xl" aria-hidden>✅</span>
          <p className="mt-2 font-display text-lg font-bold text-green-900">
            Tu solicitud fue enviada. El negocio debe confirmarla; te contactará por teléfono.
          </p>
          <p className="mt-1 text-sm text-green-800">
            En cuanto {b.name} acepte tu cita en su panel, esa fecha y hora quedarán apartadas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-6 rounded-[28px] bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border)] sm:p-7"
      aria-label={"Reservar cita en " + b.name}
    >
      <h2 className="font-display text-xl font-extrabold">📅 Reservar cita</h2>
      <p className="mt-1 max-w-2xl text-sm text-stone-600">
        Elige el día y la hora que quieras (citas de 1 hora, dentro del horario
        de {b.name}) y deja tu nombre y tu teléfono. Tu cita queda{" "}
        <strong>pendiente</strong>: el negocio la confirma desde su panel y te
        contacta por teléfono. Las horas marcadas como «Apartado» ya tienen una
        cita confirmada.
      </p>
      <form action={formAction} className="mt-4">
        <input type="hidden" name="businessId" value={b.id} />
        <input type="hidden" name="fecha" value={fecha} />
        <input type="hidden" name="hora" value={hora} />
        <fieldset>
          <legend className="text-sm font-bold">1. Elige el día</legend>
          {days.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--dim)]">
              Este negocio no abre en los próximos {CITA_ANTICIPACION_DIAS} días
              según su horario.
            </p>
          ) : (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Días disponibles para tu cita">
              {days.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { setFechaSel(f); setHora(""); }}
                  aria-pressed={fecha === f}
                  aria-label={"Cita el " + fechaLarga(f)}
                  className={
                    "shrink-0 rounded-2xl px-3.5 py-2 text-sm font-bold capitalize ring-1 " +
                    (fecha === f
                      ? "bg-[var(--accent)] text-white ring-[var(--accent)]"
                      : "bg-[var(--surface-alt)] ring-[var(--border)]")
                  }
                >
                  {fechaCorta(f)}
                </button>
              ))}
            </div>
          )}
        </fieldset>

        {fecha ? (
          <fieldset className="mt-4">
            <legend className="text-sm font-bold">
              2. Elige la hora — {fechaLarga(fecha)}
            </legend>
            {todas.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--dim)]">
                Ese día no hay horas de cita dentro del horario. Prueba con otro día.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Horas disponibles para tu cita">
                {todas.map((h) => {
                  const ocupada = apartadas.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={ocupada}
                      onClick={() => setHora(h)}
                      aria-pressed={!ocupada && hora === h}
                      aria-label={ocupada ? "Hora " + h + ": apartado" : "Cita a las " + h}
                      className={
                        "rounded-2xl px-3.5 py-2 text-sm font-bold ring-1 " +
                        (ocupada
                          ? "cursor-not-allowed bg-stone-100 text-stone-400 ring-stone-200"
                          : hora === h
                            ? "bg-[var(--accent)] text-white ring-[var(--accent)]"
                            : "bg-[var(--surface-alt)] ring-[var(--border)]")
                      }
                    >
                      {h}
                      {ocupada ? " · Apartado" : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold">3. Tu nombre *</span>
            <input
              name="nombre"
              required
              minLength={2}
              maxLength={120}
              placeholder="Ej. Ana López"
              aria-label="Tu nombre para la cita"
              autoComplete="name"
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[15px] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold">Tu teléfono *</span>
            <input
              name="telefono"
              required
              minLength={7}
              maxLength={30}
              placeholder="Ej. 33 1234 5678"
              aria-label="Tu teléfono para la cita"
              autoComplete="tel"
              inputMode="tel"
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[15px] outline-none focus:border-[var(--accent)]"
            />
          </label>
        </div>

        {state && state.error ? (
          <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !fecha || !hora}
          className="mt-4 rounded-full bg-[var(--accent)] px-6 py-3 font-display text-sm font-bold text-white shadow disabled:opacity-60"
        >
          {pending
            ? "Enviando…"
            : hora
              ? "Pedir mi cita el " + fechaCorta(fecha) + " a las " + hora
              : "Pedir mi cita"}
        </button>
        <p className="mt-2 text-xs text-[var(--dim)]">
          Sin pago en línea: solo dejas tus datos y el negocio confirma tu cita.
        </p>
      </form>
    </section>
  );
}
