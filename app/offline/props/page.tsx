'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { OfflineNavTabs } from '@/components/modules/offline/offline-nav-tabs';
import { INITIAL_MARKETING_PROPS } from '@/lib/data/seed-offline';
import { INITIAL_PROJECTS, INITIAL_PROFILES } from '@/lib/data/seed-data';
import { MarketingProp, PropItemType, PropStatus } from '@/lib/types/database';
import {
  Megaphone,
  PlusCircle,
  Building2,
  RefreshCw,
  ExternalLink,
  X,
} from 'lucide-react';

let nextPropCounter = 100;
function generatePropId(): string {
  nextPropCounter += 1;
  return `prop-${nextPropCounter}`;
}

export default function MarketingPropsPage() {
  const [propsList, setPropsList] = useState<MarketingProp[]>(INITIAL_MARKETING_PROPS);
  const [typeFilter, setTypeFilter] = useState<'all' | PropItemType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PropStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    item_type: 'baliho' as PropItemType,
    project_id: INITIAL_PROJECTS[0].id,
    is_revitalization: false,
    location_description: '',
    quantity: '1',
    size: '4 x 8 meter',
    vendor: '',
    cost: '',
    status: 'needed' as PropStatus,
    condition_note: '',
    pic_id: INITIAL_PROFILES[0].id,
  });

  const filteredProps = propsList.filter((p) => {
    if (typeFilter !== 'all' && p.item_type !== typeFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  // Metrics
  const totalProps = propsList.length;
  const installedCount = propsList.filter((p) => p.status === 'installed').length;
  const totalCost = propsList.reduce((sum, p) => sum + p.cost, 0);
  const needsReplacementCount = propsList.filter((p) => p.status === 'needs_replacement').length;

  const getItemTypeBadge = (type: PropItemType) => {
    switch (type) {
      case 'baliho':
        return { label: 'Baliho Raksasa', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'spanduk':
        return { label: 'Spanduk Jalan', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'umbul_umbul':
        return { label: 'Umbul-umbul', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'banner':
        return { label: 'Roll Banner', color: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'flyer':
      case 'brosur':
        return { label: 'Brosur / Flyer', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'x_banner':
        return { label: 'X-Banner', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'signage':
        return { label: 'Signage / Petunjuk Arah', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: type, color: 'bg-stone-50 text-stone-800 border-sand-border' };
    }
  };

  const getStatusBadge = (status: PropStatus) => {
    switch (status) {
      case 'needed':
        return { label: 'Dibutuhkan', color: 'bg-stone-100 text-stone-800 border-sand-border' };
      case 'design':
        return { label: 'Proses Desain', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'proofing':
        return { label: 'Proofing Warna', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'printing':
        return { label: 'Proses Cetak', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'ready':
        return { label: 'Siap Pasang', color: 'bg-teal-50 text-teal-800 border-teal-200' };
      case 'installed':
        return { label: 'Terpasang', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'needs_replacement':
        return { label: 'Perlu Penggantian', color: 'bg-rose-50 text-rose-800 border-rose-300' };
    }
  };

  const handleCreateProp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location_description) return;

    const newProp: MarketingProp = {
      id: generatePropId(),
      item_type: formData.item_type,
      project_id: formData.project_id,
      is_revitalization: formData.is_revitalization,
      location_description: formData.location_description,
      quantity: parseInt(formData.quantity, 10) || 1,
      size: formData.size || null,
      vendor: formData.vendor || null,
      cost: parseFloat(formData.cost) || 0,
      status: formData.status,
      design_url: null,
      install_date: null,
      condition_note: formData.condition_note || null,
      pic_id: formData.pic_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pic: INITIAL_PROFILES.find((p) => p.id === formData.pic_id),
      project: INITIAL_PROJECTS.find((p) => p.id === formData.project_id),
    };

    setPropsList([newProp, ...propsList]);
    setIsModalOpen(false);
    setFormData({
      item_type: 'baliho',
      project_id: INITIAL_PROJECTS[0].id,
      is_revitalization: false,
      location_description: '',
      quantity: '1',
      size: '4 x 8 meter',
      vendor: '',
      cost: '',
      status: 'needed',
      condition_note: '',
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
                Reklame & OOH Media
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-black">
              Alat Peraga & Reklame Fisik (Props)
            </h1>
            <p className="text-sm text-stone-gray mt-1">
              Manajemen inventaris baliho, spanduk jalan, umbul-umbul, banner, vendor percetakan, dan pemantauan kondisi fisik reklame.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-paper-white bg-ink-black rounded-full hover:bg-stone-800 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambah Alat Peraga Baru</span>
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Total Item Reklame
            </span>
            <div className="text-2xl font-black text-ink-black font-mono">{totalProps}</div>
            <span className="text-[11px] text-stone-500 mt-1 block">Titik terdaftar</span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Titik Terpasang
            </span>
            <div className="text-2xl font-black text-emerald-700 font-mono">{installedCount}</div>
            <span className="text-[11px] text-emerald-600 mt-1 block">Aktif di lapangan</span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Total Biaya Cetak/Pasang
            </span>
            <div className="text-2xl font-black text-ink-black font-mono">
              Rp {(totalCost / 1000000).toFixed(1)} jt
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">Akumulasi biaya reklame</span>
          </div>

          <div className="bg-paper-white border border-sand-border rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-stone-gray uppercase tracking-wider block mb-1">
              Perlu Penggantian
            </span>
            <div className="text-2xl font-black text-rose-700 font-mono">{needsReplacementCount}</div>
            <span className="text-[11px] text-rose-600 mt-1 block">Pudar / rusak cuaca</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-warm-cream border border-sand-border rounded-2xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-stone-gray uppercase tracking-wider mr-1">Jenis:</span>
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
            {(['baliho', 'spanduk', 'umbul_umbul', 'banner'] as PropItemType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  typeFilter === t
                    ? 'bg-ink-black text-paper-white shadow-xs'
                    : 'bg-paper-white text-ink-black border border-sand-border hover:bg-stone-50'
                }`}
              >
                {t === 'umbul_umbul' ? 'Umbul-umbul' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-gray uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | PropStatus)}
              aria-label="Filter status alat peraga"
              className="text-xs font-semibold bg-paper-white border border-sand-border rounded-full px-3 py-1 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
            >
              <option value="all">Semua Status</option>
              <option value="needed">Dibutuhkan</option>
              <option value="printing">Proses Cetak</option>
              <option value="ready">Siap Pasang</option>
              <option value="installed">Terpasang</option>
              <option value="needs_replacement">Perlu Penggantian</option>
            </select>
          </div>
        </div>

        {/* Props Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProps.map((prop) => {
            const typeBadge = getItemTypeBadge(prop.item_type);
            const statusBadge = getStatusBadge(prop.status);

            return (
              <div
                key={prop.id}
                className={`bg-paper-white border rounded-2xl p-5 hover:border-stone-400 transition-all shadow-xs flex flex-col justify-between ${
                  prop.status === 'needs_replacement' ? 'border-rose-300 ring-1 ring-rose-300/40' : 'border-sand-border'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}>
                        {typeBadge.label}
                      </span>
                      {prop.is_revitalization && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                          <RefreshCw className="w-3 h-3 text-amber-600" />
                          Revitalisasi
                        </span>
                      )}
                    </div>

                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Location & Title */}
                  <h3 className="text-base font-extrabold text-ink-black leading-snug mb-1">
                    {prop.location_description}
                  </h3>

                  {prop.project && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-gray bg-warm-cream px-2.5 py-1 rounded-lg border border-sand-border mb-3 w-fit">
                      <Building2 className="w-3.5 h-3.5 text-stone-500" />
                      <span>{prop.project.name}</span>
                    </div>
                  )}

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-warm-cream/60 border border-sand-border rounded-xl p-2.5 text-xs mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-stone-gray uppercase block">Jumlah</span>
                      <span className="font-mono font-bold text-ink-black">{prop.quantity} unit</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-gray uppercase block">Ukuran</span>
                      <span className="font-mono text-ink-black">{prop.size || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-gray uppercase block">Biaya</span>
                      <span className="font-mono font-bold text-ink-black">
                        Rp {(prop.cost / 1000).toLocaleString('id-ID')}k
                      </span>
                    </div>
                  </div>

                  {/* Condition notes */}
                  {prop.condition_note && (
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-sand-border text-xs text-stone-600 italic mb-2">
                      <span className="font-semibold text-stone-800 not-italic">Catatan Lapangan: </span>
                      {prop.condition_note}
                    </div>
                  )}
                </div>

                {/* Footer Strip */}
                <div className="pt-3 border-t border-sand-border flex items-center justify-between gap-2 text-xs text-stone-gray mt-2">
                  <div className="flex items-center gap-2">
                    {prop.vendor && <span>Vendor: <strong className="text-ink-black">{prop.vendor}</strong></span>}
                    {prop.install_date && (
                      <span className="font-mono text-[11px] text-stone-500">Pasang: {prop.install_date}</span>
                    )}
                  </div>

                  {prop.design_url && (
                    <a
                      href={prop.design_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-violet-pulse font-semibold hover:underline"
                    >
                      <span>Lihat Desain</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Tambah Alat Peraga */}
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
                  <Megaphone className="w-5 h-5 text-violet-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-black tracking-tight">
                    Tambah Alat Peraga / Reklame
                  </h3>
                  <p className="text-xs text-stone-gray">Baliho, spanduk, umbul-umbul, banner</p>
                </div>
              </div>

              <form onSubmit={handleCreateProp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Jenis Alat Peraga
                    </label>
                    <select
                      value={formData.item_type}
                      onChange={(e) => setFormData({ ...formData, item_type: e.target.value as PropItemType })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    >
                      <option value="baliho">Baliho Raksasa</option>
                      <option value="spanduk">Spanduk Jalan</option>
                      <option value="umbul_umbul">Umbul-umbul</option>
                      <option value="banner">Roll Banner</option>
                      <option value="flyer">Flyer / Brosur</option>
                      <option value="x_banner">X-Banner</option>
                      <option value="signage">Signage Penunjuk Arah</option>
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

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    value={formData.location_description}
                    onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                    placeholder="Contoh: Simpang Kayu Besar Jl. Lintas Sumatera Lubuk Pakam"
                    required
                    className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Jumlah Unit
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black font-mono focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Ukuran
                    </label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="Contoh: 4 x 8 m"
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Biaya (Rp)
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      placeholder="Contoh: 1500000"
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black font-mono focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Vendor Percetakan
                    </label>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                      placeholder="Contoh: Cahaya Reklame Medan"
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                      Status Produksi
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as PropStatus })}
                      className="w-full text-xs bg-warm-cream border border-sand-border rounded-xl px-3 py-2 text-ink-black focus:outline-hidden focus:ring-1 focus:ring-ink-black"
                    >
                      <option value="needed">Dibutuhkan</option>
                      <option value="design">Proses Desain</option>
                      <option value="proofing">Proofing Warna</option>
                      <option value="printing">Proses Cetak</option>
                      <option value="ready">Siap Pasang</option>
                      <option value="installed">Terpasang</option>
                      <option value="needs_replacement">Perlu Penggantian</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-warm-cream rounded-xl border border-sand-border">
                  <input
                    type="checkbox"
                    id="is_revitalization_check"
                    checked={formData.is_revitalization}
                    onChange={(e) => setFormData({ ...formData, is_revitalization: e.target.checked })}
                    className="w-4 h-4 rounded-md border-sand-border text-ink-black focus:ring-ink-black"
                  />
                  <label htmlFor="is_revitalization_check" className="text-xs font-semibold text-ink-black cursor-pointer">
                    Merupakan program revitalisasi (mengganti materi reklame lama yang sudah rusak/pudar)
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                    Catatan Kondisi Lapangan
                  </label>
                  <textarea
                    rows={2}
                    value={formData.condition_note}
                    onChange={(e) => setFormData({ ...formData, condition_note: e.target.value })}
                    placeholder="Contoh: Rangka besi kokoh, lampu sorot berfungsi normal..."
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
                    Simpan Alat Peraga
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
