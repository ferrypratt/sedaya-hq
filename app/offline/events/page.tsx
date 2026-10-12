'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { OfflineNavTabs } from '@/components/modules/offline/offline-nav-tabs';
import { INITIAL_OFFLINE_EVENTS } from '@/lib/data/seed-offline';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { OfflineEvent, EventType, EventStatus } from '@/lib/types/database';
import {
  Calendar,
  PlusCircle,
  MapPin,
  Clock,
  Building2,
  Users,
  FileText,
  ExternalLink,
  X,
} from 'lucide-react';

let nextEventCounter = 100;
function generateEventId(): string {
  nextEventCounter += 1;
  return `evt-${nextEventCounter}`;
}

export default function OfflineEventsPage() {
  const [events, setEvents] = useState<OfflineEvent[]>(INITIAL_OFFLINE_EVENTS);
  const [typeFilter, setTypeFilter] = useState<'all' | EventType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    event_type: 'weekly' as EventType,
    event_date: '2026-10-18',
    start_time: '08:00',
    end_time: '12:00',
    location: '',
    project_id: INITIAL_PROJECTS[0].id,
    objective: '',
    budget_planned: '',
    target_visitors: '',
    pic_id: INITIAL_PROFILES[0].id,
  });

  const filteredEvents = events.filter((ev) => {
    if (typeFilter !== 'all' && ev.event_type !== typeFilter) return false;
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
    return true;
  });

  // KPI aggregates
  const totalEvents = events.length;
  const totalBudgetPlanned = events.reduce((sum, e) => sum + e.budget_planned, 0);
  const totalBudgetActual = events.reduce((sum, e) => sum + e.budget_actual, 0);
  const totalLeads = events.reduce((sum, e) => sum + e.leads, 0);
  const totalBookings = events.reduce((sum, e) => sum + e.bookings, 0);

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'planned':
        return { label: 'Direncanakan', color: 'bg-stone-100 text-stone-800 border-sand-border' };
      case 'prepared':
        return { label: 'Persiapan', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'done':
        return { label: 'Selesai', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'cancelled':
        return { label: 'Dibatalkan', color: 'bg-rose-50 text-rose-800 border-rose-300' };
      default:
        return { label: status, color: 'bg-stone-100 text-stone-800 border-sand-border' };
    }
  };

  const getTypeBadge = (type: EventType) => {
    switch (type) {
      case 'weekly':
        return { label: 'Mingguan (Open Booth)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'monthly':
        return { label: 'Bulanan', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'special':
        return { label: 'Special (Expo / Pameran)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;

    const newEv: OfflineEvent = {
      id: generateEventId(),
      title: formData.title,
      event_type: formData.event_type,
      event_date: formData.event_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      location: formData.location,
      project_id: formData.project_id,
      objective: formData.objective || null,
      budget_planned: parseFloat(formData.budget_planned) || 0,
      budget_actual: 0,
      target_visitors: parseInt(formData.target_visitors, 10) || 0,
      actual_visitors: 0,
      leads: 0,
      bookings: 0,
      status: 'planned',
      pic_id: formData.pic_id,
      documentation_url: null,
      evaluation_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pic: INITIAL_PROFILES.find((p) => p.id === formData.pic_id),
      project: INITIAL_PROJECTS.find((p) => p.id === formData.project_id),
    };

    setEvents([newEv, ...events]);
    setIsModalOpen(false);
    setFormData({
      title: '',
      event_type: 'weekly',
      event_date: '2026-10-18',
      start_time: '08:00',
      end_time: '12:00',
      location: '',
      project_id: INITIAL_PROJECTS[0].id,
      objective: '',
      budget_planned: '',
      target_visitors: '',
      pic_id: INITIAL_PROFILES[0].id,
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <OfflineNavTabs />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-ink-black text-paper-white">
                Offline Marketing
              </span>
              <span className="text-xs text-stone-gray font-medium">
                Pameran & Open Booth
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Event & Pameran Offline
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Kelola jadwal expo, booth pameran mall, dan open booth mingguan di titik keramaian Deli Serdang & Medan.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Event Baru</span>
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Total Event Terdata
            </span>
            <div className="text-2xl font-black text-ink-black font-mono">{totalEvents}</div>
            <span className="text-[11px] text-stone-500 mt-1 block">Agenda operasional</span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Realisasi Budget
            </span>
            <div className="text-2xl font-black text-ink-black font-mono">
              Rp {(totalBudgetActual / 1000000).toFixed(1)} jt
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">
              dari pagu Rp {(totalBudgetPlanned / 1000000).toFixed(1)} jt
            </span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Total Leads Terkumpul
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">{totalLeads}</div>
            <span className="text-[11px] text-emerald-600 mt-1 block">Kontak prospek calon pembeli</span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Booking On-the-spot
            </span>
            <div className="text-2xl font-black text-violet-pulse font-mono">{totalBookings}</div>
            <span className="text-[11px] text-stone-500 mt-1 block">Closing langsung di booth</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-warm-cream border border-sand-border rounded-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-stone-gray uppercase tracking-wider mr-1">Tipe:</span>
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                typeFilter === 'all'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setTypeFilter('weekly')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                typeFilter === 'weekly'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setTypeFilter('special')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                typeFilter === 'special'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
              }`}
            >
              Special (Expo)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-gray uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | EventStatus)}
              aria-label="Filter status event"
              className="text-xs font-semibold bg-paper-white border border-sand-border rounded-full px-3 py-1 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
            >
              <option value="all">Semua Status</option>
              <option value="planned">Direncanakan</option>
              <option value="prepared">Persiapan</option>
              <option value="done">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Events Cards List */}
        {filteredEvents.length === 0 ? (
          <div className="rounded-[28px] bg-paper-white border border-sand-border p-8 sm:p-12 text-center shadow-xs">
            <Calendar className="w-12 h-12 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-bold text-ink-black mb-1">
              Belum Ada Agenda Event Offline
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada agenda pameran, expo, atau open booth yang tercatat. Klik tombol di bawah untuk menambahkan agenda baru.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              Tambah Agenda Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
            const statusBadge = getStatusBadge(event.status);
            const typeBadge = getTypeBadge(event.event_type);

            return (
              <div
                key={event.id}
                className="bg-paper-white border border-sand-border rounded-2xl p-5 hover:border-stone-400 transition-all shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Badges strip */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      {event.project && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-warm-cream px-2.5 py-0.5 rounded-full border border-sand-border">
                          <Building2 className="w-3 h-3 text-stone-500" />
                          {event.project.name}
                        </span>
                      )}
                    </div>

                    {/* Title & Objectives */}
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-ink-black">{event.title}</h3>
                      {event.objective && (
                        <p className="text-xs text-stone-gray mt-1 leading-relaxed">{event.objective}</p>
                      )}
                    </div>

                    {/* Details: Date, Time, Location */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-gray pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-violet-pulse" />
                        <span className="font-medium text-ink-black">{event.event_date}</span>
                      </div>
                      {event.start_time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{event.start_time} - {event.end_time || 'Selesai'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate max-w-xs">{event.location}</span>
                      </div>
                      {event.pic && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-stone-400" />
                          <span>PIC: <strong className="text-ink-black">{event.pic.full_name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantitative Metrics Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 bg-warm-cream/70 border border-sand-border rounded-xl p-3 shrink-0 lg:w-72">
                    <div>
                      <span className="text-[10px] font-bold text-stone-gray uppercase block">Budget</span>
                      <span className="text-xs font-mono font-bold text-ink-black">
                        Rp {event.budget_actual > 0 ? (event.budget_actual / 1000).toLocaleString('id-ID') : (event.budget_planned / 1000).toLocaleString('id-ID')}k
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        {event.budget_actual > 0 ? 'Realisasi' : 'Pagu'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-gray uppercase block">Pengunjung</span>
                      <span className="text-xs font-mono font-bold text-ink-black">
                        {event.actual_visitors > 0 ? event.actual_visitors : event.target_visitors}
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        {event.actual_visitors > 0 ? 'Hadir' : 'Target'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-gray uppercase block">Leads</span>
                      <span className="text-xs font-mono font-bold text-emerald-700">
                        {event.leads}
                      </span>
                      <span className="text-[10px] text-stone-400 block">Kontak</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-stone-gray uppercase block">Booking</span>
                      <span className="text-xs font-mono font-bold text-violet-pulse">
                        {event.bookings}
                      </span>
                      <span className="text-[10px] text-stone-400 block">Unit</span>
                    </div>
                  </div>
                </div>

                {/* Footer notes & links */}
                {(event.evaluation_notes || event.documentation_url) && (
                  <div className="mt-4 pt-3 border-t border-sand-border/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {event.evaluation_notes ? (
                      <div className="flex items-center gap-1.5 text-stone-gray">
                        <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="italic line-clamp-1">{event.evaluation_notes}</span>
                      </div>
                    ) : <div />}

                    {event.documentation_url && (
                      <a
                        href={event.documentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-pulse font-semibold hover:underline"
                      >
                        <span>Dokumentasi Foto / Laporan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

        {/* Modal Tambah Event */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-paper-white border border-sand-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-stone-gray hover:text-ink-black p-1.5 rounded-full hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-warm-cream border border-sand-border text-ink-black">
                  <Calendar className="w-5 h-5 text-violet-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-black tracking-tight">
                    Tambah Agenda Event Baru
                  </h3>
                  <p className="text-xs text-stone-gray">Pameran, open booth, atau expo properti</p>
                </div>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Judul Event / Kegiatan
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Open Booth Weekend Grand Sevilla di Simpang Kayu Besar"
                    required
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Tipe Event
                    </label>
                    <select
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    >
                      <option value="weekly">Mingguan (Open Booth)</option>
                      <option value="monthly">Bulanan</option>
                      <option value="special">Special (Expo / Pameran)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Proyek Terkait
                    </label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    >
                      {INITIAL_PROJECTS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Mulai
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Selesai
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Lokasi Spesifik
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Depan Pintu Masuk Pasar Bakaran Batu, Lubuk Pakam"
                    required
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Budget Pagu (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.budget_planned}
                      onChange={(e) => setFormData({ ...formData, budget_planned: e.target.value })}
                      placeholder="Contoh: 1000000"
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black font-mono focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Target Pengunjung
                    </label>
                    <input
                      type="number"
                      value={formData.target_visitors}
                      onChange={(e) => setFormData({ ...formData, target_visitors: e.target.value })}
                      placeholder="Contoh: 150"
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black font-mono focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    PIC Penanggung Jawab
                  </label>
                  <select
                    value={formData.pic_id}
                    onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  >
                    {INITIAL_PROFILES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Tujuan & Sasaran (Objektif)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    placeholder="Contoh: Menjaring calon debitur wiraswasta di sekitar pasar tradisional..."
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-gray hover:text-ink-black bg-stone-100 rounded-full"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs"
                  >
                    Simpan Event
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
