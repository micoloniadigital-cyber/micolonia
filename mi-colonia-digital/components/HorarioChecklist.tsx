// components/HorarioChecklist.tsx — el checklist de horario
// que pidió Mario: en vez de escribir los días, el comerciante
// MARCA los días que abre y elige la hora de apertura y cierre
// de CADA día. El resultado viaja al servidor en un campo
// oculto «schedule» con el JSON [{ day, open, close }] solo de
// los días marcados; el servidor lo valida y lo guarda en la
// columna schedule (jsonb) junto con los campos derivados.
// Por defecto: los 7 días marcados, 09:00 a 21:00.
"use client";

import { useMemo, useState } from "react";
import { WEEK_DAYS, type ScheduleDay } from "../lib/plataforma";

interface DiaForm {
  day: string;
  checked: boolean;
  open: string;
  close: string;
}

export default function HorarioChecklist({
  inicial,
  apertura = "09:00",
  cierre = "21:00",
}: {
  inicial?: ScheduleDay[];
  apertura?: string;
  cierre?: string;
}) {
  const [dias, setDias] = useState<DiaForm[]>(() =>
    WEEK_DAYS.map((day) => {
      const e = (inicial || []).find((x) => x.day === day);
      if (inicial && inicial.length > 0) {
        return e
          ? { day, checked: true, open: e.open, close: e.close }
          : { day, checked: false, open: apertura, close: cierre };
      }
      return { day, checked: true, open: apertura, close: cierre };
    }),
  );
  const json = useMemo(
    () =>
      JSON.stringify(
        dias
          .filter((d) => d.checked)
          .map((d) => ({
            day: d.day,
            open: d.open || "09:00",
            close: d.close || "21:00",
          })),
      ),
    [dias],
  );
  const cambiar = (i: number, patch: Partial<DiaForm>) =>
    setDias((prev) => prev.map((d, xi) => (xi === i ? { ...d, ...patch } : d)));
  const ninguno = dias.every((d) => !d.checked);

  return (
    <fieldset className="horario-checklist">
      <legend>Horario: marca los días que abres</legend>
      <p className="tenue">
        Toca la casilla de cada día que abres y elige a qué hora abres y
        cierras ese día. Los días sin marcar son los días que cierras.
      </p>
      <input type="hidden" name="schedule" value={json} />
      {dias.map((d, i) => (
        <div key={d.day} className="horario-dia">
          <label>
            <input
              type="checkbox"
              checked={d.checked}
              onChange={(e) => cambiar(i, { checked: e.target.checked })}
              aria-label={"Abre el " + d.day}
            />{" "}
            <strong>{d.day}</strong>
          </label>{" "}
          {d.checked ? (
            <span>
              Abre{" "}
              <input
                type="time"
                value={d.open}
                onChange={(e) => cambiar(i, { open: e.target.value })}
                aria-label={"Hora de apertura el " + d.day}
              />{" "}
              Cierra{" "}
              <input
                type="time"
                value={d.close}
                onChange={(e) => cambiar(i, { close: e.target.value })}
                aria-label={"Hora de cierre el " + d.day}
              />
            </span>
          ) : (
            <span className="tenue">Cerrado</span>
          )}
        </div>
      ))}
      {ninguno ? (
        <p className="error" role="alert">
          Marca al menos un día: si no marcas ninguno, tu negocio aparecerá
          siempre como cerrado.
        </p>
      ) : null}
    </fieldset>
  );
}
