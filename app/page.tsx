'use client';

import { useState, useSyncExternalStore } from 'react';
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
import { usePersistentState, STORAGE_KEYS } from '@/lib/storage/persistence';
import {
  UnitSnapshot,
  DailyActivity,
  MarketingPlan,
  PlanItem,
  ContentItem,
} from '@/lib/types/database';
import { InstagramIcon, TikTokIcon } from '@/components/shared/icons';
import { QuickUnitSaleModal } from '@/components/modules/projects/quick-unit-sale-modal';
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
  Tag,
  Copy,
  Sparkles,
  CalendarClock,
  HelpCircle,
  Megaphone,
} from 'lucide-react';

export default function DashboardPage() {
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const [allHousingSnapshots] = usePersistentState<Record<string, UnitSnapshot[]>>(
    STORAGE_KEYS.HOUSING_SNAPSHOTS,
    INITIAL_UNIT_SNAPSHOTS
  );
  const [activities] = usePersistentState<DailyActivity[]>(
    STORAGE_KEYS.ACTIVITIES,
    INITIAL_ACTIVITIES
  );
  const [plans] = usePersistentState<(MarketingPlan & { items: PlanItem[] })[]>(
    STORAGE_KEYS.MARKETING_PLANS,
    INITIAL_MARKETING_PLANS
  );
  const [contentItems] = usePersistentState<ContentItem[]>(
    STORAGE_KEYS.CONTENT_ITEMS,
    INITIAL_CONTENT_ITEMS
  );

  const activeHousingProjects = INITIAL_PROJECTS.filter(
    (p) => p.kind === 'active_project'
  );

  // Portfolio inventory aggregation
  const projectRows = activeHousingProjects.map((project) => {
    const snapshots = allHousingSnapshots[project.id] || [];
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

  // Calculate filtered display values based on selected project pill
  const activeDisplay = (() => {
    if (selectedProjectFilter === 'all') {
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

      return {
        title: 'Seluruh Portofolio',
        subtitle: 'Konsolidasi 6 Proyek Perumahan Aktif di Medan & Deli Serdang',
        totalUnits: portfolioTotals.totalUnits,
        sold: portfolioTotals.sold,
        soldPct,
        pipeline: portfolioTotals.pipeline,
        pipelinePct,
        available: portfolioTotals.available,
        availablePct,
        hold: portfolioTotals.hold,
        unallocated: portfolioTotals.unallocated,
      };
    }

    const row = projectRows.find((r) => r.project.slug === selectedProjectFilter);
    if (!row) {
      return {
        title: 'Proyek Terpilih',
        subtitle: 'Data rincian proyek',
        totalUnits: 0,
        sold: 0,
        soldPct: 0,
        pipeline: 0,
        pipelinePct: 0,
        available: 0,
        availablePct: 0,
        hold: 0,
        unallocated: 0,
      };
    }

    const total = row.project.total_units;
    const soldPct = total > 0 ? Math.round((row.soldTotal / total) * 100) : 0;
    const pipelinePct = total > 0 ? Math.round((row.pipelineTotal / total) * 100) : 0;
    const availablePct = total > 0 ? Math.round((row.belumTerjual / total) * 100) : 0;

    return {
      title: row.project.name,
      subtitle: `${row.project.location} • Perumahan Subsidi Aktif`,
      totalUnits: total,
      sold: row.soldTotal,
      soldPct,
      pipeline: row.pipelineTotal,
      pipelinePct,
      available: row.belumTerjual,
      availablePct,
      hold: row.hold,
      unallocated: row.unallocated,
    };
  })();

  // Active weekly plan
  const activePlan =
    plans.find(
      (p) => p.period_type === 'weekly' && p.status === 'active'
    ) || plans[0];

  const planItems = activePlan?.items || [];
  const completedPlanItems = planItems.filter((i) => i.status === 'done').length;
  const planProgressPct =
    planItems.length > 0
      ? Math.round((completedPlanItems / planItems.length) * 100)
      : 0;

  // Activities for today
  const todayActivities = activities;
  const activitiesByFerry = todayActivities.filter((a) =>
    a.pic?.full_name.includes('Ferry')
  );
  const activitiesByZiyad = todayActivities.filter((a) =>
    a.pic?.full_name.includes('Ziyad')
  );

  // Content due this week
  const upcomingContent = contentItems.slice(0, 3);

  // 7d channel metrics from verified seed records
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

  const handleCopyWhatsAppReport = () => {
    const text = `*SEDAYA HQ: LAPORAN EKSEKUTIF HARIAN*\nTanggal: ${todayFormatted}\n\n*Posisi Stok Portofolio (6 Proyek):*\n- Total Unit Terdaftar: ${portfolioTotals.totalUnits} unit\n- Terjual (Akad + Cash): ${portfolioTotals.sold} unit (${activeDisplay.soldPct}%)\n- Pipeline KPR (Booking + SP3K): ${portfolioTotals.pipeline} unit\n- Stok Siap Jual: ${portfolioTotals.available} unit\n- Rekonsiliasi Unallocated: ${portfolioTotals.unallocated} unit\n\n*Aktivitas Kerja Tim Hari Ini (${todayActivities.length} log):*\n- Ferry Pratama: ${activitiesByFerry.length} aktivitas\n- Ziyad: ${activitiesByZiyad.length} aktivitas\n\n*Rencana Kerja Pekan Ini:*\n- Progres: ${planProgressPct}% (${completedPlanItems}/${planItems.length} item selesai)\n\n_Diterbitkan via Sedaya HQ Executive OS_`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Ringkasan berhasil disalin untuk WhatsApp grup Daily Report');
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {toastMessage && (
          <aside
            role="status"
            aria-live="polite"
            className="p-3.5 rounded-2xl bg-forest-surface border border-forest-border text-xs font-semibold text-ink-black flex items-center gap-2.5 shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
            <span>{toastMessage}</span>
          </aside>
        )}

        <PageHeader
          section="KOMANDO EKSEKUTIF"
          meta={
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
              <span>Sistem Operasi Portofolio Properti</span>
            </span>
          }
          title="Ikhtisar Operasional & Portofolio"
          description="Pusat kendali realisasi stok unit perumahan, akselerasi harian tim pemasaran, dan radar kanal pertumbuhan PT Sedaya Property."
          actions={
            <>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-forest bg-forest-surface border border-forest-border hover:bg-forest-surface/80 transition-colors"
                title="Catat perubahan status unit (booking, SP3K, akad, cash) secara cepat"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>+ Catat Penjualan Unit</span>
              </button>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-gray bg-warm-cream border border-sand-border hover:text-ink-black hover:border-sand-hover transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Cetak Laporan</span>
              </Link>
              <Link
                href="/activities"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-terracotta text-paper-white hover:bg-terracotta-hover active:scale-[0.97] transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Aktivitas</span>
              </Link>
            </>
          }
        />

        {/* Section 1: Executive Architectural Bento Grid (12-Column Layout) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tile 1 (Large 8 Cols): Portfolio Inventory Realization Funnel */}
          <div className="lg:col-span-8 bento-card flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sand-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ash-gray">
                      Realisasi Inventaris Portofolio
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-ink-black mt-1">
                    {activeDisplay.title}
                  </h2>
                  <p className="text-xs text-stone-gray mt-0.5">
                    {activeDisplay.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="metric-mono text-xs font-bold px-2.5 py-1 rounded-full bg-terracotta-surface text-terracotta border border-terracotta-border">
                    {activeDisplay.soldPct}% Terjual
                  </span>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta hover:underline"
                  >
                    <span>Modul Proyek</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Project Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedProjectFilter('all')}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-all shrink-0 border ${
                    selectedProjectFilter === 'all'
                      ? 'bg-ink-black text-paper-white border-ink-black shadow-2xs'
                      : 'bg-warm-cream text-stone-gray border-sand-border hover:text-ink-black hover:border-sand-hover'
                  }`}
                >
                  Semua Proyek ({portfolioTotals.totalUnits})
                </button>
                {activeHousingProjects.map((p) => {
                  const isSelected = selectedProjectFilter === p.slug;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjectFilter(p.slug)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-all shrink-0 border ${
                        isSelected
                          ? 'bg-ink-black text-paper-white border-ink-black shadow-2xs font-semibold'
                          : 'bg-warm-cream text-stone-gray border-sand-border hover:text-ink-black hover:border-sand-hover'
                      }`}
                    >
                      {p.name} ({p.total_units})
                    </button>
                  );
                })}
              </div>

              {/* Hero Metric & Stacked Funnel Bar */}
              <div className="pt-2 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="metric-mono text-4xl sm:text-5xl font-extrabold text-ink-black tracking-tight">
                      {activeDisplay.totalUnits}
                    </span>
                    <span className="text-sm font-semibold text-stone-gray">
                      Unit Terdaftar dalam Portofolio
                    </span>
                  </div>
                  <span className="text-xs font-medium text-stone-gray hidden sm:inline">
                    Target Realisasi Q4 2026
                  </span>
                </div>

                {/* Multi-segment Progress Gauge */}
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-full bg-warm-cream border border-sand-border overflow-hidden flex p-0.5">
                    <div
                      style={{ width: `${activeDisplay.soldPct}%` }}
                      className="bg-obsidian rounded-l-full h-full transition-all duration-300"
                      title={`Terjual (Akad + Cash): ${activeDisplay.sold} unit`}
                    />
                    <div
                      style={{ width: `${activeDisplay.pipelinePct}%` }}
                      className="bg-terracotta h-full transition-all duration-300"
                      title={`Proses KPR (Booking + SP3K): ${activeDisplay.pipeline} unit`}
                    />
                    <div
                      style={{ width: `${activeDisplay.availablePct}%` }}
                      className="bg-sand-hover h-full transition-all duration-300"
                      title={`Stok Tersedia: ${activeDisplay.available} unit`}
                    />
                  </div>

                  {/* 4 Architectural Bento Metric Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 rounded-2xl bg-warm-cream border border-sand-border flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-stone-gray mb-1">
                        <span className="w-2 h-2 rounded-full bg-obsidian shrink-0" />
                        <span className="font-medium">Terjual (Akad/Cash)</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="metric-mono text-2xl font-bold text-ink-black">
                          {activeDisplay.sold}
                        </span>
                        <span className="metric-mono text-xs font-semibold text-stone-gray">
                          {activeDisplay.soldPct}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-warm-cream border border-sand-border flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-stone-gray mb-1">
                        <span className="w-2 h-2 rounded-full bg-terracotta shrink-0" />
                        <span className="font-medium">Pipeline (SP3K/Book)</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="metric-mono text-2xl font-bold text-ink-black">
                          {activeDisplay.pipeline}
                        </span>
                        <span className="metric-mono text-xs font-semibold text-stone-gray">
                          {activeDisplay.pipelinePct}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-warm-cream border border-sand-border flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-stone-gray mb-1">
                        <span className="w-2 h-2 rounded-full bg-sand-hover shrink-0" />
                        <span className="font-medium">Stok Siap Jual</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="metric-mono text-2xl font-bold text-ink-black">
                          {activeDisplay.available}
                        </span>
                        <span className="metric-mono text-xs font-semibold text-stone-gray">
                          {activeDisplay.availablePct}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-warm-cream border border-sand-border flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-stone-gray mb-1">
                        <span className="w-2 h-2 rounded-full bg-stone-gray shrink-0" />
                        <span className="font-medium">Hold / Cadangan</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="metric-mono text-2xl font-bold text-ink-black">
                          {activeDisplay.hold}
                        </span>
                        <span className="text-[11px] font-medium text-stone-gray">
                          unit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Samudera Residence Reconciliation Callout */}
            {activeDisplay.unallocated > 0 && (
              <div className="p-4 rounded-2xl bg-ember-surface border border-ember-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-ember-orange shrink-0 mt-0.5" />
                  <div className="text-xs text-ink-black leading-relaxed">
                    <strong className="font-bold text-ember-orange block sm:inline">
                      Rekonsiliasi Unit Samudera Residence:{' '}
                    </strong>
                    <span>
                      Terdapat <strong className="metric-mono font-bold">3 unit Unallocated</strong> (Total master: 61 unit, teralokasi: 58 unit). Harap diverifikasi bersama tim legal/KPR perbankan.
                    </span>
                  </div>
                </div>
                <Link
                  href="/projects/samudera-residence"
                  className="px-3.5 py-1.5 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:bg-slate-gray shrink-0 self-start sm:self-center"
                >
                  Buka Rekonsiliasi
                </Link>
              </div>
            )}
          </div>

          {/* Tile 2 (4 Cols): Team Velocity & Daily Workload Rings */}
          <div className="lg:col-span-4 bento-card flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-sand-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ash-gray">
                      Velocitas Tim
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-ink-black mt-0.5">
                    Eksekusi Harian PIC
                  </h2>
                </div>
                <span className="metric-mono text-xs text-stone-gray px-2 py-0.5 rounded-full bg-warm-cream border border-sand-border">
                  {todayFormatted}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {/* Ferry Pratama Card */}
                <div className="p-3.5 rounded-2xl bg-warm-cream border border-sand-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-obsidian text-paper-white text-xs font-bold flex items-center justify-center">
                        F
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink-black block leading-none">
                          Ferry Pratama
                        </span>
                        <span className="text-[10px] text-stone-gray font-medium block mt-0.5">
                          Supervisor & Research
                        </span>
                      </div>
                    </div>
                    <span className="metric-mono text-xs font-bold text-ink-black px-2 py-0.5 rounded-full bg-paper-white border border-sand-border">
                      {activitiesByFerry.length} Aktivitas
                    </span>
                  </div>
                  {activitiesByFerry.length === 0 ? (
                    <p className="text-xs text-stone-gray italic">
                      Belum ada catatan aktivitas hari ini.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 mt-2">
                      {activitiesByFerry.slice(0, 2).map((act) => (
                        <li
                          key={act.id}
                          className="text-xs text-ink-black flex items-center justify-between gap-2 bg-paper-white px-2.5 py-1.5 rounded-xl border border-sand-border"
                        >
                          <span className="truncate font-medium">{act.title}</span>
                          <span className="metric-mono text-[10px] uppercase font-semibold text-stone-gray shrink-0">
                            {act.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Ziyad Card */}
                <div className="p-3.5 rounded-2xl bg-warm-cream border border-sand-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-terracotta text-paper-white text-xs font-bold flex items-center justify-center">
                        Z
                      </div>
                      <div>
                        <span className="text-xs font-bold text-ink-black block leading-none">
                          Ziyad
                        </span>
                        <span className="text-[10px] text-stone-gray font-medium block mt-0.5">
                          Sr. Branding Officer
                        </span>
                      </div>
                    </div>
                    <span className="metric-mono text-xs font-bold text-ink-black px-2 py-0.5 rounded-full bg-paper-white border border-sand-border">
                      {activitiesByZiyad.length} Aktivitas
                    </span>
                  </div>
                  {activitiesByZiyad.length === 0 ? (
                    <p className="text-xs text-stone-gray italic">
                      Belum ada catatan aktivitas hari ini.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 mt-2">
                      {activitiesByZiyad.slice(0, 2).map((act) => (
                        <li
                          key={act.id}
                          className="text-xs text-ink-black flex items-center justify-between gap-2 bg-paper-white px-2.5 py-1.5 rounded-xl border border-sand-border"
                        >
                          <span className="truncate font-medium">{act.title}</span>
                          <span className="metric-mono text-[10px] uppercase font-semibold text-stone-gray shrink-0">
                            {act.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* WhatsApp Group Share Trigger */}
            <div className="pt-3 border-t border-sand-border space-y-2">
              <button
                type="button"
                onClick={handleCopyWhatsAppReport}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-obsidian text-paper-white hover:bg-slate-gray transition-colors"
                title="Salin rekap harian untuk WhatsApp grup Daily Report"
              >
                <Copy className="w-3.5 h-3.5 text-sand-border" />
                <span>Salin untuk WhatsApp grup Daily Report</span>
              </button>
              <div className="flex items-center justify-between text-[11px] text-stone-gray px-1">
                <span>Total Hari Ini: {todayActivities.length} Log</span>
                <Link
                  href="/activities"
                  className="font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Log</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Tile 3 (4 Cols): Live Channel & Media Radar */}
          <div className="lg:col-span-4 bento-card-subtle flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-sand-border">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ash-gray block">
                    Radar Kanal Digital
                  </span>
                  <h3 className="text-sm font-bold text-ink-black mt-0.5">
                    Jangkauan 7 Hari Terakhir
                  </h3>
                </div>
                <span className="metric-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-paper-white border border-sand-border text-stone-gray">
                  Snapshot 7H
                </span>
              </div>

              <div className="divide-y divide-sand-border">
                <div className="py-2.5 flex items-center justify-between gap-3">
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
                  <span className="metric-mono text-sm font-bold text-ink-black">
                    {sevillaReach.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between gap-3">
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
                  <span className="metric-mono text-sm font-bold text-ink-black">
                    {tiktokViews.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between gap-3">
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
                  <span className="metric-mono text-sm font-bold text-ink-black">
                    {webSessions.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="py-2.5 flex items-center justify-between gap-3">
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
                  <span className="metric-mono text-sm font-bold text-ink-black">
                    {mapsViews.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-sand-border">
              <Link
                href="/channels"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-ink-black bg-paper-white border border-sand-border hover:border-sand-hover transition-colors"
              >
                <span>Buka Registri 14 Kanal Digital</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-gray" />
              </Link>
            </div>
          </div>

          {/* Tile 4 (4 Cols): Content Editorial Pulse & Studio */}
          <div className="lg:col-span-4 bento-card-subtle flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-sand-border">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ash-gray block">
                    Kalender & Studio
                  </span>
                  <h3 className="text-sm font-bold text-ink-black mt-0.5">
                    Antrian Konten Pekan Ini
                  </h3>
                </div>
                <Link
                  href="/content/studio"
                  className="metric-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-terracotta-surface text-terracotta border border-terracotta-border inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Studio</span>
                </Link>
              </div>

              {upcomingContent.length === 0 ? (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs font-semibold text-ink-black">
                    Antrian publikasi masih kosong.
                  </p>
                  <p className="text-[11px] text-stone-gray">
                    Jadwalkan Reels atau edukasi KPR di Kalender Konten.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2 mt-3">
                  {upcomingContent.map((content) => (
                    <li
                      key={content.id}
                      className="p-2.5 rounded-xl bg-paper-white border border-sand-border text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] text-stone-gray mb-1">
                        <span className="font-bold uppercase tracking-wider text-terracotta bg-terracotta-surface px-1.5 py-0.2 rounded">
                          {content.format}
                        </span>
                        <span className="metric-mono font-medium">{content.publish_date}</span>
                      </div>
                      <p className="font-semibold text-ink-black truncate">
                        {content.title}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="pt-2 border-t border-sand-border flex items-center gap-2">
              <Link
                href="/content"
                className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold text-ink-black bg-paper-white border border-sand-border hover:border-sand-hover transition-colors"
              >
                <span>Kalender</span>
              </Link>
              <Link
                href="/content/studio"
                className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold bg-obsidian text-paper-white hover:bg-slate-gray transition-colors"
              >
                <span>Buka Studio</span>
              </Link>
            </div>
          </div>

          {/* Tile 5 (4 Cols): Offline Marketing & Sales Support Radar */}
          <div className="lg:col-span-4 bento-card-subtle flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-sand-border">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ash-gray block">
                    Marketing Lapangan
                  </span>
                  <h3 className="text-sm font-bold text-ink-black mt-0.5">
                    Dukungan Sales & Aktivasi
                  </h3>
                </div>
                <span className="metric-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-paper-white border border-sand-border text-stone-gray">
                  4 Divisi
                </span>
              </div>

              <div className="space-y-2 mt-3">
                <Link
                  href="/offline/events"
                  className="p-2.5 rounded-xl bg-paper-white border border-sand-border flex items-center justify-between hover:border-sand-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarClock className="w-4 h-4 text-terracotta" />
                    <div>
                      <span className="text-xs font-bold text-ink-black block leading-none">
                        Event & Pameran
                      </span>
                      <span className="text-[10px] text-stone-gray block mt-0.5">
                        Jadwal booth & expo properti
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-gray" />
                </Link>

                <Link
                  href="/offline/sales-support"
                  className="p-2.5 rounded-xl bg-paper-white border border-sand-border flex items-center justify-between hover:border-sand-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-forest" />
                    <div>
                      <span className="text-xs font-bold text-ink-black block leading-none">
                        Dukungan Sales & CRO
                      </span>
                      <span className="text-[10px] text-stone-gray block mt-0.5">
                        Brosur, simulasi KPR, pendampingan
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-gray" />
                </Link>

                <Link
                  href="/offline/props"
                  className="p-2.5 rounded-xl bg-paper-white border border-sand-border flex items-center justify-between hover:border-sand-hover transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4 text-ember-orange" />
                    <div>
                      <span className="text-xs font-bold text-ink-black block leading-none">
                        Alat Peraga & Reklame
                      </span>
                      <span className="text-[10px] text-stone-gray block mt-0.5">
                        Spanduk, baliho, umbul-umbul
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-gray" />
                </Link>
              </div>
            </div>

            <div className="pt-2 border-t border-sand-border">
              <Link
                href="/campaigns"
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-ink-black bg-paper-white border border-sand-border hover:border-sand-hover transition-colors"
              >
                <span>Kelola Kampanye Promo Aktif</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-gray" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Portfolio Inventory Reconciliation Ledger Table */}
        <section className="bento-card p-0 overflow-hidden">
          <div className="px-6 py-4.5 bg-warm-cream border-b border-sand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-ink-black flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-terracotta" />
                <span>Matriks Rekonsiliasi Stok Unit per Proyek</span>
              </h2>
              <p className="text-xs text-stone-gray mt-0.5">
                Rincian posisi alokasi unit riil berdasarkan snapshot inventaris perumahan terbaru.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1.5"
            >
              <span>Kelola Semua Proyek</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sand-border bg-warm-cream/50 text-[11px] font-semibold uppercase tracking-[0.05em] text-ash-gray">
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
                    className="hover:bg-warm-cream/40 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/projects/${row.project.slug}`}
                        className="font-bold text-ink-black hover:text-terracotta block transition-colors"
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
                    <td className="py-3.5 px-4 text-right metric-mono font-semibold text-terracotta">
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
                        className="inline-flex items-center gap-1 font-semibold text-ink-black hover:text-terracotta transition-colors"
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

        {/* Section 3: Active Marketing Plan & KPI Realization */}
        <section className="bento-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sand-border mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-terracotta-surface text-terracotta border border-terracotta-border flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-ink-black">
                  Rencana Marketing & KPI Kuartal
                </h2>
                <p className="text-xs text-stone-gray">
                  Pelacakan target mingguan dan pencapaian indikator kinerja operasional.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="metric-mono text-sm font-bold text-ink-black px-3 py-1 rounded-full bg-warm-cream border border-sand-border">
                {planProgressPct}% Tuntas
              </span>
              <Link
                href="/plans"
                className="text-xs font-semibold text-terracotta hover:underline inline-flex items-center gap-1"
              >
                <span>Kelola Rencana</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {activePlan ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-2">
                <h3 className="text-sm font-bold text-ink-black">
                  {activePlan.title}
                </h3>
                <p className="text-xs text-stone-gray leading-relaxed">
                  {activePlan.objective}
                </p>
                <div className="h-2.5 w-full bg-warm-cream rounded-full overflow-hidden border border-sand-border mt-2">
                  <div
                    className="h-full bg-obsidian rounded-full transition-all duration-300"
                    style={{ width: `${planProgressPct}%` }}
                  />
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-warm-cream border border-sand-border">
                  <span className="text-[11px] text-stone-gray block">Item Rencana Selesai</span>
                  <span className="metric-mono text-xl font-bold text-ink-black mt-0.5 block">
                    {completedPlanItems} / {planItems.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-warm-cream border border-sand-border">
                  <span className="text-[11px] text-stone-gray block">Status Periode</span>
                  <span className="metric-mono text-sm font-bold text-forest mt-1 block uppercase">
                    {activePlan.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-xs text-stone-gray">
              Belum ada rencana mingguan aktif yang ditetapkan.
            </div>
          )}
        </section>

        <QuickUnitSaleModal
          isOpen={isUnitModalOpen}
          onClose={() => setIsUnitModalOpen(false)}
          onSuccess={showToast}
        />
      </div>
    </AppShell>
  );
}

