-- ============================================================
-- RentFlow - Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- TENANTS
-- ============================================================
create table if not exists public.tenants (
  id text primary key,
  company text not null,
  seed_mode text not null default 'empty',
  created_at timestamptz default now()
);

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  company text not null,
  tenant_id text not null references public.tenants(id),
  created_at timestamptz default now()
);

-- ============================================================
-- COMPANY SETTINGS (one per tenant)
-- ============================================================
create table if not exists public.company_settings (
  tenant_id text primary key references public.tenants(id) on delete cascade,
  company_name text not null default '',
  logo_url text not null default '',
  cnpj text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  contact_name text not null default '',
  theme_preference text not null default 'dark',
  equipment_categories jsonb not null default '[]'
);

-- ============================================================
-- EQUIPMENT
-- ============================================================
create table if not exists public.equipment (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null,
  category text not null default '',
  brand text not null default '',
  model text not null default '',
  serial_number text not null default '',
  status text not null default 'available',
  daily_rate numeric not null default 0,
  location text not null default '',
  notes text not null default '',
  supplier text,
  acquisition_date text,
  acquisition_cost numeric,
  created_at timestamptz default now()
);

-- ============================================================
-- CLIENTS
-- ============================================================
create table if not exists public.clients (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  type text not null default 'individual',
  name text not null,
  company text not null default '',
  contact_name text not null default '',
  trade_name text not null default '',
  legal_name text not null default '',
  state_registration text not null default '',
  financial_contact text not null default '',
  phone text not null default '',
  secondary_phone text not null default '',
  email text not null default '',
  financial_email text not null default '',
  document text not null default '',
  website text not null default '',
  notes text not null default '',
  address_zip_code text not null default '',
  address_street text not null default '',
  address_number text not null default '',
  address_complement text not null default '',
  address_district text not null default '',
  address_city text not null default '',
  address_state text not null default '',
  created_at timestamptz default now()
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
create table if not exists public.reservations (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  client_id text not null references public.clients(id),
  client_name text not null,
  equipment_ids jsonb not null default '[]',
  equipment jsonb not null default '[]',
  pickup_date text not null,
  return_date text not null,
  total_value numeric not null default 0,
  status text not null default 'quote',
  notes text not null default '',
  created_at timestamptz default now()
);

-- ============================================================
-- KITS
-- ============================================================
create table if not exists public.kits (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null,
  item_ids jsonb not null default '[]',
  items jsonb not null default '[]',
  daily_rate numeric not null default 0,
  description text not null default '',
  created_at timestamptz default now()
);

-- ============================================================
-- QUOTES
-- ============================================================
create table if not exists public.quotes (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  client_id text not null references public.clients(id),
  client_name text not null,
  status text not null default 'draft',
  total numeric not null default 0,
  created_at_date text not null,
  rental_start_date text not null,
  rental_end_date text not null,
  valid_until text not null,
  notes text not null default '',
  discount numeric not null default 0
);

-- ============================================================
-- QUOTE ITEMS
-- ============================================================
create table if not exists public.quote_items (
  id text primary key,
  quote_id text not null references public.quotes(id) on delete cascade,
  tenant_id text not null,
  type text not null,
  ref_id text not null,
  name text not null,
  quantity integer not null default 1,
  daily_rate numeric not null default 0,
  days integer not null default 1
);

-- ============================================================
-- CONTRACTS
-- ============================================================
create table if not exists public.contracts (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  reservation_id text not null references public.reservations(id) on delete cascade,
  client_id text not null references public.clients(id),
  client_name text not null,
  status text not null default 'draft',
  created_at_date text not null,
  value numeric not null default 0,
  content text not null default ''
);

-- ============================================================
-- AGENDA EVENTS
-- ============================================================
create table if not exists public.agenda_events (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  type text not null,
  reservation_id text,
  client_id text,
  client_name text not null,
  equipment jsonb not null default '[]',
  date text not null,
  time text not null,
  status text not null default 'pending',
  title text,
  description text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table if not exists public.activity_log (
  id text primary key,
  tenant_id text not null,
  timestamp text not null,
  user_name text not null,
  action text not null,
  entity text not null,
  entity_id text not null,
  description text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- SHARE TOKENS (public quote links)
-- ============================================================
create table if not exists public.share_tokens (
  token text primary key,
  tenant_id text not null,
  quote_id text not null references public.quotes(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
create table if not exists public.team_members (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'viewer',
  status text not null default 'active',
  added_at text not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.company_settings enable row level security;
alter table public.equipment enable row level security;
alter table public.clients enable row level security;
alter table public.reservations enable row level security;
alter table public.kits enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.contracts enable row level security;
alter table public.agenda_events enable row level security;
alter table public.activity_log enable row level security;
alter table public.share_tokens enable row level security;
alter table public.team_members enable row level security;

-- Helper: get current user's tenant_id from their profile
create or replace function public.my_tenant_id()
returns text
language sql
stable
security definer
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

-- ── profiles ──────────────────────────────────────────────────
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- ── tenants ───────────────────────────────────────────────────
-- Allow any authenticated user to insert a tenant (needed during signup, before profile exists)
create policy "tenants_insert" on public.tenants
  for insert with check (auth.uid() is not null);

create policy "tenants_select_own" on public.tenants
  for select using (id = public.my_tenant_id());

create policy "tenants_update_own" on public.tenants
  for update using (id = public.my_tenant_id());

create policy "tenants_delete_own" on public.tenants
  for delete using (id = public.my_tenant_id());

-- ── company_settings ──────────────────────────────────────────
create policy "settings_insert" on public.company_settings
  for insert with check (auth.uid() is not null);

-- Allow public read for tenants that have active share tokens (public quote page)
create policy "settings_public_share_read" on public.company_settings
  for select using (
    exists (
      select 1 from public.share_tokens
      join public.quotes on quotes.id = share_tokens.quote_id
      where quotes.tenant_id = company_settings.tenant_id
    )
  );

create policy "settings_own" on public.company_settings
  for select using (tenant_id = public.my_tenant_id());

create policy "settings_update_own" on public.company_settings
  for update using (tenant_id = public.my_tenant_id());

create policy "settings_delete_own" on public.company_settings
  for delete using (tenant_id = public.my_tenant_id());

-- ── equipment ─────────────────────────────────────────────────
create policy "equipment_own_tenant" on public.equipment
  for all using (tenant_id = public.my_tenant_id());

-- ── clients ───────────────────────────────────────────────────
create policy "clients_own_tenant" on public.clients
  for all using (tenant_id = public.my_tenant_id());

-- ── reservations ──────────────────────────────────────────────
create policy "reservations_own_tenant" on public.reservations
  for all using (tenant_id = public.my_tenant_id());

-- ── kits ──────────────────────────────────────────────────────
create policy "kits_own_tenant" on public.kits
  for all using (tenant_id = public.my_tenant_id());

-- ── quotes ────────────────────────────────────────────────────
create policy "quotes_own_tenant" on public.quotes
  for all using (tenant_id = public.my_tenant_id());

-- Allow public read/update for share token pages (no auth required)
create policy "quotes_public_share_read" on public.quotes
  for select using (
    exists (select 1 from public.share_tokens where share_tokens.quote_id = quotes.id)
  );

create policy "quotes_public_share_update" on public.quotes
  for update using (
    exists (select 1 from public.share_tokens where share_tokens.quote_id = quotes.id)
  );

-- ── quote_items ───────────────────────────────────────────────
create policy "quote_items_own_tenant" on public.quote_items
  for all using (tenant_id = public.my_tenant_id());

-- ── contracts ─────────────────────────────────────────────────
create policy "contracts_own_tenant" on public.contracts
  for all using (tenant_id = public.my_tenant_id());

-- ── agenda_events ─────────────────────────────────────────────
create policy "agenda_own_tenant" on public.agenda_events
  for all using (tenant_id = public.my_tenant_id());

-- ── activity_log ──────────────────────────────────────────────
create policy "activity_own_tenant" on public.activity_log
  for all using (tenant_id = public.my_tenant_id());

-- ── share_tokens ──────────────────────────────────────────────
create policy "share_tokens_public_read" on public.share_tokens
  for select using (true);

create policy "share_tokens_own_write" on public.share_tokens
  for insert with check (tenant_id = public.my_tenant_id());

create policy "share_tokens_own_delete" on public.share_tokens
  for delete using (tenant_id = public.my_tenant_id());

-- ── team_members ──────────────────────────────────────────────
create policy "team_members_own_tenant" on public.team_members
  for all using (tenant_id = public.my_tenant_id());
