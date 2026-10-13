'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
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
  AlertTriangle,
  CheckCircle2,
  Globe,
  MapPin,
  FileText,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const activeHousingProjects = INITIAL_PROJECTS.filter(
    (p) => p.kind === 'active_project'
  );

  // Portfolio inventory aggregation
  const projectRows = activeHousingProjects.map((project) => {
    const snapshots = INITIAL_UNIT_SNAPSHOTS[project.id] || [];
    const latest = snapshots[0];
    const belumTerjual = latest?.belum_terjual ?? 0;
    const booking = latest?.booking ?? 0;
    const sp3k = latest?.sp3k ?? 0;
    const akad = latest?.akad_kredit ?? 0;
    const cash = latest?.cash_keras ?? 0;
    const hold = latest?.hold_manajemen ?? 0;

    const totalAllocated = belumTerjual + booking + sp3k + akad + cash + hold;
    const unallocated = project.total_units - totalAllocated;
    const soldTotal = akad + cash;
    const pipelineTotal = booking + sp3k;

    return {
      project,
      belumTerjual,
      booking,
      sp3k,
      akad,
      cash,
      hold,
      totalAllocated,
      unallocated,
      soldTotal,
      pipelineTotal,
    };
  });

  const portfolioTotals = projectRows.reduce(
    (acc, row) => {
      acc.totalUnits += row.project.total_units;
      acc.sold += row.soldTotal;
      acc.pipeline += row.pipelineTotal;
      acc.available += row.belumTerjual;
      acc.hold += row.hold;
      acc.unallocated += row.unallocated;
      return acc;
    },
    { totalUnits: 0, sold: 0, pipeline: 0, available: 0, hold: 0, unallocated: 0 }
  );

  const soldPct =
    portfolioTotals.totalUnits > 0
      ? Math.round((portfolioTotals.sold / portfolioTotals.totalUnits) * 100)
      : 0;
  const pipelinePct =
    portfolioTotals.totalUnits > 0
      ? Math.round((portfolioTotals.pipeline / portfolioTotals.totalUnits) * 100)
      : 0;
  const availablePct =
    portfolioTotals.totalUnits > 0
      ? Math.round((portfolioTotals.available / portfolioTotals.totalUnits) * 100)
      : 0;

  // Active weekly plan
  const activePlan =
    INITIAL_MARKETING_PLANS.find(
      (p) => p.period_type === 'weekly' && p.status === 'active'
    ) || INITIAL_MARKETING_PLANS[0];

  const planItems = activePlan?.items || [];
  const completedPlanItems = planItems.filter((i) => i.status === 'done').length;
  const planProgressPct =
    planItems.length > 0
      ? Math.round((completedPlanItems / planItems.length) * 100)
      : 0;

  // Activities for today
  const todayActivities = INITIAL_ACTIVITIES;
  const activitiesByFerry = todayActivities.filter((a) =>
    a.pic?.full_name.includes('Ferry')
  );
  const activitiesByZiyad = todayActivities.filter((a) =>
    a.pic?.full_name.includes('Ziyad')
  );

  // Content due this week
  const upcomingContent = INITIAL_CONTENT_ITEMS.slice(0, 4);

  // 7d channel metrics (computed strictly from actual seed snapshot values, zero fabricated deltas)
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

  const todayFormatted = useSyncExternalStore(
    () => () => {},
    () =>
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    () => 'Oktober 2026'
  );

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          section="Komando Eksekutif"
          meta={<span>Medan & Deli Serdang</span>}
          title="Ikhtisar Operasional"
          description="Pantauan rekonsiliasi stok unit perumahan, performa kanal digital, dan progres kerja harian tim pemasaran PT Sedaya Property."
          actions={
            <>
              <Link href="/reports" className="btn-pill-ghost">
                <FileText className="w-3.5 h-3.5 text-stone-gray" />
                <span>Cetak Laporan</span>
              </Link>
              <Link href="/activities" className="btn-pill-primary">
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Aktivitas</span>
              </Link>
            </>
          }
        />

        {/* Section 1: Asymmetric Hero Workbench (8:4 Split) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 8 Cols: Portfolio Inventory & Reconciliation Matrix */}
          <div className="lg:col-span-8 card-clay p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ash-gray block mb-1">
                    Posisi Inventaris Portofolio (6 Proyek Perumahan)
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="metric-mono text-3xl sm:text-4xl font-bold text-ink-black">
                      {portfolioTotals.totalUnits}
                    </span>
                    <span className="text-sm font-medium text-stone-gray">
                      Total Unit Terdaftar
                    </span>
                  </div>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-pulse hover:underline"
                >
                  <span>Buka Modul Proyek</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Stacked Visual Allocation Bar */}
              <div className="space-y-2">
                <div className="h-3.5 w-full rounded-full bg-warm-cream border border-sand-border overflow-hidden flex">
                  <div
                    style={{ width: `${soldPct}%` }}
                    className="bg-ink-black h-full"
                    title={`Terjual (Akad + Cash): ${portfolioTotals.sold} unit`}
                  />
                  <div
                    style={{ width: `${pipelinePct}%` }}
                    className="bg-violet-pulse h-full"
                    title={`Proses KPR (Booking + SP3K): ${portfolioTotals.pipeline} unit`}
                  />
                  <div
                    style={{ width: `${availablePct}%` }}
                    className="bg-sand-hover h-full"
                    title={`Tersedia: ${portfolioTotals.available} unit`}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-warm-cream border border-sand-border">
                    <div className="flex items-center gap-1.5 text-xs text-stone-gray mb-1">
                      <span className="w-2 h-2 rounded-full bg-ink-black shrink-0" />
                      <span>Terjual (Akad/Cash)</span>
                    </div>
                    <span className="metric-mono text-lg font-bold text-ink-black">
                      {portfolioTotals.sold}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-warm-cream border border-sand-border">
                    <div className="flex items-center gap-1.5 text-xs text-stone-gray mb-1">
                      <span className="w-2 h-2 rounded-full bg-violet-pulse shrink-0" />
                      <span>Proses (Book/SP3K)</span>
                    </div>
                    <span className="metric-mono text-lg font-bold text-ink-black">
                      {portfolioTotals.pipeline}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-warm-cream border border-sand-border">
                    <div className="flex items-center gap-1.5 text-xs text-stone-gray mb-1">
                      <span className="w-2 h-2 rounded-full bg-sand-hover shrink-0" />
                      <span>Stok Tersedia</span>
                    </div>
                    <span className="metric-mono text-lg font-bold text-ink-black">
                      {portfolioTotals.available}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-ember-surface border border-ember-border">
                    <div className="flex items-center gap-1.5 text-xs text-ember-orange font-semibold mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Unallocated</span>
                    </div>
                    <span className="metric-mono text-lg font-bold text-ember-orange">
                      {portfolioTotals.unallocated}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Samudera Residence Reconciliation Callout */}
            {portfolioTotals.unallocated > 0 && (
              <div className="p-4 rounded-xl bg-ember-surface border border-ember-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-ember-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-ink-black leading-relaxed">
                    <strong className="font-bold text-ember-orange block sm:inline">
                      Perhatian Rekonsiliasi Samudera Residence:{' '}
                    </strong>
                    <span>
                      Terdapat <strong className="metric-mono font-bold">3 unit Unallocated</strong> (Total master: <span className="metric-mono font-semibold">61</span> unit, teralokasi pada snapshot: <span className="metric-mono font-semibold">58</span> unit). Lakukan verifikasi bersama administrasi KPR/Legal.
                    </span>
                  </div>
                </div>
                <Link
                  href="/projects/samudera-residence"
                  className="px-3.5 py-2 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:bg-slate-gray shrink-0 self-start sm:self-center"
                >
                  Rekonsiliasi Unit
                </Link>
              </div>
            )}
          </div>

          {/* Right 4 Cols: 7-Day Digital Reach Ledger (Zero Fake Deltas) */}
          <div className="lg:col-span-4 card-cream p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-sand-border">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ash-gray block">
                    Snapshot 7 Hari Terakhir
                  </span>
                  <h2 className="text-base font-bold text-ink-black mt-0.5">
                    Performa Kanal Utama
                  </h2>
                </div>
                <span className="metric-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-paper-white border border-sand-border text-stone-gray">
                  Periode 7H
                </span>
              </div>

              <div className="divide-y divide-sand-border">
                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-paper-white border border-sand-border flex items-center justify-center text-ink-black shrink-0">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-ink-black block truncate">
                        IG Grand Sevilia
                      </span>
                      <span className="text-[11px] text-stone-gray block">
                        Jangkauan Akun (Reach)
                      </span>
                    </div>
                  </div>
                  <span className="metric-mono text-base font-bold text-ink-black">
                    {sevillaReach.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-paper-white border border-sand-border flex items-center justify-center text-ink-black shrink-0">
                      <TikTokIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-ink-black block truncate">
                        TikTok Grand Sevilia
                      </span>
                      <span className="text-[11px] text-stone-gray block">
                        Tayangan Video (Views)
                      </span>
                    </div>
                  </div>
                  <span className="metric-mono text-base font-bold text-ink-black">
                    {tiktokViews.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-paper-white border border-sand-border flex items-center justify-center text-ink-black shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-ink-black block truncate">
                        Website Sedaya Group
                      </span>
                      <span className="text-[11px] text-stone-gray block">
                        Sesi Kunjungan Aktif
                      </span>
                    </div>
                  </div>
                  <span className="metric-mono text-base font-bold text-ink-black">
                    {webSessions.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-paper-white border border-sand-border flex items-center justify-center text-ink-black shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-ink-black block truncate">
                        Google Maps Kantor
                      </span>
                      <span className="text-[11px] text-stone-gray block">
                        Tayangan Profil Lokasi
                      </span>
                    </div>
                  </div>
                  <span className="metric-mono text-base font-bold text-ink-black">
                    {mapsViews.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-sand-border">
              <Link
                href="/channels"
                className="btn-pill-ghost w-full justify-between"
              >
                <span>Buka Registri 14 Kanal Digital</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Full Portfolio Unit Reconciliation Ledger Table */}
        <section className="card-clay p-0 overflow-hidden">
          <div className="px-6 py-4 bg-warm-cream border-b border-sand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-ink-black flex items-center gap-2">
                <Building2 className="w-4 h-4 text-ink-black" />
                <span>Matriks Rekonsiliasi Stok Unit per Proyek</span>
              </h2>
              <p className="text-xs text-stone-gray mt-0.5">
                Rincian alokasi unit berdasarkan snapshot inventaris terbaru.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-violet-pulse hover:underline inline-flex items-center gap-1"
            >
              <span>Kelola Semua Proyek</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand-border bg-warm-cream/60 text-[11px] font-semibold uppercase tracking-[0.05em] text-ash-gray">
                  <th className="py-3 px-6">Proyek & Lokasi</th>
                  <th className="py-3 px-4 text-right">Total Unit</th>
                  <th className="py-3 px-4 text-right">Belum Terjual</th>
                  <th className="py-3 px-4 text-right">Booking + SP3K</th>
                  <th className="py-3 px-4 text-right">Akad + Cash</th>
                  <th className="py-3 px-4 text-right">Hold</th>
                  <th className="py-3 px-4 text-right">Status Rekonsiliasi</th>
                  <th className="py-3 px-6 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-border text-xs">
                {projectRows.map((row) => (
                  <tr
                    key={row.project.id}
                    className="hover:bg-warm-cream/50 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/projects/${row.project.slug}`}
                        className="font-bold text-ink-black hover:text-violet-pulse block"
                      >
                        {row.project.name}
                      </Link>
                      <span className="text-[11px] text-stone-gray">
                        {row.project.location}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right metric-mono font-bold text-ink-black">
                      {row.project.total_units}
                    </td>
                    <td className="py-3.5 px-4 text-right metric-mono text-stone-gray">
                      {row.belumTerjual}
                    </td>
                    <td className="py-3.5 px-4 text-right metric-mono font-semibold text-violet-pulse">
                      {row.pipelineTotal}
                    </td>
                    <td className="py-3.5 px-4 text-right metric-mono font-semibold text-forest">
                      {row.soldTotal}
                    </td>
                    <td className="py-3.5 px-4 text-right metric-mono text-stone-gray">
                      {row.hold}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {row.unallocated !== 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ember-surface text-ember-orange border border-ember-border metric-mono">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{row.unallocated} Unallocated</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-forest-surface text-forest border border-forest-border">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Seimbang (0)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/projects/${row.project.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-ink-black hover:text-violet-pulse"
                      >
                        <span>Buka</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Operational Execution Workbench (5:7 Split) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Daily PIC Log Status (Ferry & Ziyad) */}
          <div className="lg:col-span-5 card-clay p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-sand-border mb-4">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-ink-black" />
                  <h2 className="text-base font-bold text-ink-black">
                    Log Aktivitas PIC Hari Ini
                  </h2>
                </div>
                <span className="metric-mono text-xs text-stone-gray">
                  {todayFormatted}
                </span>
              </div>

              <div className="space-y-4">
                {/* Ferry Pratama */}
                <div className="p-4 rounded-xl bg-warm-cream border border-sand-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-ink-black" />
                      <span className="text-xs font-bold text-ink-black">
                        Ferry Pratama
                      </span>
                      <span className="text-[11px] text-stone-gray font-medium">
                        (Supervisor)
                      </span>
                    </div>
                    <span className="metric-mono text-xs font-bold text-ink-black px-2 py-0.5 rounded bg-paper-white border border-sand-border">
                      {activitiesByFerry.length} Log
                    </span>
                  </div>
                  {activitiesByFerry.length === 0 ? (
                    <p className="text-xs text-stone-gray">
                      Belum ada aktivitas yang dicatat hari ini.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 mt-2">
                      {activitiesByFerry.slice(0, 3).map((act) => (
                        <li
                          key={act.id}
                          className="text-xs text-ink-black flex items-center justify-between gap-2 bg-paper-white px-3 py-1.5 rounded-lg border border-sand-border"
                        >
                          <span className="truncate font-medium">{act.title}</span>
                          <span className="metric-mono text-[10px] uppercase font-semibold text-stone-gray">
                            {act.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Ziyad */}
                <div className="p-4 rounded-xl bg-warm-cream border border-sand-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-pulse" />
                      <span className="text-xs font-bold text-ink-black">
                        Ziyad
                      </span>
                      <span className="text-[11px] text-stone-gray font-medium">
                        (Sr. Branding Officer)
                      </span>
                    </div>
                    <span className="metric-mono text-xs font-bold text-ink-black px-2 py-0.5 rounded bg-paper-white border border-sand-border">
                      {activitiesByZiyad.length} Log
                    </span>
                  </div>
                  {activitiesByZiyad.length === 0 ? (
                    <p className="text-xs text-stone-gray">
                      Belum ada aktivitas yang dicatat hari ini.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 mt-2">
                      {activitiesByZiyad.slice(0, 3).map((act) => (
                        <li
                          key={act.id}
                          className="text-xs text-ink-black flex items-center justify-between gap-2 bg-paper-white px-3 py-1.5 rounded-lg border border-sand-border"
                        >
                          <span className="truncate font-medium">{act.title}</span>
                          <span className="metric-mono text-[10px] uppercase font-semibold text-stone-gray">
                            {act.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-sand-border flex items-center justify-between">
              <span className="text-xs text-stone-gray">
                Total tercatat: <strong className="metric-mono text-ink-black">{todayActivities.length}</strong> aktivitas
              </span>
              <Link
                href="/activities"
                className="text-xs font-semibold text-violet-pulse hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Log Harian</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right 7 Cols: Active Marketing Plan & Editorial Pipeline */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Active Marketing Plan Card */}
            <div className="card-clay p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-sand-border mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-ink-black" />
                    <h2 className="text-sm font-bold text-ink-black">
                      Rencana Marketing Aktif
                    </h2>
                  </div>
                  <span className="metric-mono text-xs font-bold text-ink-black">
                    {planProgressPct}%
                  </span>
                </div>

                {activePlan ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-ink-black">
                      {activePlan.title}
                    </h3>
                    <p className="text-xs text-stone-gray leading-relaxed">
                      {activePlan.objective}
                    </p>
                    <div className="h-2 w-full bg-warm-cream rounded-full overflow-hidden border border-sand-border">
                      <div
                        className="h-full bg-ink-black rounded-full"
                        style={{ width: `${planProgressPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-6 space-y-2">
                    <p className="text-xs font-semibold text-ink-black">
                      Belum ada rencana mingguan aktif.
                    </p>
                    <p className="text-xs text-stone-gray leading-relaxed">
                      Susun target mingguan atau bulanan beserta matriks KPI untuk memantau progres eksekusi tim.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-sand-border">
                <Link
                  href="/plans"
                  className="btn-pill-ghost w-full justify-between"
                >
                  <span>Kelola Rencana & KPI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Content Pipeline Card */}
            <div className="card-clay p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-sand-border mb-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-ink-black" />
                    <h2 className="text-sm font-bold text-ink-black">
                      Antrian Konten Pekan Ini
                    </h2>
                  </div>
                  <span className="metric-mono text-xs font-bold text-ink-black">
                    {upcomingContent.length} Item
                  </span>
                </div>

                {upcomingContent.length === 0 ? (
                  <div className="py-6 space-y-2">
                    <p className="text-xs font-semibold text-ink-black">
                      Antrian publikasi masih kosong.
                    </p>
                    <p className="text-xs text-stone-gray leading-relaxed">
                      Jadwalkan produksi Reels, Carousel edukasi KPR, atau dokumentasi progres lapangan di Kalender Konten.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {upcomingContent.map((content) => (
                      <li
                        key={content.id}
                        className="p-2.5 rounded-xl bg-warm-cream border border-sand-border text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-stone-gray mb-0.5">
                          <span className="font-semibold uppercase text-ink-black">
                            {content.format}
                          </span>
                          <span className="metric-mono">{content.publish_date}</span>
                        </div>
                        <p className="font-semibold text-ink-black truncate">
                          {content.title}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-sand-border">
                <Link
                  href="/content"
                  className="btn-pill-ghost w-full justify-between"
                >
                  <span>Buka Kalender Konten</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
