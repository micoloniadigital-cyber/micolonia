// app/ingresar/page.tsx — el inicio de sesión COMO EN EL
// DEMO: normalmente se abre como POPUP desde el encabezado
// (components/LoginModal); esta ruta existe para enlaces
// directos y para cuando /panel o /admin piden sesión, y
// muestra el MISMO formulario dentro de una tarjeta con el
// diseño del popup, centrada sobre el fondo cálido. Si ya hay
// sesión, manda directo a tu panel.
import { redirect } from "next/navigation";
import { LoginForm } from "../../components/LoginModal";
import { leerSesion } from "../../lib/sesion";

export default async function IngresarPage() {
  const sesion = await leerSesion();
  if (sesion) redirect(sesion.rol === "admin" ? "/admin" : "/panel");
  return (
    <main className="mx-auto flex max-w-md px-4 py-10 sm:py-16">
      <div className="w-full rounded-[28px] bg-[var(--surface)] p-6 shadow-xl ring-1 ring-[var(--border)]">
        <LoginForm />
      </div>
    </main>
  );
}
