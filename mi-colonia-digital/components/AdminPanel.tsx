// components/AdminPanel.tsx — el panel del administrador
// EXACTAMENTE como el del demo: mismo encabezado y caja
// naranja «¿Cómo funciona tu cobro?», las 5 tarjetas de
// estadísticas con sus iconos, la sección ámbar de Lugares
// destacados (máximo 5, solo el admin), los filtros
// Todos/Activos/Inactivos, las tarjetas de cada local con
// TODOS sus botones e insignias (activar/desactivar,
// registrar pago $259, avisar por WhatsApp en la gracia,
// fecha de vencimiento, estado, suscripción, destacar,
// eliminar con confirmación en dos pasos), el historial de
// pagos por local y la lista global de pagos. Los datos los
// trae la página del servidor (app/admin/page.tsx) y cada
// botón llama a las acciones del servidor de app/admin.
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminEliminarNegocio,
  adminRegistrarPago,
  adminSetDestacado,
  adminSetEstado,
  adminSetSuscripcion,
  adminSetVencimiento,
} from "../app/admin/actions";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./SocialIcons";
import {
  CATEGORIES,
  COLONIAS,
  GRACE_DAYS,
  MAX_FEATURED,
  MONTHLY_PRICE,
  money,
  type Business,
  type Payment,
} from "../lib/plataforma";

export type AdminBiz = Business & { productCount: number };
export type AdminPayment = Payment & { businessName: string };
export type CodigoPendiente = { code: string; expiresAt: string };

function LogoBiz({ b, size = "md" }: { b: AdminBiz; size?: "sm" | "md" }) {
  const sz =
    size === "sm"
      ? "h-10 w-10 text-lg rounded-xl"
      : "h-14 w-14 text-2xl rounded-2xl";
  if (b.logoUrl) {
    return (
      <img
        src={b.logoUrl}
        alt={"Logo de " + b.name}
        className={sz + " shrink-0 object-cover shadow ring-2 ring-white"}
      />
    );
  }
  return (
    <span
      className={sz + " flex shrink-0 items-center justify-center font-display font-extrabold text-white shadow ring-2 ring-white"}
      style={{ background: b.accent }}
      aria-hidden
    >
      {b.name.charAt(0)}
    </span>
  );
}

function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "52" + digits;
  return digits;
}
function waLink(b: AdminBiz, text: string): string {
  return (
    "https://wa.me/" +
    waNumber(b.whatsapp || b.phone) +
    "?text=" +
    encodeURIComponent(text)
  );
}

export default function AdminPanel({
  businesses,
  payments,
  codigos,
  totalProducts,
  categorias,
}: {
  businesses: AdminBiz[];
  payments: AdminPayment[];
  codigos: Record<number, CodigoPendiente>;
  totalProducts: number;
  categorias: string[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"todos" | "activos" | "inactivos">("todos");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [payDates, setPayDates] = useState<Record<number, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const notify = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 3200);
  };

  const run = async (
    action: (fd: FormData) => Promise<void>,
    fields: Record<string, string>,
    okMsg: string,
  ) => {
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      for (const k of Object.keys(fields)) fd.set(k, fields[k] as string);
      await action(fd);
      router.refresh();
      notify(okMsg);
    } catch {
      notify(
        "No pudimos aplicar el cambio. Si era un destacado, revisa que no tengas ya " +
          MAX_FEATURED +
          " lugares destacados.",
      );
    } finally {
      setSaving(false);
    }
  };

  const featuredBiz = businesses.filter((b) => b.featured);
  const featuredCount = featuredBiz.length;
  const activeBiz = businesses.filter((b) => b.status === "activo");
  const inactiveBiz = businesses.filter((b) => b.status !== "activo");
  const activeSubs = businesses.filter((b) => b.subscriptionStatus === "activa");
  const mrr = activeSubs.length * MONTHLY_PRICE;
  const confirmedIncome = payments
    .filter((p) => p.status === "confirmado")
    .reduce((s, p) => s + p.amount, 0);
  const paymentsByBiz = useMemo(() => {
    const m = new Map<number, AdminPayment[]>();
    for (const p of payments) {
      const arr = m.get(p.businessId) ?? [];
      arr.push(p);
      m.set(p.businessId, arr);
    }
    return m;
  }, [payments]);

  const shownBiz =
    filter === "todos" ? businesses : filter === "activos" ? activeBiz : inactiveBiz;
  const todayStr = new Date().toISOString().slice(0, 10);
  const isExpired = (b: AdminBiz) => !!b.nextPaymentDate && b.nextPaymentDate < todayStr;
  const daysLeft = (b: AdminBiz) => {
    if (!b.nextPaymentDate) return null;
    return Math.round(
      (new Date(b.nextPaymentDate + "T12:00:00").getTime() - Date.now()) / 86400000,
    );
  };
  const graceEndStr = (b: AdminBiz) => {
    if (!b.nextPaymentDate) return null;
    const d = new Date(b.nextPaymentDate + "T12:00:00");
    d.setDate(d.getDate() + GRACE_DAYS);
    return d.toISOString().slice(0, 10);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24">
      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Panel del administrador — Mario
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--dim)]">
            Tú cobras personalmente los{" "}
            <strong className="text-[var(--text)]">$259 MXN/mes</strong> sin
            Mercado Pago. Desde aquí activas o desactivas locales, registras
            cada cobro, ves la fecha de renovación y el vencimiento de cada
            negocio.
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800 ring-1 ring-green-200">
          💵 Cobro personal · Sin pasarela
        </span>
      </div>

      <div className="mt-4 rounded-3xl bg-[var(--accent)] p-4 text-white shadow-sm">
        <p className="font-display font-bold">¿Cómo funciona tu cobro?</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-white/95">
          <li>
            El comerciante se registra, recibe un{" "}
            <strong>código de verificación por correo</strong> y lo escribe
            para terminar su registro; queda <strong>pendiente</strong> (no
            aparece en el catálogo). Si el correo no le llega, tú ves su
            código en su tarjeta y se lo puedes dictar.
          </li>
          <li>
            Tú recibes sus $259 en persona y pulsas{" "}
            <strong>«Registrar pago $259 y activar»</strong>.
          </li>
          <li>
            El local pasa a <strong>activo</strong>, la suscripción queda
            activa y el vencimiento se mueve +30 días.
          </li>
          <li>
            Si llega el vencimiento sin pago, el local entra en{" "}
            <strong>periodo de gracia de 7 días</strong>: sigue publicado,
            conserva sus productos y configuración, y tú le avisas por
            WhatsApp con el botón de cada tarjeta.
          </li>
          <li>
            Si pasan los 7 días de gracia sin pago, cámbialo a{" "}
            <strong>suspendido / vencida</strong> con los controles de cada
            local. Al registrar su pago se reactiva de inmediato, con todo
            intacto.
          </li>
        </ol>
        <p className="mt-2 rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/30">
          ⏳ Regla fija: <strong>7 días de gracia</strong> después del
          vencimiento antes de suspender un local sin pago. Cada tarjeta
          muestra el vencimiento, la fecha límite de gracia y su historial de
          pagos.
        </p>
        <p className="mt-2 text-xs text-white/85">
          Colonias activas: {COLONIAS.join(" · ")}
        </p>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Estadísticas generales">
        {[
          { icon: "💰", label: "Ingresos recurrentes mensuales (MRR)", value: money(mrr), sub: activeSubs.length + " suscripciones activas × $259" },
          { icon: "🟢", label: "Locales activos", value: String(activeBiz.length), sub: inactiveBiz.length + " inactivos / pendientes / suspendidos" },
          { icon: "⭐", label: "Lugares destacados", value: featuredCount + " / " + MAX_FEATURED, sub: featuredCount >= MAX_FEATURED ? "Cupo lleno — quita uno para destacar otro" : "Solo tú eliges quién entra aquí" },
          { icon: "🏪", label: "Negocios registrados", value: String(businesses.length), sub: totalProducts + " productos · " + COLONIAS.length + " colonias" },
          { icon: "✅", label: "Ingresos confirmados (cobro personal)", value: money(confirmedIncome), sub: payments.filter((p) => p.status === "confirmado").length + " pagos confirmados" },
        ].map((c) => (
          <div key={c.label} className="rounded-3xl bg-[var(--surface)] p-4 shadow-sm ring-1 ring-[var(--border)]">
            <span className="text-2xl" aria-hidden>{c.icon}</span>
            <p className="mt-1 font-display text-lg font-extrabold leading-tight">{c.value}</p>
            <p className="text-xs font-bold text-[var(--dim)]">{c.label}</p>
            <p className="text-xs text-[var(--dim)]">{c.sub}</p>
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-[28px] bg-amber-50 p-5 shadow-sm ring-1 ring-amber-200" aria-label="Lugares destacados — solo administrador">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="font-display text-lg font-bold">
              ⭐ Lugares destacados — solo tú eliges, máximo {MAX_FEATURED}
            </h2>
            <p className="mt-1 text-sm text-amber-900">
              Esta es la sección que ven todos en la portada como «Lugares
              destacados». <strong>Solo tú, como administrador, puedes poner
              un local ahí</strong> — ningún comerciante puede destacarse
              solo. Hay lugar para <strong>solo {MAX_FEATURED} negocios</strong>.
              Para destacar uno nuevo cuando el cupo está lleno, primero quita
              uno de la lista.
            </p>
          </div>
          <span
            className={
              "rounded-full px-3.5 py-1.5 font-display text-sm font-extrabold ring-1 " +
              (featuredCount >= MAX_FEATURED
                ? "bg-red-100 text-red-800 ring-red-300"
                : "bg-white text-amber-800 ring-amber-300")
            }
            role="status"
          >
            {featuredCount} / {MAX_FEATURED} lugares ocupados
          </span>
        </div>
        {featuredBiz.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-white p-4 text-sm text-[var(--dim)] ring-1 ring-amber-200">
            Todavía no has destacado ningún lugar. Abajo, en cada tarjeta de
            local, pulsa <strong>«⭐ Destacar»</strong> para agregarlo aquí.
            Solo aparecerán en la portada los destacados que estén{" "}
            <strong>activos</strong>.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBiz.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-amber-200">
                <LogoBiz b={b} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-bold">{b.name}</p>
                  <p className="text-xs text-[var(--dim)]">
                    {b.category} · {b.colonia} ·{" "}
                    {b.status === "activo" ? "🟢 Visible en portada" : "⚠️ No activo — no se ve en portada"}
                  </p>
                  <p className="text-xs text-[var(--dim)]">
                    {b.promotionsActive ? "🏷️ Promos visibles" : "🏷️ Promos apagadas por el local"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    run(adminSetDestacado, { id: String(b.id), destacar: "0" }, "Cambios del administrador guardados ✅")
                  }
                  aria-label={"Quitar a " + b.name + " de Lugares destacados"}
                  className="shrink-0 rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900 ring-1 ring-amber-300 disabled:opacity-60"
                >
                  Quitar de destacados
                </button>
              </li>
            ))}
          </ul>
        )}
        {featuredCount >= MAX_FEATURED ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-800 ring-1 ring-red-200" role="alert">
            ⛔ Cupo lleno: ya tienes los {MAX_FEATURED} lugares destacados. El
            botón «Destacar» de los demás locales queda bloqueado hasta que
            quites uno de arriba.
          </p>
        ) : null}
        <p className="mt-2 text-xs text-amber-800">
          Las promociones de cada local las prende y apaga el propio
          comerciante desde su panel, en «Mis promociones activas». Tú no
          necesitas tocar eso.
        </p>
      </section>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar locales por estado">
        {(
          [
            ["todos", "Todos (" + businesses.length + ")"],
            ["activos", "Activos (" + activeBiz.length + ")"],
            ["inactivos", "Inactivos (" + inactiveBiz.length + ")"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={filter === k}
            onClick={() => setFilter(k)}
            className={
              "rounded-full px-4 py-2 text-sm font-bold ring-1 " +
              (filter === k
                ? "bg-[var(--text)] text-white ring-[var(--text)]"
                : "bg-[var(--surface)] ring-[var(--border)]")
            }
          >
            {label}
          </button>
        ))}
      </div>

      <section className="mt-4 rounded-[28px] bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border)]">
        <h2 className="font-display text-lg font-bold">
          Locales — activa, suspende, cobra y elimina
        </h2>
        <p className="mt-0.5 text-sm text-[var(--dim)]">
          Cada tarjeta muestra logo, portada, correo verificado, colonia,
          suscripción, renovación, vencimiento,{" "}
          <strong>la fecha límite del periodo de gracia de 7 días</strong> y
          su historial de pagos. Usa «Registrar pago» cuando recibas los $259
          en persona, y «Eliminar local» para borrar un negocio para siempre
          (con confirmación).
        </p>
        <ul className="mt-4 space-y-4">
          {shownBiz.map((b) => {
            const hist = paymentsByBiz.get(b.id) ?? [];
            const lastPay = hist.find((p) => p.status === "confirmado");
            const dl = daysLeft(b);
            const expired = isExpired(b);
            const gEnd = graceEndStr(b);
            const graceLeft = dl != null ? dl + GRACE_DAYS : null;
            const inGrace = expired && graceLeft != null && graceLeft >= 0;
            const pastGrace = expired && graceLeft != null && graceLeft < 0;
            const dateVal = payDates[b.id] ?? b.nextPaymentDate ?? "";
            const codigo = !b.emailVerified ? codigos[b.id] : undefined;
            return (
              <li key={b.id} className="rounded-3xl bg-[var(--surface-alt)]/60 p-4 ring-1 ring-[var(--border)]">
                <div className="flex flex-wrap items-start gap-3">
                  <LogoBiz b={b} />
                  <div className="min-w-[200px] flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-display text-base font-bold">
                      {b.name}{" "}
                      {b.featured ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                          ⭐ Destacado
                        </span>
                      ) : null}
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-xs font-bold " +
                          (b.status === "activo"
                            ? "bg-green-100 text-green-800"
                            : b.status === "suspendido"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800")
                        }
                      >
                        {b.status === "activo"
                          ? "🟢 Activo — visible en catálogo"
                          : b.status === "suspendido"
                            ? "🔴 Suspendido — oculto"
                            : "🟡 Pendiente — oculto"}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--dim)]">
                      {b.category} · 📍 {b.colonia} · {b.ownerName} · {b.ownerEmail}
                    </p>
                    <p className="text-xs text-[var(--dim)]">
                      {b.productCount} productos · {b.views} visitas ·{" "}
                      {b.whatsappClicks} clics WhatsApp · {b.phone || b.whatsapp}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-[var(--border)]">
                        Suscripción: <strong>{b.subscriptionStatus}</strong>
                      </span>
                      <span
                        className={
                          "rounded-full px-2.5 py-1 font-semibold ring-1 " +
                          (expired
                            ? "bg-red-50 text-red-700 ring-red-200"
                            : "bg-white ring-[var(--border)]")
                        }
                      >
                        Renovación / Vencimiento:{" "}
                        <strong>{b.nextPaymentDate || "—"}</strong>
                        {dl != null
                          ? " (" +
                            (expired
                              ? "vencido hace " + Math.abs(dl) + " días"
                              : dl === 0
                                ? "vence hoy"
                                : "en " + dl + " días") +
                            ")"
                          : ""}
                      </span>
                      {gEnd ? (
                        inGrace ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800 ring-1 ring-amber-300">
                            ⏳ En periodo de gracia de 7 días:{" "}
                            {graceLeft === 0
                              ? "hoy es el último día"
                              : "quedan " + graceLeft + " días"}{" "}
                            · Suspender después del <strong>{gEnd}</strong> si no paga
                          </span>
                        ) : pastGrace ? (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700 ring-1 ring-red-300">
                            ⛔ Gracia de 7 días terminada el <strong>{gEnd}</strong>{" "}
                            (hace {Math.abs(graceLeft ?? 0)} días) — ya puedes
                            suspenderlo; conserva productos y configuración y se
                            reactiva al pagar
                          </span>
                        ) : (
                          <span className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-[var(--border)]">
                            Gracia de 7 días: si no paga, se suspende después del{" "}
                            <strong>{gEnd}</strong>
                          </span>
                        )
                      ) : null}
                      {lastPay ? (
                        <span className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-[var(--border)]">
                          Último pago: {money(lastPay.amount)} ·{" "}
                          {new Date(lastPay.createdAt).toLocaleDateString("es-MX")} ·{" "}
                          {lastPay.method || "Cobro personal"}
                        </span>
                      ) : null}
                      {b.logoUrl ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700 ring-1 ring-green-200">
                          ✓ Tiene logo de perfil
                        </span>
                      ) : (
                        <span className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-[var(--border)]">
                          Sin logo (inicial)
                        </span>
                      )}
                      {b.coverUrl ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700 ring-1 ring-green-200">
                          ✓ Portada personalizada
                        </span>
                      ) : (
                        <span className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-[var(--border)]">
                          Portada de galería
                        </span>
                      )}
                      <span
                        className={
                          "rounded-full px-2.5 py-1 font-semibold ring-1 " +
                          (b.promotionsActive
                            ? "bg-green-50 text-green-700 ring-green-200"
                            : "bg-stone-100 text-stone-600 ring-stone-200")
                        }
                      >
                        {b.promotionsActive
                          ? "🏷️ Promociones activas (el local las tiene prendidas)"
                          : "🏷️ Promociones apagadas por el local"}
                      </span>
                      {b.emailVerified ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700 ring-1 ring-green-200">
                          ✓ Correo verificado
                        </span>
                      ) : codigo ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-800 ring-1 ring-blue-200">
                          ✉️ Correo SIN verificar · Código actual:{" "}
                          <strong className="font-display tracking-widest">{codigo.code}</strong>{" "}
                          (vence {new Date(codigo.expiresAt).toLocaleString("es-MX")}) —
                          díctaselo si no le llegó
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800 ring-1 ring-amber-200">
                          ✉️ Correo sin verificar
                        </span>
                      )}
                    </div>
                    {b.facebook || b.instagram || b.tiktok ? (
                      <span className="mt-2 flex items-center gap-1.5" aria-label={"Redes de " + b.name}>
                        <span className="text-xs font-bold text-[var(--dim)]">Redes:</span>
                        {b.facebook ? (
                          <a href={b.facebook} target="_blank" rel="noreferrer" aria-label={"Facebook de " + b.name} className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-[var(--border)]">
                            <FacebookIcon className="h-4 w-4" />
                          </a>
                        ) : null}
                        {b.instagram ? (
                          <a href={b.instagram} target="_blank" rel="noreferrer" aria-label={"Instagram de " + b.name} className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-[var(--border)]">
                            <InstagramIcon className="h-4 w-4" />
                          </a>
                        ) : null}
                        {b.tiktok ? (
                          <a href={b.tiktok} target="_blank" rel="noreferrer" aria-label={"TikTok de " + b.name} className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-[var(--border)]">
                            <TikTokIcon className="h-4 w-4" />
                          </a>
                        ) : null}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[var(--border)] pt-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      run(
                        adminSetEstado,
                        {
                          id: String(b.id),
                          estado: b.status === "activo" ? "suspendido" : "activo",
                          suscripcion: b.status === "activo" ? "vencida" : "activa",
                        },
                        "Cambios del administrador guardados ✅",
                      )
                    }
                    aria-label={(b.status === "activo" ? "Desactivar " : "Activar ") + b.name}
                    className={
                      "rounded-full px-4 py-2.5 text-sm font-bold shadow-sm disabled:opacity-60 " +
                      (b.status === "activo" ? "bg-red-600 text-white" : "bg-green-600 text-white")
                    }
                  >
                    {b.status === "activo" ? "⏸ Desactivar local" : "▶ Activar local"}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      run(
                        adminRegistrarPago,
                        { id: String(b.id), fecha: payDates[b.id] || "" },
                        "Pago de $259 registrado ✅ Local activado",
                      )
                    }
                    aria-label={"Registrar pago de $259 y activar " + b.name}
                    className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60"
                  >
                    💵 Registrar pago $259 y activar
                  </button>
                  {expired && (b.whatsapp || b.phone) ? (
                    <a
                      href={waLink(
                        b,
                        inGrace
                          ? "Hola, " + b.name + ": soy Mario, de Mi Colonia Digital. Tu suscripción de $259 MXN venció el " + b.nextPaymentDate + " y estás en tu periodo de gracia de 7 días (hasta el " + gEnd + "). Tu local sigue publicado con todos tus productos. Para no suspenderlo, ¿podemos coordinar tu pago? Al pagar se reactiva de inmediato. ¡Gracias!"
                          : "Hola, " + b.name + ": soy Mario, de Mi Colonia Digital. Tu suscripción de $259 MXN venció el " + b.nextPaymentDate + " y el periodo de gracia de 7 días terminó el " + gEnd + ". Tu local conserva todos sus productos y configuración, y se reactiva en cuanto registremos tu pago. ¿Coordinamos? ¡Gracias!",
                      )}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={"Avisar por WhatsApp a " + b.name + " sobre su periodo de gracia"}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-sm"
                    >
                      <WhatsAppIcon className="h-4 w-4 [&_path]:fill-white" /> Avisar por WhatsApp
                    </a>
                  ) : null}
                  <label className="text-xs font-bold">
                    Vencimiento
                    <input
                      type="date"
                      value={dateVal}
                      onChange={(e) => setPayDates((prev) => ({ ...prev, [b.id]: e.target.value }))}
                      aria-label={"Fecha de vencimiento de " + b.name}
                      className="ml-2 rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      if (payDates[b.id]) {
                        run(
                          adminSetVencimiento,
                          { id: String(b.id), fecha: payDates[b.id] as string },
                          "Cambios del administrador guardados ✅",
                        );
                      }
                    }}
                    aria-label={"Guardar fecha de vencimiento de " + b.name}
                    className="rounded-full bg-white px-3.5 py-2 text-sm font-bold ring-1 ring-[var(--border)] disabled:opacity-60"
                  >
                    Guardar fecha
                  </button>
                  <label className="text-xs font-bold">
                    Estado
                    <select
                      value={b.status}
                      disabled={saving}
                      onChange={(e) =>
                        run(adminSetEstado, { id: String(b.id), estado: e.target.value }, "Cambios del administrador guardados ✅")
                      }
                      aria-label={"Estado de publicación de " + b.name}
                      className="ml-2 rounded-full border border-[var(--border)] bg-white px-2.5 py-2 text-sm"
                    >
                      <option value="activo">Activo</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Suscripción
                    <select
                      value={b.subscriptionStatus}
                      disabled={saving}
                      onChange={(e) =>
                        run(adminSetSuscripcion, { id: String(b.id), suscripcion: e.target.value }, "Cambios del administrador guardados ✅")
                      }
                      aria-label={"Estado de suscripción de " + b.name}
                      className="ml-2 rounded-full border border-[var(--border)] bg-white px-2.5 py-2 text-sm"
                    >
                      <option value="activa">Activa</option>
                      <option value="pendiente_pago">Pendiente de pago</option>
                      <option value="vencida">Vencida</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={saving || (!b.featured && featuredCount >= MAX_FEATURED)}
                    onClick={() =>
                      run(
                        adminSetDestacado,
                        { id: String(b.id), destacar: b.featured ? "0" : "1" },
                        "Cambios del administrador guardados ✅",
                      )
                    }
                    aria-label={
                      b.featured
                        ? "Quitar a " + b.name + " de Lugares destacados"
                        : !b.featured && featuredCount >= MAX_FEATURED
                          ? "No se puede destacar a " + b.name + ": ya hay " + MAX_FEATURED + " lugares destacados"
                          : "Poner a " + b.name + " en Lugares destacados"
                    }
                    aria-pressed={b.featured}
                    title={
                      !b.featured && featuredCount >= MAX_FEATURED
                        ? "Cupo lleno: " + featuredCount + "/" + MAX_FEATURED + " lugares destacados"
                        : undefined
                    }
                    className={
                      "rounded-full px-3.5 py-2 text-sm font-bold ring-1 disabled:cursor-not-allowed disabled:opacity-50 " +
                      (b.featured ? "bg-amber-100 text-amber-800 ring-amber-300" : "bg-white ring-[var(--border)]")
                    }
                  >
                    ⭐{" "}
                    {b.featured
                      ? "En destacados — quitar"
                      : featuredCount >= MAX_FEATURED
                        ? "Destacar (cupo lleno " + featuredCount + "/" + MAX_FEATURED + ")"
                        : "Destacar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(b.id)}
                    aria-label={"Eliminar permanentemente " + b.name}
                    className="rounded-full bg-white px-3.5 py-2 text-sm font-bold text-red-700 ring-1 ring-red-300"
                  >
                    🗑️ Eliminar local
                  </button>
                </div>

                {confirmDelete === b.id ? (
                  <div className="mt-3 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200" role="alertdialog" aria-label={"Confirmar eliminación de " + b.name}>
                    <p className="text-sm font-bold text-red-800">
                      ¿Eliminar «{b.name}» para siempre?
                    </p>
                    <p className="mt-0.5 text-sm text-red-700">
                      Se borrará el local con{" "}
                      <strong>todos sus productos, su historial de pagos y sus códigos de verificación</strong>.
                      Esta acción <strong>no se puede deshacer</strong>. Si solo
                      quieres ocultarlo del catálogo, usa «Desactivar local» en
                      su lugar.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={async () => {
                          await run(adminEliminarNegocio, { id: String(b.id) }, "Local eliminado permanentemente 🗑️");
                          setConfirmDelete(null);
                        }}
                        aria-label={"Confirmar eliminar permanentemente " + b.name}
                        className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60"
                      >
                        {saving ? "Eliminando…" : "Sí, eliminar definitivamente"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="rounded-full bg-white px-4 py-2.5 text-sm font-bold ring-1 ring-[var(--border)]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : null}

                {hist.length > 0 ? (
                  <details className="mt-3 rounded-2xl bg-white p-3 ring-1 ring-[var(--border)]">
                    <summary className="cursor-pointer text-sm font-bold">
                      Historial de pagos de {b.name} ({hist.length})
                    </summary>
                    <ul className="mt-2 divide-y divide-[var(--border)]">
                      {hist.map((pay) => (
                        <li key={pay.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span>
                            {pay.concept}
                            <span className="block text-xs text-[var(--dim)]">
                              {new Date(pay.createdAt).toLocaleDateString("es-MX")} ·{" "}
                              {pay.method || "Cobro personal"}
                            </span>
                          </span>
                          <span className="text-right">
                            <strong>{money(pay.amount)}</strong>
                            <span
                              className={
                                "block text-xs font-bold " +
                                (pay.status === "confirmado" ? "text-green-700" : "text-amber-700")
                              }
                            >
                              {pay.status}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </li>
            );
          })}
          {shownBiz.length === 0 ? (
            <li className="py-6 text-center text-sm text-[var(--dim)]">
              No hay locales en este filtro.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-5 rounded-[28px] bg-[var(--surface)] p-5 shadow-sm ring-1 ring-[var(--border)]">
        <h2 className="font-display text-lg font-bold">
          Todos los pagos — cobro personal $259
        </h2>
        <p className="mt-0.5 text-sm text-[var(--dim)]">
          Sin Mercado Pago ni Stripe. Cada pago confirmado aquí lo registraste
          tú al recibir el dinero en persona.
        </p>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--dim)]">
            Aún no hay pagos registrados. Usa «Registrar pago $259 y activar»
            en cada local cuando cobres.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--border)]">
            {payments.map((pay) => (
              <li key={pay.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  <strong>{pay.businessName}</strong> — {pay.concept}
                  <span className="block text-xs text-[var(--dim)]">
                    {new Date(pay.createdAt).toLocaleDateString("es-MX")}
                    {pay.method ? " · " + pay.method : " · Cobro personal"}
                  </span>
                </span>
                <span className="text-right">
                  <strong>{money(pay.amount)}</strong>
                  <span
                    className={
                      "block text-xs font-bold " +
                      (pay.status === "confirmado"
                        ? "text-green-700"
                        : pay.status === "fallido"
                          ? "text-red-700"
                          : "text-amber-700")
                    }
                  >
                    {pay.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-[var(--dim)]">
          Colonias de la plataforma: {COLONIAS.join(", ")}. Categorías:{" "}
          {categorias.join(", ") || CATEGORIES.join(", ")}. Precio único: $259
          MXN/mes por local, cobro personal de Mario.
        </p>
      </section>

      {toast ? (
        <div className="fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-8" role="status">
          <p className="fade-up max-w-md rounded-full bg-[var(--text)] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg">
            {toast}
          </p>
        </div>
      ) : null}
    </main>
  );
}
