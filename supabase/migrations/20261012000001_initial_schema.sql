-- ==============================================================================
-- Migration: 20261012000001_initial_schema.sql
-- Description: Core schema for Sedaya Property Marketing Operations Web App
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'officer' check (role in ('leader', 'officer')),
  position text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PROJECTS TABLE
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  location text not null,
  kind text not null check (kind in ('active_project', 'business_unit', 'upcoming')),
  unit_label text not null default 'unit' check (unit_label in ('unit', 'kamar')),
  total_units integer not null,
  breakdown jsonb,
  instagram_handle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. UNIT SNAPSHOTS (Housing Inventory)
create table if not exists public.unit_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  snapshot_date date not null default current_date,
  belum_terjual integer not null default 0,
  booking integer not null default 0,
  sp3k integer not null default 0,
  akad_kredit integer not null default 0,
  cash_keras integer not null default 0,
  hold_manajemen integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. KOS SNAPSHOTS (CozyKOS Inventory)
create table if not exists public.kos_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  snapshot_date date not null default current_date,
  terisi integer not null default 0,
  belum_terisi integer not null default 0,
  booking_hold integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. CHANNELS TABLE
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'website', 'google_maps', 'youtube', 'tiktok')),
  kind text not null check (kind in ('corporate', 'project', 'business_unit', 'office', 'gallery')),
  name text not null,
  handle text,
  url text,
  project_id uuid references public.projects(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. CHANNEL INSIGHTS TABLE
create table if not exists public.channel_insights (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  period_type text not null check (period_type in ('7d', '30d')),
  period_start date not null,
  period_end date not null,
  metric_key text not null,
  value numeric not null default 0,
  source text not null default 'manual' check (source in ('import', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_channel_insight unique (channel_id, period_type, period_end, metric_key)
);

-- 7. DAILY ACTIVITIES TABLE
create table if not exists public.daily_activities (
  id uuid primary key default gen_random_uuid(),
  activity_date date not null default current_date,
  pic_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in (
    'content_production', 'design', 'social_posting', 'community_management',
    'seo_website', 'google_maps', 'reporting_monitoring', 'event',
    'offline_production', 'sales_support', 'sosialisasi', 'meeting',
    'research', 'other'
  )),
  project_id uuid references public.projects(id) on delete set null,
  channel_id uuid references public.channels(id) on delete set null,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done', 'blocked', 'carried_over')),
  duration_minutes integer,
  output_url text,
  notes text,
  leader_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. MARKETING PLANS TABLE
create table if not exists public.marketing_plans (
  id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  title text not null,
  objective text,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. PLAN ITEMS TABLE
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.marketing_plans(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  pic_id uuid not null references public.profiles(id) on delete cascade,
  scope text not null default 'online' check (scope in ('online', 'offline')),
  target_metric text,
  target_value text,
  due_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done', 'blocked', 'carried_over')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. EVALUATIONS TABLE
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  period_type text not null check (period_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  plan_id uuid references public.marketing_plans(id) on delete set null,
  summary text,
  wins text,
  issues text,
  learnings text,
  next_actions text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. EVALUATION ITEMS TABLE
create table if not exists public.evaluation_items (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations(id) on delete cascade,
  plan_item_id uuid references public.plan_items(id) on delete set null,
  target_value text,
  actual_value text,
  status text not null default 'completed',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. CONTENT ITEMS TABLE
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  publish_date date not null,
  publish_time time,
  channel_id uuid not null references public.channels(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  pillar text not null check (pillar in (
    'product_info', 'promo', 'testimonial', 'progress_update',
    'edu_kpr', 'lifestyle_lokasi', 'event', 'brand', 'other'
  )),
  format text not null check (format in (
    'reel', 'carousel', 'single_post', 'story', 'video', 'short', 'article'
  )),
  title text not null,
  brief text,
  caption text,
  status text not null default 'idea' check (status in ('idea', 'in_production', 'review', 'scheduled', 'published', 'cancelled')),
  pic_id uuid not null references public.profiles(id) on delete cascade,
  post_url text,
  assets_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 13. OFFLINE EVENTS TABLE
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null check (event_type in ('weekly', 'monthly', 'special')),
  event_date date not null,
  start_time time,
  end_time time,
  location text not null,
  project_id uuid references public.projects(id) on delete set null,
  objective text,
  budget_planned numeric default 0,
  budget_actual numeric default 0,
  target_visitors integer default 0,
  actual_visitors integer default 0,
  leads integer default 0,
  bookings integer default 0,
  status text not null default 'planned' check (status in ('planned', 'prepared', 'done', 'cancelled')),
  pic_id uuid not null references public.profiles(id) on delete cascade,
  documentation_url text,
  evaluation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. SALES SUPPORT REQUESTS TABLE
create table if not exists public.sales_support_requests (
  id uuid primary key default gen_random_uuid(),
  request_date date not null default current_date,
  requested_by text not null,
  project_id uuid references public.projects(id) on delete set null,
  request_type text not null check (request_type in ('konten_promo', 'brosur', 'price_list', 'video', 'foto_unit', 'template_wa', 'other')),
  description text,
  due_date date,
  status text not null default 'requested' check (status in ('requested', 'in_progress', 'delivered', 'revision')),
  pic_id uuid references public.profiles(id) on delete set null,
  output_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 15. SOSIALISASI ASSISTS TABLE
create table if not exists public.sosialisasi_assists (
  id uuid primary key default gen_random_uuid(),
  activity_date date not null default current_date,
  location text not null,
  institution text not null,
  project_id uuid references public.projects(id) on delete set null,
  expected_attendees integer default 0,
  actual_attendees integer default 0,
  support_provided text,
  outcome text,
  status text not null default 'planned',
  pic_id uuid not null references public.profiles(id) on delete cascade,
  documentation_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 16. MARKETING PROPS TABLE
create table if not exists public.marketing_props (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('baliho', 'banner', 'spanduk', 'umbul_umbul', 'flyer', 'brosur', 'x_banner', 'signage', 'other')),
  project_id uuid references public.projects(id) on delete set null,
  is_revitalization boolean not null default false,
  location_description text,
  quantity integer not null default 1,
  size text,
  vendor text,
  cost numeric default 0,
  status text not null default 'needed' check (status in ('needed', 'design', 'proofing', 'printing', 'ready', 'installed', 'needs_replacement')),
  design_url text,
  install_date date,
  condition_note text,
  pic_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 17. REPORT RUNS TABLE
create table if not exists public.report_runs (
  id uuid primary key default gen_random_uuid(),
  report_type text not null check (report_type in ('weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  generated_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
create index if not exists idx_unit_snapshots_project on public.unit_snapshots(project_id, snapshot_date desc);
create index if not exists idx_kos_snapshots_project on public.kos_snapshots(project_id, snapshot_date desc);
create index if not exists idx_daily_activities_date on public.daily_activities(activity_date desc);
create index if not exists idx_daily_activities_pic on public.daily_activities(pic_id);
create index if not exists idx_daily_activities_project on public.daily_activities(project_id);
create index if not exists idx_daily_activities_channel on public.daily_activities(channel_id);
create index if not exists idx_plan_items_plan on public.plan_items(plan_id);
create index if not exists idx_plan_items_pic on public.plan_items(pic_id);
create index if not exists idx_content_items_date on public.content_items(publish_date desc);
create index if not exists idx_content_items_channel on public.content_items(channel_id);
create index if not exists idx_content_items_pic on public.content_items(pic_id);
create index if not exists idx_channel_insights_lookup on public.channel_insights(channel_id, period_type, period_end desc);
create index if not exists idx_events_date on public.events(event_date desc);
create index if not exists idx_sales_support_pic on public.sales_support_requests(pic_id);
create index if not exists idx_props_project on public.marketing_props(project_id);
