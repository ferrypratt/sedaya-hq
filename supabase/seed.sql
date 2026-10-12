-- ==============================================================================
-- Seed Data: Sedaya Property Marketing & Operations
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES UPGRADE SNIPPET (Run this AFTER creating users in Supabase Auth):
-- ------------------------------------------------------------------------------
-- -- Ferry (Leader):
-- update public.profiles
-- set role = 'leader', position = 'Supervisor / Leader', full_name = 'Ferry Pratama'
-- where id in (select id from auth.users where email ilike '%ferry%@sedayagroup.id');
--
-- -- Ziyad (Officer):
-- update public.profiles
-- set role = 'officer', position = 'Sr. Branding Officer', full_name = 'Ziyad'
-- where id in (select id from auth.users where email ilike '%ziyad%@sedayagroup.id');
--
-- -- Shella (Officer):
-- update public.profiles
-- set role = 'officer', position = 'Jr. Branding Officer', full_name = 'Shella'
-- where id in (select id from auth.users where email ilike '%shella%@sedayagroup.id');

-- ------------------------------------------------------------------------------
-- 2. PROJECTS (Active Projects, Business Unit, Upcoming)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. INVENTORY SNAPSHOTS (as of 2026-10-12)
-- ------------------------------------------------------------------------------
-- Remove prior seed snapshots for this date to prevent duplicate records on re-run:
delete from public.unit_snapshots where snapshot_date = '2026-10-12';
delete from public.kos_snapshots where snapshot_date = '2026-10-12';

-- Grand Sevilla: 23 / 11 / 4 / 46 / 2 / 18 (sum = 104, unallocated = 0)
insert into public.unit_snapshots (project_id, snapshot_date, belum_terjual, booking, sp3k, akad_kredit, cash_keras, hold_manajemen)
values ('11111111-1111-1111-1111-111111111101', '2026-10-12', 23, 11, 4, 46, 2, 18);

-- Grand Lestari: 26 / 11 / 3 / 23 / 6 / 84 (sum = 153, unallocated = 0)
insert into public.unit_snapshots (project_id, snapshot_date, belum_terjual, booking, sp3k, akad_kredit, cash_keras, hold_manajemen)
values ('11111111-1111-1111-1111-111111111102', '2026-10-12', 26, 11, 3, 23, 6, 84);

-- Harmony Hills: 23 / 4 / 1 / 10 / 0 / 0 (sum = 38, unallocated = 0)
insert into public.unit_snapshots (project_id, snapshot_date, belum_terjual, booking, sp3k, akad_kredit, cash_keras, hold_manajemen)
values ('11111111-1111-1111-1111-111111111103', '2026-10-12', 23, 4, 1, 10, 0, 0);

-- Setia Residence: 21 / 4 / 7 / 0 / 0 / 0 (sum = 32, unallocated = 0)
insert into public.unit_snapshots (project_id, snapshot_date, belum_terjual, booking, sp3k, akad_kredit, cash_keras, hold_manajemen)
values ('11111111-1111-1111-1111-111111111104', '2026-10-12', 21, 4, 7, 0, 0, 0);

-- Samudera Residence: 15 / 10 / 2 / 18 / 0 / 13 (sum = 58, unallocated = 3 -> do NOT alter)
insert into public.unit_snapshots (project_id, snapshot_date, belum_terjual, booking, sp3k, akad_kredit, cash_keras, hold_manajemen)
values ('11111111-1111-1111-1111-111111111105', '2026-10-12', 15, 10, 2, 18, 0, 13);

-- CozyKOS Snapshot: terisi 23, belum_terisi 22, booking_hold 4 (sum = 49)
insert into public.kos_snapshots (project_id, snapshot_date, terisi, belum_terisi, booking_hold)
values ('11111111-1111-1111-1111-111111111106', '2026-10-12', 23, 22, 4);

-- ------------------------------------------------------------------------------
-- 4. CHANNELS REGISTRY
-- ------------------------------------------------------------------------------
insert into public.channels (id, platform, kind, name, handle, url, project_id, active)
values
  ('22222222-2222-2222-2222-222222222201', 'instagram', 'corporate', 'Sedaya Property Corporate', 'property_sedaya', 'https://instagram.com/property_sedaya', null, true),
  ('22222222-2222-2222-2222-222222222202', 'instagram', 'project', 'Grand Sevilla Instagram', 'sedaya_grandsevilla', 'https://instagram.com/sedaya_grandsevilla', '11111111-1111-1111-1111-111111111101', true),
  ('22222222-2222-2222-2222-222222222203', 'instagram', 'project', 'Grand Lestari Instagram', 'sedaya_grandlestari', 'https://instagram.com/sedaya_grandlestari', '11111111-1111-1111-1111-111111111102', true),
  ('22222222-2222-2222-2222-222222222204', 'instagram', 'project', 'Harmony Hills Instagram', 'sedaya_harmonyhills', 'https://instagram.com/sedaya_harmonyhills', '11111111-1111-1111-1111-111111111103', true),
  ('22222222-2222-2222-2222-222222222205', 'instagram', 'project', 'Setia Residence Instagram', 'sedaya_setiaresidence', 'https://instagram.com/sedaya_setiaresidence', '11111111-1111-1111-1111-111111111104', true),
  ('22222222-2222-2222-2222-222222222206', 'instagram', 'project', 'Samudera Residence Instagram', 'sedaya_samuderaresidence', 'https://instagram.com/sedaya_samuderaresidence', '11111111-1111-1111-1111-111111111105', true),
  ('22222222-2222-2222-2222-222222222207', 'instagram', 'project', 'Harmony Palace Instagram', 'sedaya_harmonypalace', 'https://instagram.com/sedaya_harmonypalace', '11111111-1111-1111-1111-111111111108', true),
  ('22222222-2222-2222-2222-222222222208', 'instagram', 'business_unit', 'CozyKOS Instagram', 'cozykos_sedaya', 'https://instagram.com/cozykos_sedaya', '11111111-1111-1111-1111-111111111106', true),
  ('22222222-2222-2222-2222-222222222209', 'website', 'corporate', 'Sedaya Group Portal', null, 'https://sedayagroup.id', null, true),
  ('22222222-2222-2222-2222-222222222210', 'website', 'business_unit', 'CozyKOS Website', null, 'https://cozykos.sedayagroup.id', '11111111-1111-1111-1111-111111111106', true),
  ('22222222-2222-2222-2222-222222222211', 'youtube', 'corporate', 'Property Sedaya YouTube', '@property_sedaya', 'https://www.youtube.com/@property_sedaya/', null, true),
  ('22222222-2222-2222-2222-222222222212', 'tiktok', 'corporate', 'Sedaya Property TikTok', '@sedayaproperty', 'https://tiktok.com/@sedayaproperty', null, true),
  ('22222222-2222-2222-2222-222222222213', 'google_maps', 'office', 'Sedaya Property Office', null, 'https://maps.app.goo.gl/aYhjKMA2dQvs4dHb8', null, true),
  ('22222222-2222-2222-2222-222222222214', 'google_maps', 'gallery', 'Marketing Gallery Sedaya Property', null, 'https://maps.app.goo.gl/mGg7PDxFf3LwP8FV7', null, true),
  ('22222222-2222-2222-2222-222222222215', 'google_maps', 'project', 'Grand Sevilla (Gmaps)', null, 'https://maps.app.goo.gl/sVtGFY4sLeYMW5Mu8', '11111111-1111-1111-1111-111111111101', true),
  ('22222222-2222-2222-2222-222222222216', 'google_maps', 'project', 'Grand Lestari (Gmaps)', null, 'https://maps.app.goo.gl/ppAdZ6CMidrc4GYW6', '11111111-1111-1111-1111-111111111102', true),
  ('22222222-2222-2222-2222-222222222217', 'google_maps', 'project', 'Harmony Hills (Gmaps)', null, 'https://maps.app.goo.gl/KW7zK6ocmAQMqMoHA', '11111111-1111-1111-1111-111111111103', true),
  ('22222222-2222-2222-2222-222222222218', 'google_maps', 'project', 'Setia Residence (Gmaps)', null, 'https://maps.app.goo.gl/qCz5wP6Ryz3JEwbB8', '11111111-1111-1111-1111-111111111104', true),
  ('22222222-2222-2222-2222-222222222219', 'google_maps', 'project', 'Samudera Residence (Gmaps)', null, 'https://maps.app.goo.gl/cNArgzKPRecE1WL49', '11111111-1111-1111-1111-111111111105', true)
on conflict (id) do update set
  platform = excluded.platform,
  kind = excluded.kind,
  name = excluded.name,
  handle = excluded.handle,
  url = excluded.url,
  project_id = excluded.project_id,
  active = excluded.active;
