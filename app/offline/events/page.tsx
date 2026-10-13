'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
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

  const totalEvents = events.length;
  const totalBudgetPlanned = events.reduce((sum, e) => sum + e.budget_planned, 0);
  const totalBudgetActual = events.reduce((sum, e) => sum + e.budget_actual, 0);
  const totalLeads = events.reduce((sum, e) => sum + e.leads, 0);
  const totalBookings = events.reduce((sum, e) => sum + e.bookings, 0);

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'planned':
        return { label: 'Direncanakan', color: 'bg-warm-cream text-stone-gray border-sand-border' };
      case 'prepared':
        return { label: 'Persiapan', color: 'bg-ink-black text-paper-white border-ink-black' };
      case 'done':
        return { label: 'Selesai', color: 'bg-forest-surface text-forest-emerald border-forest-emerald/30' };
      case 'cancelled':
        return { label: 'Dibatalkan', color: 'bg-ember-surface text-ember-orange border-ember-orange/30' };
      default:
        return { label: status, color: 'bg-warm-cream text-stone-gray border-sand-border' };
    }
  };

  const getTypeBadge = (type: EventType) => {
    switch (type) {
      case 'weekly':
        return { label: 'Mingguan (Open Booth)', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'monthly':
        return { label: 'Bulanan', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'special':
        return { label: 'Special (Expo / Pameran)', color: 'bg-ink-black text-paper-white border-ink-black' };
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
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <OfflineNavTabs />

        <PageHeader
          eyebrow="Offline Marketing • Pameran & Open Booth"
          title="Event & Pameran Offline"
          description="Kelola jadwal expo, booth pameran mall, dan open booth mingguan di titik keramaian Deli Serdang & Medan."
          actions={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Event Baru</span>
            </button>
          }
        />

        {/* Compact Field Operations Ledger Bar (Replaces 4-Card KPI Strip) */}
        <div className="card-cream p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                Total Agenda Event
              </span>
              <span className="text-2xl font-black text-ink-black metric-mono">{totalEvents}</span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                Realisasi / Pagu Budget
              </span>
              <span className="text-base font-extrabold text-ink-black metric-mono">
                Rp {(totalBudgetActual / 1000000).toFixed(1)} jt
                <span className="text-stone-gray font-normal"> / Rp {(totalBudgetPlanned / 1000000).toFixed(1)} jt</span>
              </span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                Leads / Booking Booth
              </span>
              <span className="text-base font-extrabold text-forest-emerald metric-mono">
                {totalLeads} Leads <span className="text-ink-black">• {totalBookings} Booking</span>
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-sand-border">
            <div className="flex items-center gap-1.5">
              {(['all', 'weekly', 'special'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 min-h-9 text-xs font-bold rounded-full transition-colors ${
                    typeFilter === t
                      ? 'bg-ink-black text-paper-white'
                      : 'bg-paper-white text-stone-gray border border-sand-border hover:text-ink-black'
                  }`}
                >
                  {t === 'all' ? 'Semua Tipe' : t === 'weekly' ? 'Mingguan' : 'Special (Expo)'}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | EventStatus)}
              aria-label="Filter status event"
              className="text-xs font-bold bg-paper-white border border-sand-border rounded-full px-3.5 min-h-9 text-ink-black focus:outline-hidden"
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
          <div className="card-clay p-8 sm:p-12 text-center">
            <Calendar className="w-10 h-10 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-ink-black mb-1">
              Belum Ada Agenda Event Offline
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada agenda pameran, expo, atau open booth yang tercatat. Klik tombol di bawah untuk menambahkan agenda baru.
            </p>
            <button
              type="button"
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
                  className="card-clay p-5 hover:border-ink-black transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {event.project && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-black bg-warm-cream px-2.5 py-0.5 rounded-full border border-sand-border">
                            <Building2 className="w-3 h-3 text-stone-gray" />
                            {event.project.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-ink-black">{event.title}</h3>
                        {event.objective && (
                          <p className="text-xs text-stone-gray mt-1 leading-relaxed">{event.objective}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-gray pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-violet-pulse" />
                          <span className="font-bold text-ink-black metric-mono">{event.event_date}</span>
                        </div>
                        {event.start_time && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-stone-gray" />
                            <span className="metric-mono">{event.start_time} - {event.end_time || 'Selesai'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-gray" />
                          <span className="truncate max-w-xs">{event.location}</span>
                        </div>
                        {event.pic && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-stone-gray" />
                            <span>PIC: <strong className="text-ink-black">{event.pic.full_name}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 bg-warm-cream border border-sand-border rounded-xl p-3 shrink-0 lg:w-72">
                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Budget</span>
                        <span className="text-xs metric-mono font-extrabold text-ink-black">
                          Rp {event.budget_actual > 0 ? (event.budget_actual / 1000).toLocaleString('id-ID') : (event.budget_planned / 1000).toLocaleString('id-ID')}k
                        </span>
                        <span className="text-[10px] text-stone-gray block">
                          {event.budget_actual > 0 ? 'Realisasi' : 'Pagu'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Pengunjung</span>
                        <span className="text-xs metric-mono font-extrabold text-ink-black">
                          {event.actual_visitors > 0 ? event.actual_visitors : event.target_visitors}
                        </span>
                        <span className="text-[10px] text-stone-gray block">
                          {event.actual_visitors > 0 ? 'Hadir' : 'Target'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Leads</span>
                        <span className="text-xs metric-mono font-extrabold text-forest-emerald">
                          {event.leads}
                        </span>
                        <span className="text-[10px] text-stone-gray block">Kontak</span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Booking</span>
                        <span className="text-xs metric-mono font-extrabold text-violet-pulse">
                          {event.bookings}
                        </span>
                        <span className="text-[10px] text-stone-gray block">Unit</span>
                      </div>
                    </div>
                  </div>

                  {(event.evaluation_notes || event.documentation_url) && (
                    <div className="mt-4 pt-3 border-t border-sand-border/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {event.evaluation_notes ? (
                        <div className="flex items-center gap-1.5 text-stone-gray">
                          <FileText className="w-3.5 h-3.5 text-stone-gray shrink-0" />
                          <span className="italic line-clamp-1">{event.evaluation_notes}</span>
                        </div>
                      ) : <div />}

                      {event.documentation_url && (
                        <a
                          href={event.documentation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-violet-pulse font-bold hover:underline"
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

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tambah Agenda Event Baru"
          description="Pameran, open booth, atau expo properti"
        >
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
                className="input-clay text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Tipe Event
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                  className="input-clay text-xs"
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
                  className="input-clay text-xs"
                >
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  required
                  className="input-clay text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                  Mulai
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="input-clay text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                  Selesai
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="input-clay text-xs"
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
                className="input-clay text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Budget Pagu (Rp)
                </label>
                <input
                  type="number"
                  value={formData.budget_planned}
                  onChange={(e) => setFormData({ ...formData, budget_planned: e.target.value })}
                  placeholder="Contoh: 1000000"
                  className="input-clay text-xs metric-mono"
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
                  className="input-clay text-xs metric-mono"
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
                className="input-clay text-xs"
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
                className="input-clay text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-pill-ghost text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-pill-primary text-xs"
              >
                Simpan Event
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

