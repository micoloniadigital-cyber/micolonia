// lib/correo.ts — envío del código de verificación por correo.
// Si existe la variable RESEND_API_KEY en Vercel, el código se
// manda con Resend. Si todavía no hay servicio de correo
// conectado, la función devuelve false y el registro NO se
// cae: el administrador puede ver el código vigente de cada
// negocio en su panel (/admin) y dictarlo por WhatsApp.
export async function enviarCodigoPorCorreo(
  email: string,
  codigo: string,
  nombreNegocio: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY || "";
  if (!apiKey) {
    console.log(
      "[correo] Sin RESEND_API_KEY: código " + codigo + " para " +
        email + " (" + nombreNegocio + "). El admin lo ve en /admin.",
    );
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mi Colonia Digital <codigos@micoloniadigital.com>",
        to: [email],
        subject: "Tu código de Mi Colonia Digital: " + codigo,
        text:
          "Hola, " + nombreNegocio + ". Tu código para terminar tu " +
          "registro en Mi Colonia Digital es " + codigo +
          ". Vence en 30 minutos. Si no fuiste tú, ignora este correo.",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
