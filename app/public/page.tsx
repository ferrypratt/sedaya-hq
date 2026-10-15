'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { SedayaLogo } from '@/components/shared/sedaya-logo';
import {
  getClientTodayString,
  getYesterdayString,
  formatDisplayDateIndonesian,
} from '@/lib/utils/date-utils';
import {
  INITIAL_PROJECTS,
  INITIAL_UNIT_SNAPSHOTS,
  INITIAL_KOS_SNAPSHOTS,
  INITIAL_ACTIVITIES,
} from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS } from '@/lib/storage/persistence';
import {
  UnitSnapshot,
  KosSnapshot,
  DailyActivity,
  ActivityCategory,
  ActivityStatus,
} from '@/lib/types/database';
import { pdf } from '@react-pdf/renderer';
import { ActivitiesPdfDocument } from '@/components/modules/activities/activities-pdf-document';
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileDown,
  LayoutGrid,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  Share2,
  Shield,
  Tag,
  User,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  content_production: 'Produksi Konten',
  design: 'Desain Grafis',
  social_posting: 'Posting Medsos',
  community_management: 'Balas Chat/DM',
  seo_website: 'SEO & Website',
  google_maps: 'Optimasi G-Maps',
  reporting_monitoring: 'Monitoring & Laporan',
  event: 'Event & Pameran',
  offline_production: 'Produksi Cetak/Baliho',
  sales_support: 'Dukungan Sales/CRO',
  sosialisasi: 'Sosialisasi',
  meeting: 'Rapat Koordinasi',
  research: 'Riset Pasar/Housing',
  other: 'Lainnya',
};

const STATUS_CONFIG: Record<
  ActivityStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  planned: {
    label: 'Direncanakan',
    badgeClass: 'bg-warm-cream border-sand-border text-stone-gray',
    dotClass: 'bg-ash-gray',
  },
  in_progress: {
    label: 'Sedang Berjalan',
    badgeClass: 'bg-paper-white border-violet-pulse/50 text-violet-pulse',
    dotClass: 'bg-violet-pulse animate-pulse',
  },
  done: {
    label: 'Selesai',
    badgeClass: 'bg-forest-surface border-forest-border text-forest',
    dotClass: 'bg-forest',
  },
  blocked: {
    label: 'Terkendala',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-800',
    dotClass: 'bg-amber-600',
  },
  carried_over: {
    label: 'Dialihkan',
    badgeClass: 'bg-ink-black text-paper-white border-ink-black',
    dotClass: 'bg-paper-white',
  },
};

const emptySubscribe = () => () => {};

export default function UnifiedPublicPortalPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'activities'>('inventory');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [allHousingSnapshots] = usePersistentState<Record<string, UnitSnapshot[]>>(
    STORAGE_KEYS.HOUSING_SNAPSHOTS,
    INITIAL_UNIT_SNAPSHOTS
  );
  const [allKosSnapshots] = usePersistentState<Record<string, KosSnapshot[]>>(
    STORAGE_KEYS.KOS_SNAPSHOTS,
    INITIAL_KOS_SNAPSHOTS
  );
  const [activities] = usePersistentState<DailyActivity[]>(
    STORAGE_KEYS.ACTIVITIES,
    INITIAL_ACTIVITIES
  );

  // Filter states for activities
  const [picFilter, setPicFilter] = useState<'all' | 'ferry' | 'ziyad'>('all');
  const [selectedDate, setSelectedDate] = useState('2026-10-13');
  const [todayDate, setTodayDate] = useState('');
  const [yesterdayDate, setYesterdayDate] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const today = getClientTodayString();
    const yesterday = getYesterdayString(today);
    setSelectedDate(today);
    setTodayDate(today);
    setYesterdayDate(yesterday);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayFormatted = useSyncExternalStore(
    emptySubscribe,
    () =>
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    () => '14 Oktober 2026'
  );

  const activeHousingProjects = INITIAL_PROJECTS.filter(
    (p) => p.kind === 'active_project'
  );

  // Portfolio Inventory Aggregation
  const projectSummaries = activeHousingProjects.map((project) => {
    const snapshots = allHousingSnapshots[project.id] || [];
    const latest = snapshots[0];
    const belumTerjual = latest?.belum_terjual ?? 0;
    const booking = latest?.booking ?? 0;
    const sp3k = latest?.sp3k ?? 0;
    const akad = latest?.akad_kredit ?? 0;
    const cash = latest?.cash_keras ?? 0;
    const hold = latest?.hold_manajemen ?? 0;

    const soldTotal = akad + cash;
    const pipelineTotal = booking + sp3k;
    const soldPct =
      project.total_units > 0
        ? Math.round((soldTotal / project.total_units) * 100)
        : 0;

    return {
      project,
      belumTerjual,
      booking,
      sp3k,
      akad,
      cash,
      hold,
      soldTotal,
      pipelineTotal,
      soldPct,
    };
  });

  const totals = projectSummaries.reduce(
    (acc, row) => {
      acc.totalUnits += row.project.total_units;
      acc.sold += row.soldTotal;
      acc.pipeline += row.pipelineTotal;
      acc.available += row.belumTerjual;
      acc.hold += row.hold;
      return acc;
    },
    { totalUnits: 0, sold: 0, pipeline: 0, available: 0, hold: 0 }
  );

  const soldPctTotal =
    totals.totalUnits > 0
      ? Math.round((totals.sold / totals.totalUnits) * 100)
      : 0;

  // Activities Filtering
  const filteredActivities = activities.filter((act) => {
    if (picFilter === 'ferry' && !act.pic?.full_name.includes('Ferry')) return false;
    if (picFilter === 'ziyad' && !act.pic?.full_name.includes('Ziyad')) return false;
    if (viewMode === 'day' && act.activity_date !== selectedDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDesc = act.description?.toLowerCase().includes(q);
      const matchProj = act.project?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchProj) return false;
    }
    return true;
  });

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;

    const picLabel =
      picFilter === 'ferry'
        ? 'Ferry Pratama'
        : picFilter === 'ziyad'
        ? 'Ziyad'
        : 'Semua PIC';

    const dateLabel =
      viewMode === 'day' ? selectedDate : 'Seluruh Rekap Aktivitas';

    const totalCount = filteredActivities.length;
    const doneCount = filteredActivities.filter((a) => a.status === 'done').length;

    const publicUrl = `${window.location.origin}/public`;

    const messageLines = [
      `*RINGKASAN EKSEKUTIF PORTOFOLIO & AKTIVITAS SEDAYA GROUP*`,
      `Tanggal: ${dateLabel}`,
      `PIC: ${picLabel}`,
      ``,
      `*Status Portofolio Perumahan:*`,
      `- Total Kapasitas: ${totals.totalUnits} Unit`,
      `- Unit Terjual (Akad & Cash): ${totals.sold} Unit (${soldPctTotal}%)`,
      `- Proses KPR (Booking & SP3K): ${totals.pipeline} Unit`,
      `- Unit Tersedia: ${totals.available} Unit`,
      ``,
      `*Aktivitas Tim (${dateLabel}):*`,
      `- Total: ${totalCount} tugas (${doneCount} selesai)`,
      ``,
      `Tautan Akses Publik:`,
      publicUrl,
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(messageLines);
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(messageLines)}`;
    window.open(waUrl, '_blank');
    showToast('Ringkasan berhasil disalin & membuka WhatsApp grup Daily Report!');
  };

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const picLabel =
        picFilter === 'ferry'
          ? 'Ferry Pratama'
          : picFilter === 'ziyad'
          ? 'Ziyad'
          : 'Semua PIC';

      const dateLabel =
        viewMode === 'day' ? `Harian (${formatDisplayDateIndonesian(selectedDate)})` : 'Semua Tanggal';

      const doc = (
        <ActivitiesPdfDocument
          activities={filteredActivities}
          dateTitle={dateLabel}
          picName={picLabel}
          generatedBy="Laporan Harian Branding & Marketing"
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Aktivitas_Branding_Marketing_${selectedDate}_${picFilter}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Laporan PDF resmi berhasil diunduh.');
    } catch (err) {
      alert(`Gagal membuat PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-warm-canvas text-ink-black pb-16">
      {/* Toast Feedback */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-ink-black text-paper-white text-xs font-semibold shadow-xl flex items-center gap-3 animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-forest-emerald shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-paper-white/95 backdrop-blur-md border-b border-sand-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-paper-white border border-sand-border flex items-center justify-center p-1 shrink-0 shadow-xs">
              <SedayaLogo className="w-full h-full" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-ink-black block leading-none">
                SEDAYA GROUP
              </span>
              <span className="text-[11px] text-stone-gray font-medium block mt-0.5">
                Portal Eksekutif Publik • Read-Only
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="btn-pill-ghost text-xs py-2 px-3 text-forest border-forest-border/40 hover:bg-forest-surface transition-colors"
              title="Bagikan ringkasan ke WhatsApp grup Daily Report"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim ke WA Daily Report</span>
              <span className="sm:hidden">WA</span>
            </button>

            <Link
              href="/login"
              className="btn-pill-ghost text-xs py-2 px-3 text-stone-gray hover:text-ink-black"
            >
              <span>Login Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-sand-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-surface border border-forest-border text-xs font-bold text-forest mb-2.5">
              <Shield className="w-3.5 h-3.5 text-forest" />
              <span>Akses Terbuka Direksi & Manajemen • Sinkron Real-Time</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              Ringkasan Operasional & Portofolio Penjualan
            </h1>
            <p className="text-xs sm:text-sm text-stone-gray mt-1 max-w-2xl leading-relaxed">
              Pantauan posisi stok unit perumahan subsidi, pipeline KPR, serta rekapitulasi aktivitas harian tim pemasaran di Medan & Deli Serdang.
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="text-xs font-semibold text-stone-gray block">
              Pembaruan Terakhir
            </span>
            <span className="metric-mono text-xs font-bold text-ink-black block mt-0.5">
              {todayFormatted}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-2 px-4 py-2 min-h-11 rounded-full text-xs font-bold transition-all border ${
              activeTab === 'inventory'
                ? 'bg-ink-black text-paper-white border-ink-black shadow-xs'
                : 'bg-paper-white text-stone-gray border-sand-border hover:text-ink-black hover:border-sand-hover'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Stok & Portofolio Unit ({activeHousingProjects.length} Proyek)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`inline-flex items-center gap-2 px-4 py-2 min-h-11 rounded-full text-xs font-bold transition-all border ${
              activeTab === 'activities'
                ? 'bg-ink-black text-paper-white border-ink-black shadow-xs'
                : 'bg-paper-white text-stone-gray border-sand-border hover:text-ink-black hover:border-sand-hover'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Log Aktivitas Harian Tim</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {activeTab === 'inventory' ? (
          <div className="space-y-6">
            {/* KPI Executive Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="card-clay p-4 sm:p-5">
                <span className="text-[11px] font-bold text-stone-gray uppercase tracking-[0.05em] block">
                  Total Kapasitas
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="metric-mono text-2xl sm:text-3xl font-bold text-ink-black">
                    {totals.totalUnits}
                  </span>
                  <span className="text-xs text-stone-gray font-medium">Unit</span>
                </div>
                <span className="text-[11px] text-stone-gray block mt-2">
                  6 Proyek aktif terdaftar
                </span>
              </div>

              <div className="card-clay p-4 sm:p-5">
                <span className="text-[11px] font-bold text-forest uppercase tracking-[0.05em] block">
                  Terjual (Akad + Cash)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="metric-mono text-2xl sm:text-3xl font-bold text-forest">
                    {totals.sold}
                  </span>
                  <span className="text-xs font-bold text-forest">
                    ({soldPctTotal}%)
                  </span>
                </div>
                <span className="text-[11px] text-stone-gray block mt-2">
                  Unit sah realisasi / lunas
                </span>
              </div>

              <div className="card-clay p-4 sm:p-5">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-[0.05em] block">
                  Proses KPR (Booking/SP3K)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="metric-mono text-2xl sm:text-3xl font-bold text-amber-800">
                    {totals.pipeline}
                  </span>
                  <span className="text-xs text-stone-gray font-medium">Unit</span>
                </div>
                <span className="text-[11px] text-stone-gray block mt-2">
                  Antrian berkas perbankan
                </span>
              </div>

              <div className="card-clay p-4 sm:p-5">
                <span className="text-[11px] font-bold text-stone-gray uppercase tracking-[0.05em] block">
                  Sisa Unit Tersedia
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="metric-mono text-2xl sm:text-3xl font-bold text-ink-black">
                    {totals.available}
                  </span>
                  <span className="text-xs text-stone-gray font-medium">Unit</span>
                </div>
                <span className="text-[11px] text-stone-gray block mt-2">
                  Siap dipasarkan tim sales
                </span>
              </div>
            </div>

            {/* Project List */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-ink-black uppercase tracking-[0.05em]">
                Rincian Status Portofolio per Proyek
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectSummaries.map((item) => (
                  <div key={item.project.id} className="card-clay p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-stone-gray uppercase tracking-[0.05em] block">
                          {item.project.location}
                        </span>
                        <h3 className="text-base font-bold text-ink-black mt-0.5">
                          {item.project.name}
                        </h3>
                      </div>
                      <span className="metric-mono text-xs font-bold px-2.5 py-1 rounded-full bg-forest-surface border border-forest-border text-forest">
                        {item.soldPct}% Terjual
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2.5 w-full rounded-full bg-warm-cream border border-sand-border overflow-hidden flex">
                        <div
                          style={{ width: `${item.soldPct}%` }}
                          className="bg-forest-emerald h-full"
                          title={`Terjual: ${item.soldTotal} unit`}
                        />
                        <div
                          style={{
                            width: `${
                              item.project.total_units > 0
                                ? Math.round((item.pipelineTotal / item.project.total_units) * 100)
                                : 0
                            }%`,
                          }}
                          className="bg-amber-400 h-full"
                          title={`Pipeline: ${item.pipelineTotal} unit`}
                        />
                      </div>
                    </div>

                    {/* Numbers Breakdown */}
                    <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-sand-border">
                      <div className="p-2 rounded-xl bg-warm-cream border border-sand-border">
                        <span className="text-[10px] text-stone-gray font-semibold block uppercase">
                          Total
                        </span>
                        <span className="metric-mono text-sm font-bold text-ink-black block mt-0.5">
                          {item.project.total_units}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-forest-surface border border-forest-border">
                        <span className="text-[10px] text-forest font-semibold block uppercase">
                          Akad/Cash
                        </span>
                        <span className="metric-mono text-sm font-bold text-forest block mt-0.5">
                          {item.soldTotal}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                        <span className="text-[10px] text-amber-800 font-semibold block uppercase">
                          Booking
                        </span>
                        <span className="metric-mono text-sm font-bold text-amber-800 block mt-0.5">
                          {item.booking}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-warm-cream border border-sand-border">
                        <span className="text-[10px] text-stone-gray font-semibold block uppercase">
                          Sisa
                        </span>
                        <span className="metric-mono text-sm font-bold text-ink-black block mt-0.5">
                          {item.belumTerjual}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Controls for Activities */}
            <div className="card-clay p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div
                  role="tablist"
                  className="flex flex-wrap items-center gap-1.5 p-1 bg-warm-cream border border-sand-border rounded-full"
                >
                  <button
                    type="button"
                    onClick={() => setPicFilter('all')}
                    className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                      picFilter === 'all'
                        ? 'bg-ink-black text-paper-white'
                        : 'text-stone-gray hover:text-ink-black'
                    }`}
                  >
                    Semua PIC
                  </button>
                  <button
                    type="button"
                    onClick={() => setPicFilter('ferry')}
                    className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                      picFilter === 'ferry'
                        ? 'bg-ink-black text-paper-white'
                        : 'text-stone-gray hover:text-ink-black'
                    }`}
                  >
                    Ferry Pratama
                  </button>
                  <button
                    type="button"
                    onClick={() => setPicFilter('ziyad')}
                    className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                      picFilter === 'ziyad'
                        ? 'bg-ink-black text-paper-white'
                        : 'text-stone-gray hover:text-ink-black'
                    }`}
                  >
                    Ziyad
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center p-1 bg-warm-cream rounded-full border border-sand-border">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(todayDate || getClientTodayString())}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        todayDate && selectedDate === todayDate
                          ? 'bg-paper-white text-ink-black shadow-xs font-bold'
                          : 'text-stone-gray hover:text-ink-black'
                      }`}
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(yesterdayDate || getYesterdayString())}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        yesterdayDate && selectedDate === yesterdayDate
                          ? 'bg-paper-white text-ink-black shadow-xs font-bold'
                          : 'text-stone-gray hover:text-ink-black'
                      }`}
                    >
                      Kemarin
                    </button>
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3.5 py-1.5 min-h-9 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-ink-black metric-mono"
                  />
                  <span className="hidden md:inline text-xs font-medium text-stone-gray">
                    {formatDisplayDateIndonesian(selectedDate)}
                  </span>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="btn-pill-primary text-xs py-1.5 px-3.5 min-h-9 inline-flex items-center gap-1.5"
                  >
                    {isExporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>

              {/* Live Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-gray" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari aktivitas, proyek, atau hasil pekerjaan..."
                  className="input-clay pl-9 text-xs font-medium w-full"
                />
              </div>
            </div>

            {/* Activity Cards */}
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="card-clay p-8 text-center text-xs text-stone-gray">
                  Tidak ada catatan aktivitas pada tanggal dan filter yang dipilih.
                </div>
              ) : (
                filteredActivities.map((act) => {
                  const statusCfg = STATUS_CONFIG[act.status];
                  return (
                    <article
                      key={act.id}
                      className="card-clay p-4 sm:p-5 space-y-3 hover:border-ink-black transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`} />
                            <span>{statusCfg.label}</span>
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warm-cream border border-sand-border text-stone-gray">
                            {CATEGORY_LABELS[act.category] || act.category}
                          </span>

                          {act.project && (
                            <span className="text-xs text-stone-gray font-medium inline-flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-ash-gray" />
                              <span>{act.project.name}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-gray">
                          <span className="font-semibold text-ink-black inline-flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-ash-gray" />
                            <span>{act.pic?.full_name}</span>
                          </span>
                          <span aria-hidden="true">•</span>
                          <span className="metric-mono">{act.activity_date}</span>
                          {act.duration_minutes && (
                            <>
                              <span aria-hidden="true">•</span>
                              <span className="metric-mono inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-ash-gray" />
                                <span>{act.duration_minutes}m</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-ink-black">{act.title}</h3>
                        {act.description && (
                          <p className="text-xs text-stone-gray mt-1 leading-relaxed max-w-[85ch]">
                            {act.description}
                          </p>
                        )}
                      </div>

                      {/* Notes & Output Link */}
                      {act.notes && (
                        <div className="p-3 rounded-xl bg-warm-cream border border-sand-border text-xs space-y-1.5">
                          <p className="text-slate-gray">
                            <strong className="font-semibold text-ink-black">Catatan:</strong>{' '}
                            {act.notes}
                          </p>
                          {act.output_url && (
                            <a
                              href={act.output_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-violet-pulse font-semibold hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka Bukti Hasil Kerja (Tautan Output)</span>
                            </a>
                          )}
                        </div>
                      )}

                      {!act.notes && act.output_url && (
                        <div className="pt-0.5">
                          <a
                            href={act.output_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-cream border border-sand-border text-xs font-semibold text-ink-black hover:border-ink-black transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-stone-gray" />
                            <span>Buka Bukti Hasil Kerja (Tautan Output)</span>
                          </a>
                        </div>
                      )}

                      {act.leader_note && (
                        <div className="p-3.5 rounded-xl bg-warm-cream border border-ink-black/25 text-xs flex items-start gap-2.5 text-ink-black">
                          <MessageSquare className="w-4 h-4 text-violet-pulse shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold block text-[11px] uppercase tracking-[0.05em] text-stone-gray">
                              Evaluasi Supervisor (Ferry Pratama):
                            </strong>
                            <p className="mt-0.5 leading-relaxed">{act.leader_note}</p>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
