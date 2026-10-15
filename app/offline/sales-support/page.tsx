'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
import { getClientTodayString, getNextDayString } from '@/lib/utils/date-utils';
import { OfflineNavTabs } from '@/components/modules/offline/offline-nav-tabs';
import { INITIAL_SALES_SUPPORT_REQUESTS } from '@/lib/data/seed-offline';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { usePersistentState, STORAGE_KEYS, generateUUID } from '@/lib/storage/persistence';
import {
  SalesSupportRequest,
  SalesSupportType,
  SalesSupportStatus,
} from '@/lib/types/database';
import {
  HelpCircle,
  PlusCircle,
  Calendar,
  Building2,
  Users,
  ExternalLink,
} from 'lucide-react';

export default function SalesSupportPage() {
  const [requests, setRequests] = usePersistentState<SalesSupportRequest[]>(
    STORAGE_KEYS.SALES_SUPPORT,
    INITIAL_SALES_SUPPORT_REQUESTS
  );
  const [statusFilter, setStatusFilter] = useState<'all' | SalesSupportStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | SalesSupportType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    requested_by: '',
    project_id: INITIAL_PROJECTS[0].id,
    request_type: 'konten_promo' as SalesSupportType,
    description: '',
    due_date: '2026-10-15',
    pic_id: INITIAL_PROFILES[1].id,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      due_date: getNextDayString(getClientTodayString()),
    }));
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.request_type !== typeFilter) return false;
    return true;
  });

  const getTypeLabel = (type: SalesSupportType) => {
    switch (type) {
      case 'konten_promo':
        return 'Konten Promo Digital';
      case 'brosur':
        return 'Brosur & Flyer Cetak';
      case 'price_list':
        return 'Price List & Skema KPR';
      case 'video':
        return 'Video Presentasi Unit';
      case 'foto_unit':
        return 'Foto Update Progress Unit';
      case 'template_wa':
        return 'Template Pesan WhatsApp';
      case 'other':
        return 'Lainnya';
    }
  };

  const getStatusBadge = (status: SalesSupportStatus) => {
    switch (status) {
      case 'requested':
        return { label: 'Diminta', color: 'bg-warm-cream text-stone-gray border-sand-border' };
      case 'in_progress':
        return { label: 'Dikerjakan', color: 'bg-ink-black text-paper-white border-ink-black' };
      case 'delivered':
        return { label: 'Terkirim / Selesai', color: 'bg-forest-surface text-forest-emerald border-forest-emerald/30' };
      case 'revision':
        return { label: 'Revisi', color: 'bg-ember-surface text-ember-orange border-ember-orange/30' };
    }
  };

  const handleUpdateStatus = (id: string, newStatus: SalesSupportStatus) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r))
    );
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.requested_by || !formData.description) return;

    const newReq: SalesSupportRequest = {
      id: generateUUID(),
      request_date: new Date().toISOString().split('T')[0],
      requested_by: formData.requested_by,
      project_id: formData.project_id,
      request_type: formData.request_type,
      description: formData.description,
      due_date: formData.due_date,
      status: 'requested',
      pic_id: formData.pic_id,
      output_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pic: INITIAL_PROFILES.find((p) => p.id === formData.pic_id),
      project: INITIAL_PROJECTS.find((p) => p.id === formData.project_id),
    };

    setRequests([newReq, ...requests]);
    setIsModalOpen(false);
    setFormData({
      requested_by: '',
      project_id: INITIAL_PROJECTS[0].id,
      request_type: 'konten_promo',
      description: '',
      due_date: getNextDayString(getClientTodayString()),
      pic_id: INITIAL_PROFILES[1].id,
    });
  };

  const countByStatus: Record<SalesSupportStatus, number> = {
    requested: requests.filter((r) => r.status === 'requested').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    delivered: requests.filter((r) => r.status === 'delivered').length,
    revision: requests.filter((r) => r.status === 'revision').length,
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <OfflineNavTabs />

        <PageHeader
          eyebrow="Offline Marketing • CRO & In-house Support"
          title="Sales Support Requests"
          description="Tracking permintaan materi promosi, brosur, flyer WhatsApp, price list, dan visual dari tim sales/CRO di lapangan."
          actions={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Catat Permintaan Baru</span>
            </button>
          }
        />

        {/* Compact Field Operations Ledger Bar (Replaces 4-Card KPI Strip) */}
        <div className="card-cream p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 min-h-10 rounded-full text-xs font-bold transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-ink-black text-paper-white'
                    : 'bg-paper-white text-stone-gray border border-sand-border hover:text-ink-black'
                }`}
              >
                Semua Status <span className="metric-mono opacity-80">({requests.length})</span>
              </button>
              {(['requested', 'in_progress', 'delivered', 'revision'] as SalesSupportStatus[]).map((st) => {
                const badge = getStatusBadge(st);
                const isSelected = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(isSelected ? 'all' : st)}
                    className={`px-3.5 min-h-10 rounded-full text-xs font-bold transition-colors inline-flex items-center gap-2 ${
                      isSelected
                        ? 'bg-ink-black text-paper-white'
                        : 'bg-paper-white text-stone-gray border border-sand-border hover:text-ink-black'
                    }`}
                  >
                    <span>{badge.label}</span>
                    <span className="metric-mono text-[11px] opacity-80">({countByStatus[st]})</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-stone-gray uppercase tracking-wider mr-1">Kategori:</span>
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 min-h-9 text-xs font-bold rounded-full transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-ink-black text-paper-white'
                    : 'bg-paper-white text-stone-gray border border-sand-border hover:text-ink-black'
                }`}
              >
                Semua
              </button>
              {(['konten_promo', 'brosur', 'price_list', 'template_wa'] as SalesSupportType[]).map((t) => (
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
                  {getTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="card-clay p-8 sm:p-12 text-center">
            <HelpCircle className="w-10 h-10 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-ink-black mb-1">
              Belum Ada Permintaan Sales Support
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada permintaan dukungan materi promosi dari tim sales/CRO. Klik tombol di bawah untuk mencatat permintaan baru.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              Buat Permintaan Baru
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredRequests.map((req) => {
              const statusBadge = getStatusBadge(req.status);

              return (
                <div
                  key={req.id}
                  className="card-clay p-5 hover:border-ink-black transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-warm-cream text-ink-black border border-sand-border">
                          {getTypeLabel(req.request_type)}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {req.project && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-black bg-warm-cream px-2 py-0.5 rounded-full border border-sand-border">
                            <Building2 className="w-3 h-3 text-stone-gray" />
                            {req.project.name}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-extrabold text-ink-black leading-snug">
                        {req.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-gray pt-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-stone-gray" />
                          <span>Pemohon: <strong className="text-ink-black">{req.requested_by}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-gray" />
                          <span>Tenggat: <strong className="text-ink-black metric-mono">{req.due_date || '-'}</strong></span>
                        </div>
                        {req.pic && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-violet-pulse" />
                            <span>PIC Desain: <strong className="text-ink-black">{req.pic.full_name}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                      {req.output_url && (
                        <a
                          href={req.output_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-pill-ghost text-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Lihat Output File</span>
                        </a>
                      )}

                      {req.status === 'requested' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                          className="btn-pill-primary text-xs"
                        >
                          Mulai Kerjakan
                        </button>
                      )}

                      {req.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, 'delivered')}
                          className="px-3.5 min-h-9 text-xs font-bold text-paper-white bg-forest-emerald rounded-full hover:opacity-90 transition-opacity"
                        >
                          Tandai Terkirim
                        </button>
                      )}

                      {req.status === 'delivered' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(req.id, 'revision')}
                          className="btn-pill-ghost text-xs"
                        >
                          Minta Revisi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Catat Permintaan Sales Support"
          description="Materi promosi atau sales tool dari tim CRO"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                Nama Pemohon (Sales / CRO)
              </label>
              <input
                type="text"
                value={formData.requested_by}
                onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                placeholder="Contoh: Budi Hartono (CRO Grand Sevilla)"
                required
                className="input-clay text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Jenis Kebutuhan
                </label>
                <select
                  value={formData.request_type}
                  onChange={(e) => setFormData({ ...formData, request_type: e.target.value as SalesSupportType })}
                  className="input-clay text-xs"
                >
                  <option value="konten_promo">Konten Promo Digital</option>
                  <option value="brosur">Brosur & Flyer Cetak</option>
                  <option value="price_list">Price List & Simulasi</option>
                  <option value="video">Video Presentasi Unit</option>
                  <option value="foto_unit">Foto Progres Unit</option>
                  <option value="template_wa">Template Pesan WhatsApp</option>
                  <option value="other">Lainnya</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-gray uppercase tracking-wider mb-1">
                  Tenggat Waktu (Due Date)
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                  className="input-clay text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  PIC Pengerjaan
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
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                Detail Deskripsi Permintaan
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Contoh: Brosur A5 full color cetak 500 pcs untuk sebar di kawasan industri..."
                required
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
                Simpan Permintaan
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

