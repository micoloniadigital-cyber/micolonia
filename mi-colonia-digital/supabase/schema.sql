-- ============================================================
-- Mi Colonia Digital — Base de datos en Supabase (PostgreSQL)
-- Cómo usarlo: en Supabase entra a «SQL Editor», aprieta
-- «New query», pega TODO este archivo y aprieta «Run».
-- Es seguro correrlo una vez en un proyecto nuevo y vacío.
-- Sin negocios de ejemplo: el catálogo arranca vacío, solo
-- entran negocios verdaderos que se registren en la página.
-- Reglas del negocio ya puestas en la base:
--   · Colonias fijas (las 5 de Mario), precio $259 MXN/mes,
--     7 días de gracia, destacados máximo 5 solo admin.
--   · SIN Mercado Pago y SIN Stripe: el pago se registra a
--     mano cuando Mario cobra en persona (tabla payments).
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Negocios ----------
create table if not exists public.businesses (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  owner_name text not null default '',
  owner_email text not null default '',
  -- Solo el hash PBKDF2 de la contraseña; nunca texto claro.
  owner_password_hash text not null default '',
  category text not null,
  description text not null default '',
  colonia text not null check (colonia in (
    'Parques de Tesistán', 'Molinos', 'Valle Imperial',
    'La Cuchilla', 'Tesistán'
  )),
  address text not null default '',
  maps_url text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  facebook text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  open_time time not null default '09:00',
  close_time time not null default '21:00',
  days_label text not null default 'Lunes a domingo',
  -- Horario por día (checklist): arreglo JSON de objetos
  -- { day, open, close } SOLO con los días marcados, p. ej.
  -- [{"day":"Lunes","open":"09:00","close":"21:00"}]. El servidor
  -- deriva de aquí days_label, open_time (apertura más temprana)
  -- y close_time (cierre más tardío). Arreglo vacío = sin horario
  -- por día: se usan open_time/close_time/days_label como antes.
  schedule jsonb not null default '[]'::jsonb,
  -- Fotos: rutas dentro del bucket «fotos-negocios» de Storage.
  cover_key text not null default '',
  cover_path text not null default '',
  logo_path text not null default '',
  email_verified boolean not null default false,
  accent text not null default '#EA580C',
  rating numeric(3,2) not null default 0,
  -- Lugares destacados: máximo 5 en total, solo el admin (la
  -- regla del máximo se hace cumplir en el servidor y con el
  -- trigger de abajo).
  featured boolean not null default false,
  -- Promociones activas: el comerciante las prende y apaga.
  promotions_active boolean not null default true,
  status text not null default 'pendiente'
    check (status in ('activo', 'pendiente', 'suspendido')),
  subscription_status text not null default 'pendiente_pago'
    check (subscription_status in
      ('activa', 'pendiente_pago', 'vencida', 'cancelada')),
  -- Fecha de renovación / vencimiento. La gracia son 7 días
  -- después de esta fecha (regla en el servidor).
  next_payment_date date,
  views integer not null default 0,
  whatsapp_clicks integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Si la tabla ya existía (proyecto creado antes del checklist de
-- horario), esta línea agrega la columna sin tocar nada más.
alter table public.businesses
  add column if not exists schedule jsonb not null default '[]'::jsonb;

create unique index if not exists businesses_owner_email_idx
  on public.businesses (lower(owner_email));
create index if not exists businesses_colonia_idx on public.businesses (colonia);
create index if not exists businesses_category_idx on public.businesses (category);
create index if not exists businesses_status_idx on public.businesses (status);
create index if not exists businesses_featured_idx
  on public.businesses (featured) where featured = true;

-- Regla dura: nunca más de 5 lugares destacados.
create or replace function public.enforce_max_featured()
returns trigger language plpgsql as $$
begin
  if new.featured = true and (tg_op = 'INSERT' or old.featured = false) then
    if (select count(*) from public.businesses where featured = true) >= 5 then
      raise exception 'Solo puede haber 5 lugares destacados. Quita uno primero.';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists businesses_max_featured on public.businesses;
create trigger businesses_max_featured
  before insert or update of featured on public.businesses
  for each row execute function public.enforce_max_featured();

-- ---------- Productos ----------
create table if not exists public.products (
  id bigint generated always as identity primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  promo_price numeric(12,2) check (promo_price is null or promo_price >= 0),
  category text not null default 'General',
  image_key text not null default '',
  image_path text not null default '',
  available boolean not null default true,
  featured boolean not null default false,
  views integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_business_idx on public.products (business_id);
create index if not exists products_promo_idx
  on public.products (promo_price) where promo_price is not null;

-- ---------- Códigos de verificación por correo ----------
-- Al registrarse, cada negocio recibe un código de 6 dígitos
-- que vence en 30 minutos y admite máximo 5 intentos.
create table if not exists public.email_verifications (
  id bigint generated always as identity primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  email text not null default '',
  code text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists email_verifications_business_idx
  on public.email_verifications (business_id);

-- ---------- Pagos (cobro personal de Mario, $259/mes) ----------
-- No hay pasarela: cada fila «confirmado» la crea Mario desde
-- su panel cuando recibe el dinero en persona.
create table if not exists public.payments (
  id bigint generated always as identity primary key,
  business_id bigint not null references public.businesses(id) on delete cascade,
  amount numeric(12,2) not null default 259,
  concept text not null default 'Suscripción mensual',
  status text not null default 'pendiente'
    check (status in ('confirmado', 'pendiente', 'fallido')),
  method text not null default 'Cobro personal',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists payments_business_idx on public.payments (business_id);

-- ---------- Configuración de la plataforma ----------
-- Pares clave/valor. OJO: la clave secreta de Supabase NO se
-- guarda aquí en producción: vive solo en las variables de
-- entorno de Vercel (SUPABASE_SECRET_KEY).
create table if not exists public.platform_config (
  key text primary key,
  value text not null default '',
  is_test boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.platform_config (key, value, is_test) values
  ('domain', 'micoloniadigital.com', false),
  ('monthly_price_mxn', '259', false),
  ('grace_days', '7', false),
  ('max_featured', '5', false)
on conflict (key) do nothing;

-- ---------- updated_at automático ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists businesses_touch on public.businesses;
create trigger businesses_touch before update on public.businesses
  for each row execute function public.touch_updated_at();
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- Seguridad a nivel de fila (RLS) ----------
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.email_verifications enable row level security;
alter table public.payments enable row level security;
alter table public.platform_config enable row level security;

-- Lectura pública: solo negocios ACTIVOS y sus productos
-- disponibles. Todo lo demás lo hace el servidor con la
-- clave secreta (que salta RLS y valida sesión y rol).
drop policy if exists "negocios activos visibles" on public.businesses;
create policy "negocios activos visibles" on public.businesses
  for select to anon, authenticated using (status = 'activo');
drop policy if exists "productos disponibles visibles" on public.products;
create policy "productos disponibles visibles" on public.products
  for select to anon, authenticated using (
    available = true and exists (
      select 1 from public.businesses b
      where b.id = business_id and b.status = 'activo'
    )
  );
-- Sin políticas de escritura para anon/authenticated:
-- nadie escribe desde el navegador directo a las tablas.
-- platform_config, payments y email_verifications quedan
-- cerradas al público (solo clave secreta del servidor).

-- ---------- Fotos: bucket «fotos-negocios» ----------
insert into storage.buckets (id, name, public)
values ('fotos-negocios', 'fotos-negocios', true)
on conflict (id) do nothing;

drop policy if exists "fotos negocios lectura publica" on storage.objects;
create policy "fotos negocios lectura publica" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'fotos-negocios');
-- Subidas y borrados: solo el servidor con la clave secreta
-- (las rutas de la app validan que cada comerciante toque
-- únicamente la carpeta de su propio negocio).

-- Listo. Siguiente paso: en Vercel pega las variables de
-- .env.example y aprieta Deploy.
