'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { pdf } from '@react-pdf/renderer';
import { ActivitiesPdfDocument } from '@/components/modules/activities/activities-pdf-document';
import {
  getClientTodayString,
  getYesterdayString,
  formatDisplayDateIndonesian,
} from '@/lib/utils/date-utils';
import {
  INITIAL_ACTIVITIES,
  INITIAL_PROJECTS,
} from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS } from '@/lib/storage/persistence';
import { DailyActivity, ActivityStatus } from '@/lib/types/database';
import {
  CalendarCheck,
  Building2,
  Clock,
  User,
  ExternalLink,
  MessageSquare,
  Search,
  FileDown,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  content_production: 'Produksi Konten',
  design: 'Desain Grafis',
  copywriting: 'Copywriting',
  ads_management: 'Iklan Berbayar',
  social_media_ops: 'Operasional Medsos',
  field_coverage: 'Liputan Lapangan',
  reporting: 'Laporan & Analisis',
  coordination: 'Koordinasi Tim',
  general: 'Pekerjaan Umum',
};

const STATUS_CONFIG: Record<
  ActivityStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  planned: {
    label: 'Direncanakan',
    badgeClass: 'bg-warm-cream text-stone-gray border-sand-border',
    dotClass: 'bg-stone-gray',
  },
  in_progress: {
    label: 'Sedang Berjalan',
    badgeClass: 'bg-warm-cream text-ink-black border-sand-border',
    dotClass: 'bg-ink-black',
  },
  done: {
    label: 'Selesai',
    badgeClass: 'bg-forest-surface text-forest border-forest-border',
    dotClass: 'bg-forest',
  },
  blocked: {
    label: 'Terkendala',
    badgeClass: 'bg-ember-surface text-ember border-ember-border',
    dotClass: 'bg-ember',
  },
  carried_over: {
    label: 'Dialihkan',
    badgeClass: 'bg-warm-cream text-ink-black border-ink-black/30',
    dotClass: 'bg-ink-black',
  },
};

export default function PublicActivitiesPage() {
  const [activities] = usePersistentState<DailyActivity[]>(
    STORAGE_KEYS.ACTIVITIES,
    INITIAL_ACTIVITIES
  );

  const [picFilter, setPicFilter] = useState<'all' | 'ferry' | 'ziyad'>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState('2026-10-13');
  const [todayDate, setTodayDate] = useState('');
  const [yesterdayDate, setYesterdayDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const today = getClientTodayString();
    const yesterday = getYesterdayString(today);
    setSelectedDate(today);
    setTodayDate(today);
    setYesterdayDate(yesterday);
  }, []);

  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Tautan publik berhasil disalin ke clipboard! Siap dibagikan ke WhatsApp.');
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (picFilter === 'ferry' && !act.pic?.full_name.includes('Ferry')) return false;
      if (picFilter === 'ziyad' && !act.pic?.full_name.includes('Ziyad')) return false;
      if (viewMode === 'day' && act.activity_date !== selectedDate) return false;
      if (categoryFilter !== 'all' && act.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && act.status !== statusFilter) return false;
      if (projectFilter !== 'all' && act.project_id !== projectFilter) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const titleMatch = act.title.toLowerCase().includes(query);
        const descMatch = (act.description || '').toLowerCase().includes(query);
        const picMatch = (act.pic?.full_name || '').toLowerCase().includes(query);
        const projectMatch = (act.project?.name || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !picMatch && !projectMatch) return false;
      }

      return true;
    });
  }, [
    activities,
    picFilter,
    viewMode,
    selectedDate,
    categoryFilter,
    statusFilter,
    projectFilter,
    searchQuery,
  ]);

  const kpis = useMemo(() => {
    const total = filteredActivities.length;
    const done = filteredActivities.filter((a) => a.status === 'done').length;
    const inProgress = filteredActivities.filter((a) => a.status === 'in_progress').length;
    const issues = filteredActivities.filter((a) => a.status === 'blocked').length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, issues, completionRate };
  }, [filteredActivities]);

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
    <div className="min-h-screen bg-sand-background text-ink-black flex flex-col font-sans selection:bg-amber-100">
      {/* Toast Notification */}
      {toastMessage && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-ink-black text-paper-white px-4 py-3 rounded-xl shadow-lg border border-sand-border text-xs flex items-center gap-2 transition-transform"
        >
          <CheckCircle2 className="w-4 h-4 text-forest-emerald shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Public Executive Header */}
      <header className="border-b border-sand-border bg-paper-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-black text-paper-white flex items-center justify-center font-bold tracking-tight text-sm shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-ink-black">
                  Sedaya Property
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-warm-cream border border-sand-border text-stone-gray">
                  <ShieldCheck className="w-3 h-3 text-forest" />
                  <span>Akses Publik Eksekutif</span>
                </span>
              </div>
              <p className="text-xs text-stone-gray">
                Monitoring Aktivitas Harian Branding & Pemasaran
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-pill-ghost text-xs py-2 px-3.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Salin Link Publik</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              className="btn-pill-primary text-xs py-2 px-3.5 disabled:opacity-60"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Memproses PDF...' : 'Export PDF Resmi'}</span>
            </button>

            <Link
              href="/login"
              className="btn-pill-ghost text-xs py-2 px-3 text-stone-gray"
            >
              Masuk Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* Banner Direksi & Manajemen */}
        <div className="rounded-2xl border border-sand-border bg-gradient-to-r from-warm-cream to-paper-white p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-paper-white border border-sand-border text-ink-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-violet-pulse" />
            <span>Laporan Real-Time Khusus Direksi & Manajemen</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
            Rekapitulasi Aktivitas Harian Tim
          </h1>
          <p className="text-xs sm:text-sm text-stone-gray leading-relaxed max-w-3xl">
            Transparansi penuh progres harian divisi pemasaran dan branding Sedaya Group. Data diperbarui secara real-time dari lapangan dan kantor pusat untuk peninjauan langsung tanpa hambatan login.
          </p>
        </div>

        {/* Executive KPI Summary */}
        <section aria-label="Ringkasan Kinerja" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-clay p-4 space-y-1">
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider">
              Total Log Aktivitas
            </span>
            <div className="metric-mono text-2xl font-bold text-ink-black">
              {kpis.total}
            </div>
            <p className="text-[11px] text-stone-gray">Tercatat dalam filter saat ini</p>
          </div>

          <div className="card-clay p-4 space-y-1">
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider">
              Penyelesaian
            </span>
            <div className="metric-mono text-2xl font-bold text-forest">
              {kpis.completionRate}%
            </div>
            <p className="text-[11px] text-stone-gray">{kpis.done} dari {kpis.total} tugas tuntas</p>
          </div>

          <div className="card-clay p-4 space-y-1">
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider">
              Sedang Berjalan
            </span>
            <div className="metric-mono text-2xl font-bold text-ink-black">
              {kpis.inProgress}
            </div>
            <p className="text-[11px] text-stone-gray">Proses pengerjaan aktif</p>
          </div>

          <div className="card-clay p-4 space-y-1">
            <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider">
              Terkendala / Review
            </span>
            <div className="metric-mono text-2xl font-bold text-ember">
              {kpis.issues}
            </div>
            <p className="text-[11px] text-stone-gray">Butuh atensi atau arahan</p>
          </div>
        </section>

        {/* Interactive Filters Bar */}
        <section aria-label="Filter Aktivitas" className="card-clay p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* PIC Filters */}
            <div className="flex items-center gap-1 p-1 bg-warm-cream rounded-full border border-sand-border self-start">
              <button
                type="button"
                onClick={() => setPicFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  picFilter === 'all'
                    ? 'bg-ink-black text-paper-white shadow-xs'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Semua PIC
              </button>
              <button
                type="button"
                onClick={() => setPicFilter('ferry')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  picFilter === 'ferry'
                    ? 'bg-ink-black text-paper-white shadow-xs'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Ferry Pratama
              </button>
              <button
                type="button"
                onClick={() => setPicFilter('ziyad')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  picFilter === 'ziyad'
                    ? 'bg-ink-black text-paper-white shadow-xs'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Ziyad
              </button>
            </div>

            {/* Date Mode Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-warm-cream rounded-full border border-sand-border">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('day');
                    setSelectedDate(todayDate || getClientTodayString());
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    viewMode === 'day' && todayDate && selectedDate === todayDate
                      ? 'bg-paper-white text-ink-black shadow-xs font-bold'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('day');
                    setSelectedDate(yesterdayDate || getYesterdayString());
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    viewMode === 'day' && yesterdayDate && selectedDate === yesterdayDate
                      ? 'bg-paper-white text-ink-black shadow-xs font-bold'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Kemarin
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    viewMode === 'week'
                      ? 'bg-paper-white text-ink-black shadow-xs font-bold'
                      : 'text-stone-gray hover:text-ink-black'
                  }`}
                >
                  Semua Tanggal
                </button>
              </div>

              {viewMode === 'day' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-clay text-xs font-medium py-1.5 px-3 metric-mono"
                    aria-label="Pilih tanggal aktivitas"
                  />
                  <span className="hidden md:inline text-xs font-medium text-stone-gray">
                    {formatDisplayDateIndonesian(selectedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Filter Row + Live Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-sand-border">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tugas, output, atau PIC..."
                className="input-clay pl-9 text-xs font-medium w-full"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-clay text-xs font-medium w-full"
                aria-label="Filter status penyelesaian"
              >
                <option value="all">Semua Status</option>
                <option value="planned">Direncanakan</option>
                <option value="in_progress">Sedang Berjalan</option>
                <option value="done">Selesai</option>
                <option value="blocked">Terkendala</option>
                <option value="carried_over">Dialihkan</option>
              </select>
            </div>

            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-clay text-xs font-medium w-full"
                aria-label="Filter kategori tugas"
              >
                <option value="all">Semua Kategori</option>
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="input-clay text-xs font-medium w-full"
                aria-label="Filter proyek"
              >
                <option value="all">Semua Proyek & Entitas</option>
                {INITIAL_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Activities Ledger */}
        <section aria-label="Daftar Aktivitas" className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-gray px-1">
            <span>
              Menampilkan <strong className="text-ink-black">{filteredActivities.length}</strong> aktivitas
            </span>
            <span className="text-[11px] font-medium">
              {viewMode === 'day' ? formatDisplayDateIndonesian(selectedDate) : 'Rekapitulasi Lengkap'}
            </span>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="card-clay p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-warm-cream border border-sand-border flex items-center justify-center mx-auto text-stone-gray">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-base text-ink-black">
                {viewMode === 'day' && selectedDate
                  ? `Tidak Ada Aktivitas untuk ${formatDisplayDateIndonesian(selectedDate)}`
                  : 'Tidak Ada Aktivitas Ditemukan'}
              </h2>
              <p className="text-xs text-stone-gray max-w-md mx-auto leading-relaxed">
                {viewMode === 'day'
                  ? 'Belum ada log pekerjaan pada tanggal ini. Anda dapat memeriksa arsip aktivitas kemarin atau mengganti filter di atas.'
                  : 'Tidak ada log pekerjaan yang cocok dengan filter atau kata kunci pencarian yang dipilih. Coba sesuaikan pilihan filter di atas.'}
              </p>
              {viewMode === 'day' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate(getYesterdayString(selectedDate))}
                    className="px-4 py-2 min-h-10 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-ink-black hover:bg-warm-cream transition-colors"
                  >
                    Lihat Aktivitas Kemarin
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((act) => {
                const statusCfg = STATUS_CONFIG[act.status];
                return (
                  <article
                    key={act.id}
                    className="card-clay p-5 space-y-3 hover:border-ink-black transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badgeClass}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass}`}
                          />
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
                          <span>{act.pic?.full_name || 'PIC'}</span>
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
              })}
            </div>
          )}
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-sand-border py-6 text-center text-xs text-stone-gray bg-paper-white/50">
        <p>
          Sedaya Property HQ • Sistem Monitoring Terpadu Direksi & Manajemen
        </p>
      </footer>
    </div>
  );
}
