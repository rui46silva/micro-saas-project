-- ============================================================
-- Apontado — contas por empresa, administração e dashboard
-- IDEMPOTENTE: pode correr-se várias vezes sem erro; cada passo
-- salta o que já estiver aplicado. (Necessário porque o SQL Editor
-- pode deixar uma execução falhada aplicada apenas em parte.)
-- ============================================================

-- ---------- Perfis: dados da empresa + estado da conta ----------

alter table profiles add column if not exists email text;
alter table profiles add column if not exists address text;
alter table profiles add column if not exists nif text;
alter table profiles add column if not exists is_admin boolean not null default false;
alter table profiles add column if not exists account_status text not null default 'ativa';
alter table profiles add column if not exists paused_reason text;
alter table profiles add column if not exists paused_at timestamptz;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_account_status_check'
  ) then
    alter table profiles add constraint profiles_account_status_check
      check (account_status in ('ativa', 'pausada'));
  end if;
end $$;

-- Guardar o email no perfil ao registar (para o admin poder ver quem é quem).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

-- Preencher o email dos perfis criados antes desta migração.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- ---------- Dashboard: dinheiro recebido e satisfação ----------

alter table quotes add column if not exists paid_at timestamptz;
alter table requests add column if not exists rating smallint;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'requests_rating_check'
  ) then
    alter table requests add constraint requests_rating_check
      check (rating between 1 and 5);
  end if;
end $$;

-- ---------- Funções auxiliares (security definer evita recursão de RLS) ----------

create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.account_active()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select coalesce(
    (select p.account_status = 'ativa' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- ---------- Proteção de colunas sensíveis ----------
-- O utilizador só pode editar os dados da empresa; is_admin e account_status
-- nunca são editáveis pela API (o admin usa a RPC abaixo; is_admin só muda
-- via SQL Editor).

revoke update on table public.profiles from authenticated;
grant update (full_name, business_name, phone, trade, logo_url, address, nif)
  on table public.profiles to authenticated;

-- ---------- Políticas de admin ----------

drop policy if exists "admin read all profiles" on profiles;
create policy "admin read all profiles" on profiles
  for select using (public.is_admin());

drop policy if exists "admin update all profiles" on profiles;
create policy "admin update all profiles" on profiles
  for update using (public.is_admin())
  with check (public.is_admin());

-- ---------- Pausar / reativar contas (só admin) ----------

create or replace function public.admin_set_account_status(
  target_id uuid,
  new_status text,
  reason text default null
)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'não autorizado';
  end if;
  if new_status not in ('ativa', 'pausada') then
    raise exception 'estado inválido';
  end if;
  update public.profiles
  set account_status = new_status,
      paused_reason = case when new_status = 'pausada' then reason else null end,
      paused_at = case when new_status = 'pausada' then now() else null end
  where id = target_id;
end;
$$;

-- ---------- Conta pausada: leitura permitida, escrita bloqueada ----------
-- As políticas "for all" originais são divididas em select (sempre) e
-- escrita (só com conta ativa).

drop policy if exists "own clients" on clients;
drop policy if exists "read own clients" on clients;
create policy "read own clients" on clients
  for select using (professional_id = (select auth.uid()));
drop policy if exists "insert own clients" on clients;
create policy "insert own clients" on clients
  for insert with check (
    professional_id = (select auth.uid()) and public.account_active()
  );
drop policy if exists "update own clients" on clients;
create policy "update own clients" on clients
  for update using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()) and public.account_active());
drop policy if exists "delete own clients" on clients;
create policy "delete own clients" on clients
  for delete using (
    professional_id = (select auth.uid()) and public.account_active()
  );

drop policy if exists "own requests" on requests;
drop policy if exists "read own requests" on requests;
create policy "read own requests" on requests
  for select using (professional_id = (select auth.uid()));
drop policy if exists "insert own requests" on requests;
create policy "insert own requests" on requests
  for insert with check (
    professional_id = (select auth.uid()) and public.account_active()
  );
drop policy if exists "update own requests" on requests;
create policy "update own requests" on requests
  for update using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()) and public.account_active());
drop policy if exists "delete own requests" on requests;
create policy "delete own requests" on requests
  for delete using (
    professional_id = (select auth.uid()) and public.account_active()
  );

drop policy if exists "own quotes" on quotes;
drop policy if exists "read own quotes" on quotes;
create policy "read own quotes" on quotes
  for select using (professional_id = (select auth.uid()));
drop policy if exists "insert own quotes" on quotes;
create policy "insert own quotes" on quotes
  for insert with check (
    professional_id = (select auth.uid()) and public.account_active()
  );
drop policy if exists "update own quotes" on quotes;
create policy "update own quotes" on quotes
  for update using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()) and public.account_active());
drop policy if exists "delete own quotes" on quotes;
create policy "delete own quotes" on quotes
  for delete using (
    professional_id = (select auth.uid()) and public.account_active()
  );

drop policy if exists "own quote items" on quote_items;
drop policy if exists "read own quote items" on quote_items;
create policy "read own quote items" on quote_items
  for select using (
    exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );
drop policy if exists "write own quote items" on quote_items;
create policy "write own quote items" on quote_items
  for insert with check (
    public.account_active() and exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );
drop policy if exists "update own quote items" on quote_items;
create policy "update own quote items" on quote_items
  for update using (
    exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  )
  with check (
    public.account_active() and exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );
drop policy if exists "delete own quote items" on quote_items;
create policy "delete own quote items" on quote_items
  for delete using (
    public.account_active() and exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );

-- ---------- Notas de operação ----------
-- Tornar-se admin (uma vez, no SQL Editor, com o email da tua conta —
-- cria o perfil se ainda não existir):
--   insert into public.profiles (id, email, is_admin)
--   select id, email, true from auth.users
--   where email = 'o-teu-email@exemplo.com'
--   on conflict (id) do update set is_admin = true, email = excluded.email;
