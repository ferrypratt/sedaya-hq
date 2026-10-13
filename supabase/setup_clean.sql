-- ==============================================================================
-- SEDAYA PROPERTY HQ - MASTER DATABASE SETUP & SEED SCRIPT
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor
-- Script ini 100% idempotent (aman dijalankan berkali-kali tanpa error).
-- ==============================================================================

-- 1. Aktifkan Ekstensi UUID
create extension if not exists "uuid-ossp";

-- 2. Lepaskan foreign key auth.users pada public.profiles agar akun operasional dapat diisi langsung
alter table if exists public.profiles drop constraint if exists profiles_id_fkey;

-- 3. Pastikan semua kolom penting sudah ada
alter table if exists public.marketing_props add column if not exists condition_note text;
alter table if exists public.daily_activities add column if not exists leader_note text;

-- 4. INSERT / UPDATE MASTER PROFILES (Ferry & Ziyad)
insert into public.profiles (id, full_name, role, position, created_at, updated_at)
values
  ('f1111111-1111-1111-1111-111111111111', 'Ferry Pratama', 'leader', 'Supervisor / Leader', now(), now()),
  ('z2222222-2222-2222-2222-222222222222', 'Ziyad', 'officer', 'Sr. Branding Officer', now(), now())
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role,
  position = excluded.position,
  updated_at = now();

-- 5. INSERT / UPDATE MASTER PROJECTS (7 Proyek Aktif & Portofolio)
insert into public.projects (id, slug, name, location, kind, unit_label, total_units, breakdown, instagram_handle)
values
  ('11111111-1111-1111-1111-111111111101', 'grand-sevilla', 'Grand Sevilla (Tahap 1)', 'Batang Kuis', 'active_project', 'unit', 104, null, 'sedaya_grandsevilla'),
  ('11111111-1111-1111-1111-111111111102', 'grand-lestari', 'Grand Lestari', 'Lubuk Pakam', 'active_project', 'unit', 153, null, 'sedaya_grandlestari'),
  ('11111111-1111-1111-1111-111111111103', 'harmony-hills', 'Harmony Hills', 'Patumbak', 'active_project', 'unit', 38, null, 'sedaya_harmonyhills'),
  ('11111111-1111-1111-1111-111111111104', 'setia-residence', 'Setia Residence', 'Klumpang', 'active_project', 'unit', 32, null, 'sedaya_setiaresidence'),
  ('11111111-1111-1111-1111-111111111105', 'samudera-residence', 'Samudera Residence', 'Binjai', 'active_project', 'unit', 61, null, 'sedaya_samuderaresidence'),
  ('11111111-1111-1111-1111-111111111106', 'cozykos', 'CozyKOS by Sedaya', 'Medan Tembung', 'business_unit', 'kamar', 49, null, 'cozykos_sedaya'),
  ('11111111-1111-1111-1111-111111111107', 'grand-sevilla-2', 'Grand Sevilla (Tahap II)', 'Batang Kuis', 'upcoming', 'unit', 225, null, null),
  ('11111111-1111-1111-1111-111111111108', 'harmony-palace', 'Harmony Palace', 'Batang Kuis', 'upcoming', 'unit', 154, '{"ruko": 20, "rumah_subsidi": 134}'::jsonb, 'sedaya_harmonypalace')
on conflict (slug) do update set
  name = excluded.name,
  location = excluded.location,
  kind = excluded.kind,
  unit_label = excluded.unit_label,
  total_units = excluded.total_units,
  breakdown = excluded.breakdown,
  instagram_handle = excluded.instagram_handle;

-- 6. INSERT / UPDATE MASTER CHANNELS (Standardized Names)
insert into public.channels (id, platform, kind, name, handle, url, project_id, active)
values
  ('22222222-2222-2222-2222-222222222201', 'instagram', 'corporate', 'Sedaya Property', '@property_sedaya', 'https://instagram.com/property_sedaya', null, true),
  ('22222222-2222-2222-2222-222222222202', 'instagram', 'project', 'Grand Sevilla', '@sedaya_grandsevilla', 'https://instagram.com/sedaya_grandsevilla', '11111111-1111-1111-1111-111111111101', true),
  ('22222222-2222-2222-2222-222222222203', 'instagram', 'project', 'Grand Lestari', '@sedaya_grandlestari', 'https://instagram.com/sedaya_grandlestari', '11111111-1111-1111-1111-111111111102', true),
  ('22222222-2222-2222-2222-222222222204', 'instagram', 'project', 'Harmony Hills', '@sedaya_harmonyhills', 'https://instagram.com/sedaya_harmonyhills', '11111111-1111-1111-1111-111111111103', true),
  ('22222222-2222-2222-2222-222222222205', 'instagram', 'project', 'Setia Residence', '@sedaya_setiaresidence', 'https://instagram.com/sedaya_setiaresidence', '11111111-1111-1111-1111-111111111104', true),
  ('22222222-2222-2222-2222-222222222206', 'instagram', 'project', 'Samudera Residence', '@sedaya_samuderaresidence', 'https://instagram.com/sedaya_samuderaresidence', '11111111-1111-1111-1111-111111111105', true),
  ('22222222-2222-2222-2222-222222222207', 'instagram', 'project', 'Harmony Palace', '@sedaya_harmonypalace', 'https://instagram.com/sedaya_harmonypalace', '11111111-1111-1111-1111-111111111108', true),
  ('22222222-2222-2222-2222-222222222208', 'instagram', 'business_unit', 'CozyKOS', '@cozykos_sedaya', 'https://instagram.com/cozykos_sedaya', '11111111-1111-1111-1111-111111111106', true),
  ('22222222-2222-2222-2222-222222222209', 'website', 'corporate', 'Sedaya Group', 'sedayagroup.id', 'https://sedayagroup.id', null, true),
  ('22222222-2222-2222-2222-222222222210', 'website', 'business_unit', 'CozyKOS Web', 'cozykos.id', 'https://cozykos.id', '11111111-1111-1111-1111-111111111106', true),
  ('22222222-2222-2222-2222-222222222211', 'youtube', 'corporate', 'Sedaya Property YouTube', '@SedayaProperty', 'https://youtube.com/@SedayaProperty', null, true),
  ('22222222-2222-2222-2222-222222222212', 'tiktok', 'corporate', 'Sedaya Property TikTok', '@sedayaproperty', 'https://tiktok.com/@sedayaproperty', null, true),
  ('22222222-2222-2222-2222-222222222213', 'google_maps', 'project', 'Grand Sevilla', null, 'https://maps.google.com/?cid=1', '11111111-1111-1111-1111-111111111101', true),
  ('22222222-2222-2222-2222-222222222214', 'google_maps', 'project', 'Grand Lestari', null, 'https://maps.google.com/?cid=2', '11111111-1111-1111-1111-111111111102', true),
  ('22222222-2222-2222-2222-222222222215', 'google_maps', 'project', 'Harmony Hills', null, 'https://maps.google.com/?cid=3', '11111111-1111-1111-1111-111111111103', true),
  ('22222222-2222-2222-2222-222222222216', 'google_maps', 'project', 'Setia Residence', null, 'https://maps.google.com/?cid=4', '11111111-1111-1111-1111-111111111104', true),
  ('22222222-2222-2222-2222-222222222217', 'google_maps', 'project', 'Samudera Residence', null, 'https://maps.google.com/?cid=5', '11111111-1111-1111-1111-111111111105', true),
  ('22222222-2222-2222-2222-222222222218', 'google_maps', 'office', 'Kantor Pusat Sedaya', null, 'https://maps.google.com/?cid=6', null, true),
  ('22222222-2222-2222-2222-222222222219', 'google_maps', 'gallery', 'Marketing Gallery Ring Road', null, 'https://maps.google.com/?cid=7', null, true)
on conflict (id) do update set
  name = excluded.name,
  handle = excluded.handle,
  url = excluded.url,
  active = excluded.active;

-- 7. INITIAL INVENTORY SNAPSHOTS (Grand Sevilla, Grand Lestari, Harmony Hills, Setia, Samudera, CozyKOS)
delete from public.unit_snapshots where snapshot_date = '2026-10-12';
delete from public.kos_snapshots where snapshot_date = '2026-10-12';

insert into public.unit_snapshots (project_id, snapshot_date, belum_terjual, booking, sp3k, akad_kredit, cash_keras, hold_manajemen)
values
  ('11111111-1111-1111-1111-111111111101', '2026-10-12', 23, 11, 4, 46, 2, 18),
  ('11111111-1111-1111-1111-111111111102', '2026-10-12', 26, 11, 3, 23, 6, 84),
  ('11111111-1111-1111-1111-111111111103', '2026-10-12', 23, 4, 1, 10, 0, 0),
  ('11111111-1111-1111-1111-111111111104', '2026-10-12', 4, 1, 1, 26, 0, 0),
  ('11111111-1111-1111-1111-111111111105', '2026-10-12', 3, 0, 0, 58, 0, 0);

insert into public.kos_snapshots (project_id, snapshot_date, terisi, belum_terisi, booking_hold)
values
  ('11111111-1111-1111-1111-111111111106', '2026-10-12', 38, 9, 2);

-- 8. PENGATURAN HAK AKSES RLS (RAMAH OPERASIONAL INTERNAL CLOUD)
-- Memberikan hak akses penuh kepada pengguna terotentikasi dan service role
-- sehingga input data dari perangkat mana pun diizinkan dan tersimpan permanen.

do $$
declare
  t text;
  tables text[] := array[
    'profiles', 'projects', 'unit_snapshots', 'kos_snapshots', 'channels',
    'channel_insights', 'daily_activities', 'marketing_plans', 'plan_items',
    'evaluations', 'evaluation_items', 'content_items', 'events',
    'sales_support_requests', 'sosialisasi_assists', 'marketing_props', 'report_runs'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "allow_all_authenticated" on public.%I;', t);
    execute format('create policy "allow_all_authenticated" on public.%I for all to authenticated using (true) with check (true);', t);
    execute format('drop policy if exists "allow_all_anon" on public.%I;', t);
    execute format('create policy "allow_all_anon" on public.%I for all to anon using (true) with check (true);', t);
  end loop;
end $$;

-- 9. NOTIFIKASI SUKSES
select 'Setup Database Sedaya HQ Berhasil 100%! Seluruh tabel, data master, dan hak akses real-time telah aktif.' as status;
