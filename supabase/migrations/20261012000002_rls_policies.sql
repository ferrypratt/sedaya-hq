-- ==============================================================================
-- Migration: 20261012000002_rls_policies.sql
-- Description: Row Level Security (RLS) policies for all tables
-- ==============================================================================

-- Helper function to check if the current user is a leader
create or replace function public.is_leader()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'leader'
  );
$$ language sql security definer;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.unit_snapshots enable row level security;
alter table public.kos_snapshots enable row level security;
alter table public.channels enable row level security;
alter table public.channel_insights enable row level security;
alter table public.daily_activities enable row level security;
alter table public.marketing_plans enable row level security;
alter table public.plan_items enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_items enable row level security;
alter table public.content_items enable row level security;
alter table public.events enable row level security;
alter table public.sales_support_requests enable row level security;
alter table public.sosialisasi_assists enable row level security;
alter table public.marketing_props enable row level security;
alter table public.report_runs enable row level security;

-- ==============================================================================
-- 1. READ POLICIES (All authenticated users can read all tables)
-- ==============================================================================
create policy "Authenticated users can read profiles" on public.profiles for select to authenticated using (true);
create policy "Authenticated users can read projects" on public.projects for select to authenticated using (true);
create policy "Authenticated users can read unit_snapshots" on public.unit_snapshots for select to authenticated using (true);
create policy "Authenticated users can read kos_snapshots" on public.kos_snapshots for select to authenticated using (true);
create table if not exists dummy_placeholder; drop table if exists dummy_placeholder;
create policy "Authenticated users can read channels" on public.channels for select to authenticated using (true);
create policy "Authenticated users can read channel_insights" on public.channel_insights for select to authenticated using (true);
create policy "Authenticated users can read daily_activities" on public.daily_activities for select to authenticated using (true);
create policy "Authenticated users can read marketing_plans" on public.marketing_plans for select to authenticated using (true);
create policy "Authenticated users can read plan_items" on public.plan_items for select to authenticated using (true);
create policy "Authenticated users can read evaluations" on public.evaluations for select to authenticated using (true);
create policy "Authenticated users can read evaluation_items" on public.evaluation_items for select to authenticated using (true);
create policy "Authenticated users can read content_items" on public.content_items for select to authenticated using (true);
create policy "Authenticated users can read events" on public.events for select to authenticated using (true);
create policy "Authenticated users can read sales_support_requests" on public.sales_support_requests for select to authenticated using (true);
create policy "Authenticated users can read sosialisasi_assists" on public.sosialisasi_assists for select to authenticated using (true);
create policy "Authenticated users can read marketing_props" on public.marketing_props for select to authenticated using (true);
create policy "Authenticated users can read report_runs" on public.report_runs for select to authenticated using (true);

-- ==============================================================================
-- 2. WRITE POLICIES (Leader full write, Officer scoped to pic_id / created_by)
-- ==============================================================================

-- Profiles: users can update own name/position; leaders can update all
create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_leader())
  with check (id = auth.uid() or public.is_leader());

-- Master Data: Projects (Leader only)
create policy "Leaders can insert projects" on public.projects for insert to authenticated with check (public.is_leader());
create policy "Leaders can update projects" on public.projects for update to authenticated using (public.is_leader()) with check (public.is_leader());
create policy "Leaders can delete projects" on public.projects for delete to authenticated using (public.is_leader());

-- Master Data: Channels (Leader only)
create policy "Leaders can insert channels" on public.channels for insert to authenticated with check (public.is_leader());
create policy "Leaders can update channels" on public.channels for update to authenticated using (public.is_leader()) with check (public.is_leader());
create policy "Leaders can delete channels" on public.channels for delete to authenticated using (public.is_leader());

-- Inventory Snapshots: All authenticated can insert new snapshots; only Leader can update/delete
create policy "Authenticated users can insert unit_snapshots" on public.unit_snapshots for insert to authenticated with check (true);
create policy "Leaders can update unit_snapshots" on public.unit_snapshots for update to authenticated using (public.is_leader()) with check (public.is_leader());
create policy "Leaders can delete unit_snapshots" on public.unit_snapshots for delete to authenticated using (public.is_leader());

create policy "Authenticated users can insert kos_snapshots" on public.kos_snapshots for insert to authenticated with check (true);
create policy "Leaders can update kos_snapshots" on public.kos_snapshots for update to authenticated using (public.is_leader()) with check (public.is_leader());
create policy "Leaders can delete kos_snapshots" on public.kos_snapshots for delete to authenticated using (public.is_leader());

-- Daily Activities: pic_id = auth.uid() or Leader
create policy "Users can insert daily_activities" on public.daily_activities
  for insert to authenticated
  with check (pic_id = auth.uid() or public.is_leader());

create policy "Users can update daily_activities" on public.daily_activities
  for update to authenticated
  using (pic_id = auth.uid() or public.is_leader())
  with check (
    -- Non-leaders cannot modify leader_note
    (public.is_leader()) or (
      pic_id = auth.uid() and (
        leader_note is not distinct from (select da.leader_note from public.daily_activities da where da.id = daily_activities.id)
      )
    )
  );

create policy "Users can delete daily_activities" on public.daily_activities
  for delete to authenticated
  using (pic_id = auth.uid() or public.is_leader());

-- Marketing Plans & Plan Items
create policy "Users can insert marketing_plans" on public.marketing_plans for insert to authenticated with check (created_by = auth.uid() or public.is_leader());
create policy "Users can update marketing_plans" on public.marketing_plans for update to authenticated using (created_by = auth.uid() or public.is_leader()) with check (created_by = auth.uid() or public.is_leader());
create policy "Leaders can delete marketing_plans" on public.marketing_plans for delete to authenticated using (public.is_leader());

create policy "Users can insert plan_items" on public.plan_items for insert to authenticated with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can update plan_items" on public.plan_items for update to authenticated using (pic_id = auth.uid() or public.is_leader()) with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can delete plan_items" on public.plan_items for delete to authenticated using (pic_id = auth.uid() or public.is_leader());

-- Evaluations & Evaluation Items
create policy "Users can insert evaluations" on public.evaluations for insert to authenticated with check (created_by = auth.uid() or public.is_leader());
create policy "Users can update evaluations" on public.evaluations for update to authenticated using (created_by = auth.uid() or public.is_leader()) with check (created_by = auth.uid() or public.is_leader());
create policy "Leaders can delete evaluations" on public.evaluations for delete to authenticated using (public.is_leader());

create policy "Users can insert evaluation_items" on public.evaluation_items for insert to authenticated with check (true);
create policy "Users can update evaluation_items" on public.evaluation_items for update to authenticated using (true) with check (true);
create policy "Leaders can delete evaluation_items" on public.evaluation_items for delete to authenticated using (public.is_leader());

-- Content Items: pic_id = auth.uid() or Leader
create policy "Users can insert content_items" on public.content_items for insert to authenticated with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can update content_items" on public.content_items for update to authenticated using (pic_id = auth.uid() or public.is_leader()) with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can delete content_items" on public.content_items for delete to authenticated using (pic_id = auth.uid() or public.is_leader());

-- Channel Insights
create policy "Authenticated can insert channel_insights" on public.channel_insights for insert to authenticated with check (true);
create policy "Leaders can update channel_insights" on public.channel_insights for update to authenticated using (public.is_leader()) with check (public.is_leader());
create policy "Leaders can delete channel_insights" on public.channel_insights for delete to authenticated using (public.is_leader());

-- Events: pic_id = auth.uid() or Leader
create policy "Users can insert events" on public.events for insert to authenticated with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can update events" on public.events for update to authenticated using (pic_id = auth.uid() or public.is_leader()) with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can delete events" on public.events for delete to authenticated using (pic_id = auth.uid() or public.is_leader());

-- Sales Support Requests
create policy "Users can insert sales_support_requests" on public.sales_support_requests for insert to authenticated with check (true);
create policy "Users can update sales_support_requests" on public.sales_support_requests for update to authenticated using (pic_id = auth.uid() or public.is_leader()) with check (pic_id = auth.uid() or public.is_leader());
create policy "Leaders can delete sales_support_requests" on public.sales_support_requests for delete to authenticated using (public.is_leader());

-- Sosialisasi Assists: pic_id = auth.uid() or Leader
create policy "Users can insert sosialisasi_assists" on public.sosialisasi_assists for insert to authenticated with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can update sosialisasi_assists" on public.sosialisasi_assists for update to authenticated using (pic_id = auth.uid() or public.is_leader()) with check (pic_id = auth.uid() or public.is_leader());
create policy "Users can delete sosialisasi_assists" on public.sosialisasi_assists for delete to authenticated using (pic_id = auth.uid() or public.is_leader());

-- Marketing Props: pic_id = auth.uid() or Leader
create policy "Users can insert marketing_props" on public.marketing_props for insert to authenticated with check (true);
create policy "Users can update marketing_props" on public.marketing_props for update to authenticated using (pic_id = auth.uid() or public.is_leader()) with check (pic_id = auth.uid() or public.is_leader());
create policy "Leaders can delete marketing_props" on public.marketing_props for delete to authenticated using (public.is_leader());

-- Report Runs
create policy "Users can insert report_runs" on public.report_runs for insert to authenticated with check (generated_by = auth.uid());
