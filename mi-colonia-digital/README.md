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
  Lugares destacados: máximo 10, solo el admin. Cada local prende y
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
- `components/` — encabezado, pie y barra móvil idénticos al
  demo, tarjetas de negocio y de producto, catálogo interactivo,
  carrito, iconos oficiales de redes (`SocialIcons.tsx`) e
  iconos de las 10 categorías (`CategoryIcon.tsx`).
- `public/fotos/` y `public/logo.webp` — LAS FOTOS REALES del
  demo: la foto del barrio del héroe, una foto por categoría
  (tacos, café, panadería, belleza, farmacia…) y el logo
  oficial. La portada usa Tailwind CSS v4 con la fuente Sora:
  el diseño es EXACTAMENTE el del demo que Mario aprobó.
- `supabase/schema.sql` — tablas, índices, RLS y bucket de fotos.
- `.env.example` — plantilla de variables (la clave secreta va
  solo como marcador: su valor real vive en Vercel).
