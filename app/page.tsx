'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import {
  INITIAL_PROJECTS,
  INITIAL_UNIT_SNAPSHOTS,
  INITIAL_ACTIVITIES,
} from '@/lib/data/seed-data';
import {
  INITIAL_MARKETING_PLANS,
  INITIAL_CONTENT_ITEMS,
} from '@/lib/data/seed-plans-content';
import { INITIAL_CHANNEL_INSIGHTS } from '@/lib/data/seed-channels';
import { InstagramIcon, TikTokIcon } from '@/components/shared/icons';
import {
  Building2,
  CalendarCheck,
  Target,
  Share2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Globe,
  MapPin,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const activeHousingProjects = INITIAL_PROJECTS.filter(
    (p) => p.kind === 'active_project'
  );

  // Active weekly plan
  const activePlan = INITIAL_MARKETING_PLANS.find(
    (p) => p.period_type === 'weekly' && p.status === 'active'
  ) || INITIAL_MARKETING_PLANS[0];

  const planItems = activePlan?.items || [];
  const completedPlanItems = planItems.filter((i) => i.status === 'done').length;
  const planProgressPct =
    planItems.length > 0 ? Math.round((completedPlanItems / planItems.length) * 100) : 0;

  // Activities for today
  const todayActivities = INITIAL_ACTIVITIES;
  const activitiesByFerry = todayActivities.filter((a) => a.pic?.full_name.includes('Ferry'));
  const activitiesByZiyad = todayActivities.filter((a) => a.pic?.full_name.includes('Ziyad'));

  // Content due this week
  const upcomingContent = INITIAL_CONTENT_ITEMS.slice(0, 4);

  // Quick 7d metrics
  const get7dMetric = (channelId: string, metricKey: string) => {
    return (
      INITIAL_CHANNEL_INSIGHTS.find(
        (ci) =>
          ci.channel_id === channelId &&
          ci.period_type === '7d' &&
          ci.period_start === '2026-10-05' &&
          ci.metric_key === metricKey
      )?.value ?? 0
    );
  };

  const sevillaReach = get7dMetric('22222222-2222-2222-2222-222222222202', 'reach');
  const webSessions = get7dMetric('22222222-2222-2222-2222-222222222209', 'sessions');
  const mapsViews = get7dMetric('22222222-2222-2222-2222-222222222213', 'profile_views');
  const tiktokViews = get7dMetric('22222222-2222-2222-2222-222222222212', 'video_views');

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-warm-cream border border-sand-border text-xs text-stone-gray font-medium mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Operasional Aktif • Medan & Deli Serdang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Dashboard Operasional
            </h1>
            <p className="text-xs sm:text-sm text-stone-gray mt-0.5">
              Divisi Branding, Marketing & Research — PT Sedaya Property
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Link
              href="/activities"
              className="px-4 py-2 text-xs font-semibold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>+ Catat Aktivitas</span>
            </Link>
            <Link
              href="/reports"
              className="px-4 py-2 text-xs font-semibold text-ink-black bg-paper-white border border-sand-border rounded-full hover:bg-stone-50 transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-violet-pulse" />
              <span>Generate Laporan</span>
            </Link>
          </div>
        </div>

        {/* Attention Alert Banner (Unallocated warning for Samudera Residence) */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-950">
            <span className="font-extrabold text-sm block mb-0.5">
              Pemberitahuan Rekonsiliasi Inventaris:
            </span>
            <span>
              Terdapat <strong>3 unit belum teralokasi (Unallocated)</strong> pada proyek{' '}
              <strong>Samudera Residence</strong> (Total: 61 unit, Tercatat snapshot: 58 unit). Mohon lakukan rekonsiliasi data master dengan tim legal / administrasi bank BTN.
            </span>
          </div>
          <Link
            href="/projects/samudera-residence"
            className="px-3 py-1 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-full shrink-0"
          >
            Buka Proyek
          </Link>
        </div>

        {/* 7d Digital Highlights Row */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold text-ink-black tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-pulse" />
              <span>Highlight Performa Saluran Digital (7 Hari Terakhir)</span>
            </h2>
            <Link
              href="/channels"
              className="text-xs font-semibold text-stone-gray hover:text-ink-black flex items-center gap-1"
            >
              <span>Lihat Semua Saluran</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-gray mb-1.5">
                <span className="font-semibold uppercase tracking-wider">IG Sevilla Reach</span>
                <div className="p-1 rounded-md bg-pink-50 text-pink-600">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-ink-black font-mono">
                {sevillaReach.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+21.4% vs mgg lalu</span>
              </div>
            </div>

            <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-gray mb-1.5">
                <span className="font-semibold uppercase tracking-wider">Web Portal Sessions</span>
                <div className="p-1 rounded-md bg-blue-50 text-blue-600">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-ink-black font-mono">
                {webSessions.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+14.8% vs mgg lalu</span>
              </div>
            </div>

            <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-gray mb-1.5">
                <span className="font-semibold uppercase tracking-wider">Maps Office Views</span>
                <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-ink-black font-mono">
                {mapsViews.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+13.6% vs mgg lalu</span>
              </div>
            </div>

            <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-stone-gray mb-1.5">
                <span className="font-semibold uppercase tracking-wider">TikTok Video Views</span>
                <div className="p-1 rounded-md bg-stone-100 text-ink-black">
                  <TikTokIcon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-ink-black font-mono">
                {tiktokViews.toLocaleString('id-ID')}
              </div>
              <div className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+18.6% vs mgg lalu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Unit Funnel Summary Strip */}
        <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-ink-black tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-pulse" />
                <span>Ringkasan Funnel Stok Unit Perumahan Subsidi</span>
              </h2>
              <p className="text-xs text-stone-gray mt-0.5">
                Posisi inventaris real-time berdasarkan snapshot terbaru.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-violet-pulse hover:underline flex items-center gap-1"
            >
              <span>Detail Proyek</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeHousingProjects.map((project) => {
              const snapshots = INITIAL_UNIT_SNAPSHOTS[project.id] || [];
              const latest = snapshots[0];
              const totalAllocated = latest
                ? latest.belum_terjual +
                  latest.booking +
                  latest.sp3k +
                  latest.akad_kredit +
                  latest.cash_keras +
                  latest.hold_manajemen
                : 0;
              const unallocated = project.total_units - totalAllocated;

              return (
                <div
                  key={project.id}
                  className="bg-warm-cream/50 border border-sand-border rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-sm text-ink-black">{project.name}</h3>
                      <span className="font-mono text-xs font-bold text-stone-700">
                        {project.total_units} unit
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-gray block mb-3">
                      Lokasi: {project.location}
                    </span>

                    {/* Funnel counters grid */}
                    {latest && (
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] mb-3">
                        <div className="p-1.5 bg-paper-white rounded-lg border border-sand-border text-center">
                          <span className="text-[10px] text-stone-500 block">Belum Terjual</span>
                          <strong className="font-mono text-ink-black">{latest.belum_terjual}</strong>
                        </div>
                        <div className="p-1.5 bg-paper-white rounded-lg border border-sand-border text-center">
                          <span className="text-[10px] text-amber-700 block">Booking</span>
                          <strong className="font-mono text-amber-900">{latest.booking}</strong>
                        </div>
                        <div className="p-1.5 bg-paper-white rounded-lg border border-sand-border text-center">
                          <span className="text-[10px] text-blue-700 block">SP3K</span>
                          <strong className="font-mono text-blue-900">{latest.sp3k}</strong>
                        </div>
                        <div className="p-1.5 bg-paper-white rounded-lg border border-sand-border text-center">
                          <span className="text-[10px] text-emerald-700 block">Akad</span>
                          <strong className="font-mono text-emerald-900">{latest.akad_kredit}</strong>
                        </div>
                        <div className="p-1.5 bg-paper-white rounded-lg border border-sand-border text-center">
                          <span className="text-[10px] text-stone-600 block">Cash</span>
                          <strong className="font-mono text-stone-900">{latest.cash_keras}</strong>
                        </div>
                        <div className="p-1.5 bg-paper-white rounded-lg border border-sand-border text-center">
                          <span className="text-[10px] text-purple-700 block">Hold</span>
                          <strong className="font-mono text-purple-900">{latest.hold_manajemen}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Unallocated indicator */}
                  <div className="pt-2 border-t border-sand-border flex items-center justify-between text-xs">
                    <span className="text-stone-gray">Unallocated:</span>
                    {unallocated !== 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        {unallocated} unit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        0 (Balance)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2-Column: Current Week Marketing Plan & Today's Activities by PIC */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Week Marketing Plan */}
          <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-pulse" />
                  <h2 className="text-base font-extrabold text-ink-black tracking-tight">
                    Rencana Mingguan Berjalan
                  </h2>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Aktif
                </span>
              </div>

              {activePlan && (
                <div>
                  <h3 className="font-bold text-sm text-ink-black">{activePlan.title}</h3>
                  <p className="text-xs text-stone-gray mt-1 leading-relaxed">
                    {activePlan.objective}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-4 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-stone-gray">Progres Target Mingguan</span>
                      <span className="font-mono text-ink-black font-bold">{planProgressPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-warm-cream rounded-full overflow-hidden border border-sand-border">
                      <div
                        className="h-full bg-ink-black rounded-full transition-all"
                        style={{ width: `${planProgressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Plan Items checklist */}
                  <div className="space-y-2">
                    {planItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-warm-cream/50 border border-sand-border flex items-start justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-ink-black block truncate">{item.title}</span>
                          <span className="text-[11px] text-stone-500">
                            PIC: {item.pic?.full_name} • Batas: {item.due_date}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            item.status === 'done'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-sand-border text-right">
              <Link
                href="/plans"
                className="text-xs font-semibold text-violet-pulse hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Seluruh Rencana & Evaluasi</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Today's Activities by PIC (Ferry & Ziyad) */}
          <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-violet-pulse" />
                  <h2 className="text-base font-extrabold text-ink-black tracking-tight">
                    Aktivitas Hari Ini per PIC
                  </h2>
                </div>
                <span className="text-xs text-stone-gray font-medium">12 Oktober 2026</span>
              </div>

              {/* PIC: Ferry Pratama */}
              <div className="mb-4">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-sand-border/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-pulse" />
                    <span className="text-xs font-bold text-ink-black">Ferry Pratama</span>
                    <span className="text-[10px] text-stone-400 font-semibold">(Leader)</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    {activitiesByFerry.length} Aktivitas
                  </span>
                </div>

                <div className="space-y-1.5">
                  {activitiesByFerry.map((act) => (
                    <div
                      key={act.id}
                      className="p-2 rounded-xl bg-warm-cream/40 border border-sand-border text-xs flex items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-ink-black truncate">{act.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIC: Ziyad */}
              <div>
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-sand-border/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-ink-black">Ziyad</span>
                    <span className="text-[10px] text-stone-400 font-semibold">(Sr. Officer)</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    {activitiesByZiyad.length} Aktivitas
                  </span>
                </div>

                <div className="space-y-1.5">
                  {activitiesByZiyad.map((act) => (
                    <div
                      key={act.id}
                      className="p-2 rounded-xl bg-warm-cream/40 border border-sand-border text-xs flex items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-ink-black truncate">{act.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          act.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : act.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-sand-border text-right">
              <Link
                href="/activities"
                className="text-xs font-semibold text-violet-pulse hover:underline inline-flex items-center gap-1"
              >
                <span>Kelola Aktivitas Harian</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Content Due This Week Strip */}
        <div className="bg-paper-white border border-sand-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-ink-black tracking-tight flex items-center gap-2">
                <Share2 className="w-4 h-4 text-violet-pulse" />
                <span>Jadwal Konten Publikasi Pekan Ini</span>
              </h2>
              <p className="text-xs text-stone-gray mt-0.5">
                Rencana konten reels, carousel edukasi KPR, dan update pembangunan.
              </p>
            </div>
            <Link
              href="/content"
              className="text-xs font-semibold text-violet-pulse hover:underline flex items-center gap-1"
            >
              <span>Kalender Editorial</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcomingContent.map((content) => (
              <div
                key={content.id}
                className="p-3.5 rounded-xl bg-warm-cream/50 border border-sand-border flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-gray mb-1.5">
                    <span className="font-semibold text-violet-pulse uppercase text-[10px] tracking-wider">
                      {content.format}
                    </span>
                    <span className="font-mono text-[11px]">{content.publish_date}</span>
                  </div>
                  <h4 className="font-bold text-xs text-ink-black line-clamp-2 mb-2">
                    {content.title}
                  </h4>
                </div>
                <div className="pt-2 border-t border-sand-border/70 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500 font-mono truncate">{content.channel?.handle}</span>
                  <span className="font-bold text-stone-700 capitalize">{content.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
