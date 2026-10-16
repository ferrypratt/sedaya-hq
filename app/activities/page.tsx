'use client';

import { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { ActivitiesPdfDocument } from '@/components/modules/activities/activities-pdf-document';
import {
  getClientTodayString,
  getYesterdayString,
  getNextDayString,
  formatDisplayDateIndonesian,
} from '@/lib/utils/date-utils';
import {
  usePersistentState,
  STORAGE_KEYS,
  syncActivityToCloud,
  generateUUID,
  deleteFromCloud,
} from '@/lib/storage/persistence';
import {
  INITIAL_ACTIVITIES,
  INITIAL_PROFILES,
  INITIAL_PROJECTS,
} from '@/lib/data/seed-data';
import {
  DailyActivity,
  ActivityCategory,
  ActivityStatus,
} from '@/lib/types/database';
import {
  CalendarCheck,
  Plus,
  Clock,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  User,
  Building2,
  ExternalLink,
  Send,
  FileDown,
  Loader2,
  Pencil,
  Trash2,
  Share2,
  AlertTriangle,
} from 'lucide-react';

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  content_production: 'Produksi Konten',
  design: 'Desain Grafis',
  social_posting: 'Posting Medsos',
  community_management: 'Balas Chat / DM',
  seo_website: 'SEO & Website',
  google_maps: 'Optimasi G-Maps',
  reporting_monitoring: 'Monitoring & Laporan',
  event: 'Event & Pameran',
  offline_production: 'Produksi Cetak/Baliho',
  sales_support: 'Dukungan Sales/CRO',
  sosialisasi: 'Sosialisasi',
  meeting: 'Rapat Koordinasi',
  research: 'Riset Pasar / Housing',
  other: 'Lainnya',
};

const STATUS_CONFIG: Record<
  ActivityStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  planned: {
    label: 'Direncanakan',
    badgeClass: 'bg-warm-cream text-stone-gray border-sand-border',
    dotClass: 'bg-ash-gray',
  },
  in_progress: {
    label: 'Sedang Berjalan',
    badgeClass: 'bg-paper-white text-violet-pulse border-violet-pulse/40',
    dotClass: 'bg-violet-pulse',
  },
  done: {
    label: 'Selesai',
    badgeClass: 'bg-forest-surface text-forest border-forest-border',
    dotClass: 'bg-forest',
  },
  blocked: {
    label: 'Terkendala',
    badgeClass: 'bg-ember-surface text-ember-orange border-ember-border',
    dotClass: 'bg-ember-orange',
  },
  carried_over: {
    label: 'Dialihkan (Besok)',
    badgeClass: 'bg-warm-cream text-ink-black border-ink-black/30',
    dotClass: 'bg-ink-black',
  },
};

function getNextActivityId(): string {
  return generateUUID();
}

export default function ActivitiesPage() {
  const [activities, setActivities] = usePersistentState<DailyActivity[]>(
    STORAGE_KEYS.ACTIVITIES,
    INITIAL_ACTIVITIES
  );
  const [isExporting, setIsExporting] = useState(false);

  // PIC Filter strictly limited to Semua PIC, Ferry, and Ziyad
  const [picFilter, setPicFilter] = useState<'all' | 'ferry' | 'ziyad'>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState('2026-10-13');
  const [todayDate, setTodayDate] = useState('');
  const [yesterdayDate, setYesterdayDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  useEffect(() => {
    const today = getClientTodayString();
    const yesterday = getYesterdayString(today);
    setSelectedDate(today);
    setTodayDate(today);
    setYesterdayDate(yesterday);
  }, []);

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
        viewMode === 'day'
          ? `Harian (${formatDisplayDateIndonesian(selectedDate)})`
          : 'Semua Tanggal';

      const doc = (
        <ActivitiesPdfDocument
          activities={filteredActivities}
          dateTitle={dateLabel}
          picName={picLabel}
          generatedBy="Ferry Pratama (Supervisor)"
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
    } catch (err) {
      alert(`Gagal membuat PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Quick-Add Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pic_id: INITIAL_PROFILES[0].id,
    category: 'content_production' as ActivityCategory,
    project_id: INITIAL_PROJECTS[0].id,
    status: 'planned' as ActivityStatus,
    duration_minutes: 60,
    output_url: '',
    notes: '',
  });

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined') return;

    const picLabel =
      picFilter === 'ferry'
        ? 'Ferry Pratama'
        : picFilter === 'ziyad'
        ? 'Ziyad'
        : 'Semua PIC';

    const dateLabel =
      viewMode === 'day' ? formatDisplayDateIndonesian(selectedDate) : 'Seluruh Rekap Aktivitas';

    const totalCount = filteredActivities.length;
    const doneCount = filteredActivities.filter((a) => a.status === 'done').length;
    const inProgressCount = filteredActivities.filter((a) => a.status === 'in_progress').length;
    const blockedCount = filteredActivities.filter((a) => a.status === 'blocked').length;

    const doneItems = filteredActivities
      .filter((a) => a.status === 'done')
      .map((a, i) => `${i + 1}. [${a.project?.name || 'Umum'}] ${a.title}`)
      .join('\n');

    const pendingItems = filteredActivities
      .filter((a) => a.status !== 'done')
      .map((a, i) => {
        const stText =
          a.status === 'in_progress'
            ? 'Sedang Berjalan'
            : a.status === 'blocked'
            ? 'Terkendala'
            : 'Direncanakan';
        return `${i + 1}. [${a.project?.name || 'Umum'}] ${a.title} (${stText})`;
      })
      .join('\n');

    const publicUrl = `${window.location.origin}/activities/public`;

    const messageLines = [
      `*LOG AKTIVITAS HARIAN BRANDING & MARKETING*`,
      `Tanggal: ${dateLabel}`,
      `PIC: ${picLabel}`,
      ``,
      `*Ringkasan Progres:*`,
      `- Total Aktivitas: ${totalCount} Item`,
      `- Selesai: ${doneCount} Item`,
      `- Sedang Berjalan: ${inProgressCount} Item`,
      blockedCount > 0 ? `- Kendala: ${blockedCount} Item` : null,
      ``,
      `*Pekerjaan Selesai:*`,
      doneItems || '- Tidak ada aktivitas selesai',
      pendingItems ? `\n*Pekerjaan Berjalan / Tertunda:*\n${pendingItems}` : null,
      ``,
      `*Detail & Tautan Output:*`,
      publicUrl,
    ].filter((l) => l !== null).join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(messageLines);
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(messageLines)}`;
    window.open(waUrl, '_blank');
    showToast('Ringkasan disalin & membuka WhatsApp grup Daily Report!');
  };

  const handleCopyPublicLink = () => {
    if (typeof window !== 'undefined') {
      const publicUrl = `${window.location.origin}/activities/public`;
      navigator.clipboard.writeText(publicUrl);
      showToast('Tautan publik berhasil disalin ke clipboard! Siap dikirim ke WhatsApp grup Daily Report.');
    }
  };

  // Edit Activity State
  const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    pic_id: INITIAL_PROFILES[0].id,
    activity_date: '',
    category: 'content_production' as ActivityCategory,
    project_id: INITIAL_PROJECTS[0].id,
    status: 'planned' as ActivityStatus,
    duration_minutes: 60,
    output_url: '',
    notes: '',
    leader_note: '',
  });

  const handleOpenEditModal = (activity: DailyActivity) => {
    setEditingActivity(activity);
    setEditFormData({
      title: activity.title || '',
      description: activity.description || '',
      pic_id: activity.pic_id || INITIAL_PROFILES[0].id,
      activity_date: activity.activity_date || selectedDate,
      category: activity.category,
      project_id: activity.project_id || INITIAL_PROJECTS[0].id,
      status: activity.status,
      duration_minutes: activity.duration_minutes || 60,
      output_url: activity.output_url || '',
      notes: activity.notes || '',
      leader_note: activity.leader_note || '',
    });
  };

  const handleSaveEditActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;

    const picObj =
      INITIAL_PROFILES.find((p) => p.id === editFormData.pic_id) || INITIAL_PROFILES[0];
    const projectObj = INITIAL_PROJECTS.find((p) => p.id === editFormData.project_id);

    const updatedAct: DailyActivity = {
      ...editingActivity,
      title: editFormData.title,
      pic_id: editFormData.pic_id,
      activity_date: editFormData.activity_date,
      category: editFormData.category,
      project_id: editFormData.project_id || null,
      status: editFormData.status,
      duration_minutes: Number(editFormData.duration_minutes),
      description: editFormData.description || null,
      output_url: editFormData.output_url || null,
      notes: editFormData.notes || null,
      leader_note: editFormData.leader_note || null,
      updated_at: new Date().toISOString(),
      pic: picObj,
      project: projectObj,
    };

    setActivities(
      activities.map((a) => (a.id === updatedAct.id ? updatedAct : a))
    );
    setEditingActivity(null);
    showToast('Aktivitas berhasil diperbarui dan tersimpan ke cloud.');
  };

  // Delete Activity State
  const [deletingActivity, setDeletingActivity] = useState<DailyActivity | null>(null);

  const handleConfirmDelete = async () => {
    if (!deletingActivity) return;
    const targetId = deletingActivity.id;
    setActivities(activities.filter((a) => a.id !== targetId));
    setDeletingActivity(null);
    await deleteFromCloud(STORAGE_KEYS.ACTIVITIES, targetId);
    showToast('Aktivitas berhasil dihapus permanen dari sistem.');
  };

  // Leader Note Modal
  const [noteModalActivity, setNoteModalActivity] = useState<DailyActivity | null>(null);
  const [leaderNoteText, setLeaderNoteText] = useState('');

  const filteredActivities = activities.filter((act) => {
    if (picFilter === 'ferry' && !act.pic?.full_name.includes('Ferry')) return false;
    if (picFilter === 'ziyad' && !act.pic?.full_name.includes('Ziyad')) return false;
    if (viewMode === 'day' && act.activity_date !== selectedDate) return false;
    if (categoryFilter !== 'all' && act.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && act.status !== statusFilter) return false;
    if (projectFilter !== 'all' && act.project_id !== projectFilter) return false;
    return true;
  });

  const handleCarryOver = (activity: DailyActivity) => {
    const nextDate = getNextDayString(activity.activity_date || selectedDate);
    const carriedActivity: DailyActivity = {
      ...activity,
      id: getNextActivityId(),
      activity_date: nextDate,
      status: 'carried_over',
      notes: `${activity.notes || ''} [Dialihkan dari ${activity.activity_date}]`.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setActivities([carriedActivity, ...activities]);
  };

  const handleSaveLeaderNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalActivity) return;

    setActivities(
      activities.map((a) =>
        a.id === noteModalActivity.id ? { ...a, leader_note: leaderNoteText } : a
      )
    );
    setNoteModalActivity(null);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const picObj =
      INITIAL_PROFILES.find((p) => p.id === formData.pic_id) || INITIAL_PROFILES[0];
    const projectObj = INITIAL_PROJECTS.find((p) => p.id === formData.project_id);

    const newActivity: DailyActivity = {
      id: getNextActivityId(),
      activity_date: selectedDate,
      pic_id: formData.pic_id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      project_id: formData.project_id || null,
      status: formData.status,
      duration_minutes: Number(formData.duration_minutes),
      output_url: formData.output_url || null,
      notes: formData.notes || null,
      leader_note: null,
      created_at: `${selectedDate}T00:00:00Z`,
      updated_at: `${selectedDate}T00:00:00Z`,
      pic: picObj,
      project: projectObj,
    };

    setActivities([newActivity, ...activities]);
    syncActivityToCloud(newActivity as unknown as Record<string, unknown>);
    setIsAddOpen(false);
    setFormData({
      title: '',
      description: '',
      pic_id: INITIAL_PROFILES[0].id,
      category: 'content_production',
      project_id: INITIAL_PROJECTS[0].id,
      status: 'planned',
      duration_minutes: 60,
      output_url: '',
      notes: '',
    });
  };

  return (
    <AppShell>
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

      <div className="space-y-6">
        <PageHeader
          section="Operasional Harian"
          meta={<span className="metric-mono">{filteredActivities.length} Log Ditampilkan</span>}
          title="Aktivitas Harian Tim"
          description="Pencatatan eksekusi kerja harian, bukti output konten/desain, pengalihan tugas (carry over), dan catatan evaluasi supervisor."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="btn-pill-ghost text-xs py-2 px-3 text-forest border-forest-border/40 hover:bg-forest-surface transition-colors"
                title="Kirim ringkasan laporan harian langsung ke WhatsApp grup Daily Report"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Kirim ke WA Daily Report</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPublicLink}
                className="btn-pill-ghost text-xs py-2 px-3"
                title="Salin tautan publik khusus peninjauan tim & manajemen"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-gray" />
                <span>Link Publik</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="btn-pill-ghost text-xs py-2 px-3"
                title="Export daftar aktivitas ke format PDF (.pdf)"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-gray" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-stone-gray" />
                )}
                <span>{isExporting ? 'Menyiapkan PDF...' : 'Export PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-terracotta text-paper-white hover:bg-terracotta-hover active:scale-[0.97] transition-all shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Aktivitas</span>
              </button>
            </div>
          }
        />

        {/* Primary Workbench Bar: PIC Filter (Semua PIC, Ferry, Ziyad) & Date Mode */}
        <div className="p-3 rounded-2xl bg-warm-cream border border-sand-border flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Filter PIC"
            className="flex flex-wrap items-center gap-1.5 p-1 bg-paper-white border border-sand-border rounded-full self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={picFilter === 'all'}
              onClick={() => setPicFilter('all')}
              className={`px-4 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                picFilter === 'all'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Semua PIC
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={picFilter === 'ferry'}
              onClick={() => setPicFilter('ferry')}
              className={`px-4 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                picFilter === 'ferry'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <span>Ferry</span>
              <span className="text-[10px] opacity-75">(Leader)</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={picFilter === 'ziyad'}
              onClick={() => setPicFilter('ziyad')}
              className={`px-4 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                picFilter === 'ziyad'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <span>Ziyad</span>
              <span className="text-[10px] opacity-75">(Sr. Branding)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center p-1 bg-paper-white border border-sand-border rounded-full">
              <button
                type="button"
                onClick={() => {
                  setViewMode('day');
                  setSelectedDate(todayDate || getClientTodayString());
                }}
                className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                  viewMode === 'day' && todayDate && selectedDate === todayDate
                    ? 'bg-ink-black text-paper-white'
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
                className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                  viewMode === 'day' && yesterdayDate && selectedDate === yesterdayDate
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                  viewMode === 'week'
                    ? 'bg-ink-black text-paper-white'
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
                  aria-label="Pilih tanggal aktivitas"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3.5 py-2 min-h-9 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-ink-black metric-mono shadow-sm"
                />
                <span className="hidden md:inline text-xs font-medium text-stone-gray">
                  {formatDisplayDateIndonesian(selectedDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Attribute Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="filter-category" className="sr-only">
              Filter Kategori
            </label>
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-clay text-xs font-medium"
            >
              <option value="all">Semua Kategori Pekerjaan</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-status" className="sr-only">
              Filter Status
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-clay text-xs font-medium"
            >
              <option value="all">Semua Status Penyelesaian</option>
              <option value="planned">Direncanakan</option>
              <option value="in_progress">Sedang Berjalan</option>
              <option value="done">Selesai</option>
              <option value="blocked">Terkendala</option>
              <option value="carried_over">Dialihkan</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-project" className="sr-only">
              Filter Proyek
            </label>
            <select
              id="filter-project"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="input-clay text-xs font-medium"
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

        {/* Activities Ledger */}
        {filteredActivities.length === 0 ? (
          <div className="card-clay p-12 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-warm-cream border border-sand-border flex items-center justify-center mx-auto text-stone-gray">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-base text-ink-black">
              {viewMode === 'day' && selectedDate
                ? `Belum Ada Aktivitas untuk ${formatDisplayDateIndonesian(selectedDate)}`
                : 'Belum Ada Aktivitas Tercatat'}
            </h2>
            <p className="text-xs text-stone-gray max-w-md mx-auto leading-relaxed">
              {viewMode === 'day'
                ? 'Belum ada pekerjaan tercatat untuk tanggal yang dipilih. Mulai catat pekerjaan hari ini atau lihat arsip pekerjaan kemarin.'
                : 'Mulai catat pekerjaan harian untuk PIC yang dipilih agar rekapitulasi produktivitas dan laporan mingguan terisi secara otomatis.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-terracotta text-paper-white hover:bg-terracotta-hover active:scale-[0.97] transition-all shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Aktivitas</span>
              </button>
              {viewMode === 'day' && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(getYesterdayString(selectedDate))}
                  className="px-4 py-2 min-h-10 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-ink-black hover:bg-warm-cream transition-colors"
                >
                  Lihat Aktivitas Kemarin
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((act) => {
              const statusCfg = STATUS_CONFIG[act.status];
              return (
                <article
                  key={act.id}
                  className="bento-card p-5 space-y-3"
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
                        {CATEGORY_LABELS[act.category]}
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
                      <p className="text-xs text-stone-gray mt-1 leading-relaxed max-w-[75ch]">
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
                          className="inline-flex items-center gap-1 text-violet-pulse font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka Tautan Output</span>
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
                        <span>Buka Tautan Output</span>
                      </a>
                    </div>
                  )}

                  {act.leader_note && (
                    <div className="p-3.5 rounded-xl bg-warm-cream border border-ink-black/25 text-xs flex items-start gap-2.5 text-ink-black">
                      <MessageSquare className="w-4 h-4 text-violet-pulse shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block text-[11px] uppercase tracking-[0.05em] text-stone-gray">
                          Evaluasi Supervisor (Ferry):
                        </strong>
                        <p className="mt-0.5 leading-relaxed">{act.leader_note}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-sand-border flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {act.status !== 'done' && (
                        <button
                          type="button"
                          onClick={() => handleCarryOver(act)}
                          className="btn-pill-ghost text-xs py-1.5 px-3 min-h-9"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Carry Over ke Besok</span>
                        </button>
                      )}

                      {act.status !== 'done' && (
                        <button
                          type="button"
                          onClick={() =>
                            setActivities(
                              activities.map((a) =>
                                a.id === act.id ? { ...a, status: 'done' } : a
                              )
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-9 rounded-full bg-forest-surface text-forest border border-forest-border text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tandai Selesai</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(act)}
                        className="btn-pill-ghost text-xs py-1.5 px-3 min-h-9"
                        title="Edit rincian aktivitas"
                      >
                        <Pencil className="w-3.5 h-3.5 text-stone-gray" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingActivity(act)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-9 rounded-full border border-sand-border text-xs font-semibold text-stone-gray hover:text-ember hover:border-ember/40 hover:bg-ember-surface/40 transition-colors"
                        title="Hapus aktivitas ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNoteModalActivity(act);
                        setLeaderNoteText(act.leader_note || '');
                      }}
                      className="text-xs font-semibold text-stone-gray hover:text-ink-black underline underline-offset-4 py-1.5 px-2"
                    >
                      {act.leader_note ? 'Edit Catatan Supervisor' : '+ Catatan Supervisor'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Modal: Create Activity */}
        <Modal
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Catat Aktivitas Harian"
          subtitle="Dokumentasikan tugas harian dan tautan hasil kerja tim."
        >
          <form onSubmit={handleCreateActivity} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Judul Tugas / Aktivitas *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Produksi Video Reels Update Pembangunan"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-clay"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  PIC Penanggung Jawab *
                </label>
                <select
                  value={formData.pic_id}
                  onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                  className="input-clay text-xs font-semibold"
                >
                  <option value={INITIAL_PROFILES[0].id}>Ferry (Leader)</option>
                  <option value={INITIAL_PROFILES[1].id}>Ziyad (Sr. Officer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Kategori Aktivitas *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as ActivityCategory,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Proyek Terkait
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData({ ...formData, project_id: e.target.value })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value="">Semua / Korporat</option>
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Status Penyelesaian
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ActivityStatus,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value="planned">Direncanakan</option>
                  <option value="in_progress">Sedang Berjalan</option>
                  <option value="done">Selesai</option>
                  <option value="blocked">Terkendala</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Deskripsi Ringkas
              </label>
              <textarea
                rows={2}
                placeholder="Rincian pengerjaan atau catatan lapangan..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Estimasi Durasi (Menit)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: Number(e.target.value),
                    })
                  }
                  className="input-clay metric-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Tautan Output / Bukti Kerja
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.output_url}
                  onChange={(e) =>
                    setFormData({ ...formData, output_url: e.target.value })
                  }
                  className="input-clay"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="btn-pill-ghost"
              >
                Batal
              </button>
              <button type="submit" className="btn-pill-primary">
                Simpan Aktivitas
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Leader Note */}
        <Modal
          open={Boolean(noteModalActivity)}
          onClose={() => setNoteModalActivity(null)}
          title="Catatan Evaluasi Supervisor"
          subtitle={
            noteModalActivity
              ? `${noteModalActivity.title} (${noteModalActivity.pic?.full_name})`
              : undefined
          }
          maxWidthClass="max-w-md"
        >
          <form onSubmit={handleSaveLeaderNote} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1.5">
                Arahan / Feedback Supervisor
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tuliskan catatan evaluasi, revisi, atau tindak lanjut..."
                value={leaderNoteText}
                onChange={(e) => setLeaderNoteText(e.target.value)}
                className="input-clay"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setNoteModalActivity(null)}
                className="btn-pill-ghost"
              >
                Batal
              </button>
              <button type="submit" className="btn-pill-primary">
                <Send className="w-3.5 h-3.5" />
                <span>Simpan Catatan</span>
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Activity */}
        <Modal
          open={Boolean(editingActivity)}
          onClose={() => setEditingActivity(null)}
          title="Edit Rincian Aktivitas"
          subtitle="Perbarui data tugas, durasi, status, atau catatan output."
        >
          <form onSubmit={handleSaveEditActivity} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Judul Tugas / Aktivitas *
              </label>
              <input
                type="text"
                required
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  PIC Penanggung Jawab *
                </label>
                <select
                  value={editFormData.pic_id}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, pic_id: e.target.value })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value={INITIAL_PROFILES[0].id}>Ferry Pratama (Supervisor)</option>
                  <option value={INITIAL_PROFILES[1].id}>Ziyad (Sr. Officer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Tanggal Aktivitas *
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.activity_date}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, activity_date: e.target.value })
                  }
                  className="input-clay text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Kategori Aktivitas *
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      category: e.target.value as ActivityCategory,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Proyek Terkait
                </label>
                <select
                  value={editFormData.project_id}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, project_id: e.target.value })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value="">Semua / Korporat</option>
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Status Penyelesaian
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as ActivityStatus,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value="planned">Direncanakan</option>
                  <option value="in_progress">Sedang Berjalan</option>
                  <option value="done">Selesai</option>
                  <option value="blocked">Terkendala</option>
                  <option value="carried_over">Dialihkan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Estimasi Durasi (Menit)
                </label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={editFormData.duration_minutes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      duration_minutes: Number(e.target.value),
                    })
                  }
                  className="input-clay metric-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Deskripsi Ringkas
              </label>
              <textarea
                rows={2}
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Tautan Output / Bukti Kerja
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editFormData.output_url}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, output_url: e.target.value })
                  }
                  className="input-clay"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Catatan pengerjaan..."
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  className="input-clay"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Evaluasi / Arahan Supervisor (Ferry Pratama)
              </label>
              <textarea
                rows={2}
                placeholder="Catatan dari supervisor..."
                value={editFormData.leader_note}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, leader_note: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingActivity(null)}
                className="btn-pill-ghost"
              >
                Batal
              </button>
              <button type="submit" className="btn-pill-primary">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Delete Confirmation */}
        <Modal
          open={Boolean(deletingActivity)}
          onClose={() => setDeletingActivity(null)}
          title="Konfirmasi Hapus Aktivitas"
          subtitle="Tindakan ini permanen dan akan menghapus data dari database cloud."
          maxWidthClass="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-ember-surface/30 border border-ember/25 text-xs text-ink-black space-y-2">
              <div className="flex items-center gap-2 text-ember font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Peringatan Penghapusan</span>
              </div>
              <p className="leading-relaxed">
                Aktivitas berikut akan dihapus secara permanen dari daftar dan database:
              </p>
              <p className="font-semibold text-ink-black bg-paper-white p-2.5 rounded-lg border border-sand-border">
                {deletingActivity?.title}
              </p>
              <p className="text-[11px] text-stone-gray">
                PIC: {deletingActivity?.pic?.full_name} • Tanggal: {deletingActivity?.activity_date}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingActivity(null)}
                className="btn-pill-ghost text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ember text-paper-white text-xs font-semibold hover:bg-ember/90 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
