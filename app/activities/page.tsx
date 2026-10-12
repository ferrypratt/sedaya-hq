'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
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
  PlusCircle,
  Filter,
  Clock,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  User,
  Building2,
  ExternalLink,
  X,
  Send,
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
  sosialisasi: 'Sosialisasi Instansi',
  meeting: 'Rapat Koordinasi',
  research: 'Riset Pasar / Housing',
  other: 'Lainnya',
};

const STATUS_CONFIG: Record<
  ActivityStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  planned: { label: 'Direncanakan', bg: 'bg-warm-cream', text: 'text-stone-gray', border: 'border-sand-border' },
  in_progress: { label: 'Sedang Berjalan', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  done: { label: 'Selesai', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  blocked: { label: 'Terkendala', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  carried_over: { label: 'Dialihkan (Besok)', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
};

let nextActivityId = 100;
function getNextActivityId() {
  nextActivityId += 1;
  return `act-${nextActivityId}`;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<DailyActivity[]>(INITIAL_ACTIVITIES);

  // PIC Filter: Ferry, Ziyad, All (Shella removed per instruction)
  const [picFilter, setPicFilter] = useState<'all' | 'ferry' | 'ziyad'>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

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

  // Leader Note Modal
  const [noteModalActivity, setNoteModalActivity] = useState<DailyActivity | null>(null);
  const [leaderNoteText, setLeaderNoteText] = useState('');

  // Filtering
  const filteredActivities = activities.filter((act) => {
    // PIC filter
    if (picFilter === 'ferry' && !act.pic?.full_name.includes('Ferry')) return false;
    if (picFilter === 'ziyad' && !act.pic?.full_name.includes('Ziyad')) return false;

    // Date filter in day view
    if (viewMode === 'day' && act.activity_date !== selectedDate) return false;

    // Category filter
    if (categoryFilter !== 'all' && act.category !== categoryFilter) return false;

    // Status filter
    if (statusFilter !== 'all' && act.status !== statusFilter) return false;

    // Project filter
    if (projectFilter !== 'all' && act.project_id !== projectFilter) return false;

    return true;
  });

  // Action: Carry Over to Tomorrow
  const handleCarryOver = (activity: DailyActivity) => {
    const carriedActivity: DailyActivity = {
      ...activity,
      id: getNextActivityId(),
      activity_date: '2026-10-13',
      status: 'carried_over',
      notes: `${activity.notes || ''} [Dialihkan dari ${activity.activity_date}]`.trim(),
      created_at: '2026-10-13T00:00:00Z',
      updated_at: '2026-10-13T00:00:00Z',
    };

    setActivities([carriedActivity, ...activities]);
  };

  // Action: Add Leader Note
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

  // Action: Create New Activity
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const picObj = INITIAL_PROFILES.find((p) => p.id === formData.pic_id) || INITIAL_PROFILES[0];
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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warm-cream border border-sand-border text-xs text-stone-gray font-medium mb-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-ink-black" />
              <span>Operasional Harian Tim</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              Aktivitas Harian
            </h1>
            <p className="text-sm text-stone-gray">
              Pencatatan tugas, pelaporan hasil kerja, alih tugas (carry over), dan evaluasi supervisor.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="btn-pill-primary text-xs sm:text-sm inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Catat Aktivitas</span>
          </button>
        </div>

        {/* Control Bar: PIC Tabs & View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-warm-cream border border-sand-border">
          {/* PIC Tabs: Ferry, Ziyad, All */}
          <div className="flex items-center gap-1 p-1 bg-paper-white border border-sand-border rounded-full self-start">
            <button
              onClick={() => setPicFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                picFilter === 'all'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              Semua PIC
            </button>
            <button
              onClick={() => setPicFilter('ferry')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                picFilter === 'ferry'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <span>Ferry</span>
              <span className="text-[10px] opacity-75">(Leader)</span>
            </button>
            <button
              onClick={() => setPicFilter('ziyad')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                picFilter === 'ziyad'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <span>Ziyad</span>
              <span className="text-[10px] opacity-75">(Sr. Branding)</span>
            </button>
          </div>

          {/* View Switcher & Date */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-paper-white border border-sand-border rounded-full">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  viewMode === 'day'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  viewMode === 'week'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Mingguan
              </button>
            </div>

            {viewMode === 'day' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-sand-border bg-paper-white text-xs font-medium text-ink-black"
              />
            )}
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-stone-gray font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-cool-mist bg-paper-white text-ink-black text-xs font-medium"
          >
            <option value="all">Semua Kategori</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-cool-mist bg-paper-white text-ink-black text-xs font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="planned">Direncanakan</option>
            <option value="in_progress">Sedang Berjalan</option>
            <option value="done">Selesai</option>
            <option value="blocked">Terkendala</option>
            <option value="carried_over">Dialihkan</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-cool-mist bg-paper-white text-ink-black text-xs font-medium"
          >
            <option value="all">Semua Proyek</option>
            {INITIAL_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <span className="ml-auto text-stone-gray font-medium">
            {filteredActivities.length} aktivitas ditampilkan
          </span>
        </div>

        {/* Activities List */}
        {filteredActivities.length === 0 ? (
          <div className="p-12 rounded-[24px] bg-paper-white border border-sand-border text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-warm-cream border border-sand-border flex items-center justify-center mx-auto text-stone-gray">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-ink-black">Belum Ada Aktivitas</h3>
            <p className="text-xs text-stone-gray max-w-sm mx-auto">
              Tidak ada aktivitas yang sesuai dengan kriteria filter tanggal dan PIC saat ini.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="btn-pill-primary text-xs inline-flex items-center gap-1.5 mt-2"
            >
              <span>+ Tambah Aktivitas Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((act) => {
              const statusCfg = STATUS_CONFIG[act.status];
              return (
                <div
                  key={act.id}
                  className="p-5 rounded-[20px] bg-paper-white border border-sand-border hover:border-ink-black transition space-y-3"
                >
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-warm-cream border border-sand-border text-stone-gray">
                        {CATEGORY_LABELS[act.category]}
                      </span>
                      {act.project && (
                        <span className="text-xs text-stone-gray font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{act.project.name}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-gray">
                      <span className="font-semibold text-ink-black flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{act.pic?.full_name}</span>
                      </span>
                      <span>•</span>
                      <span>{act.activity_date}</span>
                      {act.duration_minutes && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{act.duration_minutes} menit</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-ink-black">{act.title}</h3>
                    {act.description && (
                      <p className="text-xs text-stone-gray mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    )}
                  </div>

                  {/* Notes & Output Link */}
                  {(act.notes || act.output_url) && (
                    <div className="p-3 rounded-xl bg-warm-cream border border-sand-border text-xs space-y-1.5">
                      {act.notes && (
                        <p className="text-stone-gray">
                          <strong className="text-ink-black">Catatan Hasil:</strong> {act.notes}
                        </p>
                      )}
                      {act.output_url && (
                        <a
                          href={act.output_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-violet-pulse font-semibold hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Lihat Output / Bukti Konten</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Leader Note Banner */}
                  {act.leader_note ? (
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs flex items-start gap-2.5 text-purple-950">
                      <MessageSquare className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-[11px] text-purple-800 uppercase tracking-wider">
                          Catatan Supervisor / Leader (Ferry):
                        </strong>
                        <p className="mt-0.5">{act.leader_note}</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-cool-mist flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Carry over button */}
                      <button
                        onClick={() => handleCarryOver(act)}
                        className="px-3 py-1 rounded-full border border-sand-border text-stone-gray hover:text-ink-black hover:bg-warm-cream text-xs font-semibold inline-flex items-center gap-1.5 transition"
                        title="Alihkan ke jadwal besok"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Carry Over ke Besok</span>
                      </button>

                      {/* Status quick toggle */}
                      {act.status !== 'done' && (
                        <button
                          onClick={() =>
                            setActivities(
                              activities.map((a) => (a.id === act.id ? { ...a, status: 'done' } : a))
                            )
                          }
                          className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tandai Selesai</span>
                        </button>
                      )}
                    </div>

                    {/* Leader Note trigger */}
                    <button
                      onClick={() => {
                        setNoteModalActivity(act);
                        setLeaderNoteText(act.leader_note || '');
                      }}
                      className="text-xs font-semibold text-stone-gray hover:text-ink-black underline decoration-sand-border underline-offset-4"
                    >
                      {act.leader_note ? 'Edit Catatan Leader' : '+ Beri Catatan Leader'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Quick Add Activity */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper-white border border-sand-border rounded-[28px] max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-sand-border mb-4">
                <h3 className="font-bold text-base text-ink-black">Catat Aktivitas Harian</h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 rounded-full text-stone-gray hover:text-ink-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-gray uppercase tracking-wider mb-1">
                    Judul Tugas / Aktivitas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Produksi Video Reels Promo SP3K"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-cool-mist text-sm font-medium focus:outline-none focus:border-ink-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      PIC Penanggung Jawab *
                    </label>
                    <select
                      value={formData.pic_id}
                      onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold focus:outline-none"
                    >
                      <option value={INITIAL_PROFILES[0].id}>Ferry (Leader)</option>
                      <option value={INITIAL_PROFILES[1].id}>Ziyad (Sr. Officer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Kategori Aktivitas *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as ActivityCategory })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold focus:outline-none"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Proyek Terkait
                    </label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold focus:outline-none"
                    >
                      <option value="">Semua / Umum</option>
                      {INITIAL_PROJECTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Status Awal
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as ActivityStatus })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold focus:outline-none"
                    >
                      <option value="planned">Direncanakan</option>
                      <option value="in_progress">Sedang Berjalan</option>
                      <option value="done">Selesai</option>
                      <option value="blocked">Terkendala</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-gray mb-1">
                    Deskripsi Ringkas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Penjelasan detail pekerjaan atau kendala..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none focus:border-ink-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Estimasi Durasi (Menit)
                    </label>
                    <input
                      type="number"
                      min="10"
                      step="10"
                      value={formData.duration_minutes}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_minutes: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tautan Output / Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.output_url}
                      onChange={(e) => setFormData({ ...formData, output_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-sand-border text-xs font-semibold text-stone-gray"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:opacity-90"
                  >
                    Simpan Aktivitas
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Leader Note */}
        {noteModalActivity && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper-white border border-sand-border rounded-[28px] max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-sand-border mb-3">
                <h3 className="font-bold text-sm text-ink-black">Catatan Evaluasi Leader</h3>
                <button
                  onClick={() => setNoteModalActivity(null)}
                  className="p-1 rounded-full text-stone-gray hover:text-ink-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-3 p-2.5 rounded-xl bg-warm-cream border border-sand-border text-xs">
                <span className="text-ash-gray block text-[10px] uppercase font-semibold">Tugas:</span>
                <span className="font-semibold text-ink-black">{noteModalActivity.title}</span>
                <span className="text-stone-gray block mt-0.5">PIC: {noteModalActivity.pic?.full_name}</span>
              </div>

              <form onSubmit={handleSaveLeaderNote} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-gray mb-1">
                    Instruksi / Feedback Leader
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan arahan, revisi, atau apresiasi untuk petugas..."
                    value={leaderNoteText}
                    onChange={(e) => setLeaderNoteText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cool-mist text-xs focus:outline-none focus:border-ink-black"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNoteModalActivity(null)}
                    className="flex-1 py-2 rounded-full border border-sand-border text-xs font-semibold text-stone-gray"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-full bg-ink-black text-paper-white text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Simpan Catatan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
