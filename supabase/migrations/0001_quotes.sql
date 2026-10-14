-- Unify Luxury — Fase 3: tabla `quotes`
-- Guarda cada solicitud de cotización. Guest-first: no requiere cuenta de usuario.

create extension if not exists "pgcrypto";

do $$ begin
    create type quote_status as enum (
        'pending_review',
        'sent',
        'accepted',
        'paid',
        'completed',
        'cancelled'
    );
exception when duplicate_object then null; end $$;

do $$ begin
    create type service_level as enum ('practico', 'select', 'premium');
exception when duplicate_object then null; end $$;

create table if not exists public.quotes (
    id                  uuid primary key default gen_random_uuid(),
    status              quote_status not null default 'pending_review',

    origin              text not null,
    origin_lat          decimal(9, 6),
    origin_lng          decimal(9, 6),
    destination         text not null,
    destination_lat     decimal(9, 6),
    destination_lng     decimal(9, 6),

    pickup_at           timestamptz not null,

    passengers          int not null check (passengers between 1 and 10),
    luggage             int not null default 0 check (luggage >= 0),
    service_level       service_level not null,

    distance_km         decimal(8, 2),
    duration_min        int,

    price_preliminary   decimal(10, 2),
    price_final         decimal(10, 2),

    customer_name       text not null,
    customer_email      text not null,
    customer_phone      text,
    is_corporate        boolean not null default false,
    notes               text,

    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

create index if not exists quotes_status_idx on public.quotes (status);
create index if not exists quotes_pickup_at_idx on public.quotes (pickup_at);
create index if not exists quotes_customer_email_idx on public.quotes (customer_email);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
    before update on public.quotes
    for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;

drop policy if exists "quotes_insert_anon" on public.quotes;
create policy "quotes_insert_anon"
    on public.quotes
    for insert
    to anon, authenticated
    with check (true);
