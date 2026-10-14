-- Unify Luxury — Fase 3: profiles + role-based access
-- Extiende auth.users con un rol (customer | admin). Auto-creación de profile
-- al signup y helper is_admin() para policies.

do $$ begin
    create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    email       text not null,
    role        user_role not null default 'customer',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_role_idx on public.profiles (role);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists(
        select 1 from public.profiles
        where id = user_id and role = 'admin'
    );
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
    on public.profiles
    for select
    to authenticated
    using (auth.uid() = id);

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
    on public.profiles
    for select
    to authenticated
    using (public.is_admin(auth.uid()));

-- Un usuario puede actualizar su propio profile, pero NO el rol
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
    on public.profiles
    for update
    to authenticated
    using (auth.uid() = id)
    with check (
        auth.uid() = id
        and role = (select role from public.profiles where id = auth.uid())
    );

-- Políticas adicionales sobre quotes: admin lee/actualiza todo
drop policy if exists "quotes_select_admin" on public.quotes;
create policy "quotes_select_admin"
    on public.quotes
    for select
    to authenticated
    using (public.is_admin(auth.uid()));

drop policy if exists "quotes_update_admin" on public.quotes;
create policy "quotes_update_admin"
    on public.quotes
    for update
    to authenticated
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));

-- Cliente autenticado lee sus propias quotes por email
drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own"
    on public.quotes
    for select
    to authenticated
    using (
        customer_email = (select email from public.profiles where id = auth.uid())
    );
