'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
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
  Plus,
  LayoutGrid,
  List,
  Columns3,
  ExternalLink,
  Building2,
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

const KANBAN_COLUMNS: { status: ContentStatus; label: string; dotClass: string }[] = [
  { status: 'idea', label: 'Ide Konten', dotClass: 'bg-ash-gray' },
  { status: 'in_production', label: 'Dalam Produksi', dotClass: 'bg-ember-orange' },
  { status: 'review', label: 'Review Supervisor', dotClass: 'bg-ink-black' },
  { status: 'scheduled', label: 'Terjadwal', dotClass: 'bg-violet-pulse' },
  { status: 'published', label: 'Tayang (Published)', dotClass: 'bg-forest' },
];

export default function ContentCalendarPage() {
  const [items, setItems] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [viewMode, setViewMode] = useState<'calendar' | 'week' | 'kanban'>('kanban');

  // Filters: PIC strictly limited to Semua PIC, Ferry, and Ziyad
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

  const totalPlanned = items.length;
  const totalPublished = items.filter((i) => i.status === 'published').length;
  const totalScheduled = items.filter((i) => i.status === 'scheduled').length;
  const totalInProgress = items.filter((i) => i.status === 'in_production').length;

  const handleCreateContent = (e: React.FormEvent) => {
    e.preventDefault();
    const picObj =
      INITIAL_PROFILES.find((p) => p.id === formData.pic_id) || INITIAL_PROFILES[0];
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
    setFormData({
      title: '',
      pillar: 'promo',
      format: 'reel',
      publish_date: '2026-10-15',
      publish_time: '12:00',
      project_id: INITIAL_PROJECTS[0].id,
      pic_id: INITIAL_PROFILES[1].id,
      status: 'idea',
      brief: '',
      caption: '',
      post_url: '',
      assets_url: '',
    });
  };

  const handleUpdateStatus = (id: string, status: ContentStatus) => {
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          section="Editorial & Distribusi"
          meta={<span className="metric-mono">{filteredItems.length} Konten</span>}
          title="Kalender & Antrian Konten"
          description="Kelola alur produksi Reels, Carousel edukasi KPR, liputan progres lapangan, serta penjadwalan publikasi lintas kanal."
          actions={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Rencanakan Konten</span>
            </button>
          }
        />

        {/* Compact Editorial Pipeline Bar (Replacing generic 4-card strip) */}
        <section className="card-cream p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ash-gray block">
                Total Direncanakan
              </span>
              <span className="metric-mono text-xl font-bold text-ink-black">
                {totalPlanned}
              </span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-forest block">
                Sudah Tayang
              </span>
              <span className="metric-mono text-xl font-bold text-forest">
                {totalPublished}
              </span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-violet-pulse block">
                Terjadwal
              </span>
              <span className="metric-mono text-xl font-bold text-violet-pulse">
                {totalScheduled}
              </span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ember-orange block">
                Dalam Produksi
              </span>
              <span className="metric-mono text-xl font-bold text-ember-orange">
                {totalInProgress}
              </span>
            </div>
          </div>

          <span className="metric-mono text-xs font-semibold text-stone-gray bg-paper-white px-3 py-1.5 rounded-full border border-sand-border">
            Realisasi Tayang:{' '}
            <strong className="text-ink-black">
              {totalPlanned > 0
                ? Math.round((totalPublished / totalPlanned) * 100)
                : 0}
              %
            </strong>
          </span>
        </section>

        {/* Control & View Toggle Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-warm-cream border border-sand-border">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-paper-white border border-sand-border rounded-full self-start">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Papan Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'week'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-ink-black text-paper-white'
                  : 'text-stone-gray hover:text-ink-black'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kalender Bulanan</span>
            </button>
          </div>

          {/* PIC Filter strictly: Semua PIC, Ferry, Ziyad */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-paper-white border border-sand-border rounded-full">
              <button
                type="button"
                onClick={() => setPicFilter('all')}
                className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
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
                className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                  picFilter === 'ferry'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Ferry
              </button>
              <button
                type="button"
                onClick={() => setPicFilter('ziyad')}
                className={`px-3 py-1.5 min-h-9 rounded-full text-xs font-semibold transition-colors ${
                  picFilter === 'ziyad'
                    ? 'bg-ink-black text-paper-white'
                    : 'text-stone-gray hover:text-ink-black'
                }`}
              >
                Ziyad
              </button>
            </div>

            <select
              aria-label="Filter Proyek"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3.5 py-2 min-h-10 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-ink-black"
            >
              <option value="all">Semua Proyek</option>
              {INITIAL_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 min-h-10 rounded-full border border-sand-border bg-paper-white text-xs font-semibold text-ink-black"
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

        {/* View 1: Kanban Board */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pb-4">
            {KANBAN_COLUMNS.map((col) => {
              const colItems = filteredItems.filter(
                (i) => i.status === col.status
              );
              return (
                <section
                  key={col.status}
                  className="bg-warm-cream border border-sand-border rounded-2xl p-3 flex flex-col min-h-[260px]"
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-sand-border">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                      <h2 className="font-bold text-xs text-ink-black">
                        {col.label}
                      </h2>
                    </div>
                    <span className="metric-mono px-2 py-0.5 rounded-full text-[11px] font-bold bg-paper-white border border-sand-border text-stone-gray">
                      {colItems.length}
                    </span>
                  </div>

                  {colItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-4 text-center">
                      <p className="text-[11px] text-ash-gray">
                        Kosong pada tahap ini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 flex-1">
                      {colItems.map((item) => (
                        <article
                          key={item.id}
                          className="p-3.5 rounded-xl bg-paper-white border border-sand-border hover:border-ink-black transition-colors space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            <span className="font-bold uppercase tracking-[0.04em] text-ink-black bg-warm-cream px-2 py-0.5 rounded border border-sand-border">
                              {FORMAT_LABELS[item.format]}
                            </span>
                            <span className="metric-mono text-stone-gray">
                              {item.publish_date}
                            </span>
                          </div>

                          <h3 className="font-bold text-xs text-ink-black leading-snug">
                            {item.title}
                          </h3>

                          {item.project && (
                            <span className="text-[11px] text-stone-gray inline-flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-ash-gray" />
                              <span className="truncate">{item.project.name}</span>
                            </span>
                          )}

                          <div className="pt-2 border-t border-sand-border flex items-center justify-between gap-2 text-[11px] text-stone-gray">
                            <span className="truncate font-medium">
                              {item.pic?.full_name}
                            </span>
                            <select
                              aria-label={`Ubah status ${item.title}`}
                              value={item.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  item.id,
                                  e.target.value as ContentStatus
                                )
                              }
                              className="text-[11px] font-semibold bg-warm-cream border border-sand-border rounded-md px-1.5 py-1 text-ink-black"
                            >
                              <option value="idea">Ide</option>
                              <option value="in_production">Produksi</option>
                              <option value="review">Review</option>
                              <option value="scheduled">Jadwal</option>
                              <option value="published">Tayang</option>
                            </select>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* View 2: Table / List View */}
        {viewMode === 'week' && (
          <section className="card-clay p-0 overflow-hidden">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <CalendarDays className="w-8 h-8 text-ash-gray mx-auto" />
                <p className="text-sm font-bold text-ink-black">
                  Belum ada item konten yang tercatat
                </p>
                <p className="text-xs text-stone-gray">
                  Tambahkan rencana konten baru menggunakan tombol di kanan atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-sand-border bg-warm-cream text-[11px] font-semibold uppercase tracking-[0.05em] text-ash-gray">
                      <th className="py-3.5 px-5">Jadwal Tayang</th>
                      <th className="py-3.5 px-4">Judul & Konsep</th>
                      <th className="py-3.5 px-4">Format</th>
                      <th className="py-3.5 px-4">Proyek</th>
                      <th className="py-3.5 px-4">PIC</th>
                      <th className="py-3.5 px-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-border">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-warm-cream/50 transition-colors"
                      >
                        <td className="py-3.5 px-5 metric-mono font-semibold text-ink-black whitespace-nowrap">
                          {item.publish_date}{' '}
                          {item.publish_time && (
                            <span className="text-stone-gray font-normal">
                              ({item.publish_time})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-ink-black block">
                            {item.title}
                          </span>
                          {(item.caption || item.brief) && (
                            <span className="text-[11px] text-stone-gray line-clamp-1">
                              {item.caption || item.brief}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-warm-cream border border-sand-border font-semibold text-ink-black">
                            {FORMAT_LABELS[item.format]}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-stone-gray">
                          {item.project?.name || 'Korporat'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-ink-black">
                          {item.pic?.full_name}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <select
                              aria-label={`Status ${item.title}`}
                              value={item.status}
                              onChange={(e) =>
                                handleUpdateStatus(
                                  item.id,
                                  e.target.value as ContentStatus
                                )
                              }
                              className="py-1 px-2 rounded-lg border border-sand-border bg-warm-cream text-xs font-semibold text-ink-black"
                            >
                              <option value="idea">Ide</option>
                              <option value="in_production">Produksi</option>
                              <option value="review">Review</option>
                              <option value="scheduled">Terjadwal</option>
                              <option value="published">Tayang</option>
                            </select>
                            {item.post_url && (
                              <a
                                href={item.post_url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Buka tautan konten"
                                className="p-1.5 rounded-lg border border-sand-border text-stone-gray hover:text-ink-black"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* View 3: Monthly Calendar Grid */}
        {viewMode === 'calendar' && (
          <section className="card-clay p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-ink-black">
                Oktober 2026
              </h2>
              <span className="text-xs text-stone-gray font-medium">
                Kalender Distribusi Konten
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-xs border-b border-sand-border pb-2 text-stone-gray font-semibold">
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
              <span>Min</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-xs">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const dateStr = `2026-10-${day < 10 ? `0${day}` : day}`;
                const dayItems = filteredItems.filter(
                  (i) => i.publish_date === dateStr
                );
                return (
                  <div
                    key={day}
                    className="p-2 rounded-xl border border-sand-border min-h-[76px] flex flex-col justify-between bg-paper-white hover:bg-warm-cream transition-colors"
                  >
                    <span className="metric-mono font-bold text-[11px] text-stone-gray text-right block">
                      {day}
                    </span>
                    <div className="space-y-1">
                      {dayItems.map((di) => (
                        <div
                          key={di.id}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-ink-black text-paper-white truncate"
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
          </section>
        )}

        {/* Modal: Rencanakan Konten */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Rencanakan Konten Baru"
          subtitle="Tambahkan ide atau jadwal produksi konten ke kalender editorial."
        >
          <form onSubmit={handleCreateContent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Judul / Hook Konten *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Edukasi Syarat KPR Subsidi & Update Lapangan"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Format Konten
                </label>
                <select
                  value={formData.format}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      format: e.target.value as ContentFormat,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Pilar Konten
                </label>
                <select
                  value={formData.pillar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pillar: e.target.value as ContentPillar,
                    })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  {Object.entries(PILLAR_LABELS).map(([k, v]) => (
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
                  Tanggal Rencana Tayang
                </label>
                <input
                  type="date"
                  required
                  value={formData.publish_date}
                  onChange={(e) =>
                    setFormData({ ...formData, publish_date: e.target.value })
                  }
                  className="input-clay metric-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  Jam Tayang (WIB)
                </label>
                <input
                  type="time"
                  value={formData.publish_time}
                  onChange={(e) =>
                    setFormData({ ...formData, publish_time: e.target.value })
                  }
                  className="input-clay metric-mono"
                />
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
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-black mb-1">
                  PIC Pembuat
                </label>
                <select
                  value={formData.pic_id}
                  onChange={(e) =>
                    setFormData({ ...formData, pic_id: e.target.value })
                  }
                  className="input-clay text-xs font-semibold"
                >
                  <option value={INITIAL_PROFILES[0].id}>Ferry (Leader)</option>
                  <option value={INITIAL_PROFILES[1].id}>
                    Ziyad (Sr. Branding)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Brief / Ide Konsep
              </label>
              <textarea
                rows={2}
                placeholder="Arahan visual, sudut pengambilan gambar, atau pesan utama..."
                value={formData.brief}
                onChange={(e) =>
                  setFormData({ ...formData, brief: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-black mb-1">
                Draft Caption
              </label>
              <textarea
                rows={2}
                placeholder="Teks caption dan informasi kontak..."
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                className="input-clay"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-pill-ghost"
              >
                Batal
              </button>
              <button type="submit" className="btn-pill-primary">
                Simpan ke Kalender
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
