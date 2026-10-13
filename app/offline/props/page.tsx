'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Modal } from '@/components/ui/modal';
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

  const totalProps = propsList.length;
  const installedCount = propsList.filter((p) => p.status === 'installed').length;
  const totalCost = propsList.reduce((sum, p) => sum + p.cost, 0);
  const needsReplacementCount = propsList.filter((p) => p.status === 'needs_replacement').length;

  const getItemTypeBadge = (type: PropItemType) => {
    switch (type) {
      case 'baliho':
        return { label: 'Baliho Raksasa', color: 'bg-ink-black text-paper-white border-ink-black' };
      case 'spanduk':
        return { label: 'Spanduk Jalan', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'umbul_umbul':
        return { label: 'Umbul-umbul', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'banner':
        return { label: 'Roll Banner', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'flyer':
      case 'brosur':
        return { label: 'Brosur / Flyer', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'x_banner':
        return { label: 'X-Banner', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'signage':
        return { label: 'Signage / Petunjuk Arah', color: 'bg-warm-cream text-ink-black border-sand-border' };
      default:
        return { label: type, color: 'bg-warm-cream text-ink-black border-sand-border' };
    }
  };

  const getStatusBadge = (status: PropStatus) => {
    switch (status) {
      case 'needed':
        return { label: 'Dibutuhkan', color: 'bg-warm-cream text-stone-gray border-sand-border' };
      case 'design':
        return { label: 'Proses Desain', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'proofing':
        return { label: 'Proofing Warna', color: 'bg-warm-cream text-ink-black border-sand-border' };
      case 'printing':
        return { label: 'Proses Cetak', color: 'bg-ink-black text-paper-white border-ink-black' };
      case 'ready':
        return { label: 'Siap Pasang', color: 'bg-ink-black text-paper-white border-ink-black' };
      case 'installed':
        return { label: 'Terpasang', color: 'bg-forest-surface text-forest-emerald border-forest-emerald/30' };
      case 'needs_replacement':
        return { label: 'Perlu Penggantian', color: 'bg-ember-surface text-ember-orange border-ember-orange/30' };
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
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        <OfflineNavTabs />

        <PageHeader
          eyebrow="Offline Marketing • Reklame & OOH Media"
          title="Alat Peraga & Reklame Fisik (Props)"
          description="Manajemen inventaris baliho, spanduk jalan, umbul-umbul, banner, vendor percetakan, dan pemantauan kondisi fisik reklame."
          actions={
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Alat Peraga Baru</span>
            </button>
          }
        />

        {/* Compact Field Operations Ledger Bar */}
        <div className="card-cream p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                Total Item Reklame
              </span>
              <span className="text-2xl font-black text-ink-black metric-mono">{totalProps}</span>
              <span className="text-xs text-stone-gray ml-1.5">Titik</span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                Titik Terpasang
              </span>
              <span className="text-2xl font-black text-forest-emerald metric-mono">{installedCount}</span>
              <span className="text-xs text-stone-gray ml-1.5">Aktif</span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                Total Biaya Cetak / Pasang
              </span>
              <span className="text-lg font-extrabold text-ink-black metric-mono">
                Rp {(totalCost / 1000000).toFixed(1)} jt
              </span>
            </div>
            <div className="h-8 w-px bg-sand-border hidden sm:block" />
            <div>
              <span className="text-[11px] font-bold text-stone-gray uppercase tracking-wider block">
                Perlu Penggantian
              </span>
              <span className="text-2xl font-black text-ember-orange metric-mono">{needsReplacementCount}</span>
              <span className="text-xs text-stone-gray ml-1.5">Pudar / rusak</span>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-sand-border">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 min-h-9 text-xs font-bold rounded-full transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-ink-black text-paper-white'
                    : 'bg-paper-white text-stone-gray border border-sand-border hover:text-ink-black'
                }`}
              >
                Semua Jenis
              </button>
              {(['baliho', 'spanduk', 'umbul_umbul', 'banner'] as PropItemType[]).map((t) => (
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
                  {t === 'umbul_umbul' ? 'Umbul-umbul' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | PropStatus)}
              aria-label="Filter status alat peraga"
              className="text-xs font-bold bg-paper-white border border-sand-border rounded-full px-3.5 min-h-9 text-ink-black focus:outline-hidden"
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
        {filteredProps.length === 0 ? (
          <div className="card-clay p-8 sm:p-12 text-center">
            <Megaphone className="w-10 h-10 text-ash-gray mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-ink-black mb-1">
              Belum Ada Data Alat Peraga / Reklame
            </h3>
            <p className="text-xs sm:text-sm text-stone-gray max-w-md mx-auto mb-6">
              Belum ada baliho, spanduk, umbul-umbul, atau sarana promosi fisik yang tercatat. Klik tombol di bawah untuk mencatat alat peraga baru.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-pill-primary text-xs"
            >
              Tambah Alat Peraga Promosi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProps.map((prop) => {
              const typeBadge = getItemTypeBadge(prop.item_type);
              const statusBadge = getStatusBadge(prop.status);

              return (
                <div
                  key={prop.id}
                  className={`card-clay p-5 hover:border-ink-black transition-colors flex flex-col justify-between ${
                    prop.status === 'needs_replacement' ? 'border-ember-orange' : ''
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${typeBadge.color}`}>
                          {typeBadge.label}
                        </span>
                        {prop.is_revitalization && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ember-orange bg-ember-surface px-2 py-0.5 rounded-full border border-ember-orange/30">
                            <RefreshCw className="w-3 h-3" />
                            Revitalisasi
                          </span>
                        )}
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-ink-black leading-snug mb-1">
                      {prop.location_description}
                    </h3>

                    {prop.project && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-black font-semibold bg-warm-cream px-2.5 py-1 rounded-lg border border-sand-border mb-3 w-fit">
                        <Building2 className="w-3.5 h-3.5 text-stone-gray" />
                        <span>{prop.project.name}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 bg-warm-cream border border-sand-border rounded-xl p-2.5 text-xs mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Jumlah</span>
                        <span className="metric-mono font-bold text-ink-black">{prop.quantity} unit</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Ukuran</span>
                        <span className="metric-mono text-ink-black">{prop.size || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-gray uppercase block">Biaya</span>
                        <span className="metric-mono font-bold text-ink-black">
                          Rp {(prop.cost / 1000).toLocaleString('id-ID')}k
                        </span>
                      </div>
                    </div>

                    {prop.condition_note && (
                      <div className="p-2.5 rounded-xl bg-warm-cream border border-sand-border text-xs text-stone-gray italic mb-2">
                        <span className="font-bold text-ink-black not-italic">Catatan Lapangan: </span>
                        {prop.condition_note}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-sand-border flex items-center justify-between gap-2 text-xs text-stone-gray mt-2">
                    <div className="flex items-center gap-2">
                      {prop.vendor && <span>Vendor: <strong className="text-ink-black">{prop.vendor}</strong></span>}
                      {prop.install_date && (
                        <span className="metric-mono text-[11px] text-stone-gray">Pasang: {prop.install_date}</span>
                      )}
                    </div>

                    {prop.design_url && (
                      <a
                        href={prop.design_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-pulse font-bold hover:underline"
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
        )}

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tambah Alat Peraga / Reklame"
          description="Baliho, spanduk, umbul-umbul, banner"
        >
          <form onSubmit={handleCreateProp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Jenis Alat Peraga
                </label>
                <select
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value as PropItemType })}
                  className="input-clay text-xs"
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
                className="input-clay text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Jumlah Unit
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  className="input-clay text-xs metric-mono"
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
                  className="input-clay text-xs"
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
                  className="input-clay text-xs metric-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Vendor Percetakan
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Contoh: Cahaya Reklame Medan"
                  className="input-clay text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-black uppercase tracking-wider mb-1">
                  Status Produksi
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PropStatus })}
                  className="input-clay text-xs"
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

            <div className="flex items-center gap-2.5 p-3 bg-warm-cream rounded-xl border border-sand-border">
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
                Simpan Alat Peraga
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}

