'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { OfflineNavTabs } from '@/components/modules/offline/offline-nav-tabs';
import { INITIAL_SALES_SUPPORT_REQUESTS } from '@/lib/data/seed-offline';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
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
  X,
} from 'lucide-react';

let nextSupportCounter = 100;
function generateSupportId(): string {
  nextSupportCounter += 1;
  return `ssr-${nextSupportCounter}`;
}

export default function SalesSupportPage() {
  const [requests, setRequests] = useState<SalesSupportRequest[]>(INITIAL_SALES_SUPPORT_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<'all' | SalesSupportStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | SalesSupportType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    requested_by: '',
    project_id: INITIAL_PROJECTS[0].id,
    request_type: 'konten_promo' as SalesSupportType,
    description: '',
    due_date: '2026-10-15',
    pic_id: INITIAL_PROFILES[1].id,
  });

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
        return { label: 'Diminta', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'in_progress':
        return { label: 'Dikerjakan', color: 'bg-blue-50 text-blue-800 border-blue-300' };
      case 'delivered':
        return { label: 'Terkirim / Selesai', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'revision':
        return { label: 'Revisi', color: 'bg-rose-50 text-rose-800 border-rose-300' };
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
      id: generateSupportId(),
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
      due_date: '2026-10-15',
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
                CRO & In-house Support
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Sales Support Requests
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Tracking permintaan materi promosi, brosur, flyer WhatsApp, price list, dan visual dari tim sales/CRO di lapangan.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Catat Permintaan Baru</span>
          </button>
        </div>

        {/* Status KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['requested', 'in_progress', 'delivered', 'revision'] as SalesSupportStatus[]).map((st) => {
            const badge = getStatusBadge(st);
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(isSelected ? 'all' : st)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-warm-cream border-ink-black ring-1 ring-ink-black shadow-xs'
                    : 'bg-paper-white border-sand-border hover:border-stone-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider">
                    {badge.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    {countByStatus[st]}
                  </span>
                </div>
                <div className="text-2xl font-black text-ink-black font-mono">
                  {countByStatus[st]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-warm-cream border border-sand-border rounded-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-stone-gray uppercase tracking-wider mr-1">Kategori:</span>
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                typeFilter === 'all'
                  ? 'bg-ink-black text-paper-white shadow-xs'
                  : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
              }`}
            >
              Semua ({requests.length})
            </button>
            {(['konten_promo', 'brosur', 'price_list', 'template_wa'] as SalesSupportType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  typeFilter === t
                    ? 'bg-ink-black text-paper-white shadow-xs'
                    : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
                }`}
              >
                {getTypeLabel(t)}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-3.5">
          {filteredRequests.map((req) => {
            const statusBadge = getStatusBadge(req.status);

            return (
              <div
                key={req.id}
                className="bg-paper-white border border-sand-border rounded-2xl p-5 hover:border-stone-400 transition-all shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-warm-cream text-ink-black border border-sand-border">
                        {getTypeLabel(req.request_type)}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                      {req.project && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
                          <Building2 className="w-3 h-3 text-stone-500" />
                          {req.project.name}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm font-bold text-ink-black leading-snug">
                      {req.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-gray pt-1">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        <span>Pemohon: <strong className="text-ink-black">{req.requested_by}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Tenggat: <strong className="text-ink-black">{req.due_date || '—'}</strong></span>
                      </div>
                      {req.pic && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-violet-pulse" />
                          <span>PIC Desain: <strong className="text-ink-black">{req.pic.full_name}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Workflow Dropdown */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                    {req.output_url && (
                      <a
                        href={req.output_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold text-violet-pulse bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Lihat Output File</span>
                      </a>
                    )}

                    {req.status === 'requested' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-paper-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        Mulai Kerjakan
                      </button>
                    )}

                    {req.status === 'in_progress' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'delivered')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-paper-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors"
                      >
                        Tandai Terkirim
                      </button>
                    )}

                    {req.status === 'delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'revision')}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-gray hover:text-ink-black bg-stone-100 rounded-full"
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

        {/* Modal Catat Permintaan */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-paper-white border border-sand-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-stone-gray hover:text-ink-black p-1.5 rounded-full hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-warm-cream border border-sand-border text-ink-black">
                  <HelpCircle className="w-5 h-5 text-violet-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-black tracking-tight">
                    Catat Permintaan Sales Support
                  </h3>
                  <p className="text-xs text-stone-gray">Materi promosi atau sales tool dari tim CRO</p>
                </div>
              </div>

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
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Jenis Kebutuhan
                    </label>
                    <select
                      value={formData.request_type}
                      onChange={(e) => setFormData({ ...formData, request_type: e.target.value as SalesSupportType })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-gray mb-1">
                      Tenggat Waktu (Due Date)
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      PIC Pengerjaan
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
                    Simpan Permintaan
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
