-- ============================================================
-- Apontado — contas por empresa, administração e dashboard
-- Aplicar depois da migração inicial (SQL Editor ou supabase db push).
-- ============================================================

-- ---------- Perfis: dados da empresa + estado da conta ----------

alter table profiles
  add column email text,
  add column address text,
  add column nif text,
  add column is_admin boolean not null default false,
  add column account_status text not null default 'ativa'
    check (account_status in ('ativa', 'pausada')),
  add column paused_reason text,
  add column paused_at timestamptz;

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

-- ---------- Dashboard: dinheiro recebido e satisfação ----------

alter table quotes add column paid_at timestamptz;
alter table requests add column rating smallint check (rating between 1 and 5);

-- ---------- Funções auxiliares (security definer evita recursão de RLS) ----------

create function public.is_admin()
returns boolean
language sql stable
security definer set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create function public.account_active()
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

create policy "admin read all profiles" on profiles
  for select using (public.is_admin());

create policy "admin update all profiles" on profiles
  for update using (public.is_admin())
  with check (public.is_admin());

-- ---------- Pausar / reativar contas (só admin) ----------

create function public.admin_set_account_status(
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

drop policy "own clients" on clients;
create policy "read own clients" on clients
  for select using (professional_id = (select auth.uid()));
create policy "insert own clients" on clients
  for insert with check (
    professional_id = (select auth.uid()) and public.account_active()
  );
create policy "update own clients" on clients
  for update using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()) and public.account_active());
create policy "delete own clients" on clients
  for delete using (
    professional_id = (select auth.uid()) and public.account_active()
  );

drop policy "own requests" on requests;
create policy "read own requests" on requests
  for select using (professional_id = (select auth.uid()));
create policy "insert own requests" on requests
  for insert with check (
    professional_id = (select auth.uid()) and public.account_active()
  );
create policy "update own requests" on requests
  for update using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()) and public.account_active());
create policy "delete own requests" on requests
  for delete using (
    professional_id = (select auth.uid()) and public.account_active()
  );

drop policy "own quotes" on quotes;
create policy "read own quotes" on quotes
  for select using (professional_id = (select auth.uid()));
create policy "insert own quotes" on quotes
  for insert with check (
    professional_id = (select auth.uid()) and public.account_active()
  );
create policy "update own quotes" on quotes
  for update using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()) and public.account_active());
create policy "delete own quotes" on quotes
  for delete using (
    professional_id = (select auth.uid()) and public.account_active()
  );

drop policy "own quote items" on quote_items;
create policy "read own quote items" on quote_items
  for select using (
    exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );
create policy "write own quote items" on quote_items
  for insert with check (
    public.account_active() and exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );
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
create policy "delete own quote items" on quote_items
  for delete using (
    public.account_active() and exists (
      select 1 from quotes
      where quotes.id = quote_items.quote_id
        and quotes.professional_id = (select auth.uid())
    )
  );

-- ---------- Notas de operação ----------
-- Tornar-se admin (uma vez, no SQL Editor, com o email da tua conta):
--   update profiles set is_admin = true
--   where id = (select id from auth.users where email = 'o-teu-email@exemplo.com');
