'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { INITIAL_CONTENT_ITEMS } from '@/lib/data/seed-plans-content';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import {
  ContentItem,
  ContentPillar,
  ContentFormat,
  ContentStatus,
} from '@/lib/types/database';
import {
  CalendarDays,
  PlusCircle,
  LayoutGrid,
  List,
  Columns3,
  ExternalLink,
  X,
} from 'lucide-react';

const PILLAR_LABELS: Record<ContentPillar, string> = {
  product_info: 'Info Produk & Tipe',
  promo: 'Promo & Diskon',
  testimonial: 'Testimoni Konsumen',
  progress_update: 'Progres Pembangunan',
  edu_kpr: 'Edukasi KPR Subsidi',
  lifestyle_lokasi: 'Akses & Gaya Hidup',
  event: 'Liputan Event',
  brand: 'Brand Awareness',
  other: 'Lainnya',
};

const FORMAT_LABELS: Record<ContentFormat, string> = {
  reel: 'Video Reels',
  carousel: 'Carousel (Slide)',
  single_post: 'Single Post',
  story: 'Instagram Story',
  video: 'Long Video',
  short: 'Shorts / TikTok',
  article: 'Artikel Web',
};

const KANBAN_COLUMNS: { status: ContentStatus; label: string; color: string }[] = [
  { status: 'idea', label: 'Ide Konten', color: 'bg-warm-cream text-stone-gray' },
  { status: 'in_production', label: 'Dalam Produksi', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  { status: 'review', label: 'Review Supervisor', color: 'bg-purple-50 text-purple-900 border-purple-200' },
  { status: 'scheduled', label: 'Terjadwal', color: 'bg-sky-50 text-sky-900 border-sky-200' },
  { status: 'published', label: 'Tayang (Published)', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
];

export default function ContentCalendarPage() {
  const [items, setItems] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [viewMode, setViewMode] = useState<'calendar' | 'week' | 'kanban'>('kanban');

  // Filters
  const [picFilter, setPicFilter] = useState<'all' | 'ferry' | 'ziyad'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    pillar: 'promo' as ContentPillar,
    format: 'reel' as ContentFormat,
    publish_date: '2026-10-15',
    publish_time: '12:00',
    project_id: INITIAL_PROJECTS[0].id,
    pic_id: INITIAL_PROFILES[1].id,
    status: 'idea' as ContentStatus,
    brief: '',
    caption: '',
    post_url: '',
    assets_url: '',
  });

  const filteredItems = items.filter((item) => {
    if (picFilter === 'ferry' && !item.pic?.full_name.includes('Ferry')) return false;
    if (picFilter === 'ziyad' && !item.pic?.full_name.includes('Ziyad')) return false;
    if (projectFilter !== 'all' && item.project_id !== projectFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  // Monthly summary stats
  const totalPlanned = items.length;
  const totalPublished = items.filter((i) => i.status === 'published').length;
  const totalScheduled = items.filter((i) => i.status === 'scheduled').length;
  const totalInProgress = items.filter((i) => i.status === 'in_production').length;

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    const picObj = INITIAL_PROFILES.find((p) => p.id === formData.pic_id) || INITIAL_PROFILES[0];
    const projObj = INITIAL_PROJECTS.find((p) => p.id === formData.project_id);

    const newItem: ContentItem = {
      id: `cnt-${Date.now()}`,
      title: formData.title,
      pillar: formData.pillar,
      format: formData.format,
      publish_date: formData.publish_date,
      publish_time: formData.publish_time,
      channel_id: '22222222-2222-2222-2222-222222222201',
      project_id: formData.project_id,
      pic_id: formData.pic_id,
      status: formData.status,
      brief: formData.brief,
      caption: formData.caption,
      post_url: formData.post_url,
      assets_url: formData.assets_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pic: picObj,
      project: projObj,
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (id: string, status: ContentStatus) => {
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warm-cream border border-sand-border text-xs text-stone-gray font-medium mb-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-ink-black" />
              <span>Manajemen Distribusi Media</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-black">
              Kalender Konten & Editorial
            </h1>
            <p className="text-sm text-stone-gray">
              Atur jadwal penerbitan Instagram Reels, Carousel, promo proyek, dan pipeline produksi.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-pill-primary text-xs sm:text-sm inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Rencanakan Konten</span>
          </button>
        </div>

        {/* Monthly Summary Strip (Strict Requirement) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-paper-white border border-sand-border text-center">
            <span className="text-[10px] font-bold uppercase text-ash-gray block">Rencana Bulan Ini</span>
            <span className="text-2xl font-bold text-ink-black mt-1 block">{totalPlanned} Konten</span>
            <span className="text-[11px] text-stone-gray">Total di kalender</span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-emerald-900">
            <span className="text-[10px] font-bold uppercase block text-emerald-700">Sudah Tayang</span>
            <span className="text-2xl font-bold mt-1 block">{totalPublished} Konten</span>
            <span className="text-[11px] text-emerald-700">
              {Math.round((totalPublished / (totalPlanned || 1)) * 100)}% terealisasi
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center text-sky-900">
            <span className="text-[10px] font-bold uppercase block text-sky-700">Terjadwal Tayang</span>
            <span className="text-2xl font-bold mt-1 block">{totalScheduled} Konten</span>
            <span className="text-[11px] text-sky-700">Siap diposting</span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center text-amber-900">
            <span className="text-[10px] font-bold uppercase block text-amber-700">Proses Produksi</span>
            <span className="text-2xl font-bold mt-1 block">{totalInProgress} Konten</span>
            <span className="text-[11px] text-amber-700">Desain & Video</span>
          </div>
        </div>

        {/* Control & View Toggle Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-warm-cream border border-sand-border">
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-paper-white border border-sand-border rounded-full">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Papan Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Mingguan</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kalender Bulanan</span>
            </button>
          </div>

          {/* PIC Filter: Ferry, Ziyad, All */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-paper-white border border-sand-border rounded-full">
              <button
                onClick={() => setPicFilter('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  picFilter === 'all'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Semua PIC
              </button>
              <button
                onClick={() => setPicFilter('ferry')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  picFilter === 'ferry'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Ferry
              </button>
              <button
                onClick={() => setPicFilter('ziyad')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  picFilter === 'ziyad'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Ziyad
              </button>
            </div>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-2.5 py-1 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-stone-gray"
            >
              <option value="all">Semua Proyek</option>
              {INITIAL_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-stone-gray"
            >
              <option value="all">Semua Status</option>
              <option value="idea">Ide</option>
              <option value="in_production">Produksi</option>
              <option value="review">Review</option>
              <option value="scheduled">Terjadwal</option>
              <option value="published">Tayang</option>
            </select>
          </div>
        </div>

        {/* View 1: Papan Kanban by Status */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
            {KANBAN_COLUMNS.map((col) => {
              const colItems = filteredItems.filter((i) => i.status === col.status);
              return (
                <div
                  key={col.status}
                  className="bg-warm-cream/50 border border-sand-border rounded-[22px] p-3 flex flex-col min-w-[240px]"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-sand-border">
                    <span className="font-bold text-xs text-ink-black">{col.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-paper-white border border-sand-border text-stone-gray">
                      {colItems.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {colItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-paper-white border border-sand-border hover:border-ink-black transition space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            {FORMAT_LABELS[item.format]}
                          </span>
                          <span className="text-stone-gray">{item.publish_date}</span>
                        </div>

                        <h4 className="font-bold text-xs text-ink-black leading-snug">{item.title}</h4>

                        {item.project && (
                          <span className="text-[10px] text-stone-gray block">
                            📍 {item.project.name}
                          </span>
                        )}

                        <div className="pt-2 border-t border-cool-mist flex items-center justify-between text-[10px] text-stone-gray">
                          <span>PIC: {item.pic?.full_name}</span>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleUpdateStatus(item.id, e.target.value as ContentStatus)
                            }
                            className="text-[10px] bg-warm-cream border border-sand-border rounded px-1 py-0.5"
                          >
                            <option value="idea">Ide</option>
                            <option value="in_production">Produksi</option>
                            <option value="review">Review</option>
                            <option value="scheduled">Jadwal</option>
                            <option value="published">Tayang</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View 2: Daftar Mingguan */}
        {viewMode === 'week' && (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-paper-white border border-sand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                      {item.status.toUpperCase()}
                    </span>
                    <span className="font-semibold text-stone-gray">
                      📅 {item.publish_date} {item.publish_time && `• ${item.publish_time}`}
                    </span>
                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                      {FORMAT_LABELS[item.format]}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-ink-black">{item.title}</h3>
                  <p className="text-stone-gray line-clamp-1">{item.caption || item.brief}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-ink-black">{item.pic?.full_name}</span>
                  {item.post_url && (
                    <a
                      href={item.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-sand-border text-stone-gray hover:text-ink-black"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View 3: Kalender Bulanan Grid */}
        {viewMode === 'calendar' && (
          <div className="p-6 rounded-[24px] bg-paper-white border border-sand-border space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-ink-black">
              <span>Oktober 2026</span>
              <span className="text-xs text-stone-gray font-normal">Minggu ke-42 & 43</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs border-b border-sand-border pb-2 text-stone-gray font-semibold">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs min-h-[300px]">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const dateStr = `2026-10-${day < 10 ? `0${day}` : day}`;
                const dayItems = filteredItems.filter((i) => i.publish_date === dateStr);
                return (
                  <div
                    key={day}
                    className="p-1.5 rounded-xl border border-cool-mist min-h-[70px] flex flex-col justify-between hover:bg-warm-cream/50 transition"
                  >
                    <span className="font-bold text-[11px] text-ink-black text-right block">
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {dayItems.map((di) => (
                        <div
                          key={di.id}
                          className="px-1 py-0.5 rounded text-[9px] font-semibold bg-violet-pulse/10 text-violet-pulse truncate"
                          title={di.title}
                        >
                          {di.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Tambah Konten */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-paper-white border border-sand-border rounded-[28px] max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-sand-border mb-4">
                <h3 className="font-bold text-base text-ink-black">Rencanakan Konten Baru</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-stone-gray hover:text-ink-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateContent} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-gray mb-1">Judul / Hook Konten *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rumah Murah Cicilan 1 Juta Dekat Bandara"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-cool-mist text-sm font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">Format Konten</label>
                    <select
                      value={formData.format}
                      onChange={(e) =>
                        setFormData({ ...formData, format: e.target.value as ContentFormat })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">Pilar Konten</label>
                    <select
                      value={formData.pillar}
                      onChange={(e) =>
                        setFormData({ ...formData, pillar: e.target.value as ContentPillar })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      {Object.entries(PILLAR_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">Tanggal Rencana Tayang</label>
                    <input
                      type="date"
                      required
                      value={formData.publish_date}
                      onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">Jam Tayang (WIB)</label>
                    <input
                      type="time"
                      value={formData.publish_time}
                      onChange={(e) => setFormData({ ...formData, publish_time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">Proyek Terkait</label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      {INITIAL_PROJECTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-gray mb-1">PIC Pembuat</label>
                    <select
                      value={formData.pic_id}
                      onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs font-semibold"
                    >
                      <option value={INITIAL_PROFILES[0].id}>Ferry (Leader)</option>
                      <option value={INITIAL_PROFILES[1].id}>Ziyad (Sr. Branding)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-gray mb-1">Brief / Ide Konsep</label>
                  <textarea
                    rows={2}
                    placeholder="Instruksi pengambilan video atau angle foto..."
                    value={formData.brief}
                    onChange={(e) => setFormData({ ...formData, brief: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-gray mb-1">Caption / Teks Postingan</label>
                  <textarea
                    rows={2}
                    placeholder="Tulis caption medsos lengkap dengan hashtag..."
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cool-mist text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-full border border-sand-border font-semibold text-stone-gray"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-ink-black text-paper-white font-semibold hover:opacity-90"
                  >
                    Simpan ke Kalender
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
