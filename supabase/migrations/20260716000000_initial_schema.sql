-- ============================================================
-- ObraFácil — schema inicial (Fase 1 / MVP)
-- Aplicar via Supabase CLI (supabase db push) ou SQL Editor.
-- ============================================================

-- ---------- Enums ----------

create type trade as enum (
  'carpintaria',
  'canalizacao',
  'eletricidade',
  'pintura',
  'construcao_geral',
  'outro'
);

create type request_status as enum (
  'novo',
  'orcamentado',
  'aceite',
  'em_curso',
  'concluido'
);

create type quote_status as enum (
  'rascunho',
  'enviado',
  'aceite',
  'recusado'
);

create type quote_item_kind as enum (
  'mao_de_obra',
  'material',
  'outro'
);

-- ---------- Perfis (1:1 com auth.users) ----------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  business_name text,
  phone text,
  trade trade not null default 'carpintaria',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cria o perfil automaticamente no registo.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- Clientes (o "caderninho") ----------

create table clients (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_professional_idx on clients (professional_id);

-- ---------- Pedidos / leads ----------

create table requests (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references profiles (id) on delete cascade,
  -- Entrada rápida: o cliente pode ainda não existir na base de clientes.
  client_id uuid references clients (id) on delete set null,
  client_name text not null,
  client_phone text,
  description text not null,
  status request_status not null default 'novo',
  photo_paths text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index requests_professional_idx on requests (professional_id, status);

-- ---------- Orçamentos ----------

create table quotes (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references profiles (id) on delete cascade,
  request_id uuid references requests (id) on delete set null,
  client_id uuid references clients (id) on delete set null,
  -- Numeração sequencial por profissional (ex.: 2026-001), gerada na app.
  reference text not null,
  status quote_status not null default 'rascunho',
  sent_at timestamptz,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_id, reference)
);

create index quotes_professional_idx on quotes (professional_id, status);

create table quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  kind quote_item_kind not null default 'mao_de_obra',
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit text not null default 'un',
  unit_price numeric(10, 2) not null default 0,
  position int not null default 0
);

create index quote_items_quote_idx on quote_items (quote_id);

-- ---------- Itens pré-carregados por ofício ----------
-- A especificidade por ofício é o que faz a app parecer "feita para ele".

create table preset_items (
  id uuid primary key default gen_random_uuid(),
  trade trade not null,
  kind quote_item_kind not null,
  description text not null,
  unit text not null default 'un',
  suggested_price numeric(10, 2)
);

create index preset_items_trade_idx on preset_items (trade);

insert into preset_items (trade, kind, description, unit, suggested_price) values
  -- Carpintaria — mão de obra
  ('carpintaria', 'mao_de_obra', 'Instalação de porta interior', 'un', 60),
  ('carpintaria', 'mao_de_obra', 'Instalação de porta exterior/blindada', 'un', 120),
  ('carpintaria', 'mao_de_obra', 'Substituição de janela', 'un', 90),
  ('carpintaria', 'mao_de_obra', 'Colocação de rodapé', 'ml', 6),
  ('carpintaria', 'mao_de_obra', 'Colocação de pavimento flutuante', 'm2', 12),
  ('carpintaria', 'mao_de_obra', 'Montagem de móvel de cozinha', 'un', 80),
  ('carpintaria', 'mao_de_obra', 'Montagem de roupeiro', 'un', 150),
  ('carpintaria', 'mao_de_obra', 'Afinação de porta/janela', 'un', 30),
  ('carpintaria', 'mao_de_obra', 'Deslocação', 'un', 20),
  -- Carpintaria — materiais
  ('carpintaria', 'material', 'Porta interior (folha)', 'un', 85),
  ('carpintaria', 'material', 'Aro e guarnições', 'un', 45),
  ('carpintaria', 'material', 'Rodapé MDF', 'ml', 4),
  ('carpintaria', 'material', 'Pavimento flutuante AC4', 'm2', 15),
  ('carpintaria', 'material', 'Dobradiças e ferragens', 'un', 12),
  ('carpintaria', 'material', 'Puxadores', 'un', 15),
  ('carpintaria', 'material', 'Silicone/espuma/consumíveis', 'un', 10);

-- ---------- updated_at automático ----------

create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger clients_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger requests_updated_at before update on requests
  for each row execute function set_updated_at();
create trigger quotes_updated_at before update on quotes
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------
-- Cada profissional só vê e altera os seus próprios dados.

alter table profiles enable row level security;
alter table clients enable row level security;
alter table requests enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table preset_items enable row level security;

create policy "own profile" on profiles
  for all using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "own clients" on clients
  for all using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "own requests" on requests
  for all using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "own quotes" on quotes
  for all using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "own quote items" on quote_items
  for all using (
    exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );

create policy "preset items readable" on preset_items
  for select to authenticated using (true);

-- ---------- Storage: fotos de pedidos e logótipos ----------
-- Convenção de pastas: <professional_id>/<ficheiro>

insert into storage.buckets (id, name, public)
values ('request-photos', 'request-photos', false),
       ('logos', 'logos', false);

create policy "own photos" on storage.objects
  for all using (
    bucket_id in ('request-photos', 'logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('request-photos', 'logos')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
