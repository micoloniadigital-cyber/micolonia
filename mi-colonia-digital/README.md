# Mi Colonia Digital

Plaza comercial digital de las colonias Parques de Tesistán, Molinos,
Valle Imperial, La Cuchilla y Tesistán — producción para
**micoloniadigital.com**.

- **Next.js 15** (App Router) + **Supabase** (PostgreSQL, Storage y RLS).
- Catálogo público, escaparate por negocio, carrito con pedido por
  WhatsApp, registro con código por correo, panel del comerciante y
  panel del administrador.
- Suscripción de **$259 MXN/mes con cobro personal** del administrador:
  NO hay Mercado Pago ni Stripe. 7 días de gracia tras el vencimiento.
  Lugares destacados: máximo 5, solo el admin. Cada local prende y
  apaga sus promociones.

## Cómo desplegar

Sigue el archivo **pasos-para-desplegar.txt** de este mismo proyecto,
en orden: GitHub → SQL en Supabase → variables en Vercel → Deploy →
dominio en HostGator.

## Estructura

- `app/` — rutas: portada, `catalogo`, `negocio/[slug]`,
  `carrito`, `registro`, `ingresar`, `panel` (comerciante),
  `admin` y `sitemap.ts`.
- `lib/` — reglas del negocio (`plataforma.ts`), clientes de
  Supabase (navegador y servidor), contraseñas (`auth.ts`), sesión
  firmada (`sesion.ts`), catálogo (`catalogo.ts`), carrito
  (`carrito.ts`) y correo de códigos (`correo.ts`).
- `components/` — tarjeta de negocio, botón de carrito y carrito.
- `supabase/schema.sql` — tablas, índices, RLS y bucket de fotos.
- `.env.example` — plantilla de variables (la clave secreta va
  solo como marcador: su valor real vive en Vercel).
